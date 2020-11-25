'use strict'

const express = require('express')
const router = express.Router()
const uuid = require('uuid').v4
const fs = require('fs')
const sharp = require('sharp')
const userModel = require('../models/user')
const bcrypt = require('../helpers/bcrypt')
const validate = require('../helpers/validate')

router.get('/', (req, res) => {
    const data = {
        'user': req.user,
        'page_title': 'Profile'
    }
    res.render('private/profile', data)
})

router.get('/image', (req, res) => {
    res.redirect('/profile')
})

router.post('/image', async (req, res) => {
    const validations = {
        image: undefined
    }

    const image = req.files ? req.files.image : null

    validations.image = validate.image(image,{
        type:'Only .png, .jpg and .jpeg format allowed',
        size:'Max image file size is 1mb',
        required:'Image is required'
    })

    console.log(req.user)

    if(validations.image){
        const data = {
            'user': req.user,
            'page_title': 'Profile',
            'error_message': 'Complete required fields',
            'image_validation': validations.image
        }
        res.render('private/profile', data)
    }else{
        const ROOT_URL = `${ process.env.ROOT_URL }:${ process.env.PORT }`

        const imagePath = `${ ROOT_URL }/img/users/`

        if(req.user.image != `${ ROOT_URL }/img/default-avatar.jpg`){
            try {
                fs.unlinkSync(req.user.image.replace(ROOT_URL, './public'))
            } catch {}
        }

        if(image.mimetype == 'image/png')
            image.name = uuid() + '.png'
        else if(image.mimetype == 'image/jpg')
            image.name = uuid() + '.jpg'
        else if(image.mimetype == 'image/jpeg')
            image.name = uuid() + '.jpeg'

        await image.mv( `./public/img/users/${ image.name }`, async (err) => {
            if (err) throw err
            try{
                await sharp(`./public/img/users/${ image.name }`).resize(250, 250).toBuffer((err, buffer) => {
                    fs.writeFile(`./public/img/users/${ image.name }`, buffer, () => {
                        console.log('Image manipulation complete')
                    })
                })
            }catch{}
        })

        userModel.updateOne({ userId: req.user.userId }, {
            image: imagePath + image.name
        }).then(() => {
            req.user.image = imagePath + image.name
            const data = {
                'user': req.user,
                'page_title': 'Profile',
                'success_message': 'User image updated'
            }
            res.render('private/profile', data)
        })

    }
})

router.get('/email', (req, res) => {
    res.redirect('/profile')
})

router.post('/email', async (req, res) => {

    const validations = {
        email: undefined
    }

    const { email } = req.body

    validations.email = validate.email(email, {
        required: 'Email required',
        invalid: `"${email}" is not valid email address`
    })

    if (!validations.email) {
        const checkEmail = await userModel.findOne({ email: { '$regex': '^' + email + '$', '$options': '-i' } })
        if (checkEmail)
            validations.email = `"${checkEmail.email}" is already registered`
    }

    if (validations.email) {
        const data = {
            'user': req.user,
            'page_title': 'Update Email',
            'error_message': 'Complete required fields',
            'email': email,
            'email_validation': validations.email
        }
        res.render('private/profile', data)
    }
    else {
        const newData = {
            email: email
        }
        await userModel.updateOne({
            userId: req.user.userId
        }, newData, (err, user) => {
            if (err)
                res.render('profile/index', {
                    'user': req.user,
                    'page_title': 'Change Email',
                    'error_message': 'Error while upating your info, please try again later'
                })

            else {
                req.user.email = email
                const data = {
                    'user': req.user,
                    'page_title': 'Change Email',
                    'success_message': 'email updated!',
                }
                res.render('private/profile', data)
            }
        })

    }
})

router.get('/username', (req, res) => {
    res.redirect('/profile')
})

router.post('/username', async (req, res) => {
    const validations = { username: undefined }

    const {
        username
    } = req.body

    validations.username = validate.username(username, {
        required: 'Username required',
        invalid: 'Invalid username'
    })

    if (!validations.username) {
        const checkUsername = await userModel.findOne({ username: { '$regex': '^' + username + '$', '$options': '-i' } })
        if (checkUsername)
            validations.username = `"${checkUsername.username}" is already registered`
    }

    if (validations.username) {
        const data = {
            'user': req.user,
            'page_title': 'Change Username',
            'error_message': 'Complete required fields',
            'username': username,
            'username_validation': validations.username
        }
        res.render('private/profile', data)
    }

    else {

        const newData = {
            username: username
        }
        await userModel.updateOne({
            userId: req.user.userId
        }, newData, (err, user) => {
            if (err)
                res.render('profile/index', {
                    'user': req.user,
                    'page_title': 'Change Username',
                    'error_message': 'Error while upating your info, please try again later'
                })

            else {
                req.user.username = username
                const data = {
                    'user': req.user,
                    'page_title': 'Change Username',
                    'success_message': 'Username updated!',
                }
                res.render('private/profile', data)
            }
        })
    }
})

router.get('/password', (req, res) => {
    res.redirect('/profile')
})

router.post('/password', async (req, res) => {
    const validations = {
        password_old: undefined,
        password: undefined,
        password_repeat: undefined
    }

    const {
        password_old,
        password,
        password_repeat
    } = req.body

    validations.password_old = validate.passwordOld(password_old, {
        required: 'Old password required'
    })

    validations.password = validate.password(password, password_repeat, {
        required: 'Password required',
        invalid: 'Password should be at least 4 characters',
        match: 'Password match error'
    })

    validations.password_repeat = validate.passwordRepeat(password, password_repeat, {
        required: 'Confirm password',
        invalid: 'Password should be at least 4 characters',
        match: 'Password match error'
      })

    if (validations.password_repeat || validations.password_old || validations.password) {
        const data = {
            'user': req.user,
            'page_title': 'password',
            'error_message': 'Complete required fields',
            'password': password_old,
            'passwordOld_validation': validations.password_old,
            'password_validation': validations.password,
            'password_repeat_validation': validations.password_repeat
        }
        res.render('private/profile', data)
    }
    // else {
    //     if (validations.password_old === undefined && validations.password  === undefined && validations.password_repeat === undefined) {
    //         await bcrypt.compare(password_old, req.user.password).then((result) => {
    //             if (!result)
    //                 validations.password_old = 'Invalid password'
    //         })
    //     }
    // }
        else {
            const hashPassword = await bcrypt.hash(password)
            const newData = {
                password: hashPassword
            }
            await userModel.updateOne({
                userId: req.user.userId
            }, newData, (err, user) => {
                if (err)
                    res.render('private/profile', {
                        'page_title': 'Change Password',
                        'user': req.user,
                        'error_message': 'Error while upating password, please try again later'
                    })
                else {
                    req.user.password = hashPassword
                    const data = {
                        'page_title': 'Change Password',
                        'user': req.user,
                        'success_message': 'Password has been updated'
                    }
                    res.render('private/profile', data)
                }
            })
        }
})


module.exports = router
'use strict'
const mail = require('../helpers/mail')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const md5 = require('md5')
const uuid = require('uuid').v4
const validate = require('../helpers/validate')
const userModel = require('../models/user')

// Load signup view
router.get('/', async (req, res) => {
    const data = {
        'page_title': 'Signup'
    }
    res.render('public/signup', data)
})

// Signup submit
router.post('/', async (req, res) => {
    const validations = {
        username: undefined,
        email: undefined,
        password: undefined,
        passwordRepeat: undefined
    }

    const { username, email, password, passwordRepeat } = req.body

    validations.username = validate.username(username, {
        required: 'Username required',
        invalid: `"${username}" is not valid username`,
    })

    validations.email = validate.email(email, {
        required: 'Email required',
        invalid: `"${email}" is not valid email address`
    })

    validations.password = validate.password(password, passwordRepeat, {
        required: 'Password required',
        invalid: 'Password should be at least 4 characters',
        match: 'Password match error'
    })

    validations.passwordRepeat = validate.passwordRepeat(password, passwordRepeat, {
        required: 'Confirm password',
        invalid: 'Password should be at least 4 characters',
        match: 'Password match error'
    })

    /*
    if(!validations.username){
        const checkUsername = await userModel.findOne({ username: { '$regex' : '^' + username + '$', '$options': '-i' } })
        if(checkUsername)
            validations.username = `"${ checkUsername.username }" is already registered`
    }
    */

    if (!validations.email) {
        const checkEmail = await userModel.findOne({ email: { '$regex': '^' + email + '$', '$options': '-i' } })
        if (checkEmail)
            validations.email = `"${checkEmail.email}" is already registered`
    }

    if (validations.username || validations.email || validations.password || validations.passwordRepeat) {
        const data = {
            'page_title': 'Signup',
            'error_message': 'Complete required fields',
            'email': email,
            'username': username,
            'password': password,
            'passwordRepeat': passwordRepeat,
            'email_validation': validations.email,
            'username_validation': validations.username,
            'password_validation': validations.password,
            'passwordRepeat_validation': validations.passwordRepeat
        }
        res.render('public/signup', data)
    } else {
        bcrypt.hash(password, 10, (err, hash) => {
            const newUser = {
                userId: md5(uuid()),
                username,
                email,
                password: hash,
                key: md5(uuid())
            }
            const mailBody = {
                to: email,
                subject: 'Verify email address',
                html: `<a target="_blank" href="${process.env.ROOT_URL}:${process.env.PORT}/verify/${newUser.key}" class="btn">Verify email address</a>`
            }
            userModel.create(newUser).then(() => {
                const sendMail = mail.sendmail(mailBody)
                    .then(async () => {
                        if (sendMail) {
                            res.render('public/signup', {
                                'page_title': 'Signup',
                                'success_message': 'Signup complete, check your email inbox for verification email'
                            })
                        } else {
                            res.render('public/signup', {
                                'page_title': 'Signup',
                                'error_message': 'Signup failed, unable to send verification email'
                            })
                        }
                    })
            })
        })
    }
})

module.exports = router
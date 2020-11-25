'use strict'

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const validate = require('../helpers/validate')
const userModel = require('../models/user')

router.get('/:key', (req, res) => {
  res.render('public/resetPassword', { 'page_title': 'Reset Password' })
})

router.post('/:key', async (req, res) => {
    const validations = {
        password: null,
        passwordRepeat: null
    }
    const { password, passwordRepeat } = req.body

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

    if(validations.password || validations.passwordRepeat){
        const data = {
            'page_title': 'Reset password',
            'error_message': 'Complete required fields',
            'password': password,
            'passwordRepeat': passwordRepeat,
            'password_validation': validations.password,
            'passwordRepeat_validation': validations.passwordRepeat
        }

        res.render('public/resetPassword', data)
    }else{
        const user = await userModel.findOne({ key: req.params.key })

        if(!user){
            const data = {
                'page_title': 'Reset password',
                'error_message': 'Invalid password reset'
            }
            res.render('public/resetPassword', data)
        }else{
            bcrypt.hash(password, 10, (err, hash) => {
                userModel.updateOne({ key: req.params.key },{
                    key: null,
                    password: hash
                }).then(() => {
                    const data = {
                        'page_title': 'Reset password',
                        'success_message': 'Password reset complete'
                    }
                    res.render('public/resetPassword', data)
                })
            })
        }
    }
})

module.exports = router
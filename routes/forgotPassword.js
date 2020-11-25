'use strict'

const express = require('express')
const mail = require('../helpers/mail')
const router = express.Router()
const md5 = require('md5')
const uuid = require('uuid').v4
const validate = require('../helpers/validate')
const userModel = require('../models/user')

router.get('/', (req, res) => {
    res.render('public/forgotPassword', { 'page_title': 'Forgot Password' })
})

router.post('/', async (req, res) => {
    const validations = {
        email: null
    }

    const { email } = req.body

    validations.email = validate.email(email, {
        required: 'Email required',
        invalid: `"${email}" is not valid email address`
    })

    if (validations.email) {
        const data = {
            'page_title': 'Forgot Password',
            'error_message': 'Complete required fields',
            'email': email,
            'email_validation': validations.email
        }

        res.render('public/forgotPassword', data)
    } else {
        const user = await userModel.findOne({ email: email })

        if (!user) {
            const data = {
                'page_title': 'Forgot Password',
                'error_message': 'No record of email on our database',
                'email': email
            }
            res.render('public/forgotPassword', data)
        } else {
            if (user.strategy) {
                const data = {
                    'page_title': 'Forgot Password',
                    'warning_message': `Use ${user.strategy} to login`
                }
                res.render('public/forgotPassword', data)
            } else {
                const user = {
                    key: md5(uuid())
                }
                const mailBody = {
                    to: email,
                    subject: 'Reset password',
                    html: `<a target="_blank" href="${process.env.ROOT_URL}:${process.env.PORT}/reset-password/${user.key}" class="btn">Reset password</a>`
                }

                mail.sendmail(mailBody)
                    .then(async (sendMail) => {
                        if (sendMail) {
                            userModel.updateOne({ email: { '$regex': '^' + email + '$', '$options': '-i' } }, user)
                                .then(() => {
                                    res.render('public/forgotPassword', {
                                        'page_title': 'Forgot Password',
                                        'status': true,
                                        'success_message': 'Check your email inbox for password reset instructions'
                                    })
                                })
                        }
                        else {
                            res.render('public/forgotPassword', {
                                'page_title': 'Forgot Password',
                                'status': false,
                                'error_message': 'Unable to send email'
                            })
                        }
                    })
            }
        }
    }
})

module.exports = router
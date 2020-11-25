'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const validate = require('../helpers/validate')
const userModel = require('../models/user')

router.get('/', async (req, res) => {
    res.render('public/login', { 'page_title': 'Login' })
})

router.post('/', async (req, res, next) => {
    const validations = {
        email: undefined,
        password: undefined
    }

    const { email, password } = req.body

    if(!email)
        validations.email = 'Email is required'
    
    if(!password)
        validations.password = 'Password is required'

    if(validations.email || validations.password){
        const data = { 
            'page_title': 'Login',
            'error_message': 'Complete required fields',
            'email': email,
            'password': password,
            'email_validation': validations.email,
            'password_validation': validations.password
        }
        res.render('public/login', data)
    }
    else{
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err)
            if(!user){
                const data = { 
                    'page_title': 'Login',
                    'error_message': 'Invalid login',
                    'email': email,
                    'password': password,
                }
                return res.render('public/login', data)
            }else{
                if(user.verified === true){
                    req.logIn(user, function(err) {
                        if (err) { return next(err) }
                        if(!user.deezerId)
                            return res.redirect('/')
                        else
                            return res.redirect('/')
                    })
                }else{
                    const data = { 
                        'page_title': 'Login',
                        'error_message': 'Verify email address'
                    }
                    return res.render('public/login', data)
                }
            }
        })(req, res, next)
    }
})

router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/')
})

router.get('/deezer', passport.authenticate('deezer'))

router.get('/deezer/callback', passport.authenticate('deezer', { failureRedirect: '/login/deezer' }), (req, res) => {
    res.redirect('/')
})

module.exports = router
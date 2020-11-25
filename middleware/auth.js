'use strict'
const userModel = require('../models/user')

module.exports.isAuth = (req, res, next) => {
    if(req.isAuthenticated())
        return next()
    return res.redirect('/login')
}

module.exports.notAuth = (req, res, next) => {
    if(!req.isAuthenticated())
        return next()
    return res.redirect('/')
}
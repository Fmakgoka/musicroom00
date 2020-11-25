'use strict'

const dotenv = require('dotenv').config({
    path: './config/.env'
})
const express = require('express')
const app = express()
const path = require('path')
const createError = require('http-errors')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const passport = require('passport')
const { isAuth, notAuth } = require('./middleware/auth')

// Server
app.listen(
    process.env.PORT,
    console.log(`Serever running in ${ process.env.NODE_ENV } mode on ${ process.env.ROOT_URL }:${ process.env.PORT }`)
)

// View engine
app.set('view engine', 'ejs')

// Connect to database
require('./config/database')

// Logging
app.use(morgan('dev'))

// Body parser built into express
app.use(express.urlencoded({ extended: true }))

// Public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Flash messaging
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_message')
    res.locals.error_msg = req.flash('error_message')
    res.locals.warning_msg = req.flash('warning_message')
    res.locals.error = req.flash('error')
    next()
})

// Passport config
require('./config/passport')(passport)

// File upload
app.use(fileUpload())

// Music Room Routes
app.use('/', require('./routes/home'))
app.use('/profile', isAuth, require('./routes/profile'))
app.use('/playlists', require('./routes/userPlaylists'))

// Deezer Chart Routes
app.use('/playlist', isAuth, require('./routes/playlist'))
app.use('/artist', require('./routes/artist'))
app.use('/album', require('./routes/album'))
app.use('/track', require('./routes/track'))

// Public Routes
app.use('/login', notAuth, require('./routes/login'))
app.use('/verify', notAuth, require('./routes/verify'))
app.use('/logout', isAuth, require('./routes/logout'))
app.use('/signup', notAuth, require('./routes/signup'))
app.use('/forgot-password', notAuth, require('./routes/forgotPassword'))
app.use('/reset-password', notAuth, require('./routes/resetPassword'))

// API routes
app.use('/api/deezer', require('./routes/api/deezer'))
app.use('/api/users', isAuth, require('./routes/api/users'))

// Error handling
app.use((req, res, next) => {
    next(createError(404))
})

app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {}
    res.status(err.status || 500)
    const data = {
        'page_title': err.status
    }
    res.render('errors/404', data)
})
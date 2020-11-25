'use strict'

const localStrategy = require('passport-local').Strategy
const googleStrategy = require('passport-google-oauth20').Strategy
const deezerStrategy = require('passport-deezer').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userModel = require('../models/user')
const { use } = require('passport')

module.exports = (passport) => {
    passport.use(
        new localStrategy({usernameField: 'email'}, async (email, password, done) =>  {
            const user = await userModel.findOne({ email: { '$regex' : '^' + email + '$', '$options': '-i' } })

            if(!user){
                return done(null, false, {'status': false, 'message': 'Invalid email'})
            }else{
                bcrypt.compare(password, user.password, (err, result) => {
                    if(err) return done(err)
                    if(result)
                        return done(null, user, {'status': false, 'message': 'Invalid password'})
                    else
                        return done(null, false, {'status': true, 'message': 'You are logged in'})
                })
            }
        })
    )

    passport.use(new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/login/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        const user = await userModel.findOne({ userId: profile.id })

        if(!user){
            userModel.create({
                strategy: 'Google',
                userId: profile.id,
                username: profile.name.givenName,
                image: profile.photos[0].value,
                verified: true
            }).then(user => done(null, user))
        }else{
            done(null, user)
        }
    }))

    passport.use(new deezerStrategy({
        clientID: process.env.DEEZER_CLIENT_ID,
        clientSecret: process.env.DEEZER_CLIENT_SECRET,
        callbackURL: '/login/deezer/callback'
      }, async (accessToken, refreshToken, profile, done) => {
        const user = await userModel.findOne({ userId: profile.id })

        if(!user){
            userModel.create({
                strategy: 'Deezer',
                userId: profile._json.id,
                username: profile._json.firstname,
                image: profile._json.picture_medium,
                verified: true
            }).then(user => done(null, user))
        }else{
            done(null, user)
        }
      }
    ))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
      
    passport.deserializeUser((id, done) => {
        userModel.findById(id, (err, user) => {
            if(err) return done(err)
            done(err, user)
        })
    })
}
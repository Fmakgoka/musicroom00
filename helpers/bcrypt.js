'use strict'
const bcrypt = require('bcrypt')
const saltRounds = 12

exports.hash = (str) => {
    return new Promise((resolve) => {
        bcrypt.hash(str, saltRounds, function(err, hash) {
            if(err) throw err.message
            resolve(hash)
        })
    })
}

exports.compare = (str, hash) => {
    return new Promise((resolve) => {
        bcrypt.compare(str, hash, function(err, result) {
            if(err) throw err.message
            resolve(result)
        })
    })
}
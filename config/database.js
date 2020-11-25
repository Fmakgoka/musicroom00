'use strict'

const mongoose = require('mongoose')

module.exports = mongoose.connect(process.env.MONGODB_URL_LOCAL, {useNewUrlParser: true, useUnifiedTopology :true, useFindAndModify: true})
                .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
                .catch(err => console.log(err.message))
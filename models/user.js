'use strict'

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  strategy: { type: String, default: null },
  username: { type: String, required: true },
  email: { type: String, default: null },
  password: { type: String, default: null },
  image: { type: String, default: `${ process.env.ROOT_URL }:${ process.env.PORT }/img/default-avatar.jpg` },
  verified: { type: Boolean, default: false },
  key: { type: String, default: null },
  deezerProfile: { type: Object, default: {} }
}, {timestamps: true})

const userModel = mongoose.model('User', UserSchema)

module.exports = userModel
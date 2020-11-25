'use strict'

const express = require('express')
const router = express.Router()
const cors = require('cors')
const userModel = require('../../models/user')

// Handle cors
router.use(cors())

router.get('/', async (req, res) => {
    const users = await userModel.find()
    const usersnames = users.map(user => user.username)
    res.json(usersnames)
})

module.exports = router
'use strict'
const express = require('express')
const router = express.Router()
const userModel = require('../models/user')

router.get('/:key', async (req, res) => {
  const key = req.params.key ? req.params.key : null
  
  let user = undefined
  if(key != null)
    user = userModel.findOne({key: key})

  if(user){
    await userModel.updateOne({key: key}, {verified: true, key: null})
    res.render('public/verify', { 
      'page_title': 'Verify',
      'status' : true,
    'success_message': `<strong>Account verified</strong>, <a href="/login">Click here to login</a>` 
})
  }
  else
    res.render('public/verify',
     { 
      'page_title': 'Verify',
      'status' : false,
     'error_message': 'Unable to verify account' 
    })
})

module.exports = router
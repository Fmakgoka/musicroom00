const express = require('express')
const router = express.Router()
const axios = require('axios')
const userModel = require('../models/user')
const { NULL } = require('node-sass')


router.get('./', (req,res)=>{

    var cache_expi3re  = 60*60*24*365;
    res.setHeader("Pragma: public");
    res.setHeader("Cache-Control: maxage=" + cache_expire)
    var time = new Date().getTime(); 
    var date = new Date(time + cache_expi3re);
    console.log("date", date);
    res.setHeader ('Expires: ' + date)
    res.render('private/artist')
    
})

module.exports = router
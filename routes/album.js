  
const express = require('express')
const router = express.Router()
const axios = require('axios')
const userModel = require('../models/user')
const { NULL } = require('node-sass')

router.get('/:id', async function(req, res){
    const album = await axios(`${ process.env.DEEZER_API_URL }/album/${req.params.id}`)
    .then(result => result.data)
    .catch(e => null)

    console.log('album', album.tracks);

    const data = {
        'page_title': album.title,
        'album': album,
        'tracks': album.tracks

    }
    res.render('private/albums/single', data)
})

module.exports = router
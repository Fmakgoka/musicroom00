const express = require('express')
const router = express.Router()
const axios = require('axios')

router.get('/:id', async function(req, res){
    const artist = await axios(`${ process.env.DEEZER_API_URL }/artist/${req.params.id}`)
    .then(result => result.data)
    .catch(e => null)

    const tracks = await axios(`${ process.env.DEEZER_API_URL }/artist/${req.params.id}/top?limit=10`)
    .then(result => result.data)
    .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': artist.name,
        'artist': artist,
        'tracks': tracks
    }

    res.render('private/artist/single', data)
})

module.exports = router

'use strict'

const express = require('express')
const router = express.Router()
const axios = require('axios')
const { isAuth } = require('../middleware/auth')
const userModel = require('../models/user')
const playlistModel =  require('../models/playlist');

router.get('/', isAuth, async (req, res) => {
    const chart = await axios(`${ process.env.DEEZER_API_URL }/chart`)
    .then(result => result.data)
    .catch(e => null)
    const musicroomPlaylists = await playlistModel.find({private: false})
    console.log(musicroomPlaylists);
    const data = {
        'user': req.user,
        'page_title': process.env.APP_NAME,
        'tracks': chart ? chart.tracks : null,
        'albums': chart ? chart.albums : null,
        'artists': chart ? chart.artists : null,
        'playlists': chart ? chart.playlists : null,
        'musicroomPlaylists': musicroomPlaylists
    }

    res.render('private/home', data)
})

router.get('/:id/artist', async (req, res) => {
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

    res.render('private/artist', data)
})

router.get('/:id/playlist', async (req, res) => {
    const playlist = await axios(`${ process.env.DEEZER_API_URL }/playlist/${req.params.id}`)
    .then(result => result.data)
    .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': playlist.title,
        'playlist': playlist,
        'tracks': playlist.tracks
    }

    res.render('private/playlist', data)
})

router.get('/:id/album', async (req, res) => {
    const album = await axios(`${ process.env.DEEZER_API_URL }/album/${req.params.id}`)
    .then(result => result.data)
    .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': album.title,
        'album': album,
        'tracks': album.tracks
    }

    res.render('private/album', data)
})

router.get('/:id/track', async (req, res) => {
    const tracks = await axios(`${ process.env.DEEZER_API_URL }/track/${req.params.id}`)
    .then(result => result.data)
    .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': tracks.title,
        'track': tracks

    }

    res.render('private/track', data)
})

module.exports = router
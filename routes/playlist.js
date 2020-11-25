'use strict'

const express = require('express')
const router = express.Router()
const axios = require('axios')

router.get('/:id', async (req, res) => {
    const playlist = await axios(`${ process.env.DEEZER_API_URL }/playlist/${req.params.id}`)
        .then(result => result.data)
        .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': playlist.title,
        'playlist': playlist,
        'tracks': playlist.tracks
    }

    res.render('private/playlist/single', data)
})

router.get('/', async (req, res) => {
    const playlists = await axios(`${ process.env.DEEZER_API_URL }/user/2529/playlists`)
        .then(result => result.data)
        .catch(e => null)

    const data = {
        'user': req.user,
        'page_title': 'Playlists',
        'playlists': playlists ? playlists : null
    }

    res.render('private/playlists/index', data)
})

router.get('/create', (req, res) => {
    res.json('Create Playlist')
})

router.get('/delete', (req, res) => {
    res.json('Delete Playlist')
})

router.get('/update', (req, res) => {
    res.json('Update Playlist')
})

module.exports = router
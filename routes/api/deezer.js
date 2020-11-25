'use strict'

const express = require('express')
const router = express.Router()
const cors = require('cors')
const axios = require('axios')

// Handle cors
router.use(cors())

// Get deezer user info by id
router.get('/user/:id', async (req, res) => {
    const user = await axios(`${ process.env.DEEZER_API_URL }/user/${ req.params.id }`)
        .then(result => result.data)
        .catch(e => {})
    res.json(user)
})

// Get deezer user's playlists
router.get('/user/:id/playlists', async (req, res) => {
    const index = req.query.index ? req.query.index : 0
    const playlists = await axios(`${ process.env.DEEZER_API_URL }/user/${ req.params.id }/playlists?index=${ index }`)
        .then(result => result.data)
        .catch(e => [])
    res.json(playlists)
})

// Get a deezer playlist by id
router.get('/playlist/:id', async (req, res) => {
    const playlist = await axios(`${ process.env.DEEZER_API_URL }/playlist/${ req.params.id }`)
        .then(result => result.data)
        .catch(e => {})
    res.json(playlist)
})

// Get the tracks of a deezer playlist
router.get('/playlist/:id/tracks', async (req, res) => {
    const tracks = await axios(`${ process.env.DEEZER_API_URL }/playlist/${ req.params.id }/tracks`)
        .then(result => result.data)
        .catch(e => {})
    res.json(tracks)
})

// Get latest deezer charts (Tracks, Albums, Artists, Playlists and Podcasts)
router.get('/chart', async (req, res) => {
    const tracks = await axios(`${ process.env.DEEZER_API_URL }/chart`)
        .then(result => result.data)
        .catch(e => {})
    res.json(tracks)
})

// Get artist tracklist
router.get('/artist/:id/top', async (req, res) => {
    const id = req.params.id
    const index = req.query.index ? req.query.index : null
    const limit = req.query.limit ? req.query.limit : null
    const tracks = await axios(`${ process.env.DEEZER_API_URL }/artist/${ id }/top?index=${ index }&limit=${ limit }`)
        .then(result => result.data)
        .catch(e => {})
    res.json(tracks)
})

module.exports = router
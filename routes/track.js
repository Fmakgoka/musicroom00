const express = require('express')
const router = express.Router()
const axios = require('axios')
const userModel = require('../models/user')
const playlistModel = require('../models/playlist')
const { findOne } = require('../models/user')

router.get('/:id/add', async (req, res) => {
    const my = await playlistModel.find({ userId: req.user.userId })
    const public = await playlistModel.find({ 'users.userId': req.user.userId })

    const playlists = [ ...my, ...public ]

    console.log(playlists)

    const data = {
        'user': req.user,
        'page_title': 'Add To Playlist',
        'playlists': playlists
    }

    res.render('private/track/add', data)
})

router.post('/:id/add', async (req, res) => {
    const playlists = await playlistModel.find({ $or: [ { userId: req.user.userId } ] })
    
    const validations = {
        playlist: undefined
    }

    const { playlist } = req.body

    if(!playlist)
        validations.playlist = 'Select a playlist'

    if(validations.playlist){
        const data = {
            'user': req.user,
            'page_title': 'Add To Playlist',
            'playlists': playlists,
            'error_message': 'Complete required fields',
            'playlist': playlist,
            'playlist_validation': validations.playlist
        }
        res.render('private/track/add', data)
    }else{
        const authUser = await playlistModel.findOne({ playlistId: playlist, 'users.userId': req.user.userId })
        const creator = await playlistModel.findOne({ userId: req.user.userId, playlistId: playlist })

        if(authUser || creator){
            const track = await axios(`${ process.env.DEEZER_API_URL }/track/${req.params.id}`)
            .then(result => result.data)
            .catch(e => null)
            
            const trackExist = await playlistModel.findOne({ playlistId: playlist, 'tracks.id': track.id })

            if(trackExist){
                const data = {
                    'user': req.user,
                    'page_title': 'Add To Playlist',
                    'playlists': playlists,
                    'error_message': 'Track already exist in playlist',
                }
                res.render('private/track/add', data)
            }else{
                playlistModel.updateOne({ playlistId: playlist }, {
                    $addToSet : { tracks: track }
                }).then(() => {
                    const data = {
                        'user': req.user,
                        'page_title': 'Add To Playlist',
                        'playlists': playlists,
                        'success_message': 'Track added to playlist',
                    }
                    res.render('private/track/add', data)
                })
            }
        }else{
            const data = {
                'user': req.user,
                'page_title': 'Add To Playlist',
                'playlists': playlists,
                'error_message': 'You do not not have access',
            }
            res.render('private/track/add', data)
        }

    }
})

router.get('/:playlistId/delete/:trackId', async (req, res) => {
    const playlistId = req.params.playlistId
    const trackId = req.params.trackId
    const link = 'https://www.deezer.com/track/' + trackId

    console.log(playlistId)
    console.log(trackId)

    playlistModel.updateOne({ playlistId: playlistId }, {
        $pull: { tracks: { link: link } }
    }).then((result) => {
        res.redirect(`/playlists/${ playlistId }/view`)
    })
})

router.get('/:playlistId/delete/:trackId/confirm', (req, res) => {
    const data = {
        'user': req.user,
        'page_title': 'Remove Track',
        'playlistId': req.params.playlistId,
        'trackId': req.params.trackId
    }

    res.render('private/track/delete', data)
})

module.exports = router

'use strict'

const express = require('express')
const router = express.Router()
const axios = require('axios')
const md5 = require('md5')
const uuid = require('uuid').v4
const fs = require('fs')
const sharp = require('sharp')
const validate = require('../helpers/validate')
const playlistModel = require('../models/playlist')
const userModel = require('../models/user')

router.get('/', async (req, res) => {
    const playlists = await playlistModel.find({ userId: req.user.userId })

    const data = {
        'user': req.user,
        'page_title': 'Playlists',
        'playlists': playlists
    }

    res.render('private/userPlaylists/playlists', data)
})

router.get('/:id/view', async (req, res) => {
    const playlist = await playlistModel.findOne({ playlistId: req.params.id })
    const creater = await userModel.findOne({ userId: playlist.userId })
    const users = await playlistModel.findOne({ playlistId: req.params.id, 'users.userId': req.user.userId })

    const data = {
        'user': req.user,
        'page_title': playlist.title,
        'playlist': playlist,
        'tracks': playlist.tracks,
        'creater': creater,
        'access': users ? true : false
    }

    res.render('private/userPlaylists/single', data)
})

router.get('/create', (req, res) => {
    const data = {
        'user': req.user,
        'page_title': 'Create Playlist'
    }

    res.render('private/userPlaylists/create', data)
})

router.post('/create', async (req, res) => {
    const validations = {
        title: undefined,
        description: undefined,
        thumbnail: undefined
    }

    const { title, description } = req.body
    const checkBox = req.body.private ? true : undefined
    const thumbnail = req.files ? req.files.thumbnail : null

    validations.thumbnail = validate.image(thumbnail,{
        type:'Only .png, .jpg and .jpeg format allowed',
        size:'Max image file size is 1mb',
        required:'Thumbnail is required'
    })

    if(!title)
        validations.title = 'Playlist title is required'
    
    if(!thumbnail)
        validations.thumbnail = undefined

    if(validations.title || validations.description || validations.thumbnail){
        const data = {
            'user': req.user,
            'page_title': 'Create Playlist',
            'error_message': 'Complete required fields',
            'title': title,
            'description': description,
            'title_validation': validations.title,
            'description_validation': validations.description,
            'thumbnail_validation': validations.thumbnail,
            'private': checkBox
        }
        res.render('private/userPlaylists/create', data)
    }else{

        const thumbnailPath = `${ process.env.ROOT_URL }:${ process.env.PORT }/img/playlists/`
        
        if( thumbnail ){
            if(thumbnail.mimetype == 'image/png')
                thumbnail.name = uuid() + '.png'
            else if(thumbnail.mimetype == 'image/jpg')
                thumbnail.name = uuid() + '.jpg'
            else if(thumbnail.mimetype == 'image/jpeg')
                thumbnail.name = uuid() + '.jpeg'

            await thumbnail.mv(`./public/img/playlists/${ thumbnail.name }`, async (err) => {
                if (err) throw err
                try{
                    await sharp(`./public/img/playlists/${ thumbnail.name }`).resize(250, 250).toBuffer((err, buffer) => {
                        fs.writeFile(`./public/img/playlists/${ thumbnail.name }`, buffer, () => {
                            console.log('Complete')
                        })
                    })
                }catch{}
            })
        }

        playlistModel.create({
            playlistId: md5( uuid() ),
            userId: req.user.userId,
            title: title,
            description: description ? description : undefined,
            thumbnail: thumbnail ? thumbnailPath + thumbnail.name : undefined,
            private: checkBox
        }).then(() => {
            const data = {
                'user': req.user,
                'page_title': 'Create Playlist',
                'success_message': 'Playlist Created',
            }
            res.render('private/userPlaylists/create', data)
        })

    }

})

router.get('/:id/access', async (req, res) => {
    const playlist = await playlistModel.findOne({ playlistId: req.params.id })

    const users = await userModel.find({ userId: { $in: playlist.users.map(user => user.userId) } })

    const data = {
        'user': req.user,
        'page_title': 'Manage Access',
        'playlistId': req.params.id,
        'users': users
    }

    res.render('private/userPlaylists/access', data)
})

router.post('/:id/access', async (req, res) => {
    const playlist = await playlistModel.findOne({ playlistId: req.params.id })
    
    const validations = { username: undefined }

    const username = req.body.username

    validations.username = validate.username(username, {
        required: 'Username required',
        invalid: `"${ username }" is not valid username`,
    })

    if(!validations.username){
        const checkUsername = await userModel.findOne({ username: { '$regex' : '^' + username + '$', '$options': '-i' } })
        if(!checkUsername)
            validations.username = `"${ username }" is not a registered user`
    }

    if(validations.username){
        const users = await userModel.find({ userId: { $in: playlist.users.map(user => user.userId) } })

        const data = {
            'user': req.user,
            'page_title': 'Manage Access',
            'playlistId': req.params.id,
            'users': users,
            'error_message': validations.username,
            'username': username,
            'username_validation': validations.username
        }
    
        res.render('private/userPlaylists/access', data)
    }else{
        let users = undefined
        const user = await userModel.findOne({ username: { '$regex' : '^' + username + '$', '$options': '-i' } })
        playlistModel.updateOne({ playlistId: req.params.id }, {
            $push : { users: { userId: user.userId } }
        }).then( async () => {
            playlist.users.push({ userId: user.userId })
            users = await userModel.find({ userId: { $in: playlist.users.map(user => user.userId) } })

            const data = {
                'user': req.user,
                'page_title': 'Manage Access',
                'playlistId': req.params.id,
                'users': users,
                'success_message': 'User added to playlist'
            }
            res.render('private/userPlaylists/access', data)
        })

    }

})

router.get('/:playlistId/delete/:userId', async (req, res) => {
    const playlistId = req.params.playlistId
    const userId = req.params.userId


    playlistModel.updateOne({ playlistId: playlistId },{
        "$pull":{"users":{ userId }}
    }).then((info) => {
        console.log(info)
        res.redirect(`/playlists/${ playlistId }/access`)
    })
})

router.get('/:playlistId/delete/:userId/confirm', (req, res) => {
    const data = {
        'user': req.user,
        'page_title': 'Remove User',
        'playlistId': req.params.playlistId,
        'userId': req.params.userId
    }

    res.render('private/userPlaylists/removeUser', data)
})

router.get('/:id/update', async (req, res) => {
    const playlist = await playlistModel.findOne({ playlistId: req.params.id })

    const data = {
        'user': req.user,
        'page_title': `Edit ${ playlist.title }`,
        'playlist': playlist
    }

    res.render('private/userPlaylists/update', data)
})

router.post('/:id/update', async (req, res) => {
    const playlist = await playlistModel.findOne({ playlistId: req.params.id })

    const validations = {
        title: undefined,
        description: undefined,
        thumbnail: undefined
    }

    const { title, description } = req.body
    const checkBox = req.body.private ? true : false
    const thumbnail = req.files ? req.files.thumbnail : null

    validations.thumbnail = validate.image(thumbnail,{
        type:'Only .png, .jpg and .jpeg format allowed',
        size:'Max image file size is 1mb',
        required:'Thumbnail is required'
    })

    if(!title)
        validations.title = 'Playlist title is required'
    
    if(!thumbnail)
        validations.thumbnail = undefined

    if(validations.title || validations.description || validations.thumbnail){
        const data = {
            'user': req.user,
            'page_title': 'Create Playlist',
            'playlist': playlist,
            'error_message': 'Complete required fields',
            'title': title,
            'description': description,
            'title_validation': validations.title,
            'description_validation': validations.description,
            'thumbnail_validation': validations.thumbnail,
            'private': checkBox
        }
        res.render('private/userPlaylists/update', data)
    }else{

        const thumbnailPath = `${ process.env.ROOT_URL }:${ process.env.PORT }/img/playlists/`
        
        if( thumbnail ){
            const ROOT_URL = `${ process.env.ROOT_URL }:${ process.env.PORT }`

            if(playlist.thumbnail != `${ ROOT_URL }/img/playlist-thumbnail.jpg`){
                try {
                    fs.unlinkSync(playlist.thumbnail.replace(ROOT_URL, './public'))
                } catch {}
            }

            if(thumbnail.mimetype == 'image/png')
                thumbnail.name = uuid() + '.png'
            else if(thumbnail.mimetype == 'image/jpg')
                thumbnail.name = uuid() + '.jpg'
            else if(thumbnail.mimetype == 'image/jpeg')
                thumbnail.name = uuid() + '.jpeg'

            await thumbnail.mv( `./public/img/playlists/${ thumbnail.name }`, async (err) => {
                if (err) throw err
                try{
                    await sharp(`./public/img/playlists/${ thumbnail.name }`).resize(250, 250).toBuffer((err, buffer) => {
                        fs.writeFile(`./public/img/playlists/${ thumbnail.name }`, buffer, () => {
                            console.log('Complete')
                        })
                    })
                }catch{}
            })
        }

        playlistModel.updateOne({ playlistId: req.params.id },{
            title: title,
            description: description ? description : undefined,
            thumbnail: thumbnail ? thumbnailPath + thumbnail.name : playlist.thumbnail,
            private: checkBox
        }).then( async () => {
            const data = {
                'user': req.user,
                'page_title': 'Create Playlist',
                'playlist': await playlistModel.findOne({ playlistId: req.params.id }),
                'success_message': 'Playlist Updated',
            }
            res.render('private/userPlaylists/update', data)
        })

    }
})

router.get('/:id/request', (req, res) => {
    const playlistId = req.params.id
    res.redirect(`/playlists/${playlistId}/view`)
})

router.get('/delete/:id/confirm', async (req, res) => {
    const playlistId = req.params.id

    const data = {
        'user': req.user,
        'page_title': 'Delete Playlist',
        'playlistId': playlistId
    }

    res.render('private/userPlaylists/deletePlaylist', data)
})

router.get('/delete/:id', async (req, res) => {
    const playlistId = req.params.id
    const playlist = await playlistModel.findOne({ playlistId: playlistId })

    const ROOT_URL = `${ process.env.ROOT_URL }:${ process.env.PORT }`
    
    
    playlistModel.deleteOne({ playlistId: req.params.id })
    .then(() => {
        if(playlist.thumbnail != `${ ROOT_URL }/img/playlist-thumbnail.jpg`){
            try {
                fs.unlinkSync(playlist.thumbnail.replace(ROOT_URL, './public'))
            } catch {}
        }
        res.redirect('/playlists')
    })
})

module.exports = router
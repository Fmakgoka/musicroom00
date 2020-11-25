'use strict'

const mongoose = require('mongoose')

const PlaylistSchema = new mongoose.Schema({
    playlistId: { type: String, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String,  default: null },
    thumbnail: { type: String, default: `${ process.env.ROOT_URL }:${ process.env.PORT }/img/playlist-thumbnail.jpg` },
    private: { type: Boolean, default: false },
    users: { type: Array, default: [] },
    requests: { type: Array, default: [] },
    tracks: { type: Array, default: [] }
}, {timestamps: true})

const playlistModel = mongoose.model('Playlist', PlaylistSchema)

module.exports = playlistModel
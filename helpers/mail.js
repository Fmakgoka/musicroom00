'use strict'

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
})

module.exports.sendmail = (body) => {
    return new Promise((resolve) => {
        transporter.sendMail({
            from: '"Music_Room" <no-reply@Music_Room.com>',
            to: body.to,
            subject: body.subject,
            html: this.html(body),
          }, (err, result) => {
            if(err)
                resolve(false)
            else
                resolve(true)
        })
    })
}

module.exports.html = (body) => {
    return `
    <style>
        .message-body{
            padding: 100px;
            background-color: #00aced;
            color: #ffffff;
            text-align: center;
        }
        .title{
            color: #ffffff;
        }
        a.btn{
            display: block;
            padding: 10px,
            border: 1px solid #ffffff;
            color: inherit;
            border-radius: 3px;
        }
    </style>
    <div class="message-body">
        <h1 class="title" >Music Room</h1>
        ${body.html}
    </div>
    `
}
const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const {generateMsg, generateLocationMsg} = require('./utils/message')

const publicPath = path.join(__dirname,'../public')
const port = process.env.PORT || 3000

var app = express()
var server = http.createServer(app)
var io = socketIO(server)
app.use(express.static(publicPath));

io.on('connection', (socket)=>{
    console.log('new user connected')

    socket.emit('newMsg', {
        from: 'admin',
        text:'welcome to chat app',
        createdAt:new Date().getTime()
    })

    socket.broadcast.emit('newMsg', {
        from: 'admin',
        text:'new user join',
        createdAt:new Date().getTime()
    })

    socket.on('createMsg', (msg, callback)=>{
        console.log('create msg', msg)
        io.emit('newMsg', generateMsg(msg.from, msg.text))
        callback('this is from the server')
    })

    socket.on('createLocationMsg', (coords)=>{
        var str = coords.latitude + coords.longitude
        io.emit('newLocationMsg', generateLocationMsg('amdin', coords.latitude, coords.longitude))
    })

    socket.on('disconnect', ()=>{
        console.log('user was disconnected')
    })
})

server.listen(port, function() {
    console.log('App listening on port '+port);
});
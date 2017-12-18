const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const {generateMsg, generateLocationMsg} = require('./utils/message')
const {isRealString} = require('./utils/validation')
const {Users} = require('./utils/users')

const publicPath = path.join(__dirname,'../public')
const port = process.env.PORT || 3000

var app = express()
var server = http.createServer(app)
var io = socketIO(server)
var users = new Users()

app.use(express.static(publicPath));

io.on('connection', (socket)=>{
    console.log('new user connected')

    socket.on('join', (params, callback)=>{
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('name and room name are require')
        }
        socket.join(params.room)
        users.removeUser(socket.id)
        users.addUser(socket.id, params.name, params.room)
        
        io.to(params.room).emit('updateUserList', users.getUserList(params.room))
        
        socket.emit('newMsg', {
            from: 'admin',
            text:'welcome to chat app',
            createdAt:new Date().getTime()
        })
    
        socket.broadcast.to(params.room).emit('newMsg', generateMsg('admin', params.name+' has joined'))

        callback()
    })

    socket.on('createMsg', (msg, callback)=>{
        var user = users.getUser(socket.id)
        
        if (user && isRealString(msg.text)) {
            io.to(user.room).emit('newMsg', generateMsg(user.name, msg.text))            
        }

        callback()
    })

    socket.on('createLocationMsg', (coords)=>{
        var user = users.getUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('newLocationMsg', generateLocationMsg(user.name, coords.latitude, coords.longitude))            
        }

    })

    socket.on('disconnect', ()=>{
        console.log('user was disconnected')
        var user = users.removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room))
            io.to(user.room).emit('newMsg', generateMsg('admin', user.name+' has left'))        
        }
    })
})

server.listen(port, function() {
});
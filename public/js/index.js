var socket = io();

socket.on('connect', function(){
    console.log('connected to server')
})

socket.on('disconnect', function(){
    console.log('disconnect from server')
})

socket.on('newMsg', function(msg){
    console.log('new msg', msg)
})
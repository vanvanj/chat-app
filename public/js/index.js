var socket = io();

socket.on('connect', function(){
    console.log('connected to server')
})

socket.on('disconnect', function(){
    console.log('disconnect from server')
})

socket.on('newMsg', function(msg){
    console.log('new msg', msg)
    var li = jQuery('<li></li>')
    li.text(msg.from+':'+msg.text)
    jQuery('#msgs').append(li)
})

socket.on('newLocationMsg', function(msg){
    var li = jQuery('<li></li>')
    var a = jQuery('<a target="_blank">my current location</a>')
    li.text(msg.from+": ")
    a.attr('href', msg.url)
    li.append(a)
    jQuery('#msgs').append(li)    
})

jQuery('#msg-form').on('submit', function(e){
    e.preventDefault();
    socket.emit('createMsg', {
        from:'User',
        text:jQuery('[name=msg]').val()
    }, function(){

    })
})

var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
    if (!navigator.geolocation) {
        return alert('geo not support')
    }

    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        socket.emit('createLocationMsg', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        })
    }, function(){
        alert('unable to fetch position')
    })

})










var socket = io();

function scrollToBottom() {
    var msgs = jQuery('#msgs')
    var newMsg = msgs.children('li:last-child')
    var clientH = msgs.prop('clientHeight')
    var scrollTop = msgs.prop('scrollTop')
    var scrollH = msgs.prop('scrollHeight')
    var newMsgH = newMsg.innerHeight()
    var lastMsgH = newMsg.prev().innerHeight()
    if (clientH + scrollTop + newMsgH + lastMsgH >= scrollH) {
        msgs.scrollTop(scrollH)
    }
}

socket.on('connect', function(){
    console.log('connected to server')
    var params = jQuery.deparam(window.location.search)
    socket.emit('join', params, function(err){
        if (err) {
            alert(err)
            window.location.href = '/'
        } else {
            console.log('no err')
        }
    })
})

socket.on('disconnect', function(){
    console.log('disconnect from server')

})

socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>')
    users.forEach(user => {
        ol.append(jQuery('<li></li>')).text(user)
    });
    jQuery('#users').html(ol)
})

socket.on('newMsg', function(msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm a')

    var template = jQuery('#msg-templete').html()
    var html = Mustache.render(template,{
        text:msg.text,
        from:msg.from,
        createdAt:formattedTime
    })

    jQuery('#msgs').append(html)
    scrollToBottom()
    // console.log('new msg', msg)
    // var li = jQuery('<li></li>')
    // li.text(msg.from+'  '+formattedTime+':  '+msg.text)
    // jQuery('#msgs').append(li)
})

socket.on('newLocationMsg', function(msg){
    var formattedTime = moment(msg.createdAt).format('h:mm a')
    
    var li = jQuery('<li></li>')
    var a = jQuery('<a target="_blank">my current location</a>')
    li.text(msg.from+'  '+formattedTime+':  ')
    a.attr('href', msg.url)
    li.append(a)
    jQuery('#msgs').append(li)    
    scrollToBottom()
})

jQuery('#msg-form').on('submit', function(e){
    e.preventDefault();

    var msgTextBox = jQuery('[name=msg]')

    socket.emit('createMsg', {
        text:msgTextBox.val()
    }, function(){
        msgTextBox.val('')
    })
})

var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
    if (!navigator.geolocation) {
        return alert('geo not support')
    }

    locationButton.attr('disabled', 'disabled').text('sending location...')

    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled')
        socket.emit('createLocationMsg', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        })
    }, function() {
        locationButton.removeAttr('disabled')        
        alert('unable to fetch position')
    })

})










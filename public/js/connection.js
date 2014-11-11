/************************
 * Non Socket.io stuff
 ************************/
// Write the message to the #message area
var appendMessage = function(msg, user) {
  if (msg) {
    switch(user) {
        case 'server':
        case 'notice':
            var appendId = '<li class="' + user + '">';
            $('#messages').append(
                $(appendId).text(msg).fadeIn(50)
            );
        break;
        default:
            var appendId = '<li class="user">';
            $('#messages').append(
                $(appendId)
                    .html('<span class="name">' + user + ':</span> ')
                    .append($('<span class="message">').html(emojify.replace(msg)))
                    .fadeIn('fast')
            );
        break;
    }
    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 10);
  }
}

// Lists all of the connected users
var updateUserList = function(list) {
    $('#users-list').text('');

    for(var i = 0; i < list.length; i++) {
        $('#users-list').append($('<p class="user">').text(list[i].username));
    }
}

// Send message on form submit
$('form').submit(function() {
    var msg = $('#m').val();

    socket.emit('chat message', msg);

    $('#m').val('');
    return false;
});

/************************
 * Socket.io
 ************************/
// Lets the user know that they've connected
socket.on('on join message', function(data) {
    if (!enterMessage) {
        appendMessage(data.msg, data.sender);
        for(var i = 0; i < data.messages.length; i++) {
            appendMessage(data.messages[i].message, data.messages[i].sender);
        }
        updateUserList(data.list);
        enterMessage = true;
    }
})

socket.on('update user list', function(list) {
    updateUserList(list);
});

// Recieve messages that have been sent
socket.on('chat message', function(msg, sender) {
    appendMessage(msg, sender);
});
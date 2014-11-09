/************************
 * Non Socket.io stuff
 ************************/
// Write the message to the #message area
var appendMessage = function(msg, user) {
  if (msg) {
    var appendId = user=="server" ? '<li class="' + user + '">' : '<li class="user">';
    if (user != "server") {
        $('#messages').append($(appendId).html("<span>" + user + ":</span> ").append(msg));
    } else {
        $('#messages').append($(appendId).text(msg));
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
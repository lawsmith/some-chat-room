/************************
 * BARE MINIMUM SETUP
 ************************/
// Setup the require variables for web server
// Loads in the required plugins
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Setup some defaults for the web server
app.set('port', (process.env.PORT || 5000))
app.set('/', express.static(__dirname + '/public'));
app.set('/js', express.static(__dirname + '/public/js'));
app.set('/css', express.static(__dirname + '/public/css'));

// Create the Web Server
app.use(express.static(__dirname + '/public'));
http.listen(app.get('port'), function() {
    console.log('Listening on *.' + app.get('port'));
});


/************************
 * Where the real stuff happens
 ************************/
// Emit Constants
var userConnect = "connection";
var userDisconnect = "disconnect";
var newChatMessage = "chat message";
var newUserJoined = "on join message";
var updateUserList = "update user list";

// Variables
var ConnectedUsers = [];
var MessageList = [];

// Setup socket.io
io.on(userConnect, function(client) {
    // Sends the user a message with instructions
    onUserJoin(client);

    // Handles disconnection
    client.on(userDisconnect, function() {
        onUserLeave(client);
    });

    // Recieves Message
    client.on(newChatMessage, function(msg) {
        onNewMessage(client, msg);
    });
});

// Runs on user join
var onUserJoin = function(client) {
    // Adds user to "connected users" list
    ConnectedUsers.push({
        id : client.id,
        username : "Guest-" + (client.id).substring(0, 10)
    });

    // Output to console
    var index = arrayObjectIndexOf(ConnectedUsers, client.id, "id");
    console.log("[USER]" + ConnectedUsers[index].username + " Connected");

    // Send the user some joining data
    var newMessage = "Welcome to the chat room. To change your user name, type '/user [name]'";
    client.emit(newUserJoined, {
        msg : newMessage,
        sender : "server",
        list : ConnectedUsers,
        messages : MessageList
    });
    client.broadcast.emit(updateUserList, ConnectedUsers);
}

// Runs on user leave
var onUserLeave = function(client) {
    var id = client.id;

    var index = arrayObjectIndexOf(ConnectedUsers, client.id, "id");
    console.log("[USER]" + ConnectedUsers[index].username + " Disconnected");

    // Remove the user from the connected users array
    ConnectedUsers.splice(ConnectedUsers.indexOf(id, 1), 1);

    // Send out a signal to tell clients to update their list
    client.broadcast.emit(updateUserList, ConnectedUsers);
}

var onNewMessage = function(client, msg) {
    if (msg) {
        // Add message to array of messages
        var index = arrayObjectIndexOf(ConnectedUsers, client.id, "id");
        var username = ConnectedUsers[index].username;

        // Adds to message array
        MessageList.push({
            message : msg,
            sender : username
        });

        // Outputs to everyone
        io.emit(newChatMessage, msg, username);

        // Logs the message to the server
        console.log('[MESSAGE]' + ConnectedUsers[index].username + ': ' + msg);
    }
}

// A genius function to find the index of a array that's full of objects
// Found on http://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }

    return -1;
}

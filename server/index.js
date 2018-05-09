const express = require('express')
const bodyParser = require('body-parser')
const socket = require('socket.io')
const port = 3005;
let users = [];

const app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + './../build'))
// pass in out listening server into socket
const io = socket(app.listen(port, () => console.log(`0,0 listening on port ${port}`)));

// connect and connection are synonymous here
io.on('connect', function (client) {
    // all client sockets have a unique id
    client.emit('contact', { id: client.id })
    console.log('user connected. Client ID: ', client.id)
    // when user connects, generate list of room occupants
    // and send to all sockets
    generateUsernameListForGeneral();

    client.on('event', function (data) {
        // data: type, message, ind, path 
        // needs: username, timestamp
        let match = users.find(user => user.id === client.id)
        let username = match ? match.username : 'anon'
        let timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
        let sendObj = { type: data.type, message: data.message, ind: data.ind, path: data.path, username, timestamp }
        switch (data.path.split('/')[1]) {
            case 'general':
                io.sockets.emit('message', sendObj)
                break;
            case 'private':
                io.to('private').emit('message', sendObj)
                break;
            case 'admin':
                io.to('admin').emit('message', sendObj)
                break;
            default: break;
        }
    })
    client.on('set username', function (data) {
        let match = users.find(user => user.username === data.username)
        if (match) {
            client.emit('response', { status: 'username taken' })
        } else {
            users.push({ username: data.username, id: client.id })
            // regenerate occupants lists
            generateUsernameListForRoom('private')
            generateUsernameListForRoom('admin')
            generateUsernameListForGeneral()
            client.emit('response', { status: 'username set', username: data.username })
        }
    })
    client.on('join room', function (path) {
        const roomname = path.split('/')[1]
        client.join(roomname)
        // when a client joins a room, generate list of occupants
        // of this rooms and send to all sockets
        generateUsernameListForRoom(roomname)
    })
    client.on('disconnect', function () {
        console.log('user disconnected')
    })

})

function generateUsernameListForRoom(roomname) {
    io.of('/').in(roomname).clients(function (error, clients) {
        let usernames = clients.map(function (id) {
            let match = users.find(user => user.id === id)
            if (match) return match.username
            return 'anonymous'
        })
        io.sockets.emit('occupants', { room: roomname, users: usernames })
    })
}
function generateUsernameListForGeneral() {
    io.of('/').clients(function (error, clients) {
        let usernames = clients.map(function (id) {
            let match = users.find(user => user.id === id)
            if (match) return match.username
            return 'anonymous'
        })
        io.sockets.emit('occupants', { room: 'general', users: usernames })
    })
}
// socket.emit -- sendds just to the original sender
// socket.broadcast.emit -- sends to all other sockets
// io.sockets.emit -- sends to all including sender
// socket.on('join room') ... socket.join('thisroom')
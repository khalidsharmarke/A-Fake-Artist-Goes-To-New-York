const PORT = process.env.PORT || 8000

const express = require('express')
const app = express()
const server = app.listen(PORT, () => console.log(`running on port ${PORT}`))

const io = require('socket.io')(server)

app.use('/', express.static('client'))

// 
io.on('connection', socket => {
    // creating a test-room for development
    // appends to a Set object on socket
    // socket.rooms 
    socket.join('test room')

    // TODO:
    // here we should instantiate a game obj
    // to track game state and stack history

    // update users in room for new image
    socket.on('gameplay-stroke', data => {
        // get which room from sender
        // send to all in same room
        // if(socket.rooms.has('test room')){

        // }
        console.log(socket.rooms)
        io.in('test room').emit('new-image', data)
    })
});

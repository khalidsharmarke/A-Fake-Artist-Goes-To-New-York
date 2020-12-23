const PORT = process.env.PORT || 8000

const express = require('express')
const app = express()
const server = app.listen(PORT, () => console.log(`running on port ${PORT}`))

const io = require('socket.io')(server)

app.use('/', express.static('client'))

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('request', data => {
        console.log(data)
        io.emit('response', {
            test: 123
        })
    })
});
const socket = io()

socket.emit('request', {
    foo: 'bar'
})

socket.on('response', data => {
    console.log(data)
})
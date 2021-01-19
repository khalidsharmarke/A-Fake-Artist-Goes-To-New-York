const PORT = process.env.PORT || 8000

const {setOfActiveGames, checkIfGameExists, createNewGame, getRoomObjFromID} = require('./utils/game')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const server = app.listen(PORT, () => console.log(`running on port ${PORT}`))
const io = require('socket.io')(server)

// Express Middleware POST parsers ///////////////////////////////////
// create application/json parser
const jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// Express cookie ////////////////////////////////////////////////////
// need cookieParser middleware before we can do anything with cookies
const cookie = require("cookie");
const cookieParser = require('cookie-parser');
// TO DO:
// change secret
const COOKIE_SECRET = 'TEMPORARY_SECRET_TO_BE_REPLACED_W_ENV_VAR'
const cookieOptions = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: false // Indicates if the cookie should be signed
}
app.use(cookieParser());

// this needs to happen after we use the cookieparser middleware
app.use('/', function (req, res, next) {
    // send back to root if user trying to access /game without cookie
    if (['/game/', '/game/index.html'].includes(req.originalUrl)){
        if (!("room_id" in req.cookies)){
            // means no room_id in cookies array
            return res.redirect('/')
        }
    }
    next()
}, express.static('client'))

app.post('/create_game', urlencodedParser, (req, res)=>{
    const new_game_id = createNewGame()
    // Set cookie`
    res.cookie('room_id', new_game_id, cookieOptions) // options is optional
    res.redirect('/game')
})

app.post('/join_game', urlencodedParser, (req, res)=>{
    const game_id_to_join = Number(req.body.game_id)
    const gameAlive = checkIfGameExists(game_id_to_join)
    if (gameAlive){
	    res.cookie('room_id', game_id_to_join, cookieOptions) // options is optional
		res.redirect('/game')
	}
	else {
		console.log(`${game_id_to_join} does not exist. redirecting to /`)
        // TODO : 
        // need to flash on page that the game_id entered doesnt exist
		res.redirect('/')
    }
})

// checks if client is assigned to room
function getRoomIDFromSocket(socket_obj){
    let result = null
    try{
        const parsed_cookie = cookie.parse(socket_obj.request.headers.cookie)
        const room_id = Number(parsed_cookie['room_id'])
        result = room_id
	}
	catch (e){ 
        console.log(e)
    }
    return result
}

// validates socket requests
function validateSocket(socket_obj){
    let result = null
    const room_id = getRoomIDFromSocket(socket_obj)
    const room = getRoomObjFromID(room_id)
    // adds socket to room if client is missing room and if room exists
    // will drop connections on server restart
    if (room_id !== null && !socket_obj.rooms.has(room_id) && room !== null){
        socket_obj.join(room_id)
        room.addPlayer(socket_obj.id)
        result = room
    }
    // drops connection if not validated
    else {
        socket_obj.disconnect(true)
    }
    console.log(result)
    return result
}

// there exists documentation for Socket IO Middleware
// possible to implement before io.on connection
io.on('connection', socket => {
    // validate all incoming connections
    const room = validateSocket(socket)
    // stops server-side operations on invalid socket connection
    if (room == null) return

    let currentPlayerNumber = room.getCurrentPlayerSocket()

    socket.emit('room_id', room.id)
    socket.emit('player_number', room.getPlayerNumberFromSocketID(socket.id))
    // needed to enable turn for room creator
    io.to(currentPlayerNumber).emit('enable_turn', true)

    // update users in room for new image
    socket.on('gameplay_stroke', image_as_json => {
        // send all clients in room new image
        io.in(room.id).emit('new_image', image_as_json)
        room.nextTurn()
        io.to(currentPlayerNumber).emit('enable_turn', true)
    });
});

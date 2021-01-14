const PORT = process.env.PORT || 8000

const {set_of_active_games, generate_game_id, checkIfGameAlive, createNewGame, getGameFromSet} = require('./utils/game')

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

//////////////////////////////////////
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
//////////////////////////////////////

app.post('/create_game', urlencodedParser, (req, res)=>{
    const new_game_id = createNewGame()
	console.log(set_of_active_games)

    // Set cookie`
    res.cookie('room_id', new_game_id, cookieOptions) // options is optional
    res.redirect('/game')
})

app.post('/join_game', urlencodedParser, (req, res)=>{
	const game_id_to_join = Number(req.body.game_id)

    const gameAlive = checkIfGameAlive(game_id_to_join)
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
function getRoomFromSocket(socket_obj){
    try{
        const parsed_cookie = cookie.parse(socket_obj.request.headers.cookie)
        const room_id = Number(parsed_cookie['room_id'])
        return room_id
	}
	catch (e){ 
        console.log(e)
		return null
	}
}

// validates socket requests
function validateSocket(socket_obj){
    const room_id = getRoomFromSocket(socket_obj)
    const room = getGameFromSet(room_id)
    // adds socket to room if client is missing room and if room exists
    // will drop connections on server restart
    if (room_id !== null && !socket_obj.rooms.has(room_id) && room !== null){
        socket_obj.join(room_id)
        room.addPlayer(socket_obj.id)
        return {room_id, room}
    }
    // drops connection if not validated
    else {
        socket_obj.disconnect(true)
        return null
    }
}

// there exists documentation for Socket IO Middleware
// possible to implement before io.on connection
io.on('connection', socket => {
    const {room_id, room} = validateSocket(socket)

    socket.emit('room_id', room_id)
    socket.emit('player_number', room.getPlayerNumber(socket.id))
    // needed to enable turn for room creator
    io.to(room.getCurrentPlayer()).emit('enable_turn', true)

    // update users in room for new image
    socket.on('gameplay_stroke', data => {
        // send all clients in room new image
        io.in(room_id).emit('new_image', data)
        const nextPlayer = room.nextTurn()
        console.log(nextPlayer)
        io.to(nextPlayer).emit('enable_turn', true)
    });
});
   
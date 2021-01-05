const PORT = process.env.PORT || 8000

const express = require('express')
const app = express()
var bodyParser = require('body-parser')

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
        if ("room_id" in req.cookies == 0){
            // means no room_id in cookies array
            return res.redirect('/')
        }
    }
    
    next()
}, express.static('client'))
//////////////////////////////////////


function generate_game_id(){
	return Math.floor(Math.random() * 1000)
}

// TO DO:
// implement check if game is alive
let list_of_active_games = []

app.post('/create_game', urlencodedParser, (req, res)=>{
	let new_game_id = generate_game_id()
	// keep generating ID if it already exists, highly unlikely...
	let successfully_inserted = false

	while (!successfully_inserted){
		if(list_of_active_games.indexOf(new_game_id)){
			list_of_active_games.push(new_game_id) 
			successfully_inserted = true	
		}
		else{
			new_game_id = generate_game_id()
		}
		
	}
	console.log(list_of_active_games)

    // Set cookie
    res.cookie('room_id', new_game_id, cookieOptions) // options is optional
    res.redirect('/game')

})

app.post('/join_game', urlencodedParser, (req, res)=>{
	const game_id_to_join = Number(req.body.game_id)
	console.log(list_of_active_games)
	if(list_of_active_games.includes(game_id_to_join)){
		// game exists
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

    // adds socket to room if client is missing room and if room exists
    // will drop connections on server restart
    if (room_id !== null && !socket_obj.rooms.has(room_id) && list_of_active_games.includes(room_id)){
        socket_obj.join(room_id)
    }
    // drops connection if not validated
    else {
        socket_obj.disconnect(true)
    }

    return room_id
}

io.on('connection', socket => {
    const room_id = validateSocket(socket)
    // TODO:
    // here we should instantiate a game obj
    // to track game state and stack history

    // update users in room for new image
    socket.on('gameplay_stroke', data => {
        console.log(data)
        io.in(room_id).emit('new_image', data)
    });
});
   
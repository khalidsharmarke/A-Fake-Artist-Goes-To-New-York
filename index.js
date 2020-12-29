const PORT = process.env.PORT || 8000

const express = require('express')
const app = express()
var bodyParser = require('body-parser')

const server = app.listen(PORT, () => console.log(`running on port ${PORT}`))
const io = require('socket.io')(server)

// Express Middleware POST parsers ///////////////////////////////////
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/', express.static('client'))

// Express cookie ////////////////////////////////////////////////////
// need cookieParser middleware before we can do anything with cookies
var cookie = require("cookie");
const cookieParser = require('cookie-parser');
const COOKIE_SECRET = 'TEMPORARY_SECRET_TO_BE_REPLACED_W_ENV_VAR'
const cookieOptions = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: false // Indicates if the cookie should be signed
}
app.use(cookieParser());



function generate_game_id(){
	return  Math.floor(Math.random() * 1000)
}

list_of_active_games = []


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
	let game_id_to_join = req.body.game_id
	console.log(list_of_active_games)
	if(list_of_active_games.indexOf(game_id_to_join) !== -1){
		// game exists
	    res.cookie('room_id', game_id_to_join, cookieOptions) // options is optional
		res.redirect('/game')
	}
	else {
		console.log(`${game_id_to_join} does not exist. redirecting to /`)
		// TODO : need to flash on paeg that the game_id entered doesnt exist
		res.redirect('/')
	}
})



io.on('connection', socket => {
	try{
		console.log(socket.request.headers.cookie)
		let parsed_cookie = cookie.parse(socket.request.headers.cookie)
		console.log(parsed_cookie)
		let room_id = parsed_cookie['room_id']
	   	console.log(`a user connected w cookie : ${room_id}`);	
	}
	catch (e){ 
		console.log(e)
		console.log(`cookie not set`)
	}
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
	    socket.on('gameplay-stroke', data=> {
			console.log(data)
	        io.emit('response', {
	            'response': 'ack'
	        })
	    })
	});
});
   
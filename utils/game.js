const Room = require('./Room')
const ActiveGames = require('./ActiveGames')

// TO DO:
// implement remove game after no users present
const set_of_active_games = new ActiveGames()


function generate_game_id(){
	return Math.floor(Math.random() * 1000)
}

function checkIfGameAlive(game_id){
    return set_of_active_games.has(game_id)
}

function getGameFromSet(game_id){
    if (set_of_active_games.has(game_id)){
        return set_of_active_games[game_id]
    }
    return null
}

function createNewGame(){
    let result = undefined
    // TODO:
    // here we should instantiate a game obj
    // to track game state and stack history
    try {
        const game_id = generate_game_id()
        let game = new Room(game_id)
        set_of_active_games.add(game_id, game)
        result = game_id
    }
    catch (e) {
        console.log(e)
        result = null
    }
    return result
}

module.exports = {set_of_active_games, generate_game_id, checkIfGameAlive, createNewGame, getGameFromSet}

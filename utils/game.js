const Room = require('./Room')
const ActiveGames = require('./ActiveGames')

const setOfActiveGames = new ActiveGames()

function generateGameId(){
	return Math.floor(Math.random() * 1000)
}

function checkIfGameExists(game_id){
    return setOfActiveGames.has(game_id)
}

function getRoomFromActiveSet(game_id){
    if (setOfActiveGames.has(game_id)){
        return setOfActiveGames[game_id]
    }
    return null
}

function createNewGame(){
    let result = undefined
    // TODO:
    // here we should instantiate a game obj
    // to track game state and stack history
    try {
        const game_id = generateGameId()
        let game = new Room(game_id)
        setOfActiveGames.add(game_id, game)
        result = game_id
    }
    catch (e) {
        console.log(e)
        result = null
    }
    return result
}

module.exports = {setOfActiveGames, checkIfGameExists, createNewGame, getRoomFromActiveSet}

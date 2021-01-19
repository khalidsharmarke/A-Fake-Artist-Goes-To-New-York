const Room = require('./Room')
const ActiveGames = require('./ActiveGames')

const setOfActiveGames = new ActiveGames()

function generateGameId(){
	return Math.floor(Math.random() * 1000)
}

function checkIfGameExists(room_id){
    return setOfActiveGames.has(room_id)
}

function getRoomObjFromID(room_id){
    if (checkIfGameExists(room_id)){
        return setOfActiveGames[room_id]
    }
    return null
}

function createNewGame(){
    let result = undefined
    try {
        const room = new Room(generateGameId())
        setOfActiveGames.add(room)
        result = room.id
    }
    catch (e) {
        console.log(e)
        result = null
    }
    return result
}

module.exports = {setOfActiveGames, checkIfGameExists, createNewGame, getRoomObjFromID}

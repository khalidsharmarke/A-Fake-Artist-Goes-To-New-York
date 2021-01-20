class Room{
    constructor(room_id){
        this.listOfPlayerSockets = []
        this.currentPlayerNumber = 0
        this.stackHistory = []
        this.id = room_id
    }
    incrementPlayerNumber(){
        this.currentPlayerNumber++;
        if (this.listOfPlayerSockets.length == this.currentPlayerNumber){
            this.currentPlayerNumber = 0
        }
    }
    // TODO
    // this function should execute all logic required to move
    // a room to its next turn ie add to stack
    nextTurn(){
        this.incrementPlayerNumber()
        return null
    }
    addPlayer(player_socket_id){
        this.listOfPlayerSockets.push(player_socket_id)
        return null
    }
    getPlayerNumberFromSocketID(player_socket_id){
        return this.listOfPlayerSockets.indexOf(player_socket_id)
    }
    getCurrentPlayerSocket(){
        return this.listOfPlayerSockets[this.currentPlayerNumber]
    }
}

module.exports = Room

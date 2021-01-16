module.exports = class Room{
    constructor(){
        this.listOfPlayers = []
        this.nextPlayerNumber = 0
        this.stackHistory = []
    }
    incrementPlayerNumber(){
        this.nextPlayerNumber++;
        if (this.listOfPlayers.length == this.nextPlayerNumber){
            this.nextPlayerNumber = 0
        }
    }
    // TODO
    // this function should execute all logic required to move
    // a room to its next turn
    nextTurn(){
        console.log(`player ${this.nextPlayerNumber + 1} is drawing`)
        this.incrementPlayerNumber()
        return null
    }
    addPlayer(player_as_socket){
        this.listOfPlayers.push(player_as_socket)
        return null
    }
    getPlayerNumber(player_as_socket){
        return this.listOfPlayers.indexOf(player_as_socket)
    }
    getCurrentPlayer(){
        return this.listOfPlayers[this.nextPlayerNumber]
    }
}
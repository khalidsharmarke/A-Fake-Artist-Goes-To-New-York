module.exports = class Room{
    #private = 123
    constructor(){
        this.listOfPlayers = []
        this.nextPlayer = 0;
    }
    incrementPlayer(){
        this.nextPlayer++;
        if (this.listOfPlayers.length == this.nextPlayer){
            this.nextPlayer = 0
        }
    }
    nextTurn(){
        const player = this.listOfPlayers[this.nextPlayer]
        console.log(`player ${this.nextPlayer + 1} is drawing`)
        this.incrementPlayer()
        return player
    }
    addPlayer(player_as_socket){
        this.listOfPlayers.push(player_as_socket)
    }
    getPlayerNumber(player_as_socket){
        return this.listOfPlayers.indexOf(player_as_socket)
    }
    test(){
        console.log(this.#private)
    }
}
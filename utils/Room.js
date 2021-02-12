const words = require("./wordList")

class Room {
	constructor(room_id) {
		this.listOfPlayerSockets = []
		this.currentPlayerNumber = 0
		this.stackHistory = []
		this.id = room_id
		this.fakeArtist = null
		this.gameStarted = null
		this.clue = null
	}
	startGame() {
		this.gameStarted = true
		this.selectFakeArtist()
		this.clue = this.selectWord()
	}
	selectWord() {
		return words[Math.floor(Math.random() * words.length)]
	}
	incrementPlayerNumber() {
		this.currentPlayerNumber++
		if (this.listOfPlayerSockets.length <= this.currentPlayerNumber) {
			this.currentPlayerNumber = 0
		}
	}
	// TODO
	// this function should execute all logic required to move
	// a room to its next turn ie add to stack
	nextTurn() {
		this.incrementPlayerNumber()
	}
	addPlayer(player_socket_id) {
		this.listOfPlayerSockets.push(player_socket_id)
	}
	getPlayerNumberFromSocketID(player_socket_id) {
		return this.listOfPlayerSockets.indexOf(player_socket_id)
	}
	getCurrentPlayerSocket() {
		return this.listOfPlayerSockets[this.currentPlayerNumber]
	}
	selectFakeArtist() {
		const random = Math.floor(
			Math.random() * (this.listOfPlayerSockets.length - 1)
		)
		this.fakeArtist = this.listOfPlayerSockets[random]
	}
	removePlayer(player_socket_id) {
		this.listOfPlayerSockets = this.listOfPlayerSockets.filter(
			socket => socket != player_socket_id
		)
	}
	checkIfEmpty() {
		if (this.listOfPlayerSockets.length > 0) {
			return false
		} else {
			return true
		}
	}
}

module.exports = Room

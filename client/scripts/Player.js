class Player {
	constructor() {
		this.isHost = false
		this.isFakeArtist = false
		this.socket = io()
		this.listOfPlayers = null
		this.room_id = null
		this.color = null
		this.number = null
		this.pad = null
		this.board = null
		this.target = document.getElementById("main")
		this.isGameStarted = false
		this.clue = null
	}
	// action handlers after receiving messages from server:
	socketInit() {
		// redirect to homepage on server connection rejection
		this.socket.on("disconnect", reason => {
			console.log(reason)
			alert("disconnected")
			window.location = "/"
		})
		// redirect to homepage on other connection errors
		this.socket.on("connect_error", error => {
			console.log(error)
			alert("connection error")
			window.location = "/"
		})
		// binding the reference of 'this' to the class
		// else the callback methods will reference the Socket once called
		this.socket.on("start_game", this.startGame.bind(this))
		this.socket.on("room_id", this.displayRoomID.bind(this))
		this.socket.on("new_image", this.updateImageFromServer.bind(this))
		this.socket.on("player_number", this.assignNumber.bind(this))
		this.socket.on("enable_turn", this.enableActions.bind(this))
		this.socket.on("player_list", this.listPlayersOnPage.bind(this))
		this.socket.on("assigned_as_host", this.becomeHost.bind(this))
		this.socket.on("room_clue", this.assignClue.bind(this))
		this.socket.on("current_player", this.displayCurrentPlayer.bind(this))
		this.socket.on("assigned_fake_artist", this.setToFakeArtist.bind(this))
	}
	setToFakeArtist() {
		this.isFakeArtist = true
	}
	displayRoomClue() {
		if (this.isFakeArtist) {
			this.target.querySelector("#room_clue").innerHTML =
				"You are the fake artist"
		} else {
			this.target.querySelector(
				"#room_clue"
			).innerHTML = `The Word is ${this.clue}`
		}
	}
	displayCurrentPlayer(player_id) {
		const playerName = player_id
		if (playerName == this.socket.id) {
			playerName == "Your"
		}
		this.target.querySelector(
			"#current_player"
		).innerHTML = `It is ${playerName}'s turn`
	}
	assignClue(clue) {
		this.clue = clue
	}
	becomeHost() {
		this.isHost = true
		if (!this.isGameStarted) {
			this.target.append(this.createStartGameButton())
		}
	}
	listPlayersOnPage(list_of_players) {
		const target = document.querySelector("#list_of_players")
		while (target.firstChild) {
			target.firstChild.remove()
		}
		list_of_players.forEach((player, index) => {
			const node = document.createElement("div")
			node.innerHTML = `${index + 1}. ${player}`
			if (player == this.socket.id) {
				node.style.fontWeight = "bold"
			}
			target.append(node)
		})
	}
	assignNumber(assigned_number) {
		this.number = assigned_number
	}
	updateImageFromServer(whiteboard_json_data) {
		this.pad.loadJSON(
			JSON.parse(decodeURIComponent(whiteboard_json_data.new_board_state))
		)
	}
	displayRoomID(room_id) {
		document.querySelector(
			"#room_id"
		).innerHTML = `Your Room Code is ${room_id}`
	}
	// converts entire sketchpad to JSON
	// then exports to server on submit
	submitPadToServer() {
		const newBoardState = JSON.stringify(this.pad.toJSON())
		this.socket.emit("gameplay_stroke", {
			player_number: this.number,
			new_board_state: encodeURIComponent(newBoardState),
		})
		// disable player actions until
		// it is current client's turn again
		this.disableActions()
	}
	getPlayerColorFromNumber() {
		const colors = [
			"641E16", // dark red
			"512E5F", // dark purple
			"154360", // dark blue
			"AED6F1", // light blue
			"145A32", // dark green
			"82E0AA", // light green
			"7D6608", // dark yellow
			"E67E22", // orange
			"99A3A4", // grey
			"F5B7B1", // light red
		]

		return "#" + colors[this.number]
	}
	sketchpadInit() {
		requirejs(["responsive-sketchpad/sketchpad"], Sketchpad => {
			const sketchpadDiv = this.board.querySelector("#sketchpad")
			this.pad = new Sketchpad(sketchpadDiv, {
				line: {
					size: 5,
				},
				onDrawEnd: () => {
					this.pad.setReadOnly(true)
					this.board.querySelector("#undo").disabled = false
					this.board.querySelector("#submit_stroke").disabled = false
				},
			})

			const enableSubmit = () => {
				this.board.querySelector("#submit_stroke").disabled = false
			}

			const disableSubmit = () => {
				this.board.querySelector("#submit_stroke").disabled = true
			}

			const enableRedo = () => {
				this.board.querySelector("#redo").disabled = false
			}

			const disableRedo = () => {
				this.board.querySelector("#redo").disabled = true
			}

			const enableUndo = () => {
				this.board.querySelector("#undo").disabled = false
			}

			const disableUndo = () => {
				this.board.querySelector("#undo").disabled = true
			}

			// undo
			const undo = () => {
				this.pad.undo()
				this.pad.setReadOnly(false)
			}
			this.board.querySelector("#undo").onclick = function () {
				undo()
				disableUndo()
				enableRedo()
				disableSubmit()
			}

			// redo
			const redo = () => {
				this.pad.redo()
				this.pad.setReadOnly(true)
			}
			this.board.querySelector("#redo").onclick = function () {
				redo()
				disableRedo()
				enableUndo()
				enableSubmit()
			}

			// resize
			window.onresize = e => {
				this.pad.resize(sketchpadDiv.offsetWidth)
			}
			this.pad.setReadOnly(true)
		})
	}
	createBoard() {
		const board = document.createElement("div")
		const sketchpadContainer = document.createElement("div")
		const playerButtonsContainer = document.createElement("div")
		const undoButtonContainer = document.createElement("div")
		const redoButtonContainer = document.createElement("div")
		const submitButtonContainer = document.createElement("div")
		const undoButton = document.createElement("button")
		const redoButton = document.createElement("button")
		const submitButton = document.createElement("button")

		board.id = "board"
		sketchpadContainer.id = "sketchpad"
		playerButtonsContainer.id = "controls"
		undoButton.id = "undo"
		redoButton.id = "redo"
		submitButton.id = "submit_stroke"

		board.classList.add("row")
		sketchpadContainer.classList.add("col-9")
		playerButtonsContainer.classList.add("col-3", "row")
		undoButtonContainer.classList.add("col-4")
		redoButtonContainer.classList.add("col-4")
		submitButtonContainer.classList.add("col-4")
		undoButton.classList.add("u-full-width")
		redoButton.classList.add("u-full-width")
		submitButton.classList.add("u-full-width")

		undoButton.textContent = "Undo"
		redoButton.textContent = "Redo"
		submitButton.textContent = "Sumbit"

		undoButtonContainer.append(undoButton)
		redoButtonContainer.append(redoButton)
		submitButtonContainer.append(submitButton)
		playerButtonsContainer.append(
			undoButtonContainer,
			redoButtonContainer,
			submitButtonContainer
		)

		submitButton.onclick = () => this.submitPadToServer()

		board.append(sketchpadContainer, playerButtonsContainer)
		this.board = board
	}
	enableActions() {
		this.pad.setReadOnly(false)
		console.log("here")
	}
	disableActions() {
		this.board.querySelector("#undo").disabled = true
		this.board.querySelector("#redo").disabled = true
		this.board.querySelector("#submit_stroke").disabled = true
		this.pad.setReadOnly(true)
	}
	createStartGameButton() {
		const button = document.createElement("button")
		button.id = "request_game_start"
		button.innerHTML = "START GAME"
		button.onclick = () => {
			this.socket.emit("request_game_start")
		}
		return button
	}
	init() {
		this.socketInit()
		this.createBoard()
		this.sketchpadInit()
	}
	startGame(word) {
		if (this.isHost) {
			this.target.querySelector("#request_game_start").remove()
		}
		this.clue = word
		this.displayRoomClue()
		this.target.append(this.board)
		this.pad.resize(this.board.offsetWidth)
		this.pad.setLineColor(this.getPlayerColorFromNumber())
		this.disableActions()
		this.isGameStarted = true
	}
}

window.Player = Player

new Player().init()

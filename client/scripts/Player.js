class Player {
	constructor() {
		this.socket = null
		this.listOfPlayers = null
		this.room_id = null
		this.color = null
		this.number = 1
		this.pad = null
		this.board = null
		this.target = document.getElementById("main")
	}
	socketInit() {}
	getPlayerColorFromNumber(player_number) {
		const colors = [
			"641E16", // dark red
			"F5B7B1", // light red
			"512E5F", // dark purple
			"154360", // dark blue
			"AED6F1", // light blue
			"145A32", // dark green
			"82E0AA", // light green
			"7D6608", // dark yellow
			"E67E22", // orange
			"99A3A4", // grey
		]

		return "#" + colors[player_number]
	}
	sketchpadInit() {
		requirejs(["responsive-sketchpad/sketchpad"], Sketchpad => {
			this.pad = new Sketchpad(this.board.querySelector("#sketchpad"), {
				line: {
					size: 5,
				},
				onDrawEnd: () => {
					this.pad.setReadOnly(true)
				},
			})

			// undo
			function undo() {
				this.pad.undo()
				this.pad.setReadOnly(false)
			}
			this.board.querySelector("#undo").onclick = undo

			// redo
			function redo() {
				this.pad.redo()
			}
			this.board.querySelector("#redo").onclick = redo

			// resize
			window.onresize = function (e) {
				this.pad.resize(el.offsetWidth)
			}
			this.pad.setLineColor(this.getPlayerColorFromNumber(this.number))
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
		board.append(sketchpadContainer, playerButtonsContainer)
		return board
	}
	enableActions() {
		this.board.querySelector("#undo").disabled = false
		this.board.querySelector("#redo").disabled = false
		this.board.querySelector("#submit_stroke").disabled = false
		pad.setReadOnly(false)
	}
	disableActions() {
		this.board.querySelector("#undo").disabled = true
		this.board.querySelector("#redo").disabled = true
		this.board.querySelector("#submit_stroke").disabled = true
		pad.setReadOnly(true)
	}
	init() {
		this.board = this.createBoard()
		this.sketchpadInit()
		this.target.append(this.board)
	}
}

new Player().init()

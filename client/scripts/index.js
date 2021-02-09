// TODO:
// refactor to have pad accessible by server
console.log("here")
let pad = null
let player_number = null
let board = null
console.log(Player)

function getPlayerColorFromNumber() {
	// returns color in hex
	// max number is 10
	console.assert(player_number <= 10)

	let colors = [
		"641E16", //dark red
		"F5B7B1", //light red
		"512E5F", //dark purple
		"154360", //dark blue
		"AED6F1", //light blue
		"145A32", //dark green
		"82E0AA", //light green
		"7D6608", // dark yellow
		"E67E22", //orange
		"99A3A4", //grey
	]

	return "#" + colors[player_number]
}
// allows player interations with interface
function enablePlayerActions() {
	if (board == null) return
	board.querySelector("#undo").disabled = false
	board.querySelector("#redo").disabled = false
	board.querySelector("#submit_stroke").disabled = false
	pad.setReadOnly(false)
}
// stops player interactions with interface
function disablePlayerActions() {
	if (board == null) return
	board.querySelector("#undo").disabled = true
	board.querySelector("#redo").disabled = true
	board.querySelector("#submit_stroke").disabled = true
	pad.setReadOnly(true)
}

function sketchpadInit(Sketchpad, board) {
	// hookup whiteboard buttons
	let el = board.querySelector("#sketchpad")
	pad = new Sketchpad(el, {
		line: {
			size: 5,
		},
		onDrawEnd: function () {
			// will need more thorough logic later
			pad.setReadOnly(true)
		},
	})

	// undo
	function undo() {
		pad.undo()
		pad.setReadOnly(false)
	}
	board.querySelector("#undo").onclick = undo

	// redo
	function redo() {
		pad.redo()
	}
	board.querySelector("#redo").onclick = redo

	// resize
	window.onresize = function (e) {
		pad.resize(el.offsetWidth)
	}
	return pad
}

function gameInit(pad, board) {
	pad.setLineColor(getPlayerColorFromNumber())
	board.querySelector("#submit_stroke").onclick = function () {
		submitPadToServer(pad)
	}
}

// after a player has submitted their stroke,
// this function exports the whiteboard as JSON and sends it to the server
function submitPadToServer(pad) {
	const newBoardState = JSON.stringify(pad.toJSON())
	socket.emit("gameplay_stroke", {
		player_number: player_number,
		new_board_state: encodeURIComponent(newBoardState),
	})
	// disable player actions until server determines
	// that it is this clients turn again
	disablePlayerActions()
}

// overwrites current pad with JSONimage from server
function updateImageFromServer(whiteboard_json_data) {
	pad.loadJSON(
		JSON.parse(decodeURIComponent(whiteboard_json_data.new_board_state))
	)
	return
}

function displayRoomID(room_id) {
	document.getElementById(
		"room_id"
	).innerHTML = `Your Room Code is ${room_id}`
}

function createBoard() {
	return document.querySelector("template").content.cloneNode(true)
		.firstElementChild
}

function boardInit() {
	this.board = createBoard()

	requirejs(["responsive-sketchpad/sketchpad"], function (Sketchpad) {
		pad = sketchpadInit(Sketchpad, this.board)
		gameInit(pad, this.board)
	})
	document.querySelector(".container").append(this.board)
	document.querySelector("#start_button").remove()
	if (player_number !== 1) {
		disablePlayerActions()
	}
	return
}

function listPlayersOnPage(list_of_players) {
	const target = document.querySelector("#list_of_players")
	while (target.firstChild) {
		target.firstChild.remove()
	}
	list_of_players.forEach((player, index) => {
		const node = document.createElement("div")
		node.innerHTML = `${index + 1}. ${player}`
		target.append(node)
	})
	return
}

const socket = io()

// redirect to homepage on server connection rejection
socket.on("disconnect", reason => {
	console.log(reason)
	alert("disconnected")
	window.location = "/"
})
// redirect to homepage on other connection errors
socket.on("connect_error", error => {
	console.log(error)
	alert("connection error")
	window.location = "/"
})

// action handlers after receiving messages from server:
socket.on("room_id", displayRoomID)
socket.on("new_image", updateImageFromServer)
socket.on("player_number", assigned_number => (player_number = assigned_number))
socket.on("enable_turn", enablePlayerActions)
socket.on("start_game", boardInit)
socket.on("player_list", listPlayersOnPage)
document.querySelector("#start_button").onclick = e => {
	socket.emit("request_game-start")
}

// TODO:
// refactor to have pad accessible by server
let pad = null

function getPlayerColorFromNumber(player_number) {
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

    return '#' + colors[player_number]

}
// allows player interations with interface
function enablePlayerActions(data){
    document.getElementById('undo').disabled = false
    document.getElementById('redo').disabled = false;
    document.getElementById('submit_stroke').disabled = false
    pad.setReadOnly(false)
}
// stops player interactions with interface 
function disablePlayerActions(data){
    document.getElementById('undo').disabled = true
    document.getElementById('redo').disabled = true;
    document.getElementById('submit_stroke').disabled = true
    pad.setReadOnly(true)
}


function sketchpadInit(Sketchpad) {
    // hookup whiteboard buttons 
    let el = document.getElementById('sketchpad');
    pad = new Sketchpad(el, {
        line: {
            size: 5
        },
        onDrawEnd: function() {
            // will need more thorough logic later
            pad.setReadOnly(true)
        }
    });

    // undo
    function undo() {
        pad.undo();
        pad.setReadOnly(false)
    }
    document.getElementById('undo').onclick = undo;

    // redo
    function redo() {
        pad.redo();
    }
    document.getElementById('redo').onclick = redo;

    // resize
    window.onresize = function(e) {
        pad.resize(el.offsetWidth);
    }
    return pad
}

function gameInit(pad) {
    let player_number = Math.floor(Math.random() * 10) // temporary placeholder for player number
    pad.setLineColor(getPlayerColorFromNumber(player_number))
    document.getElementById('submit_stroke').onclick = function() {
        submitStrokeToServer(player_number, pad)
    };
}

// after a player has submitted their stroke,
// this function exports the whiteboard as JSON and sends it to the server
function submitStrokeToServer(player_number, pad) {
    const newBoardState = JSON.stringify(pad.toJSON())
    socket.emit('gameplay_stroke', {
        player_number: player_number,
        new_board_state: encodeURIComponent(newBoardState)
    })
    // disable player actions until server determines 
    // that it is this clients turn again
    disablePlayerActions()
}

// overwrites current pad with JSONimage from server
function updateImageFromServer(data) {
    pad.loadJSON(JSON.parse(decodeURIComponent(data.new_board_state)))
    return 
}

requirejs(['responsive-sketchpad/sketchpad'],
    function(Sketchpad) {
        pad = sketchpadInit(Sketchpad)
        gameInit(pad)
    }
)

function displayRoomID(room_id){
    document.getElementById('room_id').innerHTML = `Your Room Code is ${room_id}`
}

const socket = io()

// redirect to homepage on server connection rejection
socket.on('disconnect', reason => {
    console.log(reason)
    alert('disconnected')
    window.location = '/'
})
// redirect to homepage on other connection errors
socket.on('connect_error', error => {
    console.log(error)
    alert('connection error')
    window.location = '/'
})

// action handlers after receiving messages from server:
socket.on('room_id', displayRoomID)
socket.on('new_image', updateImageFromServer)
socket.on('player_number', disablePlayerActions)
socket.on('enable_turn', enablePlayerActions)

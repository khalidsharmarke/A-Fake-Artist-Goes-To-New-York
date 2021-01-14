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

function enableButtons(data){
    document.getElementById('undo').disabled = false
    document.getElementById('redo').disabled = false;
    document.getElementById('submit_stroke').disabled = false
    pad.setReadOnly(false)
}

function disableButtons(data){
    document.getElementById('undo').disabled = true
    document.getElementById('redo').disabled = true;
    document.getElementById('submit_stroke').disabled = true
    pad.setReadOnly(true)
}


function sketchpad_init(Sketchpad) {
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

function game_init(pad) {
    let player_number = Math.floor(Math.random() * 10) // temporary placeholder for player number

    pad.setLineColor(getPlayerColorFromNumber(player_number))


    document.getElementById('submit_stroke').onclick = function() {
        submit_stroke_to_server(player_number, pad)
    };

}

// after a player has submitted their stroke,
// this function exports the whiteboard as JSON and sends it to the server
function submit_stroke_to_server(player_number, pad) {
    const newBoardState = JSON.stringify(pad.toJSON())
    socket.emit('gameplay_stroke', {
        player_number: player_number,
        new_board_state: encodeURIComponent(newBoardState)
    })
    disableButtons()
}

// TO DO:
// needs implementation
function update_image_from_server(data) {
    console.log('new image received')
    let thing = decodeURIComponent(data.new_board_state)
    pad.loadJSON(JSON.parse(thing))
    return 
}

requirejs(['responsive-sketchpad/sketchpad'],
    function(Sketchpad) {
        pad = sketchpad_init(Sketchpad)
        game_init(pad)

    }
)

function displayRoomID(data){
    console.log(data)
    document.getElementById('room_id').innerHTML = `Your Room Code is ${data}`
}

const socket = io()

// redirect to homepage on error
// emitted on failed connection to server
socket.on('connect_error', error => {
    console.log(error)
    alert('connection error')
    window.location = '/'
})
// emitted on server connection rejection
socket.on('disconnect', reason => {
    console.log(reason)
    alert('disconnected')
    window.location = '/'
})

socket.on('room_id', displayRoomID)
socket.on('new_image', update_image_from_server)
socket.on('player_number', disableButtons)
socket.on('enable_turn', enableButtons)

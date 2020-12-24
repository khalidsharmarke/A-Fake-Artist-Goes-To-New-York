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


function sketchpad_init(Sketchpad) {
    // hookup whiteboard buttons 
    let el = document.getElementById('sketchpad');
    pad = new Sketchpad(el, {
        line: {
            size: 5
        },
        onDrawEnd: function() {
            pad.setReadOnly(true)
        }
    });

    // undo
    function undo() {
        pad.undo();
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
}
requirejs(['responsive-sketchpad/sketchpad'],
    function(Sketchpad) {
        pad = sketchpad_init(Sketchpad)
        game_init(pad)

    }
)
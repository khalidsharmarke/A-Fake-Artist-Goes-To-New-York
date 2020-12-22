requirejs(['responsive-sketchpad/sketchpad'],
	function(Sketchpad){
		var el = document.getElementById('sketchpad');
		var pad = new Sketchpad(el, {
		    line: {
		        color: '#f44335',
		        size: 5
		    },
		    onDrawEnd: function(){
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
		window.onresize = function (e) {
			pad.resize(el.offsetWidth);
		}
	}
	)

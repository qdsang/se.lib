define(function(require,exports,module){
	var ST = require("mod/sa/scenetransitions");

	var st = ST.newInstance("section", "draw", "vertical");

	st.set("start", {
		callback: function(event, x, y, shiftX, shiftY, distance, index){
			console.info("callback: start." + index)
		}
	});
	st.set("move", {
		callback: function(event, x, y, shiftX, shiftY, distance, index){
			console.info("callback: move." + index)
		}
	});
	st.set("end", {
		callback: function(event, x, y, shiftX, shiftY, distance, index){
			console.info("callback: end." + index)
		}
	});
	st.set("complete", {
		callback: function(event, index){
			console.info("callback: complate." + index)
		}
	});
	st.set("shift", {
		callback: function(event, x, y, shiftX, shiftY, distance, index){
			console.info("callback: shift(" + shiftX + "/" + shiftY + ")." + index)
		}
	});
});
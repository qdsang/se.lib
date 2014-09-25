define(function(require,exports,module){
	var PhotoPlayer = require("mod/sa/photoplayer");

	var pp = new PhotoPlayer("pper");

	pp.create();

	pp.start();
});
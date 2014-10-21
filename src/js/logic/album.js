define(function(require,exports,module){
	var Albums = require("mod/sa/album");

	var _app = $.app;

	var a = Albums.newInstance("album", true);

	a.set("loading", {
		callback: function(){
			console.info("loading");
			_app.setLocked(true);
		}
	});
	a.set("exit", {
		callback: function(){
			console.info("exit");
			_app.setLocked(false);
		}
	});

	a.load();

});
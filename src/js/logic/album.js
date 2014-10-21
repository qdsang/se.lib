define(function(require,exports,module){
	var Albums = require("mod/sa/album");

	var _app = $.app;

	var a = Albums.newInstance("album", true);

	a.set("loading", {
		callback: function(){
			console.info("loading");
			//_app.setLocked(true);
		}
	});
	a.set("ready", {
		callback: function(){
			console.info("ready");
			//_app.setLocked(false);
		}
	});

	a.load();

});
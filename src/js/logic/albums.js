define(function(require,exports,module){
	var Albums = require("mod/sa/albums");

	var _app = $.app;

	var a = Albums.newInstance("albums", ".webapp-view");

	a.set("show", {
		callback: function(){
			console.info("show");
			_app.setLocked(true);
		}
	});
	a.set("hidden", {
		callback: function(){
			console.info("hidden");
			_app.setLocked(false);
		}
	});

	a.create();

});
define(function(require,exports,module){
	var App = require("mod/se/webapp");

	var app = App.newInstance("webapp", "view", "header", "footer");

	app.set("init", {
		callback : function(){
			app.showModuleWidget(0);	
		}
	});
	app.create();
});
define(function(require,exports,module){
	var App = require("mod/se/webapp");

	var app = App.newInstance("webapp", "view", "header", "footer");

	app.set("init", {
		callback : function(){

			if("drawcard" == app.mode){
				app.showModuleWidget(app.getCurrentModuleIndex());
			}else{
				app.displayViewportWidget();
			}
		}
	});
	app.create();
});
define(function(require,exports,module){
	var App = require("mod/se/webapp");

	var app = $.app = App.newInstance("webapp", "view", "header", "footer");

	app.set("init", {
		callback : function(){
			app.showModuleWidget(0);	
		}
	});

	app.set("chromecreate", {
		callback : function(index, moduleIndex, type, module, chrome, isReset){
			console.info("create: " + type)
		}
	});

	app.set("chromestart", {
		callback : function(index, moduleIndex, type, module, chrome, isReset, dx, dy, maxScrollX, maxScrollY){
			console.info("start: " + type)
		}
	});

	app.set("chromescrolling", {
		callback : function(index, moduleIndex, type, module, chrome, isReset, dx, dy, maxScrollX, maxScrollY){
			console.info("scrolling: " + type)
		}
	});

	app.set("chromeend", {
		callback : function(index, moduleIndex, type, module, chrome, isReset, dx, dy, maxScrollX, maxScrollY){
			console.info("end: " + type)
		}
	});

	app.set("chromereset", {
		callback : function(index, moduleIndex, type, module, chrome, isReset){
			console.info("reset: " + type)
		}
	})

	app.create();
});
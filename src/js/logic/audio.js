define(function(require,exports,module){
	var AC = require("mod/se/audio");

	var audio = AC.newInstance();

	audio.set("load", {
		callback: function(e, ctx){
			console.info("load....");
		},
		context: audio
	}).
	set("error", {
		callback: function(e, ctx){
			console.info("error....");
		},
		context: audio
	}).
	set("complete", {
		callback: function(e, ctx, audioList){
			console.info("complete....");
		},
		context: audio
	}).
	set("decodesuccess", {
		callback: function(e, ctx, audio){
			var source = audio.source;

			source.connect(ctx.destination);

			this.play();
		},
		context: audio
	}).
	set("decodefail", {
		callback: function(e, ctx, audio){
			alert("Decode(" + audio.name + ") failed!");
		},
		context: audio
	}).
	load([
		{name: "baby", url: "/example/audio/baby.mp3"}
	]);
});
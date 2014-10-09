define(function(require,exports,module){
	var Media = require("mod/se/media");
	var YKU   = require("mod/open/youku");

	var audio = Media.newInstance(MediaType.AUDIO, "audio", "/example/audio/baby.mp3");

	audio.insert("#a1", {
		"controls": "controls",
		"preload": "auto"/*,
		"autoplay": "autoplay"*/
	});

	audio.setProperty("volume", .65);

	var video = Media.newInstance(MediaType.VIDEO, "video", "/example/video/movie.mp4");

	video.insert("#a2", {
		"controls": "controls",
		"preload": "auto"/*,
		"autoplay": "autoplay"*/
	});

	video.setProperty("volume", .65);

	var player = YKU.newInstance({
		parent: "#a3",
		id: "yku",
		width: 300,
		height: 240,
		clientId: "a8beb55a1a56e0c1"
	});

	player.create("http://v.youku.com/v_show/id_XNzk4MDk3OTA0.html");

});
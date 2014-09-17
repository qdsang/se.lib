define(function(require,exports,module){
	var Media = require("mod/se/media");

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
});
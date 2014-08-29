define(function(require,exports,module){
	var LA = require("mod/sa/lightanimation");

	var la1 = LA.newInstance("#w1", "transition::opacity:1!0.5s ease>transformOrigin:50% 50%!;translate3d:150px,200px,0px!1s ease 2s;rotate:60deg!");

	la1.play();

	var la2 = LA.newInstance("#w2", "animation::rotate:!1s linear 1s infinite normal");
	la2.addKeyFrame("rotate", "0%", {
		rotate:"0deg",
		scale:"1,1"
	});
	la2.addKeyFrame("rotate", "50%", {
		rotate:"180deg",
		scale:"0.5,0.5"
	});

	la2.addKeyFrame("rotate", "100%", {
		rotate:"360deg",
		scale:"1,1"
	});

	la2.printKeyFrames();

	la2.play();
});
define(function(require,exports,module){
	var ScratchCard = require("mod/sa/scratchcard");

    var sc = new ScratchCard($("#sweet")[0]);
    var src = "./img/sweet.jpg";

    sc.setBrushSize(10)
      .setBlurRadius(20)
      .setScratchText({
          "font": "28px Arial",
          "textAlign": "center",
          "textBaseline": "middle",
          "color": "gray",
          "text": "刮刮看～",
          "x": 320/2,
          "y": 228/2 
      })
      .setComplete({
          callback : function(remain, removed){
              var total = remain + removed;

              //解决Android下渲染问题
              $("#sweet").width(320 - 1); //根据实际情况调整
	      	  $("#sweet").width(320);  //根据实际情况调整
              console.info(remain / total);
          }  
      })
      .paintImage(src, src, 0, 0, 320, 228);
      //.paintColor(src, "gray", 0, 0, 271, 271);
});
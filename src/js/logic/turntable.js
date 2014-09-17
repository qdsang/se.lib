define(function (require, exports, module){ 
    var Util        = require("mod/se/util");
    var TurnTable   = require("mod/sa/turntable");
    var AliasMethod = require("mod/se/aliasmethod");

    var Action = {
        start : function(){
            var i = alias.next();
            var k = 360 / 7;
            var a = Math.max(k * i, k / 5);
            var a = k * i;
            var f = (i % 2 === 0) ? a - 7.579 : a + 7.579;
            var b = f + (360 * 5);

            tt.setTweenParameter(0, b, 1000)
              .start();  
        }
    };

    var preAngle = 0;
    var tt = null;
    var alias = null;
    var start = 0;
    var end = 0;

    var _init = function(){
        tt = new TurnTable("#t");
        alias = new AliasMethod([0.06, 0.04, 0.4, 0.05, 0.045, 0.4, 0.005]);

        tt.addResource("background", "/example/img/disc-bg.gif", 0, 0, 1, 450, 450)
          //.addResource("arrow", "/example/img/arrow.png", 206, 97, 3, 32, 191)
          //.addResource("arrow", "/example/img/arrow.png", 236, 127, 3, 32, 191)
          .addResource("rotate", "/example/img/disc-rotate.gif", 47, 47, 2, 352, 352)
          .addResource("button", "/example/img/button.png", 177, 181, 4, 92, 92)
          //.addRotatingBody("rotate", 47, 47, 2, 352, 352)
          .addRotatingBody("arrow", 97, 97, 3, 250, 250)
          .setCenterCoordinates("50%", "50%")
          .setAction("button", "start")
          .setPrizeList(["360exp", "100mb", "36exp", "360mb", "100exp", "36mb", "100G"])
          .setComplete({
            callback : function(prizes, angle){
                console.info("angle: " + angle)
                var size = prizes.length;
                var k = 360 / size;
                var i = Math.floor((angle % 360) / k);

                var prize = prizes[i];

                alert(prize);
                
            },
            context: tt
          })
          //.paint("/example/img/disc-rotate.gif", 0, 0, 352, 352);
          .paint("/example/img/arrow.png", 109, 0, 32, 191);

        $("#button").on("touchstart", function(e){e.stopPropagation();Action.start()})
                    .on("touchmove", function(e){e.stopPropagation()})
                    .on("touchend", function(e){e.stopPropagation()});

        Util.setActionHook();
        Util.injectAction(Action);
    };

    module.exports = {
        init : _init
    };
});
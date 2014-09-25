/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片播放器
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
                    require("mod/zepto/touch");
    var LA        = require("mod/sa/lightanimation");
    var Vector2D  = require("mod/sa/physical/vector2d");
    var Particle  = require("mod/sa/physical/particle");
    var PS        = require("mod/sa/physical/particlesystem");
    var Style     = require("mod/polyfill/css");

    var ps = PS.newInstance();
    var dt = .5;

    ps.effect(-window.innerWidth, -window.innerHeight, window.innerWidth, window.innerHeight);

    var _PhotoPlayer = function(playerId){
        this.playerId = playerId;
        this.player = $("#" + playerId);

        if(!playerId || this.player.length != 1){
            throw new Error("the player does not configure(" + playerId + ").");
        }

        this.fadeinAnimation = [];
        this.playerAnimation = null;
        this.photos = [];
        this.size = this.photos.length;
        this.ready = false;
        this.moving = false;
        this.count = 0;
        this.startX = 0;
        this.startY = 0;
        this.startPosition = new Vector2D(this.startX, this.startY);
        this.stopX = 0;
        this.stopY = 0;
        this.stopPosition = new Vector2D(this.stopX, this.stopY);
        this.timer = null;
        this.runing = false;
        this.animate = null;
    };

    _PhotoPlayer.prototype = {
        getPointerPosition : function(e){
            if(e.changedTouches){
                e = e.changedTouches[e.changedTouches.length - 1];
            }

            var x = 0;
            var y = 0;
            var clientX = e.clientX;
            var clientY = e.clientY;
            var body = document.body;
            var scrollLeft = body.scrollLeft;
            var scrollTop = body.scrollTop;
            var stage = $(e.target);
            var offset = stage.offset();
                
            x = (clientX + scrollLeft || e.pageX) - offset.left || 0;
            y = (clientY + scrollTop || e.pageY) - offset.top || 0;

            return {"x": x, "y": y};
        },
        sampleDirection : function(angle1, angle2){
            var t = Math.random();
            var ta = angle1 * t + angle2 * (1 - t);

            return new Vector2D(Math.cos(ta), Math.sin(ta));
        },
        sampleNumber : function(n1, n2){
            var t = Math.random();

            return n1 * t + n2 * (1 - t);
        },
        bind : function(photo, index){
            var touch = ("ontouchstart" in window);
            var startEvent = touch ? "touchstart" : "mousedown";
            var moveEvent = touch ? "touchmove" : "mousemove";
            var endEvent = touch ? "touchend" : "mouseup";

            photo.on(startEvent, "", this, function(e){
                e.stopPropagation();

                var data = e.data;
                var pointer = data.getPointerPosition(e);

                if(!data.ready){
                    return;
                }

                if(data.runing){
                    return;
                }

                if(data.moving){
                    return ;
                }

                data.startX = pointer.x;
                data.startY = pointer.y;
                data.startPosition = new Vector2D(data.startX, data.startY);
                data.moving = true;

                ps.set("end", {
                    callback: function(target){
                        this.runing = false;

                        var t = $(target);
                        var index = Number(t.attr("data-photoIndex"));
                        var la = LA.newInstance(target, this.animate);
                        var listener = this.fadeinAnimation[index] || la;

                        listener.set("complete", {
                            callback: function(target, index){
                                var t = $(target);
                                t.css({
                                    "left": "",
                                    "top": "",
                                    "z-index": 1,
                                    "opacity": 1
                                });

                                if(index === 0){
                                    this.photos.css("z-index", 2);
                                }
                            }, 
                            args: [index],
                            context: this
                        });

                        la.play();
                    },
                    args: [e.target],
                    context: data
                });
            });
            photo.on(moveEvent, "", this, function(e){
                e.stopPropagation();

                var data = e.data;
                var pointer = data.getPointerPosition(e);

                if(!data.ready){
                    return;
                }

                data.stopX = pointer.x;
                data.stopY = pointer.y;
            }); 
            photo.on(endEvent, "", this, function(e){
                e.stopPropagation();

                var data = e.data;
                var pointer = data.getPointerPosition(e);
                var bound = null;
                var x = 0;
                var y = 0;
                var minX = 0;
                var minY = 0;
                var maxX = window.innerWidth;
                var maxY = window.innerHeight;

                if(!data.ready){
                    return;
                }

                data.stopX = pointer.x;
                data.stopY = pointer.y;
                data.moving = false;
                data.runing = true;

                data.stopPosition = new Vector2D(data.stopX, data.stopY);
                
                data.run(e.target);
            }); 
        },
        step : function(target){
            var _ins = this;

            var life = _ins.sampleNumber(1, 2);
            var velocity = _ins.stopPosition.subtract(_ins.startPosition).multiply(10);
            velocity = velocity.add(_ins.sampleDirection(0, Math.PI * 2).multiply(20));
            
            ps.emit(new Particle(_ins.stopPosition, velocity, 1, null, 0));

            ps.simulate(dt);

            ps.render(target, {
                callback: function(target, particle, alpha){
                    var x = particle.position.x;
                    var y = particle.position.y;

                    this.animate = "transition::left:" + (x % window.innerWidth) + "px!0.4s ease-out;top:" + (y % window.innerHeight) + "px!0.4s ease-out;opacity:0!0.4s ease-out";
                },
                context: _ins
            });
        },
        run : function(target){
            var timer = null;
            var ended = false;
            var _ins = this;

            (function(){
                _ins.step(target);

                if(_ins.runing)
                    setTimeout(arguments.callee, 10);
            })();
        },
        create : function(){
            this.photos = $("#" + this.playerId + " > *");
            this.size = this.photos.length;
            this.fadeinAnimation = [];

            this.count = 0;
            this.ready = false;

            var fadein = null;
            var photo = null;
            var interaction = null;

            fadein = this.player.attr("data-in");

            if(fadein){
                this.playerAnimation = LA.newInstance(this.player, fadein);
                this.playerAnimation.set("complete", {
                    callback: function(target){
                        this.playPhotos();
                    },
                    context: this
                });
            }

            for(var i = 0; i < this.size; i++){
                photo = $(this.photos[i]);
                fadein = photo.attr("data-in");
                interaction = photo.attr("data-interaction") || "1";

                if(fadein){
                    photo.attr("data-photoIndex", this.fadeinAnimation.length);
                    this.fadeinAnimation.push(LA.newInstance(photo, fadein));
                }

                if("1" == interaction){
                    this.bind(photo);
                }
            }
        },
        playPhotos : function(){
            var fa = this.fadeinAnimation;
            var size = fa.length;

            for(var i = 0; i < size; i++){
                fa[i].set("complete", {
                    "callback": function(target, size){
                        this.ready = (++this.count >= size);
                    },
                    "context": this,
                    "args": [size]
                });
                fa[i].play();
            }
        },
        start : function(){
            var _ins = this;

            if(_ins.playerAnimation){
                _ins.playerAnimation.play();
            }else{
                _ins.playPhotos();
            }
        }
    };

    module.exports = _PhotoPlayer;
});
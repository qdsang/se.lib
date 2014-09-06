/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 场景转场效果
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function SceneTransitions(require, exports, module){
    var Listener = $.Listener  = require("mod/se/listener");
    var Style                  = require("mod/polyfill/css");
    var LA                     = require("mod/sa/lightanimation");

    var TransitionEffect = window["TransitionEffect"] = {
        "ZOOM": "zoom",
        "ROTATE": "rotate"
    };

    var Direction = {
        "VERTICAL": "vertical",
        "HORZIONTAL": "horizontal"
    };

    var _SceneTransitions = function(snap, effect, direction){
        this.snap = snap;
        this.scenes = $(snap);
        this.index = 0;
        this.size = this.scenes.length;
        this.parent = this.scenes.parent();
        //------------
        this.currentIndex = 0;
        this.nextIndex = 1;
        this.prevIndex = this.size - 1;
        this.lastIndex = this.size - 1;
        this.moveIndex = undefined;
        this.stayIndex = undefined;
        //------------
        this.currentZIndex = 3;
        this.nextZIndex = 4;
        this.prevZIndex = 2;
        this.queueZIndex = 1;
        //------------
        this.transitionEffect = effect || TransitionEffect.ROTATE;
        this.direction = direction || Direction.VERTICAL;
        this.moveDirection = 0;
        this.lockedDirection = undefined;
        //------------
        this.drawing = false;
        this.moved = false;
        this.enabled = true;
        this.flipped = false;
        this.initiated = 0;
        this.startX = 0;
        this.startY = 0;
        this.shift = 0;
        this.offset = 0;
        //-------------
        this.deg = 28;
        this.duration = .28;
        this.perspective = "300px";

        this.listener = new Listener({
            onstart: null,
            ondrawing: null,
            onend: null,
            oncomplete: null
        });

        var offset = this.parent.offset();
        this.offset = (Direction.HORZIONTAL == this.direction ? offset.width : offset.height);

        if(effect in this){
            Style.css(this.parent, "perspective", this.perspective);
            this.page(this.currentIndex);
            this.bind();
            this.effect("init", []);
        }else{
            throw new Error("this effect(" + effect + ") not yet implemented.");
        }
    };

    _SceneTransitions.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        effect : function(method, args){
            var api = this[this.transitionEffect];

            api[method].apply(api, [this].concat(args));
        },
        setDeg : function(deg){
            this.deg = deg;
        },
        setDuration : function(duration){
            this.duration = duration;
        },
        setPerspective : function(perspective){
            this.perspective = perspective;
        },
        layout : function(){
            var scenes = this.scenes;
            var size = this.size;
            var scene = null;
            var currentIndex = this.currentIndex;
            var lastIndex = this.lastIndex;
            var nextIndex = this.nextIndex = (currentIndex + 1 > lastIndex ? 0 : currentIndex + 1);
            var prevIndex = this.prevIndex = (currentIndex - 1 < 0 ? lastIndex : currentIndex - 1);

            for(var i = 0; i < size; i++){
                scene = $(scenes[i]);
                scene.css("display", "none");
                if(i === currentIndex){ //当前显示
                    scene.css("z-index", this.currentZIndex);
                    scene.css("display", "");
                    Style.css(scene, "transform", "translate(0, 0) translateZ(0)");
                }else if(i === nextIndex){ //下一个
                    scene.css("z-index", this.nextZIndex);
                    scene.css("display", "");
                    Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == this.direction ? "100%,0" : "0,100%") + ") translateZ(0)");
                }else if(i === prevIndex){ //上一个
                    scene.css("z-index", this.prevZIndex);
                    scene.css("display", "");
                    Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == this.direction ? "0,100%" : "100%,0") + ") translateZ(0)");
                }
            }
        },
        getPointerPosition : function(e){
            var data = e.data;

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
            var stage = $(data.scenes[data.currentIndex]);
            var offset = stage.offset();

            this.stageOffsetX = offset.left;
            this.stageOffsetY = offset.top;

                
            x = (clientX + scrollLeft || e.pageX) - offset.left || 0;
            y = (clientY + scrollTop || e.pageY) - offset.top || 0;

            return {"x": x, "y": y};
        },
        page : function(n){
            if("last" == n){
                n = this.lastIndex;
            }else if("prev" == n){
                n--;
            }else if("next" == n){
                n++;
            }

            if(n < 0){
                n = 0;
            }else if(n > this.lastIndex){
                n = this.lastIndex;
            }

            var prev = n - 1;
            var next = n + 1;

            if(prev < 0){
                prev = this.lastIndex;
            }

            if(next > this.lastIndex){
                next = 0;
            }

            this.currentIndex = n;
            this.nextIndex = next;
            this.prevIndex = prev;

            this.layout();

        },
        update : function(){
            var newIndex = this.index + this.moveIndex;
            var updateIndex = this.moveIndex > 0 ? this.nextIndex : this.prevIndex;

            if(newIndex < 0){
                newIndex = this.lastIndex;
            }else if(newIndex > this.lastIndex){
                newIndex = 0;
            }

            //doupdate

            this.enabled = true;
        },
        complete : function(e){
            var data = e.data;
            var target = e.currentTarget;

            if(target != data.scenes[data.moveIndex]){
                return 0;
            }

            Style.css(data.scenes, "transitionDuration", "0s");

            if(!data.flipped){
                data.enabled = true;
                return 0;
            }

            data.index += data.moveDirection;

            if(data.index > data.lastIndex){
                data.index = 0;
            }else if(data.index < 0){
                data.index = data.lastIndex;
            }

            data.currentIndex += data.moveDirection;

            if(data.currentIndex > data.lastIndex){
                data.currentIndex = 0;
            }else if(data.currentIndex < 0){
                data.currentIndex = data.lastIndex;
            }

            data.prevIndex = data.currentIndex - 1;
            if(data.prevIndex < 0){
                data.prevIndex = data.lastIndex;
            }

            data.nextIndex = data.currentIndex + 1;
            if(data.nextIndex > data.lastIndex){
                data.nextIndex = 0;
            }

            data.layout();
            data.update();

            data.exec("complete", [e, data.currentIndex]);
        },
        bind : function(){
            var touch = ("ontouchstart" in window);
            var startEvent = touch ? "touchstart" : "mousedown";
            var endEvent = touch ? "touchend" : "mouseup";
            var drawingEvent = touch ? "touchmove" : "mousemove";

            this.scenes.on(startEvent, "", this, function(e){
                e.preventDefault();
                e.stopPropagation();

                var data = e.data;
                var target = e.currentTarget;
                var pointer = data.getPointerPosition(e);
                
                if(!data.enabled || (data.initiated && data.initiated !== 1)){
                    return 0;
                }

                data.drawing = true;
                data.lockedDirection = 0;
                data.moveIndex = undefined;
                data.stayIndex = undefined;
                data.moved = false;
                data.initiated = 1;
                data.flipped = false;
                data.startX = pointer.x;
                data.startY = pointer.y;     
            })
            .on(endEvent, "", this, function(e){
                e.preventDefault();
                e.stopPropagation();

                var data = e.data;
                var target = e.currentTarget;
                var pointer = data.getPointerPosition(e);
                
                if(!data.enabled || 1 != data.initiated){
                    return 0;
                }

                data.initiated = 0;

                if(!data.moved){
                    return 0;
                }

                data.enabled = false;

                data.effect("end", [e, pointer.x, pointer.y, target]);

                $(data.scenes[data.moveIndex]).one("webkitTransitionEnd", "", data, data.complete);
            })
            .on(drawingEvent, "", this, function(e){
                e.preventDefault();
                e.stopPropagation();

                var data = e.data;
                var target = e.currentTarget;
                var pointer = data.getPointerPosition(e);
                var args = [e, pointer.x, pointer.y, target];

                if(!data.enabled || 1 !== data.initiated){
                    return 0;
                }

                var distance = (Direction.HORZIONTAL == data.direction ? -(pointer.x - data.startX) : (pointer.y - data.startY));
                var absDistance = Math.abs(distance);
                
                data.moveDirection = -distance / absDistance; //1: prev, -1: next

                if(absDistance < 10){
                    return 0;
                }

                data.moved = true;

                if(data.moveDirection != data.lockedDirection || data.moveIndex === undefined){
                    data.moveIndex = data.moveDirection > 0 ? data.prevIndex : data.nextIndex;
                    data.lockedDirection = data.moveDirection;

                    data.effect("start", args);
                }

                if(absDistance < data.offset / 3){
                    data.effect("move", args.concat(distance));
                }else{
                    data.flipped = true;
                    data.effect("animate", args.concat(distance));
                }
            });
        },
        "rotate" : {
            init : function(__super__){
                Style.css(__super__.scenes, "transformOrigin", "0 100%");
                Style.css(__super__.scenes, "transitionTimingFunction", "ease-out");
            },
            start : function(__super__, event, x, y, target){
                var stayScene = null;

                if(__super__.moveDirection > 0){ // prev
                    __super__.moveIndex = __super__.nextIndex;
                    __super__.stayIndex = __super__.currentIndex;

                    stayScene = $(__super__.scenes[__super__.stayIndex]);

                    if(Direction.HORZIONTAL == __super__.direction){
                        //Style.css(stayScene, "transform", "rotateY(0deg) translate(0,0) translateZ(0)");
                    }else{
                        Style.css(stayScene, "transform", "rotateX(" + __super__.deg + "deg) translate(0,0) translateZ(0)");
                    }
                }else{ //next
                    __super__.moveIndex = __super__.currentIndex;
                    __super__.stayIndex = __super__.prevIndex;

                    stayScene = $(__super__.scenes[__super__.stayIndex]);

                    if(Direction.HORZIONTAL == __super__.direction){
                        Style.css(stayScene, "transform", "rotateY(" + __super__.deg + "deg) translate(0,0) translateZ(0)");
                    }else{
                        Style.css(stayScene, "transform", "rotateX(0deg) translate(100%,0) translateZ(0)");
                    }
                }

                __super__.exec("start", [event, x, y, target, __super__.currentIndex]); 
            },
            end : function(__super__, event, x, y, target){ 
                var stayScene = $(__super__.scenes[__super__.stayIndex]);
                var moveScene = $(__super__.scenes[__super__.moveIndex]);

                Style.css(moveScene, "transitionDuration", __super__.duration + "s");
                Style.css(stayScene, "transitionDuration", __super__.duration + "s");

                if(__super__.moveDirection > 0){ //prev
                    if(Direction.HORZIONTAL == __super__.direction){
                        Style.css(moveScene, "transform", "rotateY(-" + __super__.deg + "deg) translate(-100%,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateY(0deg) translateZ(0)");
                    }else{
                        Style.css(moveScene, "transform", "rotateX(0deg) translate(0,100%) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateX(0deg) translateZ(0)");
                    }
                }else{ // next
                    if(Direction.HORZIONTAL == __super__.direction){
                        Style.css(moveScene, "transform", "rotateY(0deg) translate(0,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateY(" + __super__.deg + "deg) translateZ(0)");
                    }else{
                        Style.css(moveScene, "transform", "rotateX(0deg) translate(0,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateX(" + __super__.deg + "deg) translateZ(0)");
                    }
                }

                __super__.exec("end", [event, x, y, target, __super__.currentIndex]);
            },
            move : function(__super__, event, x, y, target, distance){
                var stayDeg, moveDeg;
                var stayScene = $(__super__.scenes[__super__.stayIndex]);
                var moveScene = $(__super__.scenes[__super__.moveIndex]);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){
                        stayDeg = -__super__.deg / __super__.offset * Math.abs(distance);
                        moveDeg = Math.min(-__super__.deg + __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = -100 - 100 / __super__.offset * distance;
                    }else{
                        stayDeg = Math.min(-__super__.deg + __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        moveDeg = -__super__.deg / __super__.offset * Math.abs(distance);
                        distance = -100 / __super__.offset * distance;
                    }

                    Style.css(moveScene, "transform", "rotateY(" + moveDeg + "deg) translate(" + distance + "%,0) translateZ(0)");
                    Style.css(stayScene, "transform", "rotateY(" + -stayDeg + "deg) translateZ(0)");
                }else{
                    if(__super__.moveDirection > 0){
                        stayDeg = __super__.deg / __super__.offset * Math.abs(distance);
                        moveDeg = Math.min(-__super__.deg + __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = 100 + 100 / __super__.offset * distance;
                    }else{
                        stayDeg = __super__.deg - __super__.deg / __super__.offset * Math.abs(distance);
                        moveDeg = Math.min(-__super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = 100 / __super__.offset * distance;
                    }

                    Style.css(moveScene, "transform", "rotateX(" + moveDeg + "deg) translate(0," + distance + "%) translateZ(0)");
                    Style.css(stayScene, "transform", "rotateX(" + stayDeg + "deg) translateZ(0)");
                }

                __super__.exec("drawing", [event, x, y, target, __super__.currentIndex]);
            },
            animate : function(__super__, event, x, y, target, distance) {
                var stayScene = $(__super__.scenes[__super__.stayIndex]);
                var moveScene = $(__super__.scenes[__super__.moveIndex]);

                __super__.initiated = 0;
                __super__.enabled = false;

                Style.css(moveScene, "transitionDuration", __super__.duration + "s");
                Style.css(stayScene, "transitionDuration", __super__.duration + "s");

                if(__super__.moveDirection > 0){ //prev
                    if(Direction.HORZIONTAL == __super__.direction){
                        Style.css(moveScene, "transform", "rotateY(0deg) translate(0,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateY(" + __super__.deg + "deg) translateZ(0)");
                    }else{
                        Style.css(moveScene, "transform", "rotateX(0deg) translate(0,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateX(" + __super__.deg + "deg) translateZ(0)");
                    }
                }else{ // next
                    if(Direction.HORZIONTAL == __super__.direction){
                        Style.css(moveScene, "transform", "rotateY(-" + __super__.deg + "deg) translate(-100%,0) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateY(0deg) translateZ(0)");
                    }else{
                        Style.css(moveScene, "transform", "rotateX(-" + __super__.deg + "deg) translate(0,100%) translateZ(0)");
                        Style.css(stayScene, "transform", "rotateX(0deg) translateZ(0)");
                    }
                }

                moveScene.one("webkitTransitionEnd", "", __super__, __super__.complete);
            }
        },
        "zoom" : {
            init : function(__super__){
                Style.css(__super__.scenes, "transformOrigin", "50%, 50%");
                Style.css(__super__.scenes, "transitionTimingFunction", "ease-out");
            },
            start : function(__super__, event, x, y, target){
                __super__.exec("start", [event, x, y, target, __super__]); 
            },
            end : function(__super__, event, x, y, target){ 
                __super__.exec("end", [event, x, y, target, __super__]);
            },
            move : function(__super__, event, x, y, target, distance){
                __super__.exec("drawing", [event, x, y, target, __super__]);
            },
            animate : function(__super__, event, x, y, target, distance) {
                
            }
        }
    };

    var _pub = {
        newInstance : function(snap, effect){
            var st = new _SceneTransitions(snap, effect);

            return {
                "set" : function(type, option){
                    st.set(type, option);

                    return this;
                },
                "setDeg" : function(deg){
                    st.setDeg(deg);

                    return this;
                },
                "setDuration" : function(duration){
                    st.setDuration(duration);

                    return this;
                },
                "setPerspective" : function(perspective){
                    st.setPerspective(perspective);

                    return this;
                }
            };
        }
    };

    module.exports = _pub;
});
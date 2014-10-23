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

    var TransitionEffect = window["TransitionEffect"] = {
        "ROTATE": "rotate",
        "SCREEN": "screen",
        "SCALE": "scale",
        "DRAW": "draw"
    };

    var Direction = {
        "VERTICAL": "vertical",
        "HORZIONTAL": "horizontal"
    };

    var translateZ = Style.hasProperty("perspective") ? "translateZ(0)" : "";
    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent = touch ? "touchend" : "mouseup";
    var moveEvent = touch ? "touchmove" : "mousemove";

    var _SceneTransitions = function(snap, effect, direction, bind){
        this.snap = snap;
        this.scenes = $(snap);
        this.size = this.scenes.length;
        this.stage = this.scenes.parent();

        this.transitionEffect = effect || TransitionEffect.ROTATE;
        this.direction = direction || Direction.VERTICAL;
        this.moveDirection = 1; //1: prev, -1: next
        this.lockedDirection = 0;

        this.lastIndex = Math.max(this.size - 1, 0);

        this.enterScene = undefined;
        this.exitScene = undefined;

        this.enabled = true;
        this.locked = false;
        this.touched = false; //true: touch事件   false: 无事件/transition事件
        this.animate = false;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;

        this.deg = 28;
        this.screenScale = .7;
        this.duration = .28;
        this.timing = "ease";
        this.perspective = "300px";

        this.moveRatio = .8;
        this.shiftRatio = .2;
        
        var offset = this.stage.offset();
        this.offset = (Direction.HORZIONTAL == this.direction ? offset.width : offset.height);

        if(effect in this){
            this.updateSceneIndex(0);

            if(false !== bind){
                this.bind();
            }
            this.run("init", []);
        }else{
            throw new Error("this effect(" + effect + ") not yet implemented.");
        }

        this.listener = new Listener({
            onshift: null,
            onstart: null,
            onmove: null,
            onend: null,
            oncomplete: null
        });       
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
        run : function(method, args){
            var ins = this;
            var api = ins[ins.transitionEffect];

            var context = {
                "super": this,
                "effect": api
            };

            api[method].apply(context, args);
        },
        setDeg : function(deg){
            this.deg = deg;
        },
        setDuration : function(duration){
            this.duration = duration;
        },
        setTiming : function(timing){
            this.timing = timing;
        },
        setPerspective : function(perspective){
            this.perspective = perspective;
        },
        setScreenScale : function(scale){
            this.screenScale = scale;
        },
        setLocked : function(locked){
            this.locked = locked;
        },
        restore : function(){
            this.moveDirection = 1; //1: prev, -1: next
            this.lockedDirection = 0;
            this.enterScene = undefined;
            this.exitScene = undefined;

            this.enabled = true;
            this.locked = false;
            this.touched = false; //true: touch事件   false: 无事件/transition事件
            this.animate = false;
            this.startX = 0;
            this.startY = 0;
            this.endX = 0;
            this.endY = 0;

            this.updateSceneIndex(0);
        },
        updateSceneIndex : function(index){
            this.currentIndex = index;
            this.prevIndex = (0 >= index ? this.lastIndex : index - 1);
            this.nextIndex = (this.lastIndex === index ? 0 : index + 1);

            this.currentScene = $(this.scenes[this.currentIndex]) || null;
            this.nextScene = $(this.scenes[this.nextIndex]) || null;
            this.prevScene = $(this.scenes[this.prevIndex]) || null;

            this.enabled = true;

            this.run("layout", []);
        },
        preventDefault : function(){
            var ins = this;
            var stage = ins.stage;

            stage.on(startEvent + " " + drawingEvent + " " + endEvent, function(e){e.preventDefault()});
        },
        cancelBubble : function(){
            var ins = this;
            var stage = ins.stage;

            stage.on(startEvent + " " + drawingEvent + " " + endEvent, function(e){e.stopPropagation()});
        },
        complete : function(e){
            var data = e.data;
            var target = e.currentTarget;

            if((data.exitScene && target != data.exitScene[0]) && (data.enterScene && target != data.enterScene[0])){
                return 0;
            }

            Style.css(data.scenes, "transitionDuration", "0s");

            data.currentIndex -= data.moveDirection;

            if(data.currentIndex > data.lastIndex){
                data.currentIndex = 0;
            }else if(data.currentIndex < 0){
                data.currentIndex = data.lastIndex;
            }

            data.updateSceneIndex(data.currentIndex);

            data.exec("complete", [e, data.currentIndex]);

            if(!data.animate){
                data.enabled = true;
                return 0;
            }
        },
        off : function(){
            var ins = this;
            var stage = ins.stage;
            var scenes = ins.scenes;

            scenes.off(startEvent, '')
                  .off(moveEvent, '')
                  .off(endEvent, '');
        },
        bind : function(force){
            var ins = this;
            var stage = ins.stage;
            var scenes = ins.scenes;
            var isBind = stage.attr("data-sencestransition");

            if("1" != isBind || true === force){
                ins.off();

                scenes.on(startEvent, '', ins, function(e){
                    var data = e.data;
                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = data.startX = pointer.pageX;
                    var y = data.startY = pointer.pageY;

                    if(data.locked || !data.enabled || data.touched){
                        return 1;
                    }

                    data.moved = false;
                    data.moveDirection = 0;
                    data.enterScene = undefined;
                    data.exitScene = undefined;
                    data.touched = true;
                    data.animate = false;

                }).on(moveEvent, '', ins, function(e){
                    var data = e.data;
                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = data.endX = pointer.pageX;
                    var y = data.endY = pointer.pageY;

                    var shiftX = x - data.startX;
                    var shiftY = y - data.startY;
                    var distance = Direction.HORZIONTAL == data.direction ? shiftX : shiftY;
                    var shift = Math.abs(distance);
                    var args = [e, x, y, shiftX, shiftY, distance, data.currentIndex];

                    data.moveDirection = distance / shift; //1: prev, -1: next

                    if(data.locked || !data.enabled || !data.touched){
                        return 1;
                    }

                    if(shift < data.offset * data.shiftRatio){
                        return 1;
                    }

                    data.moved = true;

                    if(data.moveDirection != data.lockedDirection || undefined === data.enterScene){
                        data.enterScene = data.moveDirection > 0 ? data.nextScene : data.prevScene;
                        data.lockedDirection = data.moveDirection;

                        data.run("start", args);
                    }

                    if(shift < data.offset * data.moveRatio){
                        data.run("move", args);
                    }else{
                        data.animate = true;
                        data.run("animate", args);
                    }

                }).on(endEvent, '', ins, function(e){
                    var data = e.data;
                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = data.endX = pointer.pageX;
                    var y = data.endY = pointer.pageY;

                    var shiftX = x - data.startX;
                    var shiftY = y - data.startY;
                    var distance = Direction.HORZIONTAL == data.direction ? shiftX : shiftY;
                    var args = [e, x, y, shiftX, shiftY, distance, data.currentIndex];

                    data.exec("shift", args);

                    if(data.locked || !data.enabled || !data.touched){
                        return 1;
                    }

                    data.touched = false;

                    if(!data.moved){
                        return 1;
                    }

                    data.enabled = false;
                    data.run("end", args);

                });

                stage.attr("data-sencestransition", "1");
            }
        },
        //---------------------------------------
        "rotate" : {
            currentZIndex : 3,
            nextZIndex : 4,
            prevZIndex : 2,
            queueZIndex : 1,

            init : function(){
                var __super__ = this["super"];

                Style.css(__super__.scenes, "transformOrigin", "0 100%");
                Style.css(__super__.scenes, "transitionTimingFunction", __super__.timing);
                Style.css(__super__.stage, "perspective", __super__.perspective);
            },
            layout : function(){
                var __super__ = this["super"];
                var __effect__ = this["effect"];
                var scenes = __super__.scenes;
                var size = __super__.size;
                var scene = null;
                var currentIndex = __super__.currentIndex;
                var nextIndex = __super__.nextIndex;
                var prevIndex = __super__.prevIndex;

                for(var i = 0; i < size; i++){
                    scene = $(scenes[i]);
                    
                    if(i === currentIndex){ //当前显示
                        scene.css("z-index", __effect__.currentZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(0%,0%) " + translateZ);
                    }else if(i === nextIndex && nextIndex !== currentIndex){ //下一个
                        scene.css("z-index", (Direction.HORZIONTAL == __super__.direction ? __effect__.prevZIndex : __effect__.nextZIndex));
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,0%" : "0%,100%") + ") " + translateZ);
                    }else if(i === prevIndex && prevIndex !== currentIndex){ //上一个
                        scene.css("z-index", (Direction.HORZIONTAL == __super__.direction ? __effect__.nextZIndex : __effect__.prevZIndex));
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "0%,100%" : "100%,0%") + ") " + translateZ);
                    }else{
                        scene.css("z-index", __effect__.queueZIndex);
                        scene.css("visibility", "hidden");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,100%" : "100%,100%") + ") " + translateZ);
                    }
                }
            },
            start : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];
                var exitScene = null;
                var enterScene = null;

                if(__super__.moveDirection > 0){ // prev
                    __super__.enterScene = __super__.prevScene;
                    __super__.exitScene = __super__.currentScene;
                }else{ // next
                    __super__.enterScene = __super__.currentScene;
                    __super__.exitScene = __super__.nextScene;
                }

                exitScene = __super__.exitScene;
                enterScene = __super__.enterScene;

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){
                        Style.css(enterScene, "transform", "rotateY(" + __super__.deg + "deg) translate(0%,0%) " + translateZ);
                    }else{
                        //
                    }
                }else{
                    if(__super__.moveDirection > 0){
                        Style.css(enterScene, "transform", "rotateX(" + __super__.deg + "deg) translate(0%,0%) " + translateZ);
                    }else{
                        Style.css(enterScene, "transform", "rotateX(0deg) translate(100%,0%) " + translateZ);
                    }
                }

                __super__.exec("start", [event, x, y, shiftX, shiftY, distance, index]);
            },
            end : function(event, x, y, shiftX, shiftY, distance, index){ 
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "rotateY(" + __super__.deg + "deg) translate(0%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateY(0deg) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "rotateY(0deg) " + translateZ);
                        Style.css(enterScene, "transform", "rotateY(" + -__super__.deg + "deg) translate(-100%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "rotateX(-" + __super__.deg + "deg) translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateX(0deg) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "rotateX(0deg) translate(0%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateX(" + __super__.deg + "deg) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            },
            move : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;
                var enterDeg = 0;
                var exitDeg = 0;

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ // prev
                        enterDeg = __super__.deg / __super__.offset * Math.abs(distance);
                        exitDeg = Math.max(__super__.deg - __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = -100 + 100 / __super__.offset * distance;
                    }else{ //next
                        enterDeg = __super__.deg - __super__.deg / __super__.offset * Math.abs(distance);
                        exitDeg = Math.max(__super__.deg - __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = 100 / __super__.offset * distance;
                    }

                    Style.css(exitScene, "transform", "rotateY(" + exitDeg + "deg) " + translateZ);
                    Style.css(enterScene, "transform", "rotateY(" + -enterDeg + "deg) translate(" + distance + "%,0%) " + translateZ);
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        enterDeg = __super__.deg - __super__.deg / __super__.offset * Math.abs(distance);
                        exitDeg = Math.min(-__super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = 100 / __super__.offset * distance;
                    }else{ //next
                        enterDeg = __super__.deg / __super__.offset * Math.abs(distance);
                        exitDeg = Math.min(-__super__.deg + __super__.deg / (__super__.offset / 1.2) * Math.abs(distance), 0);
                        distance = 100 + 100 / __super__.offset * distance;
                    }

                    Style.css(exitScene, "transform", "rotateX(" + exitDeg + "deg) translate(0%," + distance + "%) " + translateZ);
                    Style.css(enterScene, "transform", "rotateX(" + enterDeg + "deg) " + translateZ);
                }

                __super__.exec("move", [event, x, y, shiftX, shiftY, distance, index]);
            },
            animate : function(event, x, y, shiftX, shiftY, distance, index) {
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                __super__.touched = false;
                __super__.enabled = false;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "rotateY(" + __super__.deg + "deg) translate(0%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateY(0deg) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "rotateY(0deg) " + translateZ);
                        Style.css(enterScene, "transform", "rotateY(" + -__super__.deg + "deg) translate(-100%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "rotateX(-" + __super__.deg + "deg) translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateX(0deg) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "rotateX(0deg) translate(0%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "rotateX(" + __super__.deg + "deg) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            }
        },
        //---------------------------------------
        "screen" : {
            currentZIndex : 3,
            nextZIndex : 4,
            prevZIndex : 2,
            queueZIndex : 1,

            init : function(){
                var __super__ = this["super"];

                Style.css(__super__.scenes, "transformOrigin", "50% 50%");
                Style.css(__super__.scenes, "transitionTimingFunction", __super__.timing);
            },
            layout : function(){
                var __super__ = this["super"];
                var __effect__ = this["effect"];
                var scenes = __super__.scenes;
                var size = __super__.size;
                var scene = null;
                var currentIndex = __super__.currentIndex;
                var nextIndex = __super__.nextIndex;
                var prevIndex = __super__.prevIndex;

                for(var i = 0; i < size; i++){
                    scene = $(scenes[i]);
                    
                    if(i === currentIndex){ //当前显示
                        scene.css("z-index", __effect__.currentZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(0%,0%) " + translateZ);
                    }else if(i === nextIndex && nextIndex !== currentIndex){ //下一个
                        scene.css("z-index", (Direction.HORZIONTAL == __super__.direction ? __effect__.prevZIndex : __effect__.nextZIndex));
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,0%" : "0%,100%") + ") " + translateZ);
                    }else if(i === prevIndex && prevIndex !== currentIndex){ //上一个
                        scene.css("z-index", (Direction.HORZIONTAL == __super__.direction ? __effect__.nextZIndex : __effect__.prevZIndex));
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "-100%,0%" : "0%,-100%") + ") " + translateZ);
                    }else{
                        scene.css("z-index", __effect__.queueZIndex);
                        scene.css("visibility", "hidden");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,100%" : "100%,100%") + ") " + translateZ);
                    }
                }
            },
            start : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];

                if(__super__.moveDirection > 0){
                    __super__.enterScene = __super__.prevScene;
                    __super__.exitScene = __super__.currentScene;
                }else{
                    __super__.enterScene = __super__.nextScene;
                    __super__.exitScene = __super__.currentScene;
                }
                    
                __super__.exec("start", [event, x, y, shiftX, shiftY, distance, index]);
            },
            end : function(event, x, y, shiftX, shiftY, distance, index){ 
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "translate(100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "translate(-100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "translate(0%,-100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            },
            move : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;
                var enterDistance = 0;
                var exitDistance = 0;

                if(__super__.moveDirection > 0){ // prev
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance - 100;
                }else{ //next
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance + 100;
                }

                if(Direction.HORZIONTAL == __super__.direction){
                    Style.css(exitScene, "transform", "translate(" + exitDistance + "%, 0%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(" + enterDistance + "%,0%) " + translateZ);
                }else{
                    Style.css(exitScene, "transform", "translate(0%," + exitDistance + "%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(0%," + enterDistance + "%) " + translateZ);
                }

                __super__.exec("move", [event, x, y, shiftX, shiftY, distance, index]);
            },
            animate : function(event, x, y, shiftX, shiftY, distance, index) {
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                __super__.touched = false;
                __super__.enabled = false;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "translate(100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "translate(-100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "translate(0%,-100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            }
        },
        //---------------------------------------
        "scale" : {
            currentZIndex : 2,
            nextZIndex : 3,
            prevZIndex : 3,
            queueZIndex : 1,

            init : function(){
                var __super__ = this["super"];

                Style.css(__super__.scenes, "transformOrigin", "50% 50%");
                Style.css(__super__.scenes, "transitionTimingFunction", __super__.timing);
            },
            layout : function(){
                var __super__ = this["super"];
                var __effect__ = this["effect"];
                var scenes = __super__.scenes;
                var size = __super__.size;
                var scene = null;
                var currentIndex = __super__.currentIndex;
                var nextIndex = __super__.nextIndex;
                var prevIndex = __super__.prevIndex;

                for(var i = 0; i < size; i++){
                    scene = $(scenes[i]);
                    
                    if(i === currentIndex){ //当前显示
                        scene.css("z-index", __effect__.currentZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(0%,0%) " + translateZ);
                    }else if(i === nextIndex && nextIndex !== currentIndex){ //下一个
                        scene.css("z-index", __effect__.nextZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,0%" : "0%,100%") + ") " + translateZ);
                    }else if(i === prevIndex && prevIndex !== currentIndex){ //上一个
                        scene.css("z-index", __effect__.prevZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "-100%,0%" : "0%,-100%") + ") " + translateZ);
                    }else{
                        scene.css("z-index", __effect__.queueZIndex);
                        scene.css("visibility", "hidden");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,100%" : "100%,100%") + ") " + translateZ);
                    }
                }
            },
            start : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];

                if(__super__.moveDirection > 0){
                    __super__.enterScene = __super__.prevScene;
                    __super__.exitScene = __super__.currentScene;
                }else{
                    __super__.enterScene = __super__.nextScene;
                    __super__.exitScene = __super__.currentScene;
                }
                    
                __super__.exec("start", [event, x, y, shiftX, shiftY, distance, index]);
            },
            end : function(event, x, y, shiftX, shiftY, distance, index){ 
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(-100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(0%,-100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            },
            move : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;
                var enterDistance = 0;
                var exitDistance = 0;
                var scale = 0;

                if(__super__.moveDirection > 0){ // prev
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance - 100;
                }else{ //next
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance + 100;
                }

                scale = 1 - __super__.screenScale / __super__.offset * Math.abs(distance);

                if(Direction.HORZIONTAL == __super__.direction){
                    Style.css(exitScene, "transform", "scale(" + scale + ") translate(" + exitDistance + "%, 0%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(" + enterDistance + "%,0%) " + translateZ);
                }else{
                    Style.css(exitScene, "transform", "scale(" + scale + ") translate(0%," + exitDistance + "%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(0%," + enterDistance + "%) " + translateZ);
                }

                __super__.exec("move", [event, x, y, shiftX, shiftY, distance, index]);
            },
            animate : function(event, x, y, shiftX, shiftY, distance, index) {
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                __super__.touched = false;
                __super__.enabled = false;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                exitScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                if(Direction.HORZIONTAL == __super__.direction){
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(-100%,0%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }else{
                    if(__super__.moveDirection > 0){ //prev
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(0%,100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }else{ //next
                        Style.css(exitScene, "transform", "scale(" + __super__.screenScale + ") translate(0%,-100%) " + translateZ);
                        Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);
                    }
                }

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            }
        },
        //---------------------------------------
        "draw" : {
            currentZIndex : 2,
            nextZIndex : 3,
            prevZIndex : 3,
            queueZIndex : 1,

            init : function(){
                var __super__ = this["super"];
                
                Style.css(__super__.scenes, "transformOrigin", "50% 50%");
                Style.css(__super__.scenes, "transitionTimingFunction", __super__.timing);
            },
            layout : function(){
                var __super__ = this["super"];
                var __effect__ = this["effect"];
                var scenes = __super__.scenes;
                var size = __super__.size;
                var scene = null;
                var currentIndex = __super__.currentIndex;
                var nextIndex = __super__.nextIndex;
                var prevIndex = __super__.prevIndex;

                for(var i = 0; i < size; i++){
                    scene = $(scenes[i]);
                    
                    if(i === currentIndex){ //当前显示
                        scene.css("z-index", __effect__.currentZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(0%,0%) " + translateZ);
                    }else if(i === nextIndex && nextIndex !== currentIndex){ //下一个
                        scene.css("z-index", __effect__.nextZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,0%" : "0%,100%") + ") " + translateZ);
                    }else if(i === prevIndex && prevIndex !== currentIndex){ //上一个
                        scene.css("z-index", __effect__.prevZIndex);
                        scene.css("visibility", "visible");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "-100%,0%" : "0%,-100%") + ") " + translateZ);
                    }else{
                        scene.css("z-index", __effect__.queueZIndex);
                        scene.css("visibility", "hidden");

                        Style.css(scene, "transform", "translate(" + (Direction.HORZIONTAL == __super__.direction ? "100%,100%" : "100%,100%") + ") " + translateZ);
                    }
                }
            },
            start : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];

                if(__super__.moveDirection > 0){
                    __super__.enterScene = __super__.prevScene;
                    __super__.exitScene = __super__.currentScene;
                }else{
                    __super__.enterScene = __super__.nextScene;
                    __super__.exitScene = __super__.currentScene;
                }
                    
                __super__.exec("start", [event, x, y, shiftX, shiftY, distance, index]);
            },
            end : function(event, x, y, shiftX, shiftY, distance, index){ 
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                enterScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                Style.css(exitScene, "transform", "translate(0%,0%) " + translateZ);
                Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            },
            move : function(event, x, y, shiftX, shiftY, distance, index){
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;
                var enterDistance = 0;
                var exitDistance = 0;
                var scale = 0;

                if(__super__.moveDirection > 0){ // prev
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance - 100;
                }else{ //next
                    exitDistance = 100 / __super__.offset * distance;
                    enterDistance = exitDistance + 100;
                }

                scale = 1 - __super__.screenScale / __super__.offset * Math.abs(distance);

                if(Direction.HORZIONTAL == __super__.direction){
                    Style.css(exitScene, "transform", "translate(0%, 0%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(" + enterDistance + "%,0%) " + translateZ);
                }else{
                    Style.css(exitScene, "transform", "translate(0%,0%)" + translateZ);
                    Style.css(enterScene, "transform", "translate(0%," + enterDistance + "%) " + translateZ);
                }

                __super__.exec("move", [event, x, y, shiftX, shiftY, distance, index]);
            },
            animate : function(event, x, y, shiftX, shiftY, distance, index) {
                var __super__ = this["super"];
                var enterScene = __super__.enterScene;
                var exitScene = __super__.exitScene;

                __super__.touched = false;
                __super__.enabled = false;

                Style.css(enterScene, "transitionDuration", __super__.duration + "s");
                Style.css(exitScene, "transitionDuration", __super__.duration + "s");

                enterScene.one("webkitTransitionEnd", "", __super__, __super__.complete);

                Style.css(exitScene, "transform", "translate(0%,0%) " + translateZ);
                Style.css(enterScene, "transform", "translate(0%,0%) " + translateZ);

                __super__.exec("end", [event, x, y, shiftX, shiftY, distance, index]);
            }
        }
        //---------------------------------------
    }; 

    var _pub = {
        newInstance : function(snap, effect, direction, bind){
            var st = new _SceneTransitions(snap, effect, direction, bind);

            return {
                "stage": st.stage,
                "scenes": st.scenes,
                "size": st.size,
                "set" : function(type, option){
                    st.set(type, option);

                    return this;
                },
                "setLocked" : function(locked){
                    st.setLocked(locked);

                    return this;
                },
                "setDeg" : function(deg){
                    st.setDeg(deg);

                    return this;
                },
                "setScreenScale" : function(scale){
                    st.setScreenScale(scale);

                    return this;
                },
                "setDuration" : function(duration){
                    st.setDuration(duration);

                    return this;
                },
                "setTiming" : function(timing){
                    st.setTiming(timing);

                    return this;
                },
                "setPerspective" : function(perspective){
                    st.setPerspective(perspective);

                    return this;
                },
                "setMoveRatio" : function(ratio){
                    st.moveRatio = ratio;

                    return this;
                },
                "setShiftRatio" : function(ratio){
                    st.shiftRatio = ratio;

                    return this;
                },
                "cancelBubble" : function(){
                    st.cancelBubble();

                    return this;
                },
                "preventDefault" : function(){
                    st.preventDefault();

                    return this;
                },
                "restore" : function(){
                    st.restore();

                    return this;
                },
                "off" : function(){
                    st.off();

                    return this;
                },
                "on" : function(force){
                    st.bind(force);

                    return this;
                }
            };
        }
    };

    module.exports = _pub;
});
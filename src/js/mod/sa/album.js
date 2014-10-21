/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 相集
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.10
 */
;define(function (require, exports, module){
                    require("mod/zepto/touch");
    var LA        = require("mod/sa/lightanimation");
    var Listener  = require("mod/se/listener");
    var Util      = require("mod/se/util");
    var Style     = require("mod/polyfill/css");
    /**
     .photo{-webkit-transform:scale(3) rotateZ(30deg) translate(80%,80%) translateZ(0);transform:scale(3) rotateZ(30deg) translate(80%,80%) translateZ(0);}
     <div class="album" id="album" data-type="album" data-root="body" data-album="{direction:0,thumbnail:true,exit:30,photoScale:1}" data-in="">
        <div class="thumbnail" data-type="thumbnail"></div>
        <div class="photos" data-type="photos">
            <div class="photo" data-type="photo" data-ready="transition::rotateZ:0!0.4s ease" data-in="transition::scale:1!0.4s ease;rotateZ:3.2deg!0.4s ease;translate:0%,0%!0.4s ease;translateZ:0!"></div>
            <div class="photo" data-type="photo" data-ready="transition::rotateZ:0!0.4s ease" data-in="transition::scale:1!0.4s ease;rotateZ:1.6deg!0.4s ease;translate:0%,0%!0.4s ease;translateZ:0!"></div>
            <div class="photo" data-type="photo" data-ready="transition::rotateZ:0!0.4s ease" data-in="transition::scale:1!0.4s ease;rotateZ:0.8deg!0.4s ease;translate:0%,0%!0.4s ease;translateZ:0!"></div>
            <div class="photo" data-type="photo" data-ready="transition::rotateZ:0!0.4s ease" data-in="transition::scale:1!0.4s ease;rotateZ:0deg!0.4s ease;translate:0%,0%!0.4s ease;translateZ:0!"></div>
        </div>
     </div>
     */

    var AlbumAPICache = {};
    var CACHE_KEY_PREFIX = "ALBUM_";

    var Direction = {
        "VERTICAL": 1,
        "HORZIONTAL": 0
    };

    var Selector = {
        "ALBUM": '[data-type="album"]',
        "THUMBNAIL": '[data-type="thumbnail"]',
        "PHOTOS": '[data-type="photos"]',
        "PHOTO": '[data-type="photo"]'
    };

    var translateZ = Style.hasProperty("perspective") ? "translateZ(0)" : "";
    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent = touch ? "touchend" : "mouseup";
    var moveEvent = touch ? "touchmove" : "mousemove";

    var Action = {
        album : {
            show : function(data, node, e){
                var api = AlbumAPICache[CACHE_KEY_PREFIX + data];

                api.photoBox.removeClass("hide");
                api.loadPhotos();
                api.exec("loading", []);
            }
        }
    };

    var Album = function(id, bind){
        this.id = id;

        this.album = $("#" + id);
        this.photos = this.album.find(Selector.PHOTO);
        this.size = this.photos.length;
        this.thumbnail = this.album.find(Selector.THUMBNAIL);
        this.photoBox = this.album.find(Selector.PHOTOS);
        this.root = null;

        this.options = {
            direction: Direction.HORZIONTAL,
            thumbnail: true,
            exit: 30
        };

        this.albumAnimate = null;
        this.photosAnimate = [];
        this.binded = false;

        this.lastIndex = this.size - 1;
        this.currentIndex = this.lastIndex;
        this.queue = [];

        this.listener = new Listener({
            onloading: null,
            onready: null,
            onexit: null,
            onstart: null,
            onscrolling: null,
            onend: null
        });

        if(false !== bind){
            this.on();
        }

        this.create();

        AlbumAPICache[CACHE_KEY_PREFIX + id] = this;
    };

    Album.prototype = {
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
        off : function(){
            var album = this.album;
            var photo = Selector.PHOTO;

            album.off(startEvent, photo)
                 .off(moveEvent, photo)
                 .off(endEvent, photo);
        },
        on : function(force){
            var album = this.album;
            var photo = Selector.PHOTO;

            if(false === this.binded || true === force){
                this.off();

                album.on(startEvent, photo, this, function(e){
                    var data = e.data;

                    if(!data.ready){
                        return 1;
                    }

                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    
                    data.startX = pointer.pageX;
                    data.startY = pointer.pageY;
                    data.moved = false;

                    data.exec("start", []);
                }).on(moveEvent, photo, this, function(e){
                    var data = e.data;

                    if(!data.ready){
                        return 1;
                    }

                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = data.endX = pointer.pageX;
                    var y = data.endY = pointer.pageY;

                    var shiftX = x - data.startX;
                    var shiftY = y - data.startY;
                    var distance = Direction.HORZIONTAL == data.options.direction ? shiftX : shiftY;
                    var shift = Math.abs(distance);

                    data.moveDirection = distance / shift; //1: prev, -1: next

                    if(shift < data.offset * 0.05){
                        return 1;
                    }

                    data.moved = true;

                    data.exec("scrolling", []);

                }).on(endEvent, photo, this, function(e){
                    var data = e.data;

                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = data.endX = pointer.pageX;
                    var y = data.endY = pointer.pageY;

                    var shiftX = x - data.startX;
                    var shiftY = y - data.startY;

                    if(Direction.HORZIONTAL == data.options.direction){
                        shift = Math.abs(shiftY);
                    }else{
                        shift = Math.abs(shiftX);
                    }

                    if(shift > data.options.exit){
                        data.exec("exit", []);

                        return 1;
                    }
                    
                    if(!data.ready || !data.moved){
                        return 1;
                    }

                    data.exec("end", []);

                    if(data.moveDirection === 1){
                        data.prev()
                    }else if(data.moveDirection === -1){
                        data.next();
                    }
                });
            }
        },
        next : function(photo){
            var index = this.currentIndex;
            var next = index - 1;

            var photo = $(this.photos[index]);
            var source = null;
            var ani = this.photosAnimate[index];

            if(Direction.HORZIONTAL == this.options.direction){
                source = this.getSource(index, ani.setting, {"translate": "-100%, 0%", "opacity": 0}, false);
            }else{
                source = this.getSource(index, ani.setting, {"translate": "%, -100%", "opacity": 0}, false);
            }

            if(next < 0){
                next = this.lastIndex;
            }

            this.update(index, next, source);
        },
        prev : function(){
            var index = this.currentIndex;
            var next = index - 1;

            var photo = $(this.photos[index]);
            var source = null;
            var ani = this.photosAnimate[index];

            if(Direction.HORZIONTAL == this.options.direction){
                source = this.getSource(index, ani.setting, {"translate": "100%, 0%", "opacity": 0}, false);
            }else{
                source = this.getSource(index, ani.setting, {"translate": "%, 100%", "opacity": 0}, false);
            }

            if(next < 0){
                next = this.lastIndex;
            }
            this.update(index, next, source);
        },
        update : function(index, next, source){
            var photos = this.photos;
            var size = this.size;
            var photo = null;

            for(var i = 0; i < size; i++){
                photo = $(photos[i]);

                if(i === index){
                    photo.css({
                        "zIndex": 3
                    });
                    //Style.css(photo, "rotateZ")
                }else if(i === next && next !== index){
                    photo.css({
                        "zIndex": 2
                    });
                }else{
                    photo.css({
                        "zIndex": 1
                    });
                }
            }

            this.currentIndex = index;

            if(source){
                var ani = this.photosAnimate[index];
                var la = ani.animate;
                var setting = ani.setting;

                la.updateTarget(ani.target);
                la.source(source);
                la.set("complete", {
                    callback: function(target, la, setting, index, next){

                        la.updateTarget(ani.target);
                        la.source(this.getSource(index, setting, {"translate":"0%, 0%", "opacity": 1}, false, true));
                        la.set("complete", null);
                        la.play();

                        this.update(next, next, null);
                        this.repaint(index);
                    },
                    context: this,
                    args: [la, setting, index, next]
                });

                la.play();
            }
        },
        repaint : function(_index){
            this.queue.push(this.queue.shift());

            var size = this.size;
            var photosAnimate = this.photosAnimate;
            var queue = this.queue;
            var index = 0;
            var ani = null;
            var la = null;
            var source = null;

            for(var i = size - 1; i >= 0; i--){
                index = queue[i];
                ani = photosAnimate[index];
                la = ani.animate;

                source = this.getSource(i, ani.setting, {"rotateZ": ani.setting.properties.rotateZ.replace(/</g, ">")}, false, false);

                la.updateTarget(ani.target);
                la.source(source);
                la.play();
            }
        },
        getRealValue : function(index, value){
            var size = this.size;
            var items = [];
            var start = 0;
            var increase = 0;
            var max = 0;
            var unit = "";

            value = String(value);

            if(value.indexOf("<") != -1){
                items = value.split("<");
                start = Number(items[0]);
                increase = Number(items[1]);
                unit = items[2];

                value = (size - 1 - index) * increase + unit;
            }else if(value.indexOf(">") != -1){
                items = value.split(">");
                start = Number(items[0]);
                increase = Number(items[1]);
                unit = items[2];

                value = index * increase + unit;
            }

            return value;
        },
        getAnimate : function(index, transition, isDelay, zero){
            var tmp = [];

            if(true === zero){
                tmp.push("0s");
            }else{
                tmp.push(transition.duration + "s");
            }
            tmp.push(transition.timing);

            if(isDelay){
                tmp.push(this.getRealValue(index, transition.delay));
            }

            return tmp.join(" ");
        },
        getSource : function(index, setting, properties, isDelay, zero){
            var p = setting.properties;
            var t = setting.transition;
            var np = properties || {};
            var tmp = [];
            var transform = [];
            var transition = [];
            var v = null;

            p = $.extend(p, np);

            for(var n in p){
                if(p.hasOwnProperty(n)){

                    v = this.getRealValue(index, p[n]);

                    transition.push(n + ":" + v + "!" + this.getAnimate(index, t, isDelay, zero));
                }
            }

            return "transition::" + transition.join(";");
        },
        parsePhotos : function(){
            var photos = this.photos;
            var photo = null;
            var size = photos.length;
            var source = null;
            var box = this.photoBox;
            var setting = {
                "properties": box.data("property"),
                "transition": box.data("animate")
            };

            for(var i = 0; i < size; i++){
                photo = $(photos[i]);

                //source = photo.data("in");
                source = this.getSource(i, setting, null, true);

                photo.attr("data-index", i);

                this.photosAnimate.push({
                    "animate": LA.newInstance(photo, source, true),
                    "target": photo,
                    "source": source,
                    "setting": setting
                });
            }
        },
        create : function(){
            var album = this.album;

            var conf = album.data("album");
            var albumIn = album.data("in");
            var root = $(album.data("root") || "body");

            this.options = $.extend(true, this.options, conf);
            this.ready = false;
            this.root = root;

            this.resetPhotoBox();

            if(albumIn){
                this.albumAnimate = LA.newInstance(this.album, albumIn, true);
            }

            if(conf.thumbnail){
                this.thumbnail.removeClass("hide");
                this.photoBox.addClass("hide");
            }else{
                this.thumbnail.addClass("hide");
                this.photoBox.removeClass("hide");
            }

            this.parsePhotos();

            Util.setActionHook(this.album);
            Util.injectAction(Action);
        },
        resetPhotoBox : function(){
            var offset = this.root.offset();

            this.photoBox.css({
                "width": offset.width + "px",
                "height": offset.height + "px",
                "position": "absolute",
                "left": "0px",
                "top": "0px",
            });

            this.photos.css({
                "width": offset.width + "px",
                "height": offset.height + "px",
                "position": "absolute",
                "left": "0px",
                "top": "0px",
                "zIndex": "2"
            });

            this.offset = (Direction.HORZIONTAL == this.options.direction ? offset.width : offset.height);
        },
        loadPhotos : function(){
            var photosAnimate = this.photosAnimate;
            var size = photosAnimate.length;
            var ani = null;
            var count = 0;
            var la = null;

            this.queue = [];

            this.update(this.lastIndex, this.lastIndex, null);

            for(var i = this.lastIndex; i >= 0; i--){
                this.queue.push(i);
            }

            for(var i = 0; i < size; i++){
                ani = photosAnimate[i];
                la = ani.animate;

                la.set("complete", {
                    callback: function(target, type, size, index){
                        if("in" == type){
                            ++count;

                            if(count == size){
                                this.ready = true;
                                this.exec("ready", []);
                            }
                        }
                    },
                    context: this,
                    args: ["in", size, i]
                }).play();
            }
        },
        load : function(){
            var thumbnail = this.options.thumbnail;

            if(this.albumAnimate){
                this.albumAnimate.set("complete", {
                    callback: function(target){
                        if(!this.options.thumbnail){
                            this.loadPhotos();
                        }
                    },
                    context: this
                }).play();
            }else{
                //photos...
                 if(!thumbnail){
                    this.loadPhotos();
                }
            }

            if(!thumbnail){
                this.exec("loading", []);
            }
        }
    };

    module.exports = {
        newInstance : function(id, bind){
            var _ins = new Album(id, bind);

            return {
                "set": function(type, option){
                    _ins.set(type, option);

                    return this;
                },
                "load": function(){
                    _ins.load();

                    return this;
                }
            }
        }
    };
});
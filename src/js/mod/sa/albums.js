/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片播放器
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

    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var moveEvent = touch ? "touchmove" : "mousemove";
    var endEvent = touch ? "touchend" : "mouseup";

    var translateZ = Style.hasProperty("perspective") ? "translateZ(0)" : "";

    var AlbumsCache = {};

    var Action = {
        albums : {
            show : function(data, node, e){
                var album = node.parent();
                var albums = album.parent();
                var id = albums.attr("id");
                var relative = $(albums.attr("data-relative"));

                var ro = relative.offset();
                var offset = album.offset();
                var photos = album.find('[data-type="photos"]');
                var aniSource = photos.attr("data-in");

                var cache = AlbumsCache[id];

                photos.css({
                    left: (ro.left - offset.left) + "px",
                    top: (ro.top - offset.top) + "px",
                    width: ro.width + "px",
                    height: ro.height + "px"
                });

                cache.currentIndex = 0;
                cache.photos = photos;
                cache.photoList = photos.find('[data-type="photo"]');
                cache.resetPhotoList();

                photos.removeClass("hide");

                cache.exec("show", []);

                setTimeout(function(){
                    LA.newInstance(photos, aniSource).play();
                }, 60);
            }
        }
    };

    var Albums = function(id, relative){
        this.id = id;
        this.albums = $("#" + id);
        this.relative = relative || "body";
        this.albumList = this.albums.find('[data-type="album"]');
        this.albumSize = this.albumList.length;

        this.currentIndex = 0;
        this.nextIndex = 0;
        this.prevIndex = 0;
        this.lastIndex = 0;

        this.currentZIndex = 4;
        this.nextZIndex = 3;
        this.prevZIndex = 2;
        this.queueZIndex = 1;
        this.photos = null;
        this.photoList = [];

        this.listener = new Listener({
            onshow : null,
            onhidden : null
        });
    };

    Albums.prototype = {
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
        resetPhotoList : function(){
            var list = this.photoList;
            var size = list.length;
            var photo = null;
            var scroll = this.photos.attr("data-scroll");
            var currentIndex = this.currentIndex;
            var lastIndex = this.lastIndex = size - 1;
            var nextIndex = this.nextIndex = (currentIndex + 1 > lastIndex ? 0 : currentIndex + 1);
            var prevIndex = this.prevIndex = (currentIndex - 1 < 0 ? lastIndex : currentIndex - 1);

            for(var i = 0; i < size; i++){
                photo = $(list[i]);
                photo.css("visibility", "hidden");
                photo.css("opacity", 1);
                if(i === currentIndex){ //当前显示
                    photo.css("z-index", this.currentZIndex);
                    photo.css("visibility", "visible");
                }else if(i === nextIndex){ //下一个
                    photo.css("z-index", this.nextZIndex);
                    photo.css("visibility", "visible");
                }else if(i === prevIndex){ //上一个
                    photo.css("z-index", this.prevZIndex);
                    photo.css("visibility", "visible");
                }
                Style.css(photo, "transform", "translate(0, 0) " + translateZ);
            }
        },
        bind : function(){
            var ins = this;

            var photos = ins.albums.find('[data-type="photos"]');

            $.each(photos, function(index, item){
                var startX = 0;
                var startY = 0;
                var endX = 0;
                var endY = 0;
                var o = $(item);

                o.on(startEvent, "", ins, function(e){
                    var data = e.data;
                    var pointer = data.getPointerPosition(e);

                    startX = pointer.x;
                    startY = pointer.y;

                }).on(moveEvent, "", ins, function(e){
                    var data = e.data;
                    var pointer = data.getPointerPosition(e);

                    endX = pointer.x;
                    endY = pointer.y;

                }).on(endEvent, "", ins, function(e){
                    var data = e.data;
                    var pointer = data.getPointerPosition(e);
                    var scroll = o.attr("data-scroll");
                    var hidden = Number(o.attr("data-hidden") || 50);
                    var isHidden = false;
                    var photo = data.photoList[data.currentIndex];
                    var source = null;
                    var c = '!.5s ease-out;opacity:0!.4s ease-out';
                    var moved = false;

                    endX = pointer.x;
                    endY = pointer.y;

                    if("h" == scroll){
                        isHidden = (Math.abs(endY - startY) >= hidden);
                        source = 'transition::translate:' + ((endX - startX) > 0 ? '100%,0' : '-100%,0') + c;
                        moved = (Math.abs(endX - startX) > 10);
                    }else{
                        isHidden = (Math.abs(endX - startX) >= hidden);
                        source = 'transition::translate:' + ((endY - startY) > 0 ? '0,100%' : '0,-100%') + c;
                        moved = (Math.abs(endY - startY) > 10);
                    }

                    if(isHidden){
                        o.one("webkitTransitionEnd", function(e){
                            e.stopPropagation();
                            o.addClass("hide");

                            data.exec("hidden", []);
                        });
                        o.css("opacity", 0);
                    }else{
                        if(!moved){
                            return 0;
                        }

                        LA.newInstance(photo, source)
                          .set("complete", {
                               callback: function(target){
                                   ++this.currentIndex;

                                   if(this.currentIndex >= this.photoList.length){
                                        this.currentIndex = 0;
                                   }

                                   this.resetPhotoList();
                               },
                               context: data
                          })
                          .play();
                    }
                });
            });
        },
        create : function(){
            var ins = this;

            var aniSource = ins.albums.attr("data-in");

            if(aniSource){
                var ani = LA.newInstance(ins.albums, aniSource);

                ani.play();
            }

            ins.albums.attr("data-relative", ins.relative);

            AlbumsCache[ins.id] = ins;

            ins.bind();

            Util.setActionHook(ins.albums);
            Util.injectAction(Action);
        },
        destroy : function(){
            delete AlbumsCache[this.id];
        }
    };

    module.exports = {
        newInstance : function(id, relative){
            var _ins = new Albums(id, relative);

            return {
                "set": function(type, option){
                    _ins.set(type, option);

                    return this;
                },
                "create": function(){
                    _ins.create();

                    return this;
                },
                "destroy": function(){
                    _ins.destroy();

                    return this;
                }
            }
        }
    };
});
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
    var ST        = require("mod/sa/scenetransitions");
    var Listener  = require("mod/se/listener");
    var Util      = require("mod/se/util");

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
                //cache.resetPhotoList();
                cache.createSceneTransition();

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
            onhidden : null,
            onstart: null,
            onscrolling: null,
            onend: null
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
        createSceneTransition : function(){
            var _ins = this;

            var st = null;
            var photos = _ins.photos;
            var list = _ins.photoList;
            var mode = photos.attr("data-mode");
            var scroll = photos.attr("data-scroll") || "horizontal";
            var hidden = Number(photos.attr("data-hidden") || "100");

            st = ST.newInstance(list, mode, scroll);

            st.set("shift", {
                callback: function(e, x, y, shiftX, shiftY, distance, index, scroll, hidden, _st){
                    var sx = Math.abs(shiftX);
                    var sy = Math.abs(shiftY);
                    var isHidden = false;
                    var stage = _st.stage;
                    var source = null;
                    var c = '!.5s ease-out;opacity:0!.4s ease-out';

                    if(scroll == "horizontal"){
                        isHidden = (sy >= hidden);
                        source = 'transition::translate:' + (shiftX > 0 ? '100%,0' : '-100%,0') + c;
                    }else{
                        isHidden = (sx >= hidden);
                        source = 'transition::translate:' + (shiftY > 0 ? '0,100%' : '0,-100%') + c;
                    }

                    if(isHidden){
                        stage.one("webkitTransitionEnd", "", {"stage": stage, "albums": this}, function(e){
                            e.stopPropagation();

                            var data = e.data;

                            data.stage.addClass("hide");

                            data.albums.exec("hidden", []);
                        });
                        stage.css("opacity", 0);
                    }
                },
                context: _ins,
                args: [scroll, hidden, st]
            })
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
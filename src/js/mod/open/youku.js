/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 优酷播放API
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.10
 */
;define(function (require, exports, module){
                   require("http://player.youku.com/jsapi#YKU");
    var Util     = require("mod/se/util");
    var Listener = require("mod/se/listener");

    var APICache = {};

    var YouKuPlayer = function(options){
        this.player = null;

        this.parent = options.parent || "body";
        this.id = options.id;
        this.width = options.width || "100%";
        this.height = options.height || "100%";
        this.styleId = options.styleId || "0";
        this.clientId = options.clientId;
        this.vid = null;
        this.autoplay = options.autoplay || false;
        this.showRelated = options.showRelated || false; //播放完后显示相关视频

        this.listener = new Listener({
            onready : null, 
            onstart : null,  
            onend : null 
        });
    };

    YouKuPlayer.prototype = {
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
        drawPlayerPanel : function(){
            var panel = $("#" + this.id);
            var p = /(%|auto)px/;

            if(panel.length < 1){
                $(this.parent).append((panel = $('<div id="' + this.id + '"></div>')));
            }

            panel.css({
                width: (this.width + "px").replace(p, "$1"),
                height: (this.height + "px").replace(p, "$1")
            });
        },
        parseVID : function(url){
            var start = url.indexOf("id_");
            var end = url.indexOf(".html");

            return (url.substring(start + 3, end));
        },
        create : function(url){
            var _ins = this;

            _ins.drawPlayerPanel();
            _ins.vid = _ins.parseVID(url);

            _ins.player = new YKU.Player(_ins.id, {
                styleid: _ins.styleId,
                client_id: _ins.clientId,
                vid: _ins.vid,
                autoplay: _ins.autoplay,
                show_related: _ins.showRelated,
                events:{
                    onPlayerReady: function(){ 
                        _ins.exec("ready", [_ins.player]);
                    },
                    onPlayStart: function(){
                        _ins.exec("start", [_ins.player]);
                    },
                    onPlayEnd: function(){
                        _ins.exec("end", [_ins.player]);
                    }
                }
            });
        },
        play : function (){
            var player = this.player;

            player && player.playVideo();
        },
        pause : function(){
            var player = this.player;

            player && player.pauseVideo();
        },
        setSeek : function(position){
            var player = this.player;

            player && player.seekTo(position);
        },
        getCurrentTime : function(){
            var player = this.player;

            return (player && player.currentTime()) || -1;
        }
    };

    module.exports = {
        newInstance: function(options){
            var ins = APICache[options.id] || (APICache[options.id] = new YouKuPlayer(options));

            return {
                set : function(type, option){
                    ins.set(type, option);

                    return this;
                },
                create : function(url){
                    ins.create(url);

                    return this;
                },
                play : function(){
                    ins.play();

                    return this;
                },
                pause : function(){
                    ins.pause();

                    return this;
                },
                setSeek : function(position){
                    ins.setSeek(position);

                    return this;
                },
                getCurrentTime : function(){
                    return ins.getCurrentTime();
                }
            };
        }
    };
}); 
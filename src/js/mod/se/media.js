/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 媒体模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Media(require, exports, module){
    $.Util = require("mod/se/util");

    var _Audio = {  
        //audio对象
        audio : null,
        /**
         * 创建一个新实例
         * @param Object options audio属性配置
         * @param Object events audio事件配置
         */      
        newInstance : function(options, events){
            if(null == this.audio){                
                this.audio = new Audio(); 
                //---------------------------------             
                for(var key in options){
                    if(options.hasOwnProperty(key) && (key in this.audio)){
                        this.audio[key] = options[key];
                    }
                }

                for(var e in events){
                    if(events.hasOwnProperty(e)){
                        this.bind(e, events[e]);
                    }
                }
                this.audio.load();
            }
        },
        /**
         * 绑定事件
         * @param String type 类型
         * @param Object handler 回调 @see Util.execHandler
         */
        bind : function(type, handler){
            $(this.audio).on(type, function(e){
                $.Util.execAfterMergerHandler(handler, [e, this.audio]);
            });
        },
        /**
         * 暂停
         */
        pause : function(){
            if(this.audio){
                this.audio.pause();
            }
        },
        /**
         * 播放
         */
        play : function(){  
            if(this.audio){
                this.audio.play();
            }
        }
    }

    module.exports = {
        Audio : _Audio
    }
});
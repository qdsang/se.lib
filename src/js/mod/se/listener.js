/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 监听器模块
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function Listener(require, exports, module){
    /**
     * 监听
     * @param Object options 回调配置，
     *        如：new Listener({"onbefore":{Function callback, Array args, Object context, Boolean returnValue}})
     */
    var Listener = function(options){
        this.options = options || {};
    };

    Listener.prototype = {
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            var key = "on" + type;
            var cfg = this.options;
            var opt = option || {};
            var callback = opt.callback || null;
            var args = opt.args || [];
            var context = opt.context || window;
            var returnValue = opt.returnValue;

            returnValue = (typeof(returnValue) == "boolean" ? returnValue : false);

            if(key in cfg){
                if(callback && (callback instanceof Function) && callback.apply){
                    this.options[key] = {
                        "callback" : callback,
                        "args" : args,
                        "context" : context,
                        "returnValue" : returnValue
                    };
                }else{
                    this.options[key] = null;
                }
            }
            
            opt = null; cfg = null;
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.options["on" + type] = null;
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            var key = "on" + type;
            var o = this.options;

            if(key in o){
                return o[key];
            }
            
            o = null;
            return null;
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            for(var key in this.options){
                if(this.options.hasOwnProperty(key)){
                    this.options[key] = null;
                }
            }
        },
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            var o = this.get(type);
            var m = args || [];
            var a = [].concat(m);
            var result = undefined;

            if(o && o.callback && o.callback.apply){
                a = a.concat(o.args||[]);

                if(true === o.returnValue){
                    result = o.callback.apply(o.context, a);
                }else{
                    o.callback.apply(o.context, a);
                }
            }
            m = null; a = null;

            return result;
        }
    };

    module.exports = Listener;
});
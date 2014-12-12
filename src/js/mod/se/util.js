/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 工具模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Util(require, exports, module){
    //Action配置
    $.Action = {
        //todo
    };

    var __action__ = function(node, e){
        var action = node.attr("data-action") || "";
        var pattern = /^([a-zA-Z0-9_]+):\/\/([a-zA-Z0-9_\/]+)(#([^#]+))?$/;
        var result = pattern.exec(action);
        var _class = null;
        var _className = null;
        var _namespace = null;
        var _method = null;
        var _data = null;

        if(result){
            _className = result[1];
            _namespace = result[2];            
            _data = result[4] || null;
             _class = $[_className] || null;
            //_method = result[2];

            if(_class){
                if(_namespace.indexOf("/") == -1){
                    _method = _namespace;
                }else{
                    var _pkgs = _namespace.split("/");
                    var _size = _pkgs.length;

                    _class = (function(c, pkgs, size){
                        var pkg = null;

                        for(var i = 0; i < size - 1; i++){
                            pkg = pkgs[i];

                            if(null != c && (pkg in c)){
                                c = c[pkg] || null;
                            }else{
                                return null;
                            }
                        }

                        return c;
                    })(_class, _pkgs, _size);

                    _method = _pkgs[_size - 1];
                }

                if(null != _class && (_method in _class)){
                    _class[_method].apply(null, [_data, node, e]);
                }
            }
        }

        return false;
    }; 

    //Action事件委托
    var __onAction = function(e){
        e.preventDefault();
        e.stopPropagation();
        
        var cur = $(e.currentTarget);
        
        return __action__(cur, e);
    };
    var _util = {
        //点击事件，如果支持touch，则用tap事件，否则用click事件
        CLICK_EVENT : (("ontouchstart" in window) ? "tap" : "click"),
        //zepto ajax异常配置
        RequestStatus : {
            "timeout"  : {status: 0xFE01, text: "亲，网络不给力啊~~"},
            "error"  : {status: 0xFE02, text: "亲，系统出了点小问题，请稍候片刻再试"},
            "abort" : {status: 0xFE03, text: "抱歉，您的请求被中断，请重新发起"},
            "parsererror" : {status: 0xFE04, text: "数据处理异常"},
            "success" : {status: 0x0000, text: "OK"}
        },
        /**
         * bit位检测
         * @param int src 源值
         * @param int flag 当前值
         * @return Boolean 
         * @example Util.checkBitFlag(7, 2) => true
         *          Util.checkBitFlag(7, 8) => false
         */
        checkBitFlag : function(src, flag){
            return (!!(src & flag) && flag > 0)
        },
        /**
         * 格式化模板数据
         * @param String tpl 模板数据
         * @param Object metaData 元数据
         * @param String preifx 模板数据前缀标识，默认为$
         * @return String str 格式化后的字符串
         */
        formatData : function(tplData, metaData, prefix){
            var str = "";
            var reg = null;

            prefix = (undefined === prefix ? "\\$" : (prefix ? "\\" + prefix : "")) ;
            tplData = tplData || "";
            metaData = metaData || {};

            for(var key in metaData)    {
                if(metaData.hasOwnProperty(key)){
                    reg = new RegExp(prefix + "\\!?\\{"+key+"\\}", "gm");
                    str = tplData = tplData.replace(reg, metaData[key]);
                    reg = null;
                }
            }

            str = (str || tplData);
            //----------------------------------
            reg = new RegExp(prefix + "\\!\\{[^\\{\\}]+\\}", "gm");
            str = str.replace(reg, "");
            reg = null;
            //----------------------------------
            return str;
        },
        /**
         * 隐藏地址栏
         */
        hideAddressBar : function(e){
            setTimeout(function(){
                window.scrollTo(0, 1);
            }, 0);
        },
        /**
         * 获取设备屏幕显示方向
         * @return int orient 0:竖屏 1:横屏
         */
        getOrientation : function(){
            var orient = window.orientation;

            if(0 === orient || 180 == orient){
                return 0; //竖屏
            }else if(90 == orient || -90 == orient){
                return 1;  //横屏
            }else{
                return 0;  //竖屏
            }
        },
        /**
         * 执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         */
        execHandler : function(handler){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;
                var delay = handler.delay || -1;

                if(callback && callback instanceof Function){
                    if(typeof(delay) == "number" && delay >= 0){
                        setTimeout(function(){
                            callback.apply(context, args);
                        }, delay);
                    }else{
                        callback.apply(context, args);
                    }
                }
            }
        },
        /**
         * 合并参数后执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         * @param Array args 参数
         */
        execAfterMergerHandler : function(handler, _args){
            var newHandler = $.extend(true, {}, handler);
            
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;

                newHandler.args = _args.concat(args);
            }

            this.execHandler(newHandler);
        },
        /**
         * html解码
         * @param String str 字符串
         * @return String tmp 解码后的字符串
         */
        decodeHTML : function(str){
            var tmp = str.replace(/&#60;/g, "<");
                tmp = tmp.replace(/&#62;/g, ">");
                tmp = tmp.replace(/&#34;/g, "\"");
                tmp = tmp.replace(/&#39;/g, "'");
                tmp = tmp.replace(/&#38;/g, "&");
                
            return tmp;
        },
        /**
         * html编码
         * @param String str 字符串
         * @return String tmp 编码后的字符串
         */
        encodeHTML : function(str){
            var tmp = str.replace(/&/g, "&#38;");
                tmp = tmp.replace(/>/g, "&#62;");
                tmp = tmp.replace(/"/g, "&#34;");
                tmp = tmp.replace(/'/g, "&#39;");
                tmp = tmp.replace(/</g, "&#60;");
            
            return tmp;
        },
        /**
         * 获取光标位置
         * @param Node ctrl 控件
         * @return Number caretPos 光标位置
         */
        getCursorPosition : function(ctrl){
            var caretPos = 0;
            
            if(document.selection) {
                ctrl.focus();
                
                var section = document.selection.createRange();
                
                section.moveStart ('character', -ctrl.value.length);
                caretPos = section.text.length;
                
            }else if(typeof(ctrl.selectionStart) == "number"){
                caretPos = ctrl.selectionStart;
            }
            return caretPos;
        },
        /**
         * 设置光标位置
         * @param Node ctrl 控件
         * @param Number pos 光标位置
         */
        setCursorPosition : function(ctrl, pos){
            setTimeout(function(){
                if(typeof(ctrl.selectionStart) == "number"){
                    ctrl.selectionStart = ctrl.selectionEnd = pos;
                }else if(ctrl.setSelectionRange){
                    ctrl.focus();
                    ctrl.setSelectionRange(pos,pos);
                }else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }, 15);
        },
        /**
         * 设置Action勾子         
         */
        setActionHook : function(selector, eventType){
            var body = $(selector || "body");
            var setting = body.attr("data-actionhook");
            var type = eventType ? eventType : _util.CLICK_EVENT;

            if("1" != setting){
                body.on(type, '[data-action]', __onAction);                
                body.attr("data-actionhook", "1");

                if("click" != type){ //如果不为click，将click事件的默认阻止掉
                    body.on("click", '[data-action]', false); 
                }
            }

            body = null;
        },
        /**
         * 主动触发data-action
         * @param Object 节点（zepto对象）
         * @param Event e 事件
         */
        fireAction : function(actionNode, e){
            return __action__(actionNode, e || null);
        },
        /**
         * 注入Action配置
         * @param Object action action配置
         */
        injectAction : function(action){
            $.extend(true, $.Action, action);
        },
        /**
         * 获取设备的像素比
         * @return float ratio 像素比
         */
        getDevicePixelRatio : function(){
            return window.devicePixelRatio || 1;
        }
    };

    module.exports = _util;
});
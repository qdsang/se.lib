/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 轻量级动画模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.7
 */
;define(function (require, exports, module){
                   require("mod/polyfill/array");
    var Listener = require("mod/se/listener");

    var vendors = ["webkit", "Moz", "ms", "O", ""];
    var vendorLength = vendors.length;
    var nodeStyle = document.createElement("div").style;
    var funcs = /^((translate|rotate|scale)(X|Y|Z|3d)?|skew(X|Y)|matrix(3d)?|perspective)$/;

    var vendor = (function(){
        var key = "";
        var prefix = "";

        for(var i = 0; i < vendorLength; i++){
            prefix = vendors[i];
            key = (prefix ? prefix + "T" : "t") + "ransform";

            if(key in nodeStyle){
                return prefix;
            }
        }

        return undefined;
    })();

    var getRealStyle = function(style){
        if(undefined === vendor) return undefined;
        if("" === vendor || (style in nodeStyle)) return style;
        return vendor + style.charAt(0).toUpperCase() + style.substr(1);
    };

    var getPrefixStyle = function(style){
        if(undefined === vendor) return undefined;
        if("" === vendor || (style in nodeStyle)) return style;
        return "-" + vendor.toLowerCase() + "-" + cssname(style);
    };

    var cssname = function(property){
        var tmp = property.replace(/([A-Z])/g, "-$1").toLowerCase();

        return tmp;
    };

    var transformPrefixs = getPrefixStyle("transform");
    var transitionPrefixs = getPrefixStyle("transition");
    var animationPrefixs = getPrefixStyle("animation");


    transformPrefixs = (undefined === transformPrefixs || transformPrefixs == "transform") ? "" : transformPrefixs;
    transitionPrefixs = (undefined === transitionPrefixs || transitionPrefixs == "transition") ? "" : transitionPrefixs;
    animationPrefixs = (undefined === animationPrefixs || animationPrefixs == "animation") ? "" : animationPrefixs;

    var _KeyFrame = function(name){
        this.name = name;
        this.frames = [];
    };

    _KeyFrame.prototype = {
        push : function(frame, properties){
            if(this.frames.indexOf(frame) == -1){
                var list = [];
                var p = "";
                var v = "";
                var transform = [];
                for(var key in properties){
                    v = properties[key];

                    if(funcs.test(key)){
                        transform.push(key + "(" + v + ")");
                    }else{
                        p = getPrefixStyle(key);
                       
                        if(undefined !== p && p != key){
                            list.push(p + ": " + v);
                        }else{
                            list.push(key + ": " + v);
                        }
                    }
                }

                if(transform.length > 0){
                    if(transformPrefixs){
                        list.push(transformPrefixs + ": " + transform.join(" "));
                    }else{
                        list.push("transform: " + transform.join(" "));
                    }
                }

                this.frames.push(frame + " {" + list.join("; ") + "}");
            }
        },
        print : function(){
            var frames = this.frames.join("\n");

            var key = "keyframes";
            var name = this.name;
            var hack = "-" + (vendor.toLowerCase()) + "-" + key;
            var str = " " + name + " {\n" + frames + "\n}";
            var keyframes = [];

            keyframes.push("@" + hack + str);
            keyframes.push("@" + key + str);

            $("head").append('<style type="text/css">\n'+ keyframes.join("\n") +'\n</style>');
        }
    };

    var _LightAnimation = function(target, source, bind){
        this.target = $(target);
        this.domNode = this.target[0];
        this.backupStyle = this.domNode.style.cssText;
        this.runtimeStyle = this.backupStyle;
        //transition::property:value!duration easing delay;property:value!duration easing delay>property:value!duration easing delay
        //animation::name:!duration timing-function delay iteration-count direction fill-mode play-state;
        this.source = source;
        this.current = 0;
        this.queue = this.parse(source);
        this.keyframes = {};

        this.listener = new Listener({
            ontransitionEnd : null, 
            onanimationStart : null,  
            onanimationEnd : null,   
            onanimationIteration : null,  
            oncomplete : null  
        });

        if(false !== bind){
            this.on();
        }
    };

    _LightAnimation.prototype = {
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
            var ins = this;
            var target = ins.target;

            target.off("webkitAnimationStart", "")
                  .off("webkitAnimationEnd", "")
                  .off("webkitAnimationIteration", "")
                  .off("webkitTransitionEnd", "");
        },
        on : function(force){
            var ins = this;
            var target = ins.target;
            var bind = target.attr("data-bindla");

            if("1" != bind || true === force){
                ins.off();

                target.on("webkitAnimationStart", "", ins, function(e){
                    var data = e.data;

                    data.animationStart(e);
                });

                target.on("webkitAnimationEnd", "", ins, function(e){
                    var data = e.data;

                    data.animationEnd(e);
                });

                target.on("webkitAnimationIteration", "", ins, function(e){
                    var data = e.data;

                    data.animationIteration(e);
                });

                target.on("webkitTransitionEnd", "", ins, function(e){
                    var data = e.data;
                    
                    data.transitionEnd(e);
                });
            }
        },
        animationStart : function(e){
            e.preventDefault();
            e.stopPropagation();

            var data = this;

            data.exec("animationStart", [data.target, data.current]);

            var it = "animationIterationCount";
            var pit = getRealStyle(it);

            var itc = data.domNode.style[it];

            if(pit){
                itc = data.domNode.style[pit];
            }

            if("infinite" == itc){
                data.current++;
                data.__play__();
            }
        },
        animationEnd : function(e){
            e.preventDefault();
            e.stopPropagation();

            var data = this;

            data.exec("animationEnd", [data.target, data.current]);

            data.current++;
            data.__play__();
        },
        animationIteration : function(e){
            e.preventDefault();
            e.stopPropagation();

            var data = this;

            data.exec("animationIteration", [data.target, data.current]);
        },
        transitionEnd : function(e){
            e.preventDefault();
            e.stopPropagation();

            var data = this;
            var target = data.target;
            var s = target.css(getRealStyle("transition"));
            var size = s.split(",").length;
            var tmp = Number(target.attr("data-subqueue") || 0);
            if(size == ++tmp){
                data.exec("transitionEnd", [target, data.current]);

                data.current++;
                data.__play__();
            }
            target.attr("data-subqueue", tmp);
        },
        parse : function(source){
            var schemaSeparator = "::";
            var schemaIndex = source.indexOf(schemaSeparator);
            var schema = source.substring(0, schemaIndex);
            var properties = source.substr(schemaIndex + schemaSeparator.length);

            if("transition" == schema){
                return this.parseTransition(properties);
            }else if("animation" == schema){
                return this.parseAnimation(properties);
            }else{
                throw new Error("Unknown animation schema(" + schema + ")");
            }
        },
        parseTransition : function(properties){
            var groups = properties.split(">");
            var length = groups.length;
            var items = null;
            var values = null;
            var pattern = /^([^:]+):([^!]+)!(.+)?$/g;
            var result = null;
            var conf = null;
            var transform = [];
            var transformFlag = false;
            var queue = [];

            for(var i = 0; i < length; i++){
                transform = [];
                items = groups[i];
                conf = {
                    "properties": [],
                    "values": [],
                    "animate": []
                };
                values = items.split(";");

                for(var j = 0, k = values.length; j < k; j++){
                    while(null != (result = pattern.exec(values[j]))){
                        var property = result[1];
                        var value = result[2];
                        var animate = result[3] || "";
                        var prefixs = getPrefixStyle(property);
                        var css = cssname(property);

                        prefixs = (undefined === prefixs || prefixs == property) ? "" : prefixs;

                        if(funcs.test(property)){

                            transform.push(property + "(" + value + ")");

                            if(animate && false === transformFlag){
                                if(transformPrefixs){
                                    conf.values.push(transformPrefixs + " " + animate);
                                }else{
                                    conf.values.push("transform " + animate);
                                }

                                transformFlag = true;
                            }
                        }else{
                            if(prefixs){
                                conf.properties.push(prefixs + ": " + value);
                            }else{
                                conf.properties.push(css + ": " + value);
                            }

                            if(animate){
                                if(prefixs){
                                    conf.values.push(prefixs + " " + animate);
                                }else{
                                    conf.values.push(css + " " + animate);
                                }
                            }
                        }
                    }
                }

                if(transform.length > 0){
                    if(transformPrefixs){
                        conf.properties.push(transformPrefixs + ": " + transform.join(" "));
                    }else{
                        conf.properties.push("transform: " + transform.join(" "))
                    }
                }

                if(transitionPrefixs){
                    conf.animate.push(transitionPrefixs + ": " + conf.values.join(", "));
                }else{
                    conf.animate.push("transition: " + conf.values.join(", "));
                }
                queue.push(conf);
            }

            return queue;
        },
        parseAnimation : function(properties){
            var groups = properties.split(">");
            var length = groups.length;
            var items = null;
            var values = null;
            var pattern = /^([^:]+):([^!]*)!(.+)?$/g;
            var result = null;
            var conf = null;
            var queue = [];

            for(var i = 0; i < length; i++){
                items = groups[i];
                conf = {
                    "properties": [],
                    "values": [],
                    "animate": []
                };
                values = items.split(";");

                for(var j = 0, k = values.length; j < k; j++){
                    while(null != (result = pattern.exec(values))){
                        var property = result[1];
                        var value = result[2];
                        var animate = result[3] || "";

                        conf.values.push(property + " " + animate);
                    }
                }

                
                if(animationPrefixs){
                    conf.animate.push(animationPrefixs + ": " + conf.values.join(", "));
                }else{
                    conf.animate.push("animation: " + conf.values.join(", "));
                }
                queue.push(conf);
            }

            return queue;

        },
        clearKeyFrames : function(){
            this.keyframes = {};
        },
        addKeyFrame : function(name, frame, properties){
            if(!(name in this.keyframes)){
                this.keyframes[name] = new _KeyFrame(name);
            }

            this.keyframes[name].push(frame, properties);
        },
        printKeyFrames : function(){
            for(var kf in this.keyframes){
                this.keyframes[kf].print();
            }
        },
        mergerCss : function(rs, p, ani){
            var lastChar = /(;\s*)$/g;
            var _rs = rs.replace(lastChar, "");
            var _p = p.replace(lastChar, "");
            var _tmp = (ani || "").split(":")[1] || "";

            var s = (_rs ? _rs + ";" : "")
                  + (_p ? _p + ";" : "")
                  + (_tmp && _tmp.length > 1 ? ani : "");

            return s;
        },
        __play__ : function(){
            var effect = this.queue[this.current];

            if(effect){
                var properties = effect.properties;
                var values = effect.values;
                var animate = effect.animate;

                var css = this.mergerCss(this.runtimeStyle, properties.join(";"), animate.join(";"));        

                this.runtimeStyle = this.domNode.style.cssText = css; 
            }else{
                this.exec("complete", [this.target]);
            }
        },
        updateSource : function(source){
            this.source = source;
            this.queue = this.parse(source);
        },
        updateTarget : function(target){
            this.target = $(target);
            this.domNode = this.target[0];
            this.backupStyle = this.domNode.style.cssText;
            this.runtimeStyle = this.backupStyle;
        },
        play : function(){
            this.reset();

            this.__play__();
        },
        reset : function(){
            this.domNode.style.cssText = this.runtimeStyle = this.backupStyle;
            this.target.attr("data-subqueue", "0");
            this.current = 0;
        }
    };

    var _pub = {
        newInstance : function(target, source, bind){
            var la = new _LightAnimation(target, source, bind);

            return {
                "target" : la.target,
                "set" : function(type, options){
                    la.set(type, options);

                    return this;
                },
                "addKeyFrame" : function(name, frame, properties){
                    la.addKeyFrame(name, frame, properties);

                    return this;
                },
                "printKeyFrames" : function(){
                    la.printKeyFrames();

                    return this;
                },
                "clearKeyFrames" : function(){
                    la.clearKeyFrames();

                    return this;
                },
                "updateTarget" : function(target){
                    la.updateTarget(target);

                    return this;
                },
                "source" : function(source){
                    la.updateSource(source);

                    return this;
                },
                "play" : function(){
                    setTimeout(function(){
                        la.play();
                    }, 60);
                    
                    return this;
                },
                "reset" : function(){
                    la.reset();

                    return this;
                },
                "off" : function(){
                    la.off();

                    return this;
                },
                "on" : function(force){
                    la.on(force);

                    return this;
                }
            }
        }
    };

    module.exports = _pub;
});
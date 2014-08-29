/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 轻量级动画模块
 * @charset utf-8
 * @author lijun
 * @date 2014.7
 */
;define(function (require, exports, module){
                   require("mod/polyfill/array")
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
        if("" === vendor) return style;
        return vendor + style.charAt(0).toUpperCase() + style.substr(1);
    };

    var getPrefixStyle = function(style){
        if(undefined === vendor) return undefined;
        if("" === vendor) return style;
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
                        }
                        list.push(key + ": " + v);
                    }
                }

                if(transform.length > 0){
                    if(transformPrefixs){
                        list.push(transformPrefixs + ": " + transform.join(" "));
                    }
                    list.push("transform: " + transform.join(" "));
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

            $("head").append('<style type="text/css">'+ keyframes.join("\n") +'</style>');
        }
    };

    var _LightAnimation = function(target, source){
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

        this.target.on("webkitAnimationStart", "", this, function(e){
            var data = e.data;

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
        });

        this.target.on("webkitAnimationEnd", "", this, function(e){
            var data = e.data;

            data.exec("animationEnd", [data.target, data.current]);

            data.current++;
            data.__play__();
        });

        this.target.on("webkitAnimationIteration", "", this, function(e){
            var data = e.data;

            data.exec("animationIteration", [data.target, data.current]);
        });

        this.target.on("webkitTransitionEnd", "", this, function(e){
            var data = e.data;

            data.exec("transitionEnd", [data.target, data.current]);

            data.current++;
            data.__play__();
        });
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
                                }
                                conf.values.push("transform " + animate);
                            }
                        }else{
                            if(prefixs){
                                conf.properties.push(prefixs + ": " + value);
                            }
                            conf.properties.push(css + ": " + value);

                            if(animate){
                                if(prefixs){
                                    conf.values.push(prefixs + " " + animate);
                                }
                                conf.values.push(css + " " + animate);
                            }
                        }
                    }
                }

                if(transform.length > 0){
                    if(transformPrefixs){
                        conf.properties.push(transformPrefixs + ": " + transform.join(" "));
                    }

                    conf.properties.push("transform: " + transform.join(" "))
                }

                if(transitionPrefixs){
                    conf.animate.push(transitionPrefixs + ": " + conf.values.join(", "));
                }
                conf.animate.push("transition: " + conf.values.join(", "));
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
            var transform = [];
            var transformFlag = false;
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
                }
                conf.animate.push("animation: " + conf.values.join(", "));
                queue.push(conf);
            }

            return queue;

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
        __play__ : function(){
            var effect = this.queue[this.current];

            if(effect){
                var properties = effect.properties;
                var values = effect.values;
                var animate = effect.animate;

                var css = this.runtimeStyle + "; "
                        + properties.join(";") + "; "
                        + animate.join(";");

                this.runtimeStyle = this.domNode.style.cssText = css;        
            }
        },
        play : function(){
            this.domNode.style.cssText = this.runtimeStyle = this.backupStyle;
            this.current = 0;

            this.__play__();
        }
    };

    var _pub = {
        newInstance : function(target, source){
            var la = new _LightAnimation(target, source);

            return {
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
                "play" : function(){
                    la.play();
                }
            }
        }
    };

    module.exports = _pub;
});
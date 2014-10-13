/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * webapp模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.8
 */
;define(function WebApp(require, exports, module){
                        require("mod/zepto/touch");
                        require("mod/se/raf");
    var Listener      = require("mod/se/listener");
    var Util = $.Util = require("mod/se/util");
    var LA            = require("mod/sa/lightanimation");
    var ST            = require("mod/sa/scenetransitions");

    var SCROLL = {
        "VERTICAL": "vertical",
        "HORIZONTAL": "horizontal"
    };

    var WIDGET_MODE = {
        "ONCE": "once",
        "EVERYTIME": "everytime"
    };

    var Widget = function(app, module, widget, data){
        this.app = app;
        this.module = module;
        this.widget = widget;
        this.source = data;

        this.effect = this.createAnimate(data);
    };

    Widget.prototype = {
        createAnimate : function(effect){
            var la = LA.newInstance(this.widget, effect);

            la.set("complete", {
                callback : function(target){
                    this.app.exec("widget", [this.module, this.widget]);
                },
                context : this
            });

            return la;
        },
        next : function(){
            this.effect.play();
            
        },
        restore : function(){
            this.effect.reset();
        }
    };

    var _WebApp = function(appId, viewId, headerId, footerId){
        var oApp = $("#" + appId);
        var oView = $("#" + viewId);
        var oHeader = $("#" + headerId);
        var oFooter = $("#" + footerId);

        if(!appId || !viewId || oApp.length != 1 || oView.length != 1){
            throw new Error("APP is not valid, appId = " + appId + ", viewId = " + viewId);
        }

        if(headerId && oHeader.length != 1){
            throw new Error("APP's `header` is not found(" + headerId + ")")
        }

        if(footerId && oFooter.length != 1){
            throw new Error("APP's `footer` is not found(" + footerId + ")")
        }

        if(oHeader.length != 1){
            oHeader = null;
        }

        if(oFooter.length != 1){
            oFooter = null;
        }

        this.root = $("html");
        this.appId = appId;
        this.viewId = viewId;
        this.headerId = headerId;
        this.footerId = footerId;
        this.app = oApp;
        this.view = oView;
        this.header = oHeader;
        this.footer = oFooter;
        this.scroller = null;
        this.modules = null;
        this.innerboxes = null;
        this.widgets = {};
        this.mode = TransitionEffect.ROTATE;
        this.scroll = SCROLL.VERTICAL;
        this.widgetMode = WIDGET_MODE.ONCE;
        this.device = {width:320, height:480, ratioWidth:"100%", ratioHeight:"100%"};
        this.currentIndex = 0;
        this.lazyLoading = 2;
        this.fps = 0;
        this.locked = false;
        this.sceneDeg = 28;
        this.sceneDuration = .28;
        this.sceneTiming = "ease";
        this.scenePerspective = "300px";
        this.sceneTransition = null;

        this.listener = new Listener({
            oninit : null,              //初始化时的回调{Function callback, Array args, Object context}
            onbegin : null,              //滑动开始{Function callback, Array args, Object context}
            onscrolling : null,           //滑动中{Function callback, Array args, Object context}
            onend : null,                //滑动结束{Function callback, Array args, Object context}
            onwidget : null,              //widget完成{Function callback, Array args, Object context}
            onresize : null,              //窗口大小重置{Function callback, Array args, Object context}
            onorientationchange : null,   //横竖屏切换
            onenterframe : null          //enterframe回调{Function callback, Array args, Object context}
        });
    };

    _WebApp.prototype = {
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
        setFPS : function(fps){
            this.fps = fps;
        },
        setLocked : function(locked){
            this.locked = locked;

            if(this.sceneTransition){
                this.sceneTransition.setLocked(this.locked);
            }
        },
        layout : function(node, view, def, handler){
            $.each(node, function(index, item){
                var tmp = $(item);

                tmp.css({
                    "width": ((view.width || def.width) + "px").replace("%px", "%"),
                    "height": ((view.height || def.height) + "px").replace("%px", "%")
                });

                offset = tmp.offset();

                tmp.attr("data-index", index)
                   .attr("data-x", offset.left)
                   .attr("data-y", offset.top)
                   .attr("data-width", offset.width)
                   .attr("data-height", offset.height);

                Util.execAfterMergerHandler(handler, [index, tmp]);

                tmp = null;
            });
        },
        update : function(){
            var _ins = this;
            var w = window.innerWidth;
            var h = window.innerHeight;

            var header = this.header ? this.header.offset() : {width:0, height:0};
            var footer = this.footer ? this.footer.offset() : {width:0, height:0};

            h = h - header.height - footer.height;

            var v = {
                width: w,
                height: h
            };

            _ins.setAppDeviceSize();

            _ins.layout(_ins.view, v, v, null);
            _ins.layout(_ins.modules, v, v, {
                callback: function(index, module){
                    this.queryModuleWidget(index, module);
                },
                context: _ins
            });
            _ins.layout(_ins.scroller, _ins.scroller.offset(), v, null);
            _ins.layout(_ins.innerboxes, {
                width: _ins.device.ratioWidth,
                height: _ins.device.ratioHeight
            }, v, null);

        },
        preventTouchMove : function(){
            $(document).on("touchmove", function(e){
                e.preventDefault();
            });
        },
        queryModuleWidget : function(index, module){
            var _ins = this;
            var widgets = null;
            var key = String(index);

            if(!_ins.widgets[key]){
                widgets = module.find('[data-widget]');

                _ins.widgets[key] = [];
                $.each(widgets, function(i, widget){
                    var w = $(widget);
                    var data = w.attr("data-widget");

                    _ins.widgets[key].push(new Widget(_ins, module, w, data));
                });
            }
        },
        showModuleWidget : function(index){
            var _ins = this;
            var widgets = _ins.widgets[String(index)] || [];
            var module = $(_ins.modules[index]);
            var setted = module.attr("data-setted");

            if(WIDGET_MODE.EVERYTIME == _ins.widgetMode || "1" != setted){
                for(var i = 0, size = widgets.length; i < size; i++){
                    (function(widget){
                        widget.next();
                    })(widgets[i])
                }
                module.attr("data-setted", "1");
            }
        },
        restoreModuleWidget : function(index){
            var _ins = this;
            var widgets = _ins.widgets[String(index)] || [];

            if(WIDGET_MODE.EVERYTIME == _ins.widgetMode){
                for(var i = 0, size = widgets.length; i < size; i++){
                    widgets[i].restore();
                }
            }
        },
        restoreExceptModuleWidget : function(index){
            var _ins = this;
            var sIndex = String(index);

            if(WIDGET_MODE.EVERYTIME == _ins.widgetMode){
                for(var key in _ins.widgets){
                    if(sIndex != key){
                        _ins.restoreModuleWidget(key);
                    }
                }
            }
        },
        configure : function(){
            var _ins = this;
            var _prepage = -1;

            var st = null;

            _ins.preventTouchMove();

            st = _ins.sceneTransition = ST.newInstance("section", _ins.mode, _ins.scroll);
            st.setDeg(_ins.sceneDeg);
            st.setDuration(_ins.sceneDuration);
            st.setTiming(_ins.sceneTiming);
            st.setPerspective(_ins.scenePerspective);

            st.set("start", {
                callback: function(e, x, y, shiftX, shiftY, distance, index){
                    this.exec("start", [e, x, y, shiftX, shiftY, distance, index]);
                },
                context: _ins
            });
            st.set("move", {
                callback: function(e, x, y, shiftX, shiftY, distance, index){
                    this.exec("scrolling", [e, x, y, shiftX, shiftY, distance, index]);
                },
                context: _ins
            });
            st.set("complete", {
                callback: function(e, index){
                    var _ins = this;

                    _ins.currentIndex = index;
                    _ins.showModuleWidget(index);
                    _ins.restoreExceptModuleWidget(index);
                    _ins.execLazyLoading(index);
                    _ins.exec("end", [e, index]);
                },
                context: _ins
            });
        },
        createViewport : function(){
            var _ins = this;

            _ins.update();
            _ins.configure();
        },
        resize : function(){
            var _ins = this;

            _ins.update();
        },
        enterframe : function(){
            var _ins = this;
            var lastTime = 0;
            var time = 0;

            requestAnimationFrame(function(){
                time = (new Date().getTime());

                if(_ins.fps <= 0 || (time - lastTime) > (1000 / _ins.fps)){
                    lastTime = time;

                    _ins.exec("enterframe", []);
                    requestAnimationFrame(arguments.callee);
                }
            })
        },
        setAppDeviceSize : function(){
            var _ins = this;
            var device = _ins.app.attr("data-device")||"";
            var items = device.split("/");
            var w = items[0] || "device-width";
            var h = items[1] || "device-height";
            var sw = window.innerWidth;
            var sh = window.innerHeight;

            w = isNaN(Number(w)) ? "device-width" : Number(w);
            h = isNaN(Number(h)) ? "device-height" : Number(h);

            if("device-width" == w){
                w = sw;
            }

            if("device-height" == h){
                h = sh;
            }

            w = Math.min(Math.max(w, 200), 10000);
            h = Math.min(Math.max(h, 223), 10000);

            _ins.device = {
                "width": w,
                "height": h,
                "ratioWidth": "100%",
                "ratioHeight": ((sw * h / w) / sh * 100) + "%"
            };
        },
        setLazyLoading : function(count){
            this.lazyLoading = count || 0;
        },
        execLazyLoading : function(index){
            var modules = this.modules || [];
            var size = modules.length;
            var module = null;

            if(this.lazyLoading > 0){
                for(var i = index; i < (index + this.lazyLoading) && i < size; i++){
                    module = $(modules[i]);

                    if("1" != module.attr("data-lazy")){
                        this.lazy(module);

                        module.attr("data-lazy", "1");
                    }
                }
            }
        },
        lazy : function(module){
            var lazyItems = module.find("data-lazysrc");

            $.each(lazyItems, function(index, item){
                var o = $(item);

                o.attr("src", o.attr("data-lazysrc"));
            });

            lazyItems = module.find("data-lazybg");

            $.each(lazyItems, function(index, item){
                var o = $(item);

                o.css("background-image", "url(" + o.attr("data-lazybg") + ")");
            });
        },
        init : function(){
            var _ins = this;

            _ins.scroller = $(".webapp-modules");
            _ins.modules = $(".webapp-modules>section");
            _ins.innerboxes = $(".webapp-modules>section>.innerbox");
            _ins.mode = _ins.app.attr("data-mode") || TransitionEffect.ROTATE;
            _ins.scroll = _ins.app.attr("data-scroll") || SCROLL.VERTICAL;
            _ins.widgetMode = _ins.app.attr("data-widget-mode") || WIDGET_MODE.ONCE;

            _ins.createViewport();
            _ins.enterframe();

            $(window).on("resize", "", _ins, function(e){
                var data = e.data;
                data.resize();
                data.exec("resize", []);
            }).on("orientationchange", "", _ins, function(e){
                var data = e.data;
                data.resize();
                data.exec("orientationchange", []);
            })
        }
    };

    var _pub = {
        newInstance : function(appId, viewId, headerId, footerId){
            var app = new _WebApp(appId, viewId, headerId, footerId);

            return {
                "mode" : TransitionEffect.ROTATE,
                "scroll" : SCROLL.VERTICAL,
                "widgetMode" : WIDGET_MODE.ONCE,
                "create" : function(){
                    app.init();

                    this.mode = app.mode;
                    this.scroll = app.scroll;
                    this.widgetMode = app.widgetMode;

                    app.exec("init", []);
                },
                "set" : function(type, options){
                    app.set(type, options);

                    return this;
                },
                "setFPS" : function(fps){
                    app.setFPS(fps);

                    return this;
                },
                "setLocked" : function(locked){
                    app.setLocked(locked);

                    return this;
                },
                "setLazyLoading" : function(count){
                    app.setLazyLoading(count);

                    return this;
                },
                "showModuleWidget" : function(index){
                    app.showModuleWidget(index);

                    return this;
                },
                "restoreModuleWidget" : function(index){
                    app.restoreModuleWidget(index);

                    return this;
                },
                "restoreExceptModuleWidget" : function(index){
                    app.restoreExceptModuleWidget(index);

                    return this;
                },
                "setSceneDeg" : function(deg){
                    app.sceneDeg = deg;

                    return this;
                },
                "setSceneDuration" : function(duration){
                    app.sceneDuration = duration;

                    return this;
                },
                "setSceneTiming" : function(timing){
                    app.sceneTiming = timing;

                    return this;
                },
                "setScenePerspective" : function(perspective){
                    app.scenePerspective = perspective;

                    return this;
                }
            }
        }
    };

    module.exports = _pub;
});

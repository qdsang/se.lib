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
    var Style         = require("mod/polyfill/css");

    var translateZ = Style.hasProperty("perspective") ? "translateZ(0)" : "";
    var touch = ("ontouchstart" in window);
    var startEvent = touch ? "touchstart" : "mousedown";
    var endEvent = touch ? "touchend" : "mouseup";
    var moveEvent = touch ? "touchmove" : "mousemove";

    var SCROLL = {
        "VERTICAL": "vertical",
        "HORIZONTAL": "horizontal"
    };

    var WIDGET_MODE = {
        "ONCE": "once",
        "EVERYTIME": "everytime"
    };

    var ADAPTIVE = {
        "NONE": "none",
        "AUTO": "auto",
        "X": "x",
        "Y": "y"
    };

    var OVERFLOW = {
        "ADAPTIVE": "adaptive",
        "HIDDEN": "hidden",
        "HIDDEN_X": "hidden-x",
        "HIDDEN_Y": "hidden-y"
    };

    var TARGET = {
        "VIEW": "view",
        "DESIGN": "design"
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
                    this.app.exec("widgetcomplete", [this.module, this.widget]);
                },
                context : this
            });

            la.set("play", {
                callback : function(target){
                    this.app.exec("widgetplay", [this.module, this.widget]);
                },
                context : this
            });

            la.set("reset", {
                callback : function(target){
                    this.app.exec("widgetreset", [this.module, this.widget]);
                },
                context : this
            });

            la.set("playing", {
                callback : function(target, index){
                    this.app.exec("widgetplaying", [this.module, this.widget, index]);
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
            throw new Error("APP's `header` is not found(" + headerId + ")");
        }

        if(footerId && oFooter.length != 1){
            throw new Error("APP's `footer` is not found(" + footerId + ")");
        }

        if(oHeader.length != 1){
            oHeader = null;
        }

        if(oFooter.length != 1){
            oFooter = null;
        }

        var snapKey = oApp.attr("data-snap");

        this.root = $("html");

        this.appId = appId;
        this.viewId = viewId;
        this.headerId = headerId;
        this.footerId = footerId;

        this.app = oApp;
        this.view = oView;
        this.header = oHeader;
        this.footer = oFooter;

        this.snaps = snapKey ? oApp.find(snapKey) : [];
        this.widgets = {};

        this.scroller = $(".webapp-modules");
        this.modules = $(".webapp-modules>section");
        this.innerboxes = $(".webapp-modules>section>.innerbox");
        this.mode = oApp.attr("data-mode") || TransitionEffect.ROTATE;
        this.scroll = oApp.attr("data-scroll") || SCROLL.VERTICAL;
        this.widgetMode = oApp.attr("data-widget-mode") || WIDGET_MODE.ONCE;
        this.adaptive = oApp.attr("data-adaptive") || ADAPTIVE.NONE;
        this.overflow = oApp.attr("data-overflow") || OVERFLOW.ADAPTIVE;
        this.target = oApp.attr("data-target") || TARGET.VIEW;
        this.align = oApp.attr("data-align") || null; 

        this.design = {width: 640, height: 960};
        this.viewport = {width:"device-width", height:"device-height", user_scalable:"no"};

        this.currentIndex = 0;
        this.lazyLoading = 2;
        this.fps = 0;
        this.locked = false;
        this.forcedLock = false;
        this.sceneDeg = 28;
        this.sceneDuration = .28;
        this.sceneTiming = "ease";
        this.scenePerspective = "300px";
        this.sceneTransition = null;

        this.listener = new Listener({
            oninit : null,              //初始化时的回调{Function callback, Array args, Object context}
            onlayout : null,
            onstart : null,              //滑动开始{Function callback, Array args, Object context}
            onscrolling : null,           //滑动中{Function callback, Array args, Object context}
            onend : null,                //滑动结束{Function callback, Array args, Object context}
            onexit : null,                //退出
            onmovement: null,
            onshift: null,
            onresize : null,              //窗口大小重置{Function callback, Array args, Object context}
            onorientationchange : null,   //横竖屏切换
            onenterframe : null,          //enterframe回调{Function callback, Array args, Object context}
            onwidgetcomplete : null,       //widget完成{Function callback, Array args, Object context}
            onwidgetplay: null,
            onwidgetplaying: null,
            onwidgetreset: null,
            onchromecreate: null,          //chrome创建时
            onchromestart: null,           //chrome滑动开始
            onchromescrolling: null,       //chrome滑动
            onchromeend: null,              //chrome滑动结束
            onchromeexit: null,             //chrome退出（保留）
            onchromereset: null             //chrome重置
        });
        //------------------------------------
        this.parseDesignSize();
        this.parseViewportInfo();
        this.reset();
        this.execLayoutSize();
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
            this.locked = locked || this.forcedLock;

            if(this.sceneTransition){
                this.sceneTransition.setLocked(this.locked);
            }
        },
        layout : function(name, node, view, def, handler){
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

            this.exec("layout", [name, node, view, def]);
        },
        updateViewportMeta : function(options){
            var _ins = this;
            var viewport = _ins.viewport;
            var content = [];
            var meta = $('meta[name="viewport"]');

            var tmp = $.extend(true, {}, viewport, options || {});
            var value = null;

            for(var key in tmp){
                if(tmp.hasOwnProperty(key)){
                    value = tmp[key];
                    key = key.replace(/_/g, "-");
                    if(value){
                        if("REMOVE" != value){
                            content.push(key + "=" + value);
                        }
                    }else{
                        content.push(key);
                    }
                }
            }

            meta.attr("content", content.join(", "));
        },
        execLayoutSize : function(){
            var _ins = this;
            var viewport = _ins.viewport;
            var design = _ins.design;
            var offset = _ins.app.offset();
            
            var w = offset.width;
            var h = offset.height;
            var dw = design.width;
            var dh = design.height;
            var vw = 0;
            var vh = 0;
            var iw = 0;
            var ih = 0;

            if(viewport.width != "device-width" && !isNaN(Number(viewport.width))){
                vw = Number(viewport.width);
            }

            if(viewport.height != "device-height" && !isNaN(Number(viewport.height))){
                vh = Number(viewport.height);
            }

            var header = this.header ? this.header.offset() : {width:0, height:0};
            var footer = this.footer ? this.footer.offset() : {width:0, height:0};

            h = h - header.height - footer.height;
            vh = vh - header.height - footer.height;

            iw = vw || w;
            ih = vh || h;

            //视窗大小
            this.viewSize = {
                width: (_ins.adaptive == ADAPTIVE.AUTO || _ins.adaptive == ADAPTIVE.X ? w : iw),
                height: (_ins.adaptive == ADAPTIVE.AUTO || _ins.adaptive == ADAPTIVE.Y ? h : ih)
            };

            //设计大小
            this.designSize = {
                width: (_ins.overflow == OVERFLOW.HIDDEN || _ins.overflow == OVERFLOW.HIDDEN_X ? (_ins.target == TARGET.DESIGN ? dw : iw) : iw),
                height: (_ins.overflow == OVERFLOW.HIDDEN || _ins.overflow == OVERFLOW.HIDDEN_Y ? (_ins.target == TARGET.DESIGN ? dh : ih) : ih)
            };

            this.snapSize = {
                width: Math.min(_ins.designSize.width, _ins.viewSize.width),
                height: Math.min(_ins.designSize.height, _ins.viewSize.height)
            };
        },
        update : function(){
            var _ins = this;

            //视窗大小
            var v = _ins.viewSize;

            //设计大小
            var iv = _ins.designSize;

            var sv = _ins.snapSize;
           
            _ins.layout("app", _ins.app, v, v, {
                callback: function(index, node){
                    node.css({
                        position: "relative",
                        margin: "0 auto"
                    });
                }, 
                context: _ins
            });
            _ins.layout("body", _ins.app.find("body"), v, v, null);
            _ins.layout("view", _ins.view, v, v, null);
            _ins.layout("snap", _ins.snaps, sv, sv, null);
            _ins.layout("module", _ins.modules, v, v, {
                callback: function(index, module){
                    this.queryModuleWidget(index, module);

                    if(this.align){
                        module.addClass(this.align);
                    }
                },
                context: _ins
            });
            _ins.layout("scroller", _ins.scroller, _ins.scroller.offset(), v, null);
            _ins.layout("innerbox", _ins.innerboxes, iv, iv, null);
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
        layoutLongPageChrome : function(index, moduleIndex, chrome){
            var offset = chrome.offset();

            chrome.attr("data-x", offset.left)
                  .attr("data-y", offset.top)
                  .attr("data-width", offset.width)
                  .attr("data-height", offset.height)
                  .attr("data-index", index + "," + moduleIndex);

            chrome.css({
                "left": offset.left + "px",
                "top": offset.top + "px",
                "width": offset.width + "px",
                "height": offset.height + "px"
            });
        },
        configureLongPageChrome : function(index, moduleIndex, type, module, chrome, isReset){
            var _ins = this;
            var mo = module.offset();
            var mw = mo.width;
            var mh = mo.height;
            var dir = chrome.attr("data-dir");
            var bound = Number(chrome.attr("data-bound"));
            var isBind = "1" == chrome.attr("data-bind");
            var width = Number(chrome.attr("data-width"));
            var height = Number(chrome.attr("data-height"));
            var maxScrollX = width - mw;
            var maxScrollY = height - mh;
            var startX = 0;
            var startY = 0;
            var scrollX = 0;
            var scrollY = 0;
            var moveX = 0;
            var moveY = 0;
            var isStarted = false;
            var matrix = "matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})";
            var opt = {
                "a": "1",
                "b": "0",
                "c": "0",
                "d": "1",
                "x": "0",
                "y": "${y}"
            };

            if("x" == dir){
                opt = $.extend(opt, {"x": "${x}", "y": "0"});
            }
            var args = JSON.stringify(opt);
            var ZERO = {"x": "0", "y": "0"};
            var MAX = {"x": -maxScrollX, "y": -maxScrollY};

            var moveTo = function(point){
                var meta = JSON.parse(Util.formatData(args, point));
                var func = Util.formatData(matrix, meta) + " " + translateZ;

                Style.css(chrome, "transform", func);
            };

            if(true === isReset){
                moveX = moveY = 0;
                moveTo(ZERO);

                chrome.off();
                _ins.exec("chromereset", [index, moduleIndex, type, module, chrome, isReset]);
            }else{
                chrome.on(startEvent, function(e){
                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);
                    var x = startX = pointer.pageX;
                    var y = startY = pointer.pageY;

                    isStarted = true;
                    _ins.exec("chromestart", [index, moduleIndex, type, module, chrome, isReset, x, y, maxScrollX, maxScrollY]);
                }).on(moveEvent, function(e){
                    if(!isStarted){
                        return 0;
                    }

                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);

                    var x = pointer.pageX;
                    var y = pointer.pageY;
                    var dx = scrollX = x + moveX - startX;
                    var dy = scrollY = y + moveY - startY;

                    var p = {
                        "x": dx,
                        "y": dy
                    };

                    moveTo(p);

                    var locked = true;
                    var cp = "x" == dir ? dx : dy;
                    var mp = "x" == dir ? maxScrollX : maxScrollY;

                    if(cp > 0 && cp >= bound){
                        locked = false;
                    }else if(cp < 0 && (Math.abs(cp) >= (bound + mp))){
                        locked = false;
                    }

                    _ins.forcedLock = locked;
                    _ins.setLocked(locked);

                    _ins.exec("chromescrolling", [index, moduleIndex, type, module, chrome, isReset, dx, dy, maxScrollX, maxScrollY]);
                }).on(endEvent, function(e){
                    isStarted = false;

                    var pointer = (("changedTouches" in e) ? e.changedTouches[0] : e);

                    var dx = moveX = scrollX;
                    var dy = moveY = scrollY;
                    var cp = "x" == dir ? dx : dy;
                    var mp = "x" == dir ? maxScrollX : maxScrollY;
                    var abs = Math.abs(cp);
                    
                    if(cp > 0){
                        moveX = moveY = 0;
                        moveTo(ZERO);
                    }else if(cp < 0 && abs > mp){
                        moveX = -maxScrollX;
                        moveY = -maxScrollY;
                        moveTo(MAX);
                    }

                    _ins.exec("chromeend", [index, moduleIndex, type, module, chrome, isReset, dx, dy, maxScrollX, maxScrollY]);
                }); 
            }
        },
        createViewFrame : function(index, moduleIndex, type, module, chrome, isReset){
            var _ins = this;
            var layout = "layout" + type + "Chrome";
            var configure = "configure" + type + "Chrome";

            //强制锁定
            _ins.forcedLock = !!!isReset;
            _ins.setLocked(!!!isReset);

            if(layout in _ins && _ins.forcedLock){
                _ins[layout].apply(_ins, [index, moduleIndex, chrome]);
            }

            if(configure in _ins){
                _ins[configure].apply(_ins, [index, moduleIndex, type, module, chrome, isReset]);
            }

            if(true !== isReset){
                _ins.exec("chromecreate", [index, moduleIndex, type, module, chrome, isReset]);
            }
        },
        createViewChrome : function(index, isReset){
            var _ins = this;
            var module = $(_ins.modules[index]);
            var chrome = module.find('[data-chrome]');
            var size = chrome.length;
            var node = null;
            var type = null;
            var method = null;

            if(size > 0){
                for(var i = 0; i < size; i++){
                    node = $(chrome[i]);
                    type = node.attr("data-chrome");

                    _ins["createViewFrame"].apply(_ins, [i, index, type, module, chrome, isReset]);
                }
            }
        },
        restoreViewChrome : function(index){
            var _ins = this;

            _ins.createViewChrome(index, true);
        },
        configure : function(){
            var _ins = this;

            var st = null;

            _ins.preventTouchMove();

            st = _ins.sceneTransition = ST.newInstance("section", _ins.mode, _ins.scroll);
            st.setDeg(_ins.sceneDeg);
            st.setDuration(_ins.sceneDuration);
            st.setTiming(_ins.sceneTiming);
            st.setPerspective(_ins.scenePerspective);

            st.set("start", {
                callback: function(e, x, y, shiftX, shiftY, distance, index){
                    this.currentIndex = index;
                    this.exec("start", [e, x, y, shiftX, shiftY, distance, index]);
                },
                context: _ins
            });
            st.set("move", {
                callback: function(e, x, y, shiftX, shiftY, distance, index){
                    this.currentIndex = index;
                    this.exec("scrolling", [e, x, y, shiftX, shiftY, distance, index]);
                },
                context: _ins
            });
            st.set("end", {
                callback: function(e, x, y, shiftX, shiftY, distance, index){
                    this.currentIndex = index;
                    this.restoreViewChrome(index);
                    this.exec("exit", [e, x, y, shiftX, shiftY, distance, index]);
                },
                context: _ins
            });
            st.set("movement", {
                callback: function(e, x, y, shiftX, shiftY, distance, index, direction){
                    this.currentIndex = index;
                    this.exec("movement", [e, x, y, shiftX, shiftY, distance, index, direction]);
                },
                context: _ins
            });
            st.set("shift", {
                callback: function(e, x, y, shiftX, shiftY, distance, index, direction){
                    this.currentIndex = index;
                    this.exec("shift", [e, x, y, shiftX, shiftY, distance, index, direction]);
                },
                context: _ins
            });
            st.set("complete", {
                callback: function(e, index){
                    var _ins = this;

                    _ins.currentIndex = index;
                    _ins.createViewChrome(index, false);
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
        reset : function(){
            var _ins = this;
            var _size = {
                "width": "100%",
                "height": "100%"
            };
            _ins.app.css(_size);
            _ins.app.find("body").css(_size);
            _ins.view.css(_size);
            _ins.scroller.css(_size);
            _ins.modules.css(_size);
        },
        resize : function(){
            var _ins = this;
            
            _ins.reset();
            _ins.execLayoutSize();
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
        parseDesignSize : function(){
            var str = this.app.attr("data-design") || "640/960";
            var items = str.split("/");
            var width = Number(items[0]);
            var height = Number(items[1]);

            this.design = {
                "width": width,
                "height": height
            };
        },
        parseViewportInfo : function(){
            var meta = $('meta[name="viewport"]');
            var content = meta.attr("content");
            var group = null;
            var item = null;
            var tmpKey = null;
            var key = null;
            var value = null;
            var splitIndex = 0;

            content = content.replace(/,\s*/g, ",").replace(/\s*=\s*/g, "=");
            group = content.split(",");

            for(var i = 0, size = group.length; i < size; i++){
                item = group[i];
                splitIndex = item.indexOf("=");
                tmpKey = item.substring(0, splitIndex);
                value = item.substring(splitIndex + 1);
                key = (tmpKey || value).replace(/\-/g, "_");
                value = tmpKey ? value : "";

                this.viewport[key] = value;
            }
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
            var lazyItems = module.find("[data-lazysrc]");

            $.each(lazyItems, function(index, item){
                var o = $(item);
                var conf = o.attr("data-lazysrc");
                var splitIndex = conf.indexOf("!");
                var type = splitIndex != -1 ? conf.substring(0, splitIndex) : "src";
                var source = splitIndex != -1 ? conf.substring(splitIndex + 1) : conf;

                if(type == "src"){
                    o.attr("src", source);
                }else{
                    o.css("background-image", "url(" + source + ")");
                }
            });
        },
        init : function(isAutoLoadWidget){
            var _ins = this;

            _ins.currentIndex = 0;
            _ins.createViewport();

            if(false !== isAutoLoadWidget){
                _ins.showModuleWidget(0);
                _ins.restoreExceptModuleWidget(0);
            }

            if(_ins.modules.length <= 1){
                _ins.forcedLock = true;
                _ins.setLocked(true);
            }

            _ins.execLazyLoading(0);

            _ins.exec("init", [isAutoLoadWidget]);
            _ins.exec("end", [null, 0]);

            _ins.enterframe();

            var loading = $(".webapp-loading");

            if(loading.length > 0){
                loading.addClass("hide");
            }

            $(window).on("resize", "", _ins, function(e){
                var data = e.data;
                //data.resize();
                data.exec("resize", []);
            }).on("orientationchange", "", _ins, function(e){
                var data = e.data;
                //data.resize();
                data.exec("orientationchange", []);
            })
        }
    };

    var _pub = {
        newInstance : function(appId, viewId, headerId, footerId){
            var app = new _WebApp(appId, viewId, headerId, footerId);

            return {
                "mode" : app.mode,
                "scroll" : app.scroll,
                "widgetMode" : app.widgetMode,
                "adaptive" : app.adaptive,
                "overflow" : app.overflow,
                "target": app.target,
                "align": app.align,
                "design": app.design,
                "app" : app.app,
                "view" : app.view,
                "header" : app.header,
                "footer" : app.footer,
                "scroller" : app.scroller,
                "modules" : app.modules,
                "innerboxes" : app.innerboxes,
                "viewport" : app.viewport,
                "layout" : {
                    "view": app.viewSize,
                    "design": app.designSize,
                    "snap": app.snapSize
                },
                "create" : function(isAutoLoadWidget){
                    app.init(isAutoLoadWidget);
                },
                "getCurrentIndex" : function(){
                    return app.currentIndex;
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
                "execLazyLoading" : function(index){
                    app.execLazyLoading(index);

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
                },
                "updateViewportMeta" : function(options){
                    app.updateViewportMeta(options);

                    return this;
                },
                "resize": function(){
                    app.resize();

                    return this;
                }
            }
        }
    };

    module.exports = _pub;
});

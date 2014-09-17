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
                        require("lib/extra/iscroll5/iscroll-probe");
                        require("mod/se/raf");
    var Listener      = require("mod/se/listener");
    var Util = $.Util = require("mod/se/util");
    var LA            = require("mod/sa/lightanimation");
    var ST            = require("mod/sa/scenetransitions");

    var iScroll = window.IScroll;

    var MODE = {
        "DRAWCARD": "drawcard",
        "SCREEN": "screen"
    };

    var SCROLL = {
        "VERTICAL": "vertical",
        "HORIZONTAL": "horizontal"
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
        this.viewport = null;
        this.mode = MODE.SCREEN;
        this.scroll = SCROLL.VERTICAL;
        this.device = {width:320, height:480, ratioWidth:"100%", ratioHeight:"100%"};
        this.fps = 0;
        this.snapSpeed = 400;
        this.sceneDeg = 28;
        this.sceneDuration = .28;
        this.scenePerspective = "300px";

        this.listener = new Listener({
            oninit : null,              //初始化时的回调{Function callback, Array args, Object context}
            onbefore : null,             //滑动前{Function callback, Array args, Object context}
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
        getCurrentModuleIndex : function(){
            var _ins = this;
            var currentPage = _ins.viewport.currentPage;
            var index = 0;

            if(currentPage){

                if(_ins.scroll == SCROLL.VERTICAL){
                    index = currentPage.pageY; 
                }else{
                    index = currentPage.pageX;
                }

            }

            return index;
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

            if("1" != setted){
                for(var i = 0, size = widgets.length; i < size; i++){
                    (function(widget){
                        widget.next();
                    })(widgets[i])
                }
                module.attr("data-setted", "1");
            }
        },
        initViewport : function(options){
            var _ins = this;
            var opt = {
                mouseWheel: true,
                scrollbars: false,
                probeType: 3,
                click: true,
                scrollX: (SCROLL.HORIZONTAL == _ins.scroll),
                scrollY: (SCROLL.VERTICAL == _ins.scroll)
            };

            _ins.viewport = new iScroll(this.view[0], $.extend(opt, options));
            console.info(_ins.viewport.options)
            //_ins.preventTouchMove();
            _ins.viewport.refresh();
        },
        createSingleScreenViewport : function(){
            var _ins = this;
            var _prepage = -1;

            _ins.initViewport({
                momentum: false,
                probeType: 1,
                snap: "section",
                snapSpeed: _ins.snapSpeed,
                mouseWheel: false
            });

            _ins.viewport.on("beforeScrollStart", function(){
                _ins.exec("before", [_ins.viewport, _ins.getCurrentModuleIndex()]);
            });
            _ins.viewport.on("scrollStart", function(){

                _ins.exec("start", [_ins.viewport, _ins.getCurrentModuleIndex()]);
            });
            _ins.viewport.on("scroll", function(){
                _ins.exec("scrolling", [_ins.viewport, _ins.getCurrentModuleIndex()]);
            });
            _ins.viewport.on("scrollEnd", function(){
                _ins.showModuleWidget(_ins.getCurrentModuleIndex());

                _ins.exec("end", [_ins.viewport, _ins.getCurrentModuleIndex()]);
            });
        },
        createDrawCardViewport : function(){
            var _ins = this;
            var _prepage = -1;

            var st = null;

            _ins.initViewport({
                momentum: false,
                probeType: 3,
                snap: "section",
                snapSpeed: _ins.snapSpeed,
                mouseWheel: false
            });

            st = ST.newInstance("section", TransitionEffect.ROTATE, _ins.scroll);
            st.setDeg(_ins.sceneDeg);
            st.setDuration(_ins.sceneDuration);
            st.setPerspective(_ins.scenePerspective);
            st.set("start", {
                callback: function(e, x, y, target, index){

                    this.exec("start", [this.viewport, index]);
                },
                context: _ins
            });
            st.set("drawing", {
                callback: function(e, x, y, target, index){
                    this.exec("scrolling", [this.viewport, index]);
                },
                context: _ins
            });
            st.set("complete", {
                callback: function(e, index){
                    _ins.showModuleWidget(index);
                    this.exec("end", [this.viewport, index]);
                },
                context: _ins
            });
        },
        createViewport : function(){
            var _ins = this;

            _ins.update();

            switch(_ins.mode){
                case MODE.DRAWCARD:
                    _ins.createDrawCardViewport();
                break;
                case MODE.SCREEN:
                    _ins.createSingleScreenViewport();
                break;
                default:
                    throw new Error("Unkonwn View Mode(" + _ins.mode + ")");
                break;
            }
        },
        resize : function(){
            var _ins = this;

            switch(_ins.mode){
                case MODE.DRAWCARD:
                case MODE.SCREEN:
                    _ins.update();
                break;
                default:
                    throw new Error("Unkonwn View Mode(" + _ins.mode + ")");
                break;
            }

            _ins.viewport.refresh();
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
            var sw = window.screen.width;
            var sh = window.screen.height;
            var ratioX = 1;
            var ratioY = 1;

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
        init : function(){
            var _ins = this;

            _ins.scroller = $(".webapp-modules");
            _ins.modules = $(".webapp-modules>section");
            _ins.innerboxes = $(".webapp-modules>section>.innerbox");
            _ins.mode = _ins.app.attr("data-mode") || MODE.SCREEN;
            _ins.scroll = _ins.app.attr("data-scroll") || SCROLL.VERTICAL;

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
                "viewport" : null,
                "mode" : MODE.SCREEN,
                "scroll" : SCROLL.VERTICAL,
                "create" : function(){
                    app.init();

                    this.viewport = app.viewport;
                    this.mode = app.mode;
                    this.scroll = app.scroll;

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
                "setSnapSpeed" : function(speed){
                    app.snapSpeed = speed;

                    return this;
                },
                "showModuleWidget" : function(index){
                    app.showModuleWidget(index);
                },
                "refresh" : function(){
                    this.viewport.refresh();
                },
                "scrollTo" : function(x, y, time, easing){
                    //easing: quadratic, circular, back, bounce, elastic
                    this.viewport.scrollTo(x, y, time, IScroll.utils.ease[easing]);
                },
                "scrollBy" : function (x, y, time, easing){
                    //easing: quadratic, circular, back, bounce, elastic
                    this.viewport.scrollBy(x, y, time, IScroll.utils.ease[easing]);
                },
                "scrollToElement" : function(el, time, offsetX, offsetY, easing){
                    //easing: quadratic, circular, back, bounce, elastic
                    this.viewport.scrollToElement(el, time, offsetX, offsetY, IScroll.utils.ease[easing]);
                },
                "goToPage" : function(x, y, time, easing){
                    //easing: quadratic, circular, back, bounce, elastic
                    this.viewport.goToPage(x, y, time, IScroll.utils.ease[easing]);
                },
                "next" : function(){
                    this.viewport.next();
                },
                "prev" : function(){
                    this.viewport.prev();
                },
                "setSceneDeg" : function(deg){
                    app.sceneDeg = deg;

                    return this;
                },
                "setSceneDuration" : function(duration){
                    app.sceneDuration = duration;

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

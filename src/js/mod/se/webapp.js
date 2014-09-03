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
                        require("lib/extra/iscroll5/iscroll");
                        require("mod/se/raf");
    var Listener      = require("mod/se/listener");
    var Util = $.Util = require("mod/se/util");
    var LA            = require("mod/sa/lightanimation");

    var iScroll = window.IScroll;

    var MODE = {
        "DRAWCARD": "drawcard",
        "WATERFALL": "waterfall"
    };

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

        this.appId = appId;
        this.viewId = viewId;
        this.headerId = headerId;
        this.footerId = footerId;
        this.app = oApp;
        this.view = oView;
        this.header = oHeader;
        this.footer = oFooter;
        this.modules = null;
        this.moduleSize = 0;
        this.widgets = {};
        this.viewport = null;
        this.mode = MODE.WATERFALL;
        this.scroll = SCROLL.VERTICAL;
        this.widgetMode = WIDGET_MODE.ONCE;
        this.fps = 0;
        this.moduleSnap = [];
        this.snapRangeOffset = 20;
        this.snapSpeed = 400;

        this.listener = new Listener({
            oninit : null,         //初始化时的回调{Function callback, Array args, Object context}
            onbefore : null,       //滑动前{Function callback, Array args, Object context}
            onbegin : null,        //滑动开始{Function callback, Array args, Object context}
            onend : null,          //滑动结束{Function callback, Array args, Object context}
            onwidget : null,       //widget完成{Function callback, Array args, Object context}
            onenterframe : null    //enterframe回调{Function callback, Array args, Object context}
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
        calcModulePanelOffset : function(){
            var mp = $(".webapp-modules");
            var mpo = mp.offset();

            mp.css({
                width: mpo.width + "px",
                height: mpo.height + "px"
            });

            mp.attr("data-x", mpo.left)
              .attr("data-y", mpo.top)
              .attr("data-width", mpo.width)
              .attr("data-height", mpo.height);
        },
        calcModuleOffset : function(){
            var _ins = this;
            var header = this.header ? this.header.offset() : {width:0, height:0};

            $.each(this.modules, function(index, module){
                var m = $(module);
                var offset = m.offset();

                m.attr("data-index", index)
                 .attr("data-x", offset.left)
                 .attr("data-y", offset.top)
                 .attr("data-width", offset.width)
                 .attr("data-height", offset.height);

                 _ins.moduleSnap.push({
                    index: index,
                    x: offset.left,
                    y: offset.top - header.height,
                    width: offset.width,
                    height: offset.height
                 });

                 _ins.queryModuleWidget(index, m);
            });
        },
        calcViewportOffset : function(){
            var w = window.innerWidth;
            var h = window.innerHeight;

            var header = this.header ? this.header.offset() : {width:0, height:0};
            var footer = this.footer ? this.footer.offset() : {width:0, height:0};

            h = h - header.height - footer.height;

            this.view.css({
                "width": w + "px",
                "height": h + "px"
            });
        },
        adjusted : function(){
            var w = window.innerWidth;
            var h = window.innerHeight;

            var header = this.header ? this.header.offset() : {width:0, height:0};
            var footer = this.footer ? this.footer.offset() : {width:0, height:0};

            h = h - header.height - footer.height;

            this.modules.css({
                "width": w + "px",
                "height": h + "px"
            });

            this.calcModuleOffset();
            this.calcModulePanelOffset();
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
        getModuleSnapRange : function(){
            var _ins = this;
            var vp = _ins.viewport;
            var x = Math.abs(vp.x);
            var y = Math.abs(vp.y);
            var snap = [];
            var ms = _ins.moduleSnap;
            var size = ms.length;
            var m = null;
            var view = _ins.view.offset();
            var ix = x + view.width;
            var iy = y + view.height;
            var offset = _ins.snapRangeOffset;

            //console.info("x: " + x + "; y: " + y + "; ix: " + ix + "; iy: " + iy);

            for(var i = 0; i < size; i++){
                m = ms[i];

                //console.info("m.x: " + m.x + "; m.y: " + m.y)

                if(_ins.scroll == SCROLL.VERTICAL){
                    if((m.y + offset) >= y && (m.y + offset) <= iy){
                        snap.push(m);
                    }
                }else{
                    if((m.x + offset) >= x && (m.x + offset) <= ix){
                        snap.push(m);
                    }
                }
            }

            return snap;
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
        displayViewportWidget : function(){
            var snaps = this.getModuleSnapRange();
            var size = snaps.length;

            for(var i = 0; i < size; i++){
                this.showModuleWidget(snaps[i].index);
            }
        },
        initViewport : function(options){
            var _ins = this;
            var opt = {
                mouseWheel: true,
                scrollbars: false,
                click: true,
                scrollX: (SCROLL.HORIZONTAL == _ins.scroll),
                scrollY: (SCROLL.VERTICAL == _ins.scroll)
            };

            _ins.viewport = new iScroll(this.view[0], $.extend(opt, options));
            _ins.preventTouchMove();
            _ins.viewport.refresh();
        },
        createWaterfallViewport : function(){
            var _ins = this;

            _ins.calcModuleOffset();
            _ins.calcModulePanelOffset();
            _ins.initViewport({});

            _ins.viewport.on("beforeScrollStart", function(){
                _ins.exec("before", [_ins.viewport]);
            });
            _ins.viewport.on("scrollStart", function(){
                _ins.exec("start", [_ins.viewport]);
            });
            _ins.viewport.on("scrollEnd", function(){
                _ins.displayViewportWidget();
                _ins.exec("end", [_ins.viewport]);
            });
        },
        createDrawCardViewport : function(){
            var _ins = this;
            var _prepage = -1;

            _ins.adjusted();
            _ins.initViewport({
                momentum: false,
                snap: "section",
                snapSpeed: _ins.snapSpeed,
                mouseWheel: false
            });

            _ins.viewport.on("beforeScrollStart", function(){
                _ins.exec("before", [_ins.viewport]);
            });
            _ins.viewport.on("scrollStart", function(){
                _ins.restoreModuleWidget(_ins.getCurrentModuleIndex());

                _ins.exec("start", [_ins.viewport]);
            });
            _ins.viewport.on("scroll", function(){
                _ins.exec("scroll", [_ins.viewport]);
            });
            _ins.viewport.on("scrollEnd", function(){
                _ins.showModuleWidget(_ins.getCurrentModuleIndex());

                _ins.exec("end", [_ins.viewport]);
            });
        },
        createViewport : function(){
            var _ins = this;

            _ins.calcViewportOffset();

            switch(_ins.mode){
                case MODE.WATERFALL:
                    _ins.createWaterfallViewport();
                break;
                case MODE.DRAWCARD:
                    _ins.createDrawCardViewport();
                break;
                default:
                    throw new Error("Unkonwn View Mode(" + _ins.mode + ")");
                break;
            }
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
        init : function(){
            var _ins = this;

            _ins.modules = $(".webapp-modules section");
            _ins.moduleSize = _ins.modules.length;
            _ins.mode = _ins.app.attr("data-mode") || MODE.WATERFALL;
            _ins.scroll = _ins.app.attr("data-scroll") || SCROLL.VERTICAL;
            _ins.widgetMode = _ins.app.attr("data-widget-mode") || WIDGET_MODE.ONCE;

            _ins.createViewport();
            _ins.enterframe();
        }
    };

    var _pub = {
        newInstance : function(appId, viewId, headerId, footerId){
            var app = new _WebApp(appId, viewId, headerId, footerId);

            return {
                "viewport" : null,
                "mode" : MODE.DRAWCARD,
                "scroll" : SCROLL.VERTICAL,
                "widgetMode" : WIDGET_MODE.ONCE,
                "create" : function(){
                    app.init();

                    this.viewport = app.viewport;
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
                "setSnapSpeed" : function(speed){
                    app.snapSpeed = speed;

                    return this;
                },
                "setSnapRangeOffset" : function(offset){
                    app.snapRangeOffset = offset;

                    return this;
                },
                "getCurrentModuleIndex" : function(){
                    return app.getCurrentModuleIndex();
                },
                "getModuleSnapRange" : function(){
                    return app.getModuleSnapRange();
                },
                "displayViewportWidget" : function(){
                    app.displayViewportWidget();
                },
                "showModuleWidget" : function(index){
                    app.showModuleWidget(index);
                },
                "restoreModuleWidget" : function(index){
                    app.restoreModuleWidget(index);
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
                }
            }
        }
    };

    module.exports = _pub;
});

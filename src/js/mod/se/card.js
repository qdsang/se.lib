/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 卡片模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Card(require, exports, module){
                        require("mod/zepto/touch");               
                        require("mod/zepto/fx");
    var Util = $.Util = require("mod/se/util");
    
    //卡片默认宽度   
    var _width = window.innerWidth;
    //卡片默认高度
    var _height = window.innerHeight;
    //卡片内部默认宽度
    var _innerWidth = _width;
    //卡片内部默认高度
    var _innerHeight = _height;
    //卡片内部默认最大宽度
    var _maxInnerWidth = _width;
    //卡片内部默认最大高度
    var _maxInnerHeight = _height;
    //卡片内部默认最小宽度
    var _minInnerWidth = _width;
    //卡片内部默认最小高度
    var _minInnerHeight = _height;

    //卡片HTML结构
    var _html = '<div id="card_${index}" class="card js-card" data-index="${index}" style="width:${width}px; height:${height}px;$!{styles}">'
              + '<div id="card_inner_${index}" class="card-inner js-card-inner" data-index="${index}" style="$!{innerStyles}">'
              + '<!-- dynamic html(${index}) -->'
              + '$!{content}'
              + '$!{widgets}'
              + '</div>'
              + '</div>';
    //卡片小部件模板结构          
    var _widget = '<script name="widget_${cardIndex}" type="text/template">'
                + '<div id="widget_${cardIndex}_${index}" class="card-widget" data-widget="${index}">'
                + '$!{html}'
                + '</div>'
                + '</script>';

    var _Card = {
        //唯一ID
        uniqueId : null,
        //舞台
        stage : null,
        //面板
        panel : null,
        //配置参数
        options : null,
        //卡片集大小
        size : 0,
        //卡片索引（内部计算用）
        index : 0,
        //当前索引 （内部计算用） 
        currentIndex : 0,
        //卡片索引（外部引用）
        cardIndex : 0,
        //是否循环
        loop : true,
        //是否在滚动中
        scrolling : false,
        //是否向下划动
        next : true,  
        // 当前位置
        where : -1, // -1,0,1 开始，中间，结束
        //卡片布局方向， 0：垂直 1：水平 
        dir : 0,     
        /**
         * 设置当前索引
         * @param int index 索引
         */
        setCurrentIndex : function(index){            
            this.where = 0;

            if(index >= this.size){
                index = this.size - 1;
                this.where = 1;
            }else if(index <= 0){
                index = 0;
                this.where = -1;
            }

            this.currentIndex = index;
        },
        /**
         * 获取当前索引
         * @param int index 索引
         */
        getCurrentIndex : function(){
            return this.currentIndex;
        },
        /**
         * 获取小部件列表
         * @param int int 卡片索引
         * @param Object card 卡片配置项
         * @return Array widges 小部件列表
         */
        getWidges : function(index, card){
            var tmp = [];
            var widgets = card.widgets || [];
            var len = widgets.length;
            var widget = null;

            for(var i = 0; i < len; i++){
                widget = widgets[i];

                tmp.push(Util.formatData(_widget, {
                    "cardIndex": index,
                    "index": i,
                    "html": widget.html || ""
                }));
            }

            return tmp.join("");
        },
        /**
         * 获取卡片样式
         * @param Object card 卡片配置项
         * @return String css 样式 
         */
        getStyles : function(card){
            var css = card.css || {};
            var tmp = [];

            for(var key in css){
                if(css.hasOwnProperty(key)){
                    tmp.push(key + ":" + css[key]);
                }
            }

            return tmp.join("; ");
        },
        setSize : function(width, height){
            _width = width;
            _height = height;
        },
        /**
         * 设置卡片内部尺寸
         * @param Number width 宽度 
         * @param Number height 高度
         */
        setInnerSize : function(width, height){
            _innerWidth = width;
            _innerHeight = height;
        },
        /**
         * 设置卡片内部最大尺寸
         * @param Number width 宽度 
         * @param Number height 高度
         */
        setMaxInnerSize : function(width, height){
            _maxInnerWidth = width;
            _maxInnerHeight = height;
        },
        /**
         * 设置卡片内部最小尺寸
         * @param Number width 宽度 
         * @param Number height 高度
         */
        setMinInnerSize : function(width, height){
            _minInnerWidth = width;
            _minInnerHeight = height;
        },
        /**
         * 获取卡片内部样式
         * @return String css 样式
         */
        getInnerStyles : function(){
            var css = {
                "width" : _innerWidth,
                "height" : _innerHeight,
                "max-width" : _maxInnerWidth,
                "max-height" : _maxInnerHeight,
                "min-width" : _minInnerWidth,
                "min-height" : _minInnerHeight
            };
            var tmp = [];
            
            for(var key in css){
                if(css.hasOwnProperty(key)){
                    tmp.push(key + ":" + css[key] + "px");
                }
            }

            return tmp.join("; ");
        },
        /**
         * 创建一个新的卡片结构
         * @param int index 卡片索引
         * @param Object card 卡片配置
         * @return String cardStruct 卡片结构
         */
        newCard : function(index, card){
            var _widgets = this.getWidges(index, card);
            var _styles = this.getStyles(card);
            var _inner = this.getInnerStyles();

            var cardStruct = Util.formatData(_html, {
                "index": index,
                "width": _width,
                "height": _height,
                "styles": _styles,
                "innerStyles": _inner,
                "content": card.content || "",
                "widgets":_widgets
            });

            return cardStruct;
        },
        /**
         * 获取小部件
         * @param int cardIndex 卡片索引
         * @param int widgetIndex  小部件索引
         * @return Object widget 小部件配置
         */
        getWidget : function(cardIndex, widgetIndex){
            var card = this.options[cardIndex] || {};
            var widgets = card.widgets || [];
            var widget = widgets[widgetIndex] || {};
            
            return widget;
        },
        /**
         * 获取小部件属性
         * @param int cardIndex 卡片索引
         * @param int widgetIndex 小部件索引
         * @param String propName 属性名称
         * @return * prop 属性
         */
        getWidgetProperty : function(cardIndex, widgetIndex, propName){
            var widget = this.getWidget(cardIndex, widgetIndex);
            var prop = widget[propName] || null;
            
            return prop;
        },
        /**
         * 获取小部件动画属性
         * @param int cardIndex 卡片索引
         * @param int widgetIndex 小部件索引
         * @return Array animate
         */
        getWidgetAnimate : function(cardIndex, widgetIndex){
            return this.getWidgetProperty(cardIndex, widgetIndex, "animate");
        },
        /**
         * 获取小部件样式属性
         * @param int cardIndex 卡片索引
         * @param int widgetIndex 小部件索引
         * @return Object sytles
         */
        getWidgetStyles : function(cardIndex, widgetIndex){
            return this.getWidgetProperty(cardIndex, widgetIndex, "styles");
        },
        /**
         * 获取小部件延时属性
         * @param int cardIndex 卡片索引
         * @param int widgetIndex 小部件索引
         * @return Object delay
         */
        getWidgetDelay: function(cardIndex, widgetIndex){
            return this.getWidgetProperty(cardIndex, widgetIndex, "delay");
        },
        /**
         * 显示小部件
         * @param int cardIndex 卡片索引
         * @param boolean once 是否只有第一次调用动画
         */
        showWidget : function(cardIndex, once){
            var tpls = $('script[name="widget_' + cardIndex + '"]');
            var size = tpls.length;
            var card = $("#card_inner_" + cardIndex);
            var tmp = [];
            var widget = null;
            var ani = null;
            var styles = null;
            var delay = null;
            var style = null;

            if(size > 0){
                
                if(false === once){
                    card.find(".card-widget").remove();
                    card.data("widget", 0);
                    card.data("set", 0);
                }
                
                if("1" != card.data("widget")){
                    for(var i = 0; i < size; i++){
                        tmp.push(tpls[i].innerHTML);
                    }
                    card.append(tmp.join(""));
                    
                    card.data("widget", 1);
                }
                
                if("1" != card.data("set")){                
                    for(var j = 0; j < size; j++){
                        widget = $("#widget_" + cardIndex + "_" + j);
                        
                        delay = _Card.getWidgetDelay(cardIndex, j);
                        styles = _Card.getWidgetStyles(cardIndex, j);
                        ani = _Card.getWidgetAnimate(cardIndex, j);
                        
                        if(delay){
                            Util.execAfterMergerHandler(delay.handler, [widget]);
                        }
                        
                        if(styles && styles instanceof Object){
                            for(var key in styles){
                                if(styles.hasOwnProperty(key)){
                                    style = styles[key];
                                    
                                    if("className" == key){
                                        widget.addClass(style);
                                    }else if("hash" == key){
                                        widget.css(style);
                                    }else{
                                        widget.css(key, style);
                                    }
                                }
                            }
                        }
                        
                        if(ani && ani instanceof Array){
                            widget.animate.apply(widget, ani);                            
                        }
                    }
                    
                    card.data("set", 1);
                }

            }
        },
        /**
         * 配置卡片
         * @param Object options 配置项 @see opt
         * @param boolean loop 是否循环
         * @param String frame 卡片框架（selector）
         */        
        configure : function(options, loop, frame){
            var opts = options || [];
            var opt = {
                //样式
                "css": {
                    "background":"",
                },
                //内容
                "content":"",
                //小部件集合
                "widgets":[
                    {
                        //小部件内容
                        "html":"",
                        //样式集
                        "styles":{},
                        //延时配置
                        "delay":{
                            "time":0,
                            "handler":null
                        },
                        //动画配置
                        "animate":[]
                    }
                ]
            };
            
            if(true === loop){
                opts.push(opts[0]);
            }
            
            var size = opts.length;
            
            this.index = 0;
            this.currentIndex = 0;
            this.options = opts;
            this.size = size;
            this.loop = loop;
            this.next = true;
            this.frame = frame || "body";
        },
        /**
         * 定位到指定的卡片
         * @param int index 需要定位到的卡片索引
         * @param Number duration 动画持续时长
         * @param Object fnCompleteHandler 动画完成回调句柄
         */
        position : function(index, duration, fnCompleteHandler){
            var dir = this.dir;
            var margin = "margin-" + (0 === dir ? "top" : "left");
            var size = (0 === dir ? _height : _width);
            var opt = {};
            var handler = this.complete(fnCompleteHandler);
            var args = handler.args;

            this.setCurrentIndex(index);
            this.next = true;
            this.scrolling = true;

            handler.args = [];
            opt[margin] = (-size * _Card.getCurrentIndex()) + "px";

            this.panel.animate(opt, duration || "fast", "ease-in", function(){
                //console.info("swipeUp end");
                var index = _Card.getCurrentIndex();
                
                handler.args = [];
                Util.execAfterMergerHandler(handler, [index].concat(args)); 
                
                index = _Card.getCurrentIndex();
                _Card.setCurrentIndex(++index);
                
                _Card.scrolling = false;
            });
        },
        /**
         * 视图尺寸改变时回调
         * @param Object handler 回调句柄
         */
        resize : function(handler){
            //console.info("resize before: " + _height);
            $(window).on("resize", function(e){
                // _public.width = _width = window.innerWidth;
                // _public.height = _height = window.innerHeight;
                //console.info("resize end: " + _height);
                Util.execHandler(handler);
            });
        },
        /**
         * 销毁卡片
         */
        destroy : function(){
            this.stage.remove();
        },
        /**
         * 输出卡片结构
         * @param String id 唯一ID
         * @param int dir 卡片布局方向
         * @param int limit 一次显示卡片数
         */
        trace : function(id, dir, limit){
            this.dir = dir = (dir || this.dir);

            var _w = (0 === dir ? _width : (_width * this.size));
            var _h = (0 === dir ? (_height * this.size) : _height);            
            var tmp = [];         

            limit = (this.index + limit) || this.size;

            if(this.cardIndex >= limit){
                limit = this.cardIndex + 1;
            }

            if($("#" + id + "_stage").length == 0){
                 $(this.frame).append(''
                    + '<div id="' + id + '_stage" class="card-stage" style="width:' + _width + 'px; height:' + _height + 'px;">'
                    + '  <div id="' + id + '" class="card-container" style="width:' + _w + 'px; height:' + _h + 'px;">'
                    + '  </div>'
                    + '</div>'
                );
            }

            for(var i = this.index; i < this.size && i < limit; i++){
                this.index = i + 1;

                tmp.push(this.newCard(i, this.options[i]));
            }

            this.uniqueId = id;
            this.stage = $("#" + id + "_stage");
            this.panel = $("#" + id);
            this.panel.append(tmp.join(""));            

        },
        /**
         * 置顶
         */
        zero : function(){
            var dir = (0 === this.dir ? "top" : "left");
            this.setCurrentIndex(0);
            this.next = true;

            this.panel.css("margin-" + dir, "0px");
        },
        /**
         * 完成回调
         * @param Object handler 回调
         */
        complete : function(handler){
            var h = handler || {};
            var callback = h.callback || null;
            var context = h.context || null;
            var size = this.size;
            var loop = this.loop;

            h.callback = function(){
                var _args = arguments;
                var i = _args[0];

                callback.apply(context, _args);
                
                if(i >= size - 1 && true === loop){
                    _Card.zero();
                }
            }
            return h;
        },
        /**
         * 重做
         * @param Booelan next 是否向下
         */
        undo : function(next){
            var index = this.getCurrentIndex();
            console.info("undo: " + index + "; " + next + "; " + this.where)
            
            if(true === next){ //up or left
                if(this.next != next){ //switch
                    this.setCurrentIndex(++index);  
                    console.info("up/undo: " + this.getCurrentIndex())
                }else{
                    if(0 === index){
                        this.setCurrentIndex(++index); 
                    }
                }
            }else{
                if(this.next != next){
                    this.setCurrentIndex((1 === this.where) ? --index : index - 2);
                    console.info("down/undo: " + this.getCurrentIndex())
                }
            }
            
            this.next = next;
        },
        /**
         * 获取划动偏移值
         * @return Number offset 偏移值
         */
        getSwipeOffset : function(){
            return (0 === this.dir ? _height : _width);
        },
        /**
         * 向前走
         * @param Nubmer duration 持续时长
         * @param Object handler 完成时的回调句柄
         * @param Array args 参数
         */
        swipeForward : function(duration, handler, args){
            var dir = this.dir;
            var margin = "margin-" + (0 === dir ? "top" : "left");
            var fn = "swipe" + (0 === dir ? "Up" : "Left");

            $(document)[fn](function(){
                console.info("forward start");
                _Card.undo(true);

                if(false === _Card.scrolling){
                    _Card.scrolling = true;
                    var cardIndex = _Card.cardIndex = _Card.getCurrentIndex();
                    var size = _Card.getSwipeOffset();
                    var opt = {};

                    opt[margin] = (-size * cardIndex) + "px";

                    _Card.panel.animate(opt, duration || "fast", "ease-in", function(){
                        console.info("forward end");
                        var index = cardIndex;
                        
                        handler.args = [];
                        Util.execAfterMergerHandler(handler, [index].concat(args));
                        
                        index = _Card.getCurrentIndex();
                        _Card.setCurrentIndex(++index);
                        
                        _Card.scrolling = false;
                    });
                }
            });
        },
        /**
         * 向后走
         * @param Nubmer duration 持续时长
         * @param Object handler 完成时的回调句柄
         * @param Array args 参数
         */
        swipeBack : function(duration, handler, args){
            var dir = this.dir;
            var margin = "margin-" + (0 === dir ? "top" : "left");
            var fn = "swipe" + (0 === dir ? "Down" : "Right");

            $(document)[fn](function(){
                console.info("back start");
                _Card.undo(false);
                if(false === _Card.scrolling){
                    _Card.scrolling = true;
                    var cardIndex = _Card.cardIndex = _Card.getCurrentIndex();
                    var size = _Card.getSwipeOffset();
                    var opt = {};

                    opt[margin] = (-size * cardIndex) + "px";

                    _Card.panel.animate(opt, duration || "fast", "ease-in", function(){
                        console.info("back end");
                        var index = cardIndex;
                        
                        handler.args = [];
                        Util.execAfterMergerHandler(handler, [index].concat(args));
                        
                        index = _Card.getCurrentIndex();
                        _Card.setCurrentIndex(--index);
                        
                        _Card.scrolling = false;
                    });
                }
            });
        },
        /**
         * 划动
         * @param Nubmer duration 持续时长
         * @param Object fnCompleteHandler 完成时的回调句柄
         * @param int dir 方向
         */
        swipe : function(duration, fnCompleteHandler, dir){
            var handler = this.complete(fnCompleteHandler);
            var args = handler.args;
            
            handler.args = [];
            
            $(document).on("touchmove", function(e){e.preventDefault();});

            this.dir = dir = (dir || this.dir);

            this.swipeForward(duration, handler, args);
            this.swipeBack(duration, handler, args);
        }
    };

    var _public = {
        "width" : _width,
        "height" : _height,
        "size" : _Card.size,
        "getCardIndex" : function(){
            return _Card.cardIndex;
        },
        "isForward" : function(){
            return _Card.next;
        },
        "configure" : function(options, loop, maxWidth, maxHeight){
            _Card.configure(options, !!loop, maxWidth || _width, maxHeight || _height);
            this.size = _Card.size;
            
            return this;
        },
        "trace" : function(id, dir, limit){
            _Card.trace(id, dir, limit);

            return this;
        },
        "swipe" : function(duration, fnComplete, dir){
            _Card.swipe(duration, fnComplete, dir || 0);

            return this;
        },
        "position" : function(index, duration, fnComplete){
            _Card.position(index, duration, fnComplete);
            return this;
        },
        "showWidget" : function(cardIndex, once){
            _Card.showWidget(cardIndex, !!once);

            return this;
        },
        "setSize" : function(width, height){
            this.width = width;
            this.height = height;

            _Card.setSize(width, height);

            return this;
        },
        "setInnerSize" : function(width, height){
            _Card.setInnerSize(width, height);
            
            return this;
        },
        "setMaxInnerSize" : function(width, height){
            _Card.setMaxInnerSize(width, height);
            
            return this;
        },
        "setMinInnerSize" : function(width, height){
            _Card.setMinInnerSize(width, height);
            
            return this;
        },
        "resize" : function(handler){
            _Card.resize(handler);

            return this;
        },
        "destroy" : function(){
            _Card.destroy();

            return this;
        }
    }

    module.exports = _public;
});
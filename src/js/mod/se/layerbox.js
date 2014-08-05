/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 弹层模块
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function LayerBox(require, exports, module){
    var Util = $.Util = require("mod/se/util");

    //选择器
    var _selector = ".js-layerbox";
    //HTML结构
    var _html = '' +
        '<div class="flexbox center middle layerbox-stage hide ' + _selector.substr(1) + '">' +
        '  <figure class="box layerbox-panel">' +
        '    <!-- dynamic html -->' +
        '  </figure>' +
        '  <div class="layerbox-mask"></div>' +
        '</div>';
    //动态结构    
    var _dynamic = '' +
        '    <figcaption class="flexbox center middle layerbox-title">$!{title}</figcaption>' +
        '    <div class="flexbox middle layerbox-content">$!{content}</div>' +
        '    <div class="center middle layerbox-buttons">$!{button}</div>';

    //显示时的回调
    var _showHandler = null;
    //隐藏时的回调
    var _hideHandler = null; 

    var _LayerBox = {         
        /**
         * 插入数据
         * @param Object cfg ｛配置项
         *     String title 标题         
         *     String content 内容
         *     Array btns 按钮集
         * ｝
         */      
        insertData : function(cfg){
            var panel = $(_selector + " .layerbox-panel");

            if(panel.length > 0){
                var sBtn = '<button type="button" data-index="${index}">${label}</button>';
                var btns = cfg.btns || [{label:"确定", callback:function(){
                    this.hide();
                }, args:[], context:this}];
                var size = btns.length;

                var tmp = "";
                for(var i = 0; i < size; i++){
                    btns[i].index = i;
                    tmp += Util.formatData(sBtn, btns[i]);
                }

                cfg.title = cfg.title || "提示";
                cfg.button = tmp;

                panel.html(Util.formatData(_dynamic, cfg));

                for(var j = 0; j < size; j++){
                    this.bindButtonEvent($('button[data-index="' + j + '"]'), {
                        callback : btns[j].callback || null,
                        args : btns[j].args || [],
                        context : btns[j].context || this
                    });
                }
            }
        },
        /**
         * 绑定按钮事件 
         * @param Object btn 按钮
         * @param Object handler 事件回调
         */
        bindButtonEvent : function(btn, handler){
            btn.on(Util.CLICK_EVENT, function(e){
                e.preventDefault();
                e.stopPropagation();

                var cb = handler.callback;

                var isSetted = !!cb;

                handler.callback = isSetted ? cb : function(){
                    _LayerBox.hide();
                }

                Util.execHandler(handler);
            });
        },
        /**
         * 设置数据
         * @param Object cfg 配置
         */
        data : function(cfg){
            this.insertData(cfg);
        },
        /**
         * 设置显示和隐藏回调
         * @param Object options {Object show, Object hide}
         */
        callback : function(options){
            options = options || {};
            
            _showHandler = options.show || null;
            _hideHandler = options.hide || null;
        },
        /**
         * 设置是否显示
         * @param Boolean visible 是否显示
         */
        visible : function(visible){
            var o = $(_selector);

            if(o.length > 0){
                if(true === visible){
                    o.removeClass("hide");
                    Util.execHandler(_showHandler);
                }else{
                    o.addClass("hide");
                    Util.execHandler(_hideHandler);
                }
            }
        },
        /**
         * 显示弹层
         */
        show : function(){
            this.visible(true);
        },
        /**
         * 隐藏弹层
         */
        hide : function(){
            this.visible(false);
        }
    };

    //--------------------------------------------------------------------------
    $(function InsertStage(e){
        var stage = $(_selector);

        if(stage.length == 0){
            $("body").append(_html);
        }

        stage = null;

        setTimeout(function(){
            var mask = $(_selector + " .layerbox-mask");

            if(mask.length > 0){
                mask.on(Util.CLICK_EVENT, function(e){
                    e.preventDefault();
                    e.stopPropagation();

                    _LayerBox.hide();
                });
            }
        }, 0);
    });

    var _public = { 
        //蒙版关闭，默认点击关闭
        maskclose : true,    
        /**
         * 设置box的数据
         * @param Object cfg {String title, String content, Array btns[{String label, Function callback, Array args, Object context}]}
         */
        data : function(cfg){
            _LayerBox.data(cfg);

            return this;
        },
        callback : function(options){
            _LayerBox.callback(options);

            return this;
        },
        show : function(){
            _LayerBox.show();

            return this;
        },
        hide : function(){
            if(true === _public.maskclose){
                _LayerBox.hide();
            }

            return this;
        }
    };

    module.exports = _public;
});
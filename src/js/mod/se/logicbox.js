/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 逻辑弹层模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function LogicBox(require, exports, module){
    var Util = $.Util = require("mod/se/util");

    //选择器
    var _selector = ".js-logicbox";
    //缓存
    var _memcache = {};

    //HTML结构
    var _html = '' +
        '<div class="flexbox center middle logicbox-stage hide ' + _selector.substr(1) + '">' +
        '  <figure class="box logicbox-panel">' +
        '    <!-- dynamic html -->' +
        '  </figure>' +
        '  <div class="logicbox-mask"></div>' +
        '</div>';

    //显示回调
    var _showHandler = null;
    //隐藏回调
    var _hideHandler = null;    

    var _LogicBox = {
        //蒙版关闭，默认点击关闭
        maskclose : true,
        /**
         * 模板
         * @param String name LogicBox名称
         * @param String selector 模板选择器
         * @return String tpl 模板数据
         */
        tpl : function(name, selector){
            var _tpl = _memcache[name];

            if(!!!_tpl){
                _tpl = $(selector).html();

                _memcache[name] = _tpl;
            }

            return _tpl;
        },
        /**
         * 设置大小
         * @param Object cssOptions css对象
         * @return Object this
         */
        size : function(cssOptions){
            var panel = $(_selector + " .logicbox-panel");

            if(panel.length > 0){
                panel.css(cssOptions);
            }
            return this;
        },
        /**
         * 设置内容
         * @param String str 内容
         * @return Object this
         */
        text : function(str){
            var panel = $(_selector + " .logicbox-panel");

            if(panel.length > 0){
                panel.html(str);
            }
            return this;
        },
        /**
         * 设置显示和隐藏回调
         * @param Object options {Object show, Object hide} 配置
         * @return Object this
         */
        callback : function(options){
            options = options || {};
            
            _showHandler = options.show || null;
            _hideHandler = options.hide || null;

            return this;
        },
        /**
         * 显示或隐藏 
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
         * 显示
         */
        show : function(){
            this.visible(true);
        },
        /**
         * 隐藏
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
            var mask = $(_selector + " .logicbox-mask");

            if(mask.length > 0){
                mask.on(Util.CLICK_EVENT, function(e){
                    e.preventDefault();
                    e.stopPropagation();

                    if(true === _LogicBox.maskclose){
                        _LogicBox.hide();
                    }
                });
            }
        }, 0);
    });

    module.exports = _LogicBox;
});
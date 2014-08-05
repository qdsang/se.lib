/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * Loading模块
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function Loading(require, exports, module){
    //选择器
    var _selector = ".js-loading";
    //HTML结构
    var _html = '' + 
        '<div class="flexbox center middle loading-stage hide ' + _selector.substr(1) + '">' + 
        '  <figure class="box loading-panel">' + 
        '    <figcaption class="flexbox center middle loading-ani">' + 
        '      <div></div>' + 
        '      <div></div>' + 
        '      <div></div>' + 
        '      <div></div>' + 
        '    </figcaption>' + 
        '    <div class="loading-text"></div>' + 
        '  </figure>' + 
        '  <div class="loading-mask"></div>' + 
        '</div>';

    //统计
    var _count = 0;

    var _Loading = {
        /**
         * 插入数据
         * @param String loadingText 加载文字
         */
        insertData : function(loadingText){
            var text = $(_selector + " .loading-text");

            if(text.length > 0){
                text.html(loadingText);
            }
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
                    _count++;
                }else{
                    --_count;

                    if(_count <= 0){
                        o.addClass("hide");
                    }
                }
            }
        },
        /**
         * 显示
         * @param String loadingText 加载文字
         */
        show : function(loadingText){            
            this.insertData(loadingText);
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
    });

    module.exports = {
        show : function(loadingText){_Loading.show(loadingText);},
        hide : function(){_Loading.hide();}
    };    
});
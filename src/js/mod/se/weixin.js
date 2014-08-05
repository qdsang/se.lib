/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function Weixin(require, exports, module){
    $.Util = require("mod/se/util");
    document.addEventListener("WeixinJSBridgeReady", function(){
        window.G_WEIXIN_READY = true;
    }, false);
    function CallWeiXinAPI(fn, count){
        var total = 2000;   //30s     
        count = count || 0;
        
        if(true === window.G_WEIXIN_READY || ("WeixinJSBridge" in window)){
            fn.apply(null, []);
        }else{
            if(count <= total){
                setTimeout(function(){
                    CallWeiXinAPI(fn, count++);
                }, 15);
            }
        }
    }

    var _api = {
        Share : {
            /**
             * 分享到微博
             * @param Object options {String content, String url}
             * @param Object handler
             */
            "weibo" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:weibo",function(argv){
                        WeixinJSBridge.invoke('shareWeibo', options, function(res){
                            $.Util.execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            },
            /**
             * 分享到微博
             * @param Object options {
             *                  String img_url, 
             *                  Number img_width, 
             *                  Number img_height, 
             *                  String link, 
             *                  String desc, 
             *                  String title
             * }
             * @param Object handler
             */
            "timeline" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:timeline",function(argv){
                        WeixinJSBridge.invoke('shareTimeline', options, function(res){
                            $.Util.execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            },
            /**
             * 分享到微博
             * @param Object options {
             *                  String appid, 
             *                  String img_url, 
             *                  Number img_width, 
             *                  Number img_height, 
             *                  String link, 
             *                  String desc, 
             *                  String title
             * }
             * @param Object handler
             */
            "message" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:appmessage",function(argv){
                        WeixinJSBridge.invoke('sendAppMessage', options, function(res){
                            $.Util.execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            }
        },
        /**
         * 设置底栏
         * @param boolean visible 是否显示
         * @param Object handler
         */
        "setToolbar" : function(visible, handler){
            CallWeiXinAPI(function(){
                if(true === visible){
                    WeixinJSBridge.call('showToolbar');
                }else{
                    WeixinJSBridge.call('hideToolbar');
                }
                $.Util.execAfterMergerHandler(handler, [visible]);
            });
        },
        /**
         * 设置右上角选项菜单
         * @param boolean visible 是否显示
         * @param Object handler
         */
        "setOptionMenu" : function(visible, handler){
            CallWeiXinAPI(function(){
                if(true === visible){
                    WeixinJSBridge.call('showOptionMenu');
                }else{
                    WeixinJSBridge.call('hideOptionMenu');
                }
                $.Util.execAfterMergerHandler(handler, [visible]);
            });
        },
        /**
         * 调用微信支付
         * @param Object data 微信支付参数 @see requireData
         * @param Object handlerMap 回调句柄 {Handler success, Handler fail, Handler cancel, Handler error}
         */
        "pay" : function(data, handlerMap){
            CallWeiXinAPI(function(){
                var requireData = {"appId":"","timeStamp":"","nonceStr":"","package":"","signType":"","paySign":""};
                var map = handlerMap || {};                
                var args = [data];

                for(var key in requireData){
                    if(requireData.hasOwnProperty(key)){
                        requireData[key] = data[key]||"";
                    }
                }

                WeixinJSBridge.invoke('getBrandWCPayRequest', requireData, function(response){
                    var key = "get_brand_wcpay_request:";
                    var handler = null;
                    var msg = response.err_msg;

                    switch(msg){
                        case key + "ok":
                            handler = map.success;
                            break;
                        case key + "fail":
                            handler = map.fail || map.error;
                            break;
                        case key + "cancel":
                            handler = map.cancel || map.error;
                            break;
                        default:
                            handler = map.error;
                            break;
                    }

                    $.Util.execAfterMergerHandler(handler, [msg].concat(args));
                });
            });                
        },
        /**
         * 获取收获地址
         * @param Object options 配置参数 {
         *      String appId  公众号 appID
         *      String scope  调用该 jsapi 所需的权限 scope(jsapi_address)
         *      String signType  签名方式，目前仅支持 SHA1
         *      String addrSign  签名
         *      String timeStamp  时间戳
         *      String nonceStr  随机字符串
         *      Object success {Function callback, Array args, Object context} 成功回调
         *      Object error {Function callback, Array args, Object context}  失败回调
         * }
         */
        "address" : function(options){
            CallWeiXinAPI(function(){
                var requireData = {
                    "appId" : options["appId"],
                    "scope" : options["scope"] || "jsapi_address",
                    "signType" : options["signType"] || "sha1",
                    "addrSign" : options["addrSign"],
                    "timeStamp" : options["timeStamp"],
                    "nonceStr" : options["nonceStr"]
                };           

                WeixinJSBridge.invoke('editAddress', requireData, function(response){
                    var key = "edit_address:";
                    var data = null;
                    var handler = null;   
                    var msg = response.err_msg;

                    switch(msg){
                        case key + "ok":
                            handler = options.success;
                            data = {
                                "userName" : response.userName, //收货人姓名
                                "telNumber" : response.telNumber, //收货人电话
                                "addressPostalCode" : response.addressPostalCode, //邮编
                                "proviceFirstStageName" : response.proviceFirstStageName, //国标收货地址第一级地址
                                "addressCitySecondStageName" : response.addressCitySecondStageName, //国标收货地址第二级地址
                                "addressCountiesThirdStageName" : response.addressCountiesThirdStageName, //国标收货地址第三级地址
                                "addressDetailInfo" : response.addressDetailInfo, //详细收货地址信息
                                "nationalCode" : response.nationalCode //收货地址国家码
                            };
                            break;
                        default:
                            handler = options.error;
                            break;
                    }

                    $.Util.execAfterMergerHandler(handler, [msg, data]);
                });
            });
        }
    };

    module.exports = _api;
});
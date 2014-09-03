/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 微信模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
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
             * @param Object options {
             *    String content,  分享到微薄的内容
             *    String url,  分享连接地址
             *    String type  music,vido或link，不填默认为link
             *  }  
             * @param Object handler
             */
            "weibo" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:weibo",function(argv){
                        WeixinJSBridge.invoke('shareWeibo', options, function(res){
                            // share_weibo:cancel  用户取消
                            // share_weibo:no_weibo   用户未开通微博
                            // share_weibo:not_bind_qq  用户未绑定QQ
                            // share_weibo:fail_<失败错误码>  发送失败 + 失败错误码
                            $.Util.execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            },
            /**
             * 分享到微博
             * @param Object options {
             *                  String appid,    非必填，公众号appID
             *                  String img_url,   非必填，图文消息图片的URL，如果没有设置，则默认抓取页面上第一个img元素
             *                  Number img_width,   非必填，图片的宽度，微信客户端将此参数告诉接收方，用于一些展示相关的操作，所以建议填入图片真实宽度
             *                  Number img_height,   非必填，同上，这是图片高度
             *                  String type,  非必填，music,vido或link，不填默认为link
             *                  String data_url,  非必填，数据连接地址,如音乐的mp3数据地址,供内置播放器使用   
             *                  String link,  图文消息的链接
             *                  String desc,   图文消息的描述（显示不出来）
             *                  String title  图文消息的标题
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
             *                  String appid,   非必填，公众号appID，如非特殊授权过，一般不要加，否则会出现应用未授权
             *                  String img_url,   非必填，图文消息图片的地址
             *                  Number img_width,   非必填，图片的宽度，微信客户端将此参数告诉接收方，用于一些展示相关的操作，所以建议填入图片真实宽度
             *                  Number img_height,   非必填，同上，这是图片高度
             *                  String type,  非必填，music,vido或link，不填默认为link
             *                  String data_url,  非必填，数据连接地址,如音乐的mp3数据地址,供内置播放器使用
             *                  String link,  图文消息的链接
             *                  String desc,  图文消息的描述
             *                  String title  图文消息的标题
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
         * 关闭微信Webview窗口
         */
        "close" : function(){
            CallWeiXinAPI(function(){
                WeixinJSBridge.invoke("closeWindow");
            });
        },
        /**
         * 调用微信的二维码扫描
         */
        "scanQRCode" : function(){
            CallWeiXinAPI(function(){
                WeixinJSBridge.invoke("scanQRCode");
            });
        },
        /**
         * 打开微信特定的APP页面
         * @param String view  界面
         * @param Object handler
         */
        "open" : function(view, handler){
            //view:
            // discover：“发现”页 
            // timeline：“朋友圈”页 
            // scan：“扫一扫”页 
            // me：“我”页 
            // myprofile："个人信息"页 
            // myaccount：“我的账号”页 
            // bindphone：“手机通讯录匹配”页 
            // privacy：“隐私”页 
            // general：“通用”页

            // Android另有：
            // contacts：“通讯录”页
            // addfriend：“添加朋友”页
            // newfriend：“新的朋友”页
            // searchbrand：“搜索公众号”页

            CallWeiXinAPI(function(){
                WeixinJSBridge.invoke("openSpecificView",{
                    "specificview": view
                },function(res){
                    $.Util.execAfterMergerHandler(handler, [res]);
                });
            });
        },
        /**
         * 打开微信特定的APP页面
         * @param Object options{
         *      String current,  当前图片 地址
         *      Array urls  所有图片列表  
         *  }
         * @param Object handler
         */
        "previewImage" : function(options, handler){
            CallWeiXinAPI(function(){
                WeixinJSBridge.invoke("imagePreview", options, function(res){
                    $.Util.execAfterMergerHandler(handler, [res]);
                });
            });
        },
        /**
         * 获取当前网络类型
         * @param Object handler
         */
        "getNetworkType" : function(handler){
            CallWeiXinAPI(function(){
                WeixinJSBridge.invoke("getNetworkType", {}, function(res){
                    // network_type:fail  无网络链接
                    // network_type:edge  2G/3G网络
                    // network_type:wwan  2G/3G网络
                    // network_type:wifi  Wifi网络
                    $.Util.execAfterMergerHandler(handler, [res]);
                });
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
         *      String api   接口类型  editAddress | getLatestAddress , 默认为editAddress  
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

                WeixinJSBridge.invoke(options["api"] || 'editAddress', requireData, function(response){
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
        },
        /**
         * 调用微信转账（需授权）
         * @param Object data{
         *     String appId, 公众号ID
         *     String timeStamp, 时间戳
         *     String nonceStr,  随机字符串
         *     String package,  数据包
         *     String signType, 签名方式（SHA1）
         *     String paySign  支付签名串
         * }
         * @param Object handlerMap 回调句柄 {Handler success, Handler fail, Handler cancel, Handler error}
         */
        "tranfer" : function(data, handlerMap){
            CallWeiXinAPI(function(){
                var requireData = {"appId":"","timeStamp":"","nonceStr":"","package":"","signType":"","paySign":""};
                var map = handlerMap || {};                
                var args = [data];

                for(var key in requireData){
                    if(requireData.hasOwnProperty(key)){
                        requireData[key] = data[key]||"";
                    }
                }

                WeixinJSBridge.invoke('getTransferMoneyRequest', requireData, function(response){
                    var key = "getTransferMoneyRequest:";
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
        }
    };

    module.exports = _api;
});
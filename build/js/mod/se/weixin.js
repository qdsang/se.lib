/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com */
define(function(require,exports,module){function a(b,c){var d=2e3;c=c||0,!0===window.G_WEIXIN_READY||"WeixinJSBridge"in window?b.apply(null,[]):d>=c&&setTimeout(function(){a(b,c++)},15)}$.Util=require("mod/se/util"),document.addEventListener("WeixinJSBridgeReady",function(){window.G_WEIXIN_READY=!0},!1);var b={Share:{weibo:function(b,c){a(function(){WeixinJSBridge.on("menu:share:weibo",function(){WeixinJSBridge.invoke("shareWeibo",b,function(a){$.Util.execAfterMergerHandler(c,[a])})})})},timeline:function(b,c){a(function(){WeixinJSBridge.on("menu:share:timeline",function(){WeixinJSBridge.invoke("shareTimeline",b,function(a){$.Util.execAfterMergerHandler(c,[a])})})})},message:function(b,c){a(function(){WeixinJSBridge.on("menu:share:appmessage",function(){WeixinJSBridge.invoke("sendAppMessage",b,function(a){$.Util.execAfterMergerHandler(c,[a])})})})}},setToolbar:function(b,c){a(function(){WeixinJSBridge.call(!0===b?"showToolbar":"hideToolbar"),$.Util.execAfterMergerHandler(c,[b])})},setOptionMenu:function(b,c){a(function(){WeixinJSBridge.call(!0===b?"showOptionMenu":"hideOptionMenu"),$.Util.execAfterMergerHandler(c,[b])})},pay:function(b,c){a(function(){var a={appId:"",timeStamp:"",nonceStr:"","package":"",signType:"",paySign:""},d=c||{},e=[b];for(var f in a)a.hasOwnProperty(f)&&(a[f]=b[f]||"");WeixinJSBridge.invoke("getBrandWCPayRequest",a,function(a){var b="get_brand_wcpay_request:",c=null,f=a.err_msg;switch(f){case b+"ok":c=d.success;break;case b+"fail":c=d.fail||d.error;break;case b+"cancel":c=d.cancel||d.error;break;default:c=d.error}$.Util.execAfterMergerHandler(c,[f].concat(e))})})},address:function(b){a(function(){var a={appId:b.appId,scope:b.scope||"jsapi_address",signType:b.signType||"sha1",addrSign:b.addrSign,timeStamp:b.timeStamp,nonceStr:b.nonceStr};WeixinJSBridge.invoke("editAddress",a,function(a){var c="edit_address:",d=null,e=null,f=a.err_msg;switch(f){case c+"ok":e=b.success,d={userName:a.userName,telNumber:a.telNumber,addressPostalCode:a.addressPostalCode,proviceFirstStageName:a.proviceFirstStageName,addressCitySecondStageName:a.addressCitySecondStageName,addressCountiesThirdStageName:a.addressCountiesThirdStageName,addressDetailInfo:a.addressDetailInfo,nationalCode:a.nationalCode};break;default:e=b.error}$.Util.execAfterMergerHandler(e,[f,d])})})}};module.exports=b});
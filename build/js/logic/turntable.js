/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=require("mod/se/util.49db40d40a068545864259f8d349426d62bfb26d"),b=require("mod/sa/turntable.b8325dbfaf2f268b52c81dfa48fce5a45150cc68"),c=require("mod/se/aliasmethod.1daedf76e61359da40de839268ecc895909b21b2"),d={start:function(){var a=f.next(),b=360/7,c=Math.max(b*a,b/5),c=b*a,d=a%2===0?c-7.579:c+7.579,g=d+1800;e.setTweenParameter(0,g,1e3).start()}},e=null,f=null,g=function(){e=new b("#t"),f=new c([.06,.04,.4,.05,.045,.4,.005]),e.addResource("background","/example/img/disc-bg.gif",0,0,1,450,450).addResource("rotate","/example/img/disc-rotate.gif",47,47,2,352,352).addResource("button","/example/img/button.png",177,181,4,92,92).addRotatingBody("arrow",97,97,3,250,250).setCenterCoordinates("50%","50%").setAction("button","start").setPrizeList(["360exp","100mb","36exp","360mb","100exp","36mb","100G"]).setComplete({callback:function(a,b){console.info("angle: "+b);var c=a.length,d=360/c,e=Math.floor(b%360/d),f=a[e];alert(f)},context:e}).paint("/example/img/arrow.png",109,0,32,191),$("#button").on("touchstart",function(a){a.stopPropagation(),d.start()}).on("touchmove",function(a){a.stopPropagation()}).on("touchend",function(a){a.stopPropagation()}),a.setActionHook(),a.injectAction(d)};module.exports={init:g}});

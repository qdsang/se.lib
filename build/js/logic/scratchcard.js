/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require){var a=require("mod/sa/scratchcard"),b=new a($("#sweet")[0]),c="./img/sweet.jpg";b.setBrushSize(10).setBlurRadius(20).setScratchText({font:"28px Arial",textAlign:"center",textBaseline:"middle",color:"gray",text:"刮刮看～",x:160,y:114}).setComplete({callback:function(a,b){var c=a+b;$("#sweet").width(319),$("#sweet").width(320),console.info(a/c)}}).paintImage(c,c,0,0,320,228)});
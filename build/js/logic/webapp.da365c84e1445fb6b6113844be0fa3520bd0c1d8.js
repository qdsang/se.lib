/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require){var a=require("mod/se/webapp.8b3598f26d2ac866359176a2fd8098bc13485878"),b=$.app=a.newInstance("webapp","view","header","footer");b.set("init",{callback:function(){b.showModuleWidget(0)}}),b.set("widgetplay",{callback:function(module,a){a.removeClass("transparent"),console.info("widget play....")}}),b.set("chromecreate",{callback:function(a,b,c){console.info("create: "+c)}}),b.set("chromestart",{callback:function(a,b,c){console.info("start: "+c)}}),b.set("chromescrolling",{callback:function(a,b,c){console.info("scrolling: "+c)}}),b.set("chromeend",{callback:function(a,b,c){console.info("end: "+c)}}),b.set("chromereset",{callback:function(a,b,c){console.info("reset: "+c)}}),b.create()});
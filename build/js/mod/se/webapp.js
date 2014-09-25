/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){require("mod/zepto/touch"),require("mod/se/raf");var a=require("mod/se/listener"),b=$.Util=require("mod/se/util"),c=require("mod/sa/lightanimation"),d=require("mod/sa/scenetransitions"),e={VERTICAL:"vertical",HORIZONTAL:"horizontal"},f={ONCE:"once",EVERYTIME:"everytime"},g=function(a,module,b,c){this.app=a,this.module=module,this.widget=b,this.source=c,this.effect=this.createAnimate(c)};g.prototype={createAnimate:function(a){var b=c.newInstance(this.widget,a);return b.set("complete",{callback:function(){this.app.exec("widget",[this.module,this.widget])},context:this}),b},next:function(){this.effect.play()},restore:function(){this.effect.reset()}};var h=function(b,c,d,g){var h=$("#"+b),i=$("#"+c),j=$("#"+d),k=$("#"+g);if(!b||!c||1!=h.length||1!=i.length)throw new Error("APP is not valid, appId = "+b+", viewId = "+c);if(d&&1!=j.length)throw new Error("APP's `header` is not found("+d+")");if(g&&1!=k.length)throw new Error("APP's `footer` is not found("+g+")");1!=j.length&&(j=null),1!=k.length&&(k=null),this.root=$("html"),this.appId=b,this.viewId=c,this.headerId=d,this.footerId=g,this.app=h,this.view=i,this.header=j,this.footer=k,this.scroller=null,this.modules=null,this.innerboxes=null,this.widgets={},this.mode=TransitionEffect.ROTATE,this.scroll=e.VERTICAL,this.widgetMode=f.ONCE,this.device={width:320,height:480,ratioWidth:"100%",ratioHeight:"100%"},this.fps=0,this.sceneDeg=28,this.sceneDuration=.28,this.scenePerspective="300px",this.listener=new a({oninit:null,onbegin:null,onscrolling:null,onend:null,onwidget:null,onresize:null,onorientationchange:null,onenterframe:null})};h.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()},setFPS:function(a){this.fps=a},layout:function(a,c,d,e){$.each(a,function(a,f){var g=$(f);g.css({width:((c.width||d.width)+"px").replace("%px","%"),height:((c.height||d.height)+"px").replace("%px","%")}),offset=g.offset(),g.attr("data-index",a).attr("data-x",offset.left).attr("data-y",offset.top).attr("data-width",offset.width).attr("data-height",offset.height),b.execAfterMergerHandler(e,[a,g]),g=null})},update:function(){var a=this,b=window.innerWidth,c=window.innerHeight,d=this.header?this.header.offset():{width:0,height:0},e=this.footer?this.footer.offset():{width:0,height:0};c=c-d.height-e.height;var f={width:b,height:c};a.setAppDeviceSize(),a.layout(a.view,f,f,null),a.layout(a.modules,f,f,{callback:function(a,module){this.queryModuleWidget(a,module)},context:a}),a.layout(a.scroller,a.scroller.offset(),f,null),a.layout(a.innerboxes,{width:a.device.ratioWidth,height:a.device.ratioHeight},f,null)},preventTouchMove:function(){$(document).on("touchmove",function(a){a.preventDefault()})},queryModuleWidget:function(a,module){var b=this,c=null,d=String(a);b.widgets[d]||(c=module.find("[data-widget]"),b.widgets[d]=[],$.each(c,function(a,c){var e=$(c),f=e.attr("data-widget");b.widgets[d].push(new g(b,module,e,f))}))},showModuleWidget:function(a){var b=this,c=b.widgets[String(a)]||[],module=$(b.modules[a]),d=module.attr("data-setted");if(f.EVERYTIME==b.widgetMode||"1"!=d){for(var e=0,g=c.length;g>e;e++)!function(a){a.next()}(c[e]);module.attr("data-setted","1")}},restoreModuleWidget:function(a){var b=this,c=b.widgets[String(a)]||[];if(f.EVERYTIME==b.widgetMode)for(var d=0,e=c.length;e>d;d++)c[d].restore()},restoreExceptModuleWidget:function(a){var b=this,c=String(a);if(f.EVERYTIME==b.widgetMode)for(var d in b.widgets)c!=d&&b.restoreModuleWidget(d)},configure:function(){var a=this,b=null;a.preventTouchMove(),b=d.newInstance("section",a.mode,a.scroll),b.setDeg(a.sceneDeg),b.setDuration(a.sceneDuration),b.setPerspective(a.scenePerspective),b.set("start",{callback:function(a,b,c,d,e){this.exec("start",[d,e])},context:a}),b.set("drawing",{callback:function(a,b,c,d,e){this.exec("scrolling",[d,e])},context:a}),b.set("complete",{callback:function(b,c){a.showModuleWidget(c),a.restoreExceptModuleWidget(c),this.exec("end",[null,c])},context:a})},createViewport:function(){var a=this;a.update(),a.configure()},resize:function(){var a=this;a.update()},enterframe:function(){var a=this,b=0,c=0;requestAnimationFrame(function(){c=(new Date).getTime(),(a.fps<=0||c-b>1e3/a.fps)&&(b=c,a.exec("enterframe",[]),requestAnimationFrame(arguments.callee))})},setAppDeviceSize:function(){var a=this,b=a.app.attr("data-device")||"",c=b.split("/"),d=c[0]||"device-width",e=c[1]||"device-height",f=window.innerWidth,g=window.innerHeight;d=isNaN(Number(d))?"device-width":Number(d),e=isNaN(Number(e))?"device-height":Number(e),"device-width"==d&&(d=f),"device-height"==e&&(e=g),d=Math.min(Math.max(d,200),1e4),e=Math.min(Math.max(e,223),1e4),a.device={width:d,height:e,ratioWidth:"100%",ratioHeight:f*e/d/g*100+"%"}},init:function(){var a=this;a.scroller=$(".webapp-modules"),a.modules=$(".webapp-modules>section"),a.innerboxes=$(".webapp-modules>section>.innerbox"),a.mode=a.app.attr("data-mode")||TransitionEffect.ROTATE,a.scroll=a.app.attr("data-scroll")||e.VERTICAL,a.widgetMode=a.app.attr("data-widget-mode")||f.ONCE,a.createViewport(),a.enterframe(),$(window).on("resize","",a,function(a){var b=a.data;b.resize(),b.exec("resize",[])}).on("orientationchange","",a,function(a){var b=a.data;b.resize(),b.exec("orientationchange",[])})}};var i={newInstance:function(a,b,c,d){var g=new h(a,b,c,d);return{mode:TransitionEffect.ROTATE,scroll:e.VERTICAL,widgetMode:f.ONCE,create:function(){g.init(),this.mode=g.mode,this.scroll=g.scroll,this.widgetMode=g.widgetMode,g.exec("init",[])},set:function(a,b){return g.set(a,b),this},setFPS:function(a){return g.setFPS(a),this},showModuleWidget:function(a){return g.showModuleWidget(a),this},restoreModuleWidget:function(a){return g.restoreModuleWidget(a),this},restoreExceptModuleWidget:function(a){return g.restoreExceptModuleWidget(a),this},setSceneDeg:function(a){return g.sceneDeg=a,this},setSceneDuration:function(a){return g.sceneDuration=a,this},setScenePerspective:function(a){return g.scenePerspective=a,this}}}};module.exports=i});
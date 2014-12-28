/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){require("mod/zepto/touch.e960be16676e977765ed45c5f7aaed29eb0160d4"),require("mod/se/raf.f12274d2329a19c00b6b3a12a35ba1e3bace9239");var a=require("mod/se/listener.263f38898829bcbd37b39b7743be119a9db33581"),b=$.Util=require("mod/se/util.5418ba8bf71f527f29091bc874d170aac4af716b"),c=require("mod/sa/lightanimation.0b4e84216cff435fc5e494dd1f72a2edf4becffd"),d=require("mod/sa/scenetransitions.8abd853e9c01c9e032424ba01bb84422783c9463"),e=require("mod/polyfill/css.dd4f56f0caedb23a7e61c1d33b666970c4c6dada"),f=e.hasProperty("perspective")?"translateZ(0)":"",g="ontouchstart"in window,h=g?"touchstart":"mousedown",i=g?"touchend":"mouseup",j=g?"touchmove":"mousemove",k={VERTICAL:"vertical",HORIZONTAL:"horizontal"},l={ONCE:"once",EVERYTIME:"everytime"},m={NONE:"none",AUTO:"auto",X:"x",Y:"y"},n={ADAPTIVE:"adaptive",HIDDEN:"hidden",HIDDEN_X:"hidden-x",HIDDEN_Y:"hidden-y"},o={VIEW:"view",DESIGN:"design"},p=function(a,module,b,c){this.app=a,this.module=module,this.widget=b,this.source=c,this.effect=this.createAnimate(c)};p.prototype={createAnimate:function(a){var b=c.newInstance(this.widget,a);return b.set("complete",{callback:function(){this.app.exec("widgetcomplete",[this.module,this.widget])},context:this}),b.set("play",{callback:function(){this.app.exec("widgetplay",[this.module,this.widget])},context:this}),b.set("reset",{callback:function(){this.app.exec("widgetreset",[this.module,this.widget])},context:this}),b.set("playing",{callback:function(a,b){this.app.exec("widgetplaying",[this.module,this.widget,b])},context:this}),b},next:function(){this.effect.play()},restore:function(){this.effect.reset()}};var q=function(b,c,d,e){var f=$("#"+b),g=$("#"+c),h=$("#"+d),i=$("#"+e);if(!b||!c||1!=f.length||1!=g.length)throw new Error("APP is not valid, appId = "+b+", viewId = "+c);if(d&&1!=h.length)throw new Error("APP's `header` is not found("+d+")");if(e&&1!=i.length)throw new Error("APP's `footer` is not found("+e+")");1!=h.length&&(h=null),1!=i.length&&(i=null);var j=f.attr("data-snap");this.root=$("html"),this.appId=b,this.viewId=c,this.headerId=d,this.footerId=e,this.app=f,this.view=g,this.header=h,this.footer=i,this.snaps=j?f.find(j):[],this.widgets={},this.scroller=$(".webapp-modules"),this.modules=$(".webapp-modules>section"),this.innerboxes=$(".webapp-modules>section>.innerbox"),this.mode=f.attr("data-mode")||TransitionEffect.ROTATE,this.scroll=f.attr("data-scroll")||k.VERTICAL,this.widgetMode=f.attr("data-widget-mode")||l.ONCE,this.adaptive=f.attr("data-adaptive")||m.NONE,this.overflow=f.attr("data-overflow")||n.ADAPTIVE,this.target=f.attr("data-target")||o.VIEW,this.align=f.attr("data-align")||null,this.design={width:640,height:960},this.viewport={width:"device-width",height:"device-height",user_scalable:"no"},this.currentIndex=0,this.lazyLoading=2,this.fps=0,this.locked=!1,this.forcedLock=!1,this.sceneDeg=28,this.sceneDuration=.28,this.sceneTiming="ease",this.scenePerspective="300px",this.sceneTransition=null,this.listener=new a({oninit:null,onstart:null,onscrolling:null,onend:null,onexit:null,onresize:null,onorientationchange:null,onenterframe:null,onwidgetcomplete:null,onwidgetplay:null,onwidgetplaying:null,onwidgetreset:null,onchromecreate:null,onchromestart:null,onchromescrolling:null,onchromeend:null,onchromeexit:null,onchromereset:null}),this.parseDesignSize(),this.parseViewportInfo()};q.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()},setFPS:function(a){this.fps=a},setLocked:function(a){this.locked=a||this.forcedLock,this.sceneTransition&&this.sceneTransition.setLocked(this.locked)},layout:function(a,c,d,e){$.each(a,function(a,f){var g=$(f);g.css({width:((c.width||d.width)+"px").replace("%px","%"),height:((c.height||d.height)+"px").replace("%px","%")}),offset=g.offset(),g.attr("data-index",a).attr("data-x",offset.left).attr("data-y",offset.top).attr("data-width",offset.width).attr("data-height",offset.height),b.execAfterMergerHandler(e,[a,g]),g=null})},updateViewportMeta:function(a){var b=this,c=b.viewport,d=[],e=$('meta[name="viewport"]'),f=$.extend(!0,{},c,a||{}),g=null;for(var h in f)f.hasOwnProperty(h)&&(g=f[h],h=h.replace(/_/g,"-"),g?"REMOVE"!=g&&d.push(h+"="+g):d.push(h));e.attr("content",d.join(", "))},update:function(){var a=this,b=a.viewport,c=a.design,d=a.view.offset(),e=d.width,f=d.height,g=c.width,h=c.height,i=0,j=0,k=0,l=0;"device-width"==b.width||isNaN(Number(b.width))||(i=Number(b.width)),"device-height"==b.height||isNaN(Number(b.height))||(j=Number(b.height));var p=this.header?this.header.offset():{width:0,height:0},q=this.footer?this.footer.offset():{width:0,height:0};f=f-p.height-q.height,k=i||e,l=j||f;var r={width:a.adaptive==m.AUTO||a.adaptive==m.X?e:k,height:a.adaptive==m.AUTO||a.adaptive==m.Y?f:l},s={width:(a.overflow==n.HIDDEN||a.overflow==n.HIDDEN_X)&&a.target==o.DESIGN?g:k,height:(a.overflow==n.HIDDEN||a.overflow==n.HIDDEN_Y)&&a.target==o.DESIGN?h:l},t={width:Math.min(s.width,r.width),height:Math.min(s.height,r.height)};a.layout(a.view,r,r,null),a.layout(a.snaps,t,t,null),a.layout(a.modules,r,r,{callback:function(a,module){this.queryModuleWidget(a,module),this.align&&module.addClass(this.align)},context:a}),a.layout(a.scroller,a.scroller.offset(),r,null),a.layout(a.innerboxes,s,s,null)},preventTouchMove:function(){$(document).on("touchmove",function(a){a.preventDefault()})},queryModuleWidget:function(a,module){var b=this,c=null,d=String(a);b.widgets[d]||(c=module.find("[data-widget]"),b.widgets[d]=[],$.each(c,function(a,c){var e=$(c),f=e.attr("data-widget");b.widgets[d].push(new p(b,module,e,f))}))},showModuleWidget:function(a){var b=this,c=b.widgets[String(a)]||[],module=$(b.modules[a]),d=module.attr("data-setted");if(l.EVERYTIME==b.widgetMode||"1"!=d){for(var e=0,f=c.length;f>e;e++)!function(a){a.next()}(c[e]);module.attr("data-setted","1")}},restoreModuleWidget:function(a){var b=this,c=b.widgets[String(a)]||[];if(l.EVERYTIME==b.widgetMode)for(var d=0,e=c.length;e>d;d++)c[d].restore()},restoreExceptModuleWidget:function(a){var b=this,c=String(a);if(l.EVERYTIME==b.widgetMode)for(var d in b.widgets)c!=d&&b.restoreModuleWidget(d)},layoutLongPageChrome:function(a,b,c){var d=c.offset();c.attr("data-x",d.left).attr("data-y",d.top).attr("data-width",d.width).attr("data-height",d.height).attr("data-index",a+","+b),c.css({left:d.left+"px",top:d.top+"px",width:d.width+"px",height:d.height+"px"})},configureLongPageChrome:function(a,c,d,module,g,k){var l=this,m=module.offset(),n=m.width,o=m.height,p=g.attr("data-dir"),q=Number(g.attr("data-bound")),r=("1"==g.attr("data-bind"),Number(g.attr("data-width"))),s=Number(g.attr("data-height")),t=r-n,u=s-o,v=0,w=0,x=0,y=0,z=0,A=0,B=!1,C="matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})",D={a:"1",b:"0",c:"0",d:"1",x:"0",y:"${y}"};"x"==p&&(D=$.extend(D,{x:"${x}",y:"0"}));var E=JSON.stringify(D),F={x:"0",y:"0"},G={x:-t,y:-u},H=function(a){var c=JSON.parse(b.formatData(E,a)),d=b.formatData(C,c)+" "+f;e.css(g,"transform",d)};!0===k?(z=A=0,H(F),g.off(),l.exec("chromereset",[a,c,d,module,g,k])):g.on(h,function(b){var e="changedTouches"in b?b.changedTouches[0]:b,f=v=e.pageX,h=w=e.pageY;B=!0,l.exec("chromestart",[a,c,d,module,g,k,f,h,t,u])}).on(j,function(b){if(!B)return 0;var e="changedTouches"in b?b.changedTouches[0]:b,f=e.pageX,h=e.pageY,i=x=f+z-v,j=y=h+A-w,m={x:i,y:j};H(m);var n=!0,o="x"==p?i:j,r="x"==p?t:u;o>0&&o>=q?n=!1:0>o&&Math.abs(o)>=q+r&&(n=!1),l.forcedLock=n,l.setLocked(n),l.exec("chromescrolling",[a,c,d,module,g,k,i,j,t,u])}).on(i,function(b){B=!1;var e=("changedTouches"in b?b.changedTouches[0]:b,z=x),f=A=y,h="x"==p?e:f,i="x"==p?t:u,j=Math.abs(h);h>0?(z=A=0,H(F)):0>h&&j>i&&(z=-t,A=-u,H(G)),l.exec("chromeend",[a,c,d,module,g,k,e,f,t,u])})},createViewFrame:function(a,b,c,module,d,e){var f=this,g="layout"+c+"Chrome",h="configure"+c+"Chrome";f.forcedLock=!e,f.setLocked(!e),g in f&&f.forcedLock&&f[g].apply(f,[a,b,d]),h in f&&f[h].apply(f,[a,b,c,module,d,e]),!0!==e&&f.exec("chromecreate",[a,b,c,module,d,e])},createViewChrome:function(a,b){var c=this,module=$(c.modules[a]),d=module.find("[data-chrome]"),e=d.length,f=null,g=null;if(e>0)for(var h=0;e>h;h++)f=$(d[h]),g=f.attr("data-chrome"),c.createViewFrame.apply(c,[h,a,g,module,d,b])},restoreViewChrome:function(a){var b=this;b.createViewChrome(a,!0)},configure:function(){var a=this,b=null;a.preventTouchMove(),b=a.sceneTransition=d.newInstance("section",a.mode,a.scroll),b.setDeg(a.sceneDeg),b.setDuration(a.sceneDuration),b.setTiming(a.sceneTiming),b.setPerspective(a.scenePerspective),b.set("start",{callback:function(a,b,c,d,e,f,g){this.currentIndex=g,this.exec("start",[a,b,c,d,e,f,g])},context:a}),b.set("move",{callback:function(a,b,c,d,e,f,g){this.currentIndex=g,this.exec("scrolling",[a,b,c,d,e,f,g])},context:a}),b.set("end",{callback:function(a,b,c,d,e,f,g){this.currentIndex=g,this.restoreViewChrome(g),this.exec("exit",[a,b,c,d,e,f,g])},context:a}),b.set("complete",{callback:function(a,b){var c=this;c.currentIndex=b,c.createViewChrome(b,!1),c.showModuleWidget(b),c.restoreExceptModuleWidget(b),c.execLazyLoading(b),c.exec("end",[a,b])},context:a})},createViewport:function(){var a=this;a.update(),a.configure()},resize:function(){var a=this;a.view.css({width:"100%",height:"100%"}),a.update()},enterframe:function(){var a=this,b=0,c=0;requestAnimationFrame(function(){c=(new Date).getTime(),(a.fps<=0||c-b>1e3/a.fps)&&(b=c,a.exec("enterframe",[]),requestAnimationFrame(arguments.callee))})},parseDesignSize:function(){var a=this.app.attr("data-design")||"640/960",b=a.split("/"),c=Number(b[0]),d=Number(b[1]);this.design={width:c,height:d}},parseViewportInfo:function(){var a=$('meta[name="viewport"]'),b=a.attr("content"),c=null,d=null,e=null,f=null,g=null,h=0;b=b.replace(/,\s*/g,",").replace(/\s*=\s*/g,"="),c=b.split(",");for(var i=0,j=c.length;j>i;i++)d=c[i],h=d.indexOf("="),e=d.substring(0,h),g=d.substring(h+1),f=(e||g).replace(/\-/g,"_"),g=e?g:"",this.viewport[f]=g},setLazyLoading:function(a){this.lazyLoading=a||0},execLazyLoading:function(a){var b=this.modules||[],c=b.length,module=null;if(this.lazyLoading>0)for(var d=a;d<a+this.lazyLoading&&c>d;d++)module=$(b[d]),"1"!=module.attr("data-lazy")&&(this.lazy(module),module.attr("data-lazy","1"))},lazy:function(module){var a=module.find("[data-lazysrc]");$.each(a,function(a,b){var c=$(b),d=c.attr("data-lazysrc"),e=d.indexOf("!"),f=-1!=e?d.substring(0,e):"src",g=-1!=e?d.substring(e+1):d;"src"==f?c.attr("src",g):c.css("background-image","url("+g+")")})},init:function(a){var b=this;b.currentIndex=0,b.createViewport(),!1!==a&&(b.showModuleWidget(0),b.restoreExceptModuleWidget(0)),b.modules.length<=1&&(b.forcedLock=!0,b.setLocked(!0)),b.execLazyLoading(0),b.exec("init",[a]),b.exec("end",[null,0]),b.enterframe();var c=$(".webapp-loading");c.length>0&&c.addClass("hide"),$(window).on("resize","",b,function(a){var b=a.data;b.exec("resize",[])}).on("orientationchange","",b,function(a){var b=a.data;b.exec("orientationchange",[])})}};var r={newInstance:function(a,b,c,d){var e=new q(a,b,c,d);return{mode:e.mode,scroll:e.scroll,widgetMode:e.widgetMode,adaptive:e.adaptive,overflow:e.overflow,target:e.target,align:e.align,design:e.design,app:e.app,view:e.view,header:e.header,footer:e.footer,scroller:e.scroller,modules:e.modules,innerboxes:e.innerboxes,viewport:e.viewport,create:function(a){e.init(a)},getCurrentIndex:function(){return e.currentIndex},set:function(a,b){return e.set(a,b),this},setFPS:function(a){return e.setFPS(a),this},setLocked:function(a){return e.setLocked(a),this},setLazyLoading:function(a){return e.setLazyLoading(a),this},execLazyLoading:function(a){return e.execLazyLoading(a),this},showModuleWidget:function(a){return e.showModuleWidget(a),this},restoreModuleWidget:function(a){return e.restoreModuleWidget(a),this},restoreExceptModuleWidget:function(a){return e.restoreExceptModuleWidget(a),this},setSceneDeg:function(a){return e.sceneDeg=a,this},setSceneDuration:function(a){return e.sceneDuration=a,this},setSceneTiming:function(a){return e.sceneTiming=a,this},setScenePerspective:function(a){return e.scenePerspective=a,this},updateViewportMeta:function(a){return e.updateViewportMeta(a),this},resize:function(){return e.resize(),this}}}};module.exports=r});

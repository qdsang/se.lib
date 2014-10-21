/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=$.Listener=require("mod/se/listener"),b=require("mod/polyfill/css"),c=window.TransitionEffect={ROTATE:"rotate",SCREEN:"screen",SCALE:"scale"},d={VERTICAL:"vertical",HORZIONTAL:"horizontal"},e=b.hasProperty("perspective")?"translateZ(0)":"",f="ontouchstart"in window,g=f?"touchstart":"mousedown",h=f?"touchend":"mouseup",i=f?"touchmove":"mousemove",j=function(b,e,f,g){this.snap=b,this.scenes=$(b),this.size=this.scenes.length,this.stage=this.scenes.parent(),this.transitionEffect=e||c.ROTATE,this.direction=f||d.VERTICAL,this.moveDirection=1,this.lockedDirection=0,this.lastIndex=Math.max(this.size-1,0),this.enterScene=void 0,this.exitScene=void 0,this.enabled=!0,this.locked=!1,this.touched=!1,this.animate=!1,this.startX=0,this.startY=0,this.endX=0,this.endY=0,this.deg=28,this.screenScale=.7,this.duration=.28,this.timing="ease",this.perspective="300px",this.moveRatio=.3,this.shiftRatio=.2;var h=this.stage.offset();if(this.offset=d.HORZIONTAL==this.direction?h.width:h.height,!(e in this))throw new Error("this effect("+e+") not yet implemented.");this.updateSceneIndex(0),!1!==g&&this.bind(),this.run("init",[]),this.listener=new a({onshift:null,onstart:null,onmove:null,onend:null,oncomplete:null})};j.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()},run:function(a,b){var c=this,d=c[c.transitionEffect],e={"super":this,effect:d};d[a].apply(e,b)},setDeg:function(a){this.deg=a},setDuration:function(a){this.duration=a},setTiming:function(a){this.timing=a},setPerspective:function(a){this.perspective=a},setScreenScale:function(a){this.screenScale=a},setLocked:function(a){this.locked=a},restore:function(){this.moveDirection=1,this.lockedDirection=0,this.enterScene=void 0,this.exitScene=void 0,this.enabled=!0,this.locked=!1,this.touched=!1,this.animate=!1,this.startX=0,this.startY=0,this.endX=0,this.endY=0,this.updateSceneIndex(0)},updateSceneIndex:function(a){this.currentIndex=a,this.prevIndex=0>=a?this.lastIndex:a-1,this.nextIndex=this.lastIndex===a?0:a+1,this.currentScene=$(this.scenes[this.currentIndex])||null,this.nextScene=$(this.scenes[this.nextIndex])||null,this.prevScene=$(this.scenes[this.prevIndex])||null,this.enabled=!0,this.run("layout",[])},preventDefault:function(){var a=this,b=a.stage;b.on(g+" "+drawingEvent+" "+h,function(a){a.preventDefault()})},cancelBubble:function(){var a=this,b=a.stage;b.on(g+" "+drawingEvent+" "+h,function(a){a.stopPropagation()})},complete:function(a){var c=a.data,d=a.currentTarget;return c.exitScene&&d==c.exitScene[0]?(b.css(c.scenes,"transitionDuration","0s"),c.currentIndex-=c.moveDirection,c.currentIndex>c.lastIndex?c.currentIndex=0:c.currentIndex<0&&(c.currentIndex=c.lastIndex),c.updateSceneIndex(c.currentIndex),c.exec("complete",[a,c.currentIndex]),c.animate?void 0:(c.enabled=!0,0)):0},off:function(){var a=this,b=(a.stage,a.scenes);b.off(g,"").off(i,"").off(h,"")},bind:function(a){var b=this,c=b.stage,e=b.scenes,f=c.attr("data-sencestransition");("1"!=f||!0===a)&&(b.off(),e.on(g,"",b,function(a){{var b=a.data,c="changedTouches"in a?a.changedTouches[0]:a;b.startX=c.pageX,b.startY=c.pageY}return b.locked||!b.enabled||b.touched?1:(b.moved=!1,b.moveDirection=0,b.enterScene=void 0,b.exitScene=void 0,b.touched=!0,void(b.animate=!1))}).on(i,"",b,function(a){var b=a.data,c="changedTouches"in a?a.changedTouches[0]:a,e=b.endX=c.pageX,f=b.endY=c.pageY,g=e-b.startX,h=f-b.startY,i=d.HORZIONTAL==b.direction?g:h,j=Math.abs(i),k=[a,e,f,g,h,i,b.currentIndex];return b.moveDirection=i/j,!b.locked&&b.enabled&&b.touched?j<b.offset*b.shiftRatio?1:(b.moved=!0,(b.moveDirection!=b.lockedDirection||void 0===b.enterScene)&&(b.enterScene=b.moveDirection>0?b.nextScene:b.prevScene,b.lockedDirection=b.moveDirection,b.run("start",k)),void(j<b.offset*b.moveRatio?b.run("move",k):(b.animate=!0,b.run("animate",k)))):1}).on(h,"",b,function(a){var b=a.data,c="changedTouches"in a?a.changedTouches[0]:a,e=b.endX=c.pageX,f=b.endY=c.pageY,g=e-b.startX,h=f-b.startY,i=d.HORZIONTAL==b.direction?g:h,j=[a,e,f,g,h,i,b.currentIndex];return b.exec("shift",j),!b.locked&&b.enabled&&b.touched?(b.touched=!1,b.moved?(b.enabled=!1,void b.run("end",j)):1):1}),c.attr("data-sencestransition","1"))},rotate:{currentZIndex:3,nextZIndex:4,prevZIndex:2,queueZIndex:1,init:function(){var a=this["super"];b.css(a.scenes,"transformOrigin","0 100%"),b.css(a.scenes,"transitionTimingFunction",a.timing),b.css(a.stage,"perspective",a.perspective)},layout:function(){for(var a=this["super"],c=this.effect,f=a.scenes,g=a.size,h=null,i=a.currentIndex,j=a.nextIndex,k=a.prevIndex,l=0;g>l;l++)h=$(f[l]),l===i?(h.css("z-index",c.currentZIndex),h.css("visibility","visible"),b.css(h,"transform","translate(0%,0%) "+e)):l===j&&j!==i?(h.css("z-index",d.HORZIONTAL==a.direction?c.prevZIndex:c.nextZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,0%":"0%,100%")+") "+e)):l===k&&k!==i?(h.css("z-index",d.HORZIONTAL==a.direction?c.nextZIndex:c.prevZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"0%,100%":"100%,0%")+") "+e)):(h.css("z-index",c.queueZIndex),h.css("visibility","hidden"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,100%":"100%,100%")+") "+e))},start:function(a,c,f,g,h,i,j){var k=this["super"],l=null,m=null;k.moveDirection>0?(k.enterScene=k.prevScene,k.exitScene=k.currentScene):(k.enterScene=k.currentScene,k.exitScene=k.nextScene),l=k.exitScene,m=k.enterScene,d.HORZIONTAL==k.direction?k.moveDirection>0&&b.css(m,"transform","rotateY("+k.deg+"deg) translate(0%,0%) "+e):k.moveDirection>0?b.css(m,"transform","rotateX("+k.deg+"deg) translate(0%,0%) "+e):b.css(m,"transform","rotateX(0deg) translate(100%,0%) "+e),k.exec("start",[a,c,f,g,h,i,j])},end:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","rotateY("+k.deg+"deg) translate(0%,0%) "+e),b.css(l,"transform","rotateY(0deg) "+e)):(b.css(m,"transform","rotateY(0deg) "+e),b.css(l,"transform","rotateY("+-k.deg+"deg) translate(-100%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","rotateX(-"+k.deg+"deg) translate(0%,100%) "+e),b.css(l,"transform","rotateX(0deg) "+e)):(b.css(m,"transform","rotateX(0deg) translate(0%,0%) "+e),b.css(l,"transform","rotateX("+k.deg+"deg) "+e)),k.exec("end",[a,c,f,g,h,i,j])},move:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene,n=0,o=0;d.HORZIONTAL==k.direction?(k.moveDirection>0?(n=k.deg/k.offset*Math.abs(i),o=Math.max(k.deg-k.deg/(k.offset/1.2)*Math.abs(i),0),i=-100+100/k.offset*i):(n=k.deg-k.deg/k.offset*Math.abs(i),o=Math.max(k.deg-k.deg/(k.offset/1.2)*Math.abs(i),0),i=100/k.offset*i),b.css(m,"transform","rotateY("+o+"deg) "+e),b.css(l,"transform","rotateY("+-n+"deg) translate("+i+"%,0%) "+e)):(k.moveDirection>0?(n=k.deg-k.deg/k.offset*Math.abs(i),o=Math.min(-k.deg/(k.offset/1.2)*Math.abs(i),0),i=100/k.offset*i):(n=k.deg/k.offset*Math.abs(i),o=Math.min(-k.deg+k.deg/(k.offset/1.2)*Math.abs(i),0),i=100+100/k.offset*i),b.css(m,"transform","rotateX("+o+"deg) translate(0%,"+i+"%) "+e),b.css(l,"transform","rotateX("+n+"deg) "+e)),k.exec("move",[a,c,f,g,h,i,j])},animate:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;k.touched=!1,k.enabled=!1,b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","rotateY("+k.deg+"deg) translate(0%,0%) "+e),b.css(l,"transform","rotateY(0deg) "+e)):(b.css(m,"transform","rotateY(0deg) "+e),b.css(l,"transform","rotateY("+-k.deg+"deg) translate(-100%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","rotateX(-"+k.deg+"deg) translate(0%,100%) "+e),b.css(l,"transform","rotateX(0deg) "+e)):(b.css(m,"transform","rotateX(0deg) translate(0%,0%) "+e),b.css(l,"transform","rotateX("+k.deg+"deg) "+e)),k.exec("end",[a,c,f,g,h,i,j])}},screen:{currentZIndex:3,nextZIndex:4,prevZIndex:2,queueZIndex:1,init:function(){var a=this["super"];b.css(a.scenes,"transformOrigin","50% 50%"),b.css(a.scenes,"transitionTimingFunction",a.timing)},layout:function(){for(var a=this["super"],c=this.effect,f=a.scenes,g=a.size,h=null,i=a.currentIndex,j=a.nextIndex,k=a.prevIndex,l=0;g>l;l++)h=$(f[l]),l===i?(h.css("z-index",c.currentZIndex),h.css("visibility","visible"),b.css(h,"transform","translate(0%,0%) "+e)):l===j&&j!==i?(h.css("z-index",d.HORZIONTAL==a.direction?c.prevZIndex:c.nextZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,0%":"0%,100%")+") "+e)):l===k&&k!==i?(h.css("z-index",d.HORZIONTAL==a.direction?c.nextZIndex:c.prevZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"-100%,0%":"0%,-100%")+") "+e)):(h.css("z-index",c.queueZIndex),h.css("visibility","hidden"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,100%":"100%,100%")+") "+e))},start:function(a,b,c,d,e,f,g){var h=this["super"];h.moveDirection>0?(h.enterScene=h.prevScene,h.exitScene=h.currentScene):(h.enterScene=h.nextScene,h.exitScene=h.currentScene),h.exec("start",[a,b,c,d,e,f,g])},end:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","translate(100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","translate(-100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","translate(0%,100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","translate(0%,-100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)),k.exec("end",[a,c,f,g,h,i,j])},move:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene,n=0,o=0;k.moveDirection>0?(o=100/k.offset*i,n=o-100):(o=100/k.offset*i,n=o+100),d.HORZIONTAL==k.direction?(b.css(m,"transform","translate("+o+"%, 0%)"+e),b.css(l,"transform","translate("+n+"%,0%) "+e)):(b.css(m,"transform","translate(0%,"+o+"%)"+e),b.css(l,"transform","translate(0%,"+n+"%) "+e)),k.exec("move",[a,c,f,g,h,i,j])},animate:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;k.touched=!1,k.enabled=!1,b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","translate(100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","translate(-100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","translate(0%,100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","translate(0%,-100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)),k.exec("end",[a,c,f,g,h,i,j])}},scale:{currentZIndex:2,nextZIndex:3,prevZIndex:3,queueZIndex:1,init:function(){var a=this["super"];b.css(a.scenes,"transformOrigin","50% 50%"),b.css(a.scenes,"transitionTimingFunction",a.timing)},layout:function(){for(var a=this["super"],c=this.effect,f=a.scenes,g=a.size,h=null,i=a.currentIndex,j=a.nextIndex,k=a.prevIndex,l=0;g>l;l++)h=$(f[l]),l===i?(h.css("z-index",c.currentZIndex),h.css("visibility","visible"),b.css(h,"transform","translate(0%,0%) "+e)):l===j&&j!==i?(h.css("z-index",c.nextZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,0%":"0%,100%")+") "+e)):l===k&&k!==i?(h.css("z-index",c.prevZIndex),h.css("visibility","visible"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"-100%,0%":"0%,-100%")+") "+e)):(h.css("z-index",c.queueZIndex),h.css("visibility","hidden"),b.css(h,"transform","translate("+(d.HORZIONTAL==a.direction?"100%,100%":"100%,100%")+") "+e))},start:function(a,b,c,d,e,f,g){var h=this["super"];h.moveDirection>0?(h.enterScene=h.prevScene,h.exitScene=h.currentScene):(h.enterScene=h.nextScene,h.exitScene=h.currentScene),h.exec("start",[a,b,c,d,e,f,g])},end:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","scale("+k.screenScale+") translate(100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","scale("+k.screenScale+") translate(-100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","scale("+k.screenScale+") translate(0%,100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","scale("+k.screenScale+") translate(0%,-100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)),k.exec("end",[a,c,f,g,h,i,j])},move:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene,n=0,o=0,p=0;k.moveDirection>0?(o=100/k.offset*i,n=o-100):(o=100/k.offset*i,n=o+100),p=1-k.screenScale/k.offset*Math.abs(i),d.HORZIONTAL==k.direction?(b.css(m,"transform","scale("+p+") translate("+o+"%, 0%)"+e),b.css(l,"transform","translate("+n+"%,0%) "+e)):(b.css(m,"transform","scale("+p+") translate(0%,"+o+"%)"+e),b.css(l,"transform","translate(0%,"+n+"%) "+e)),k.exec("move",[a,c,f,g,h,i,j])},animate:function(a,c,f,g,h,i,j){var k=this["super"],l=k.enterScene,m=k.exitScene;k.touched=!1,k.enabled=!1,b.css(l,"transitionDuration",k.duration+"s"),b.css(m,"transitionDuration",k.duration+"s"),m.one("webkitTransitionEnd","",k,k.complete),d.HORZIONTAL==k.direction?k.moveDirection>0?(b.css(m,"transform","scale("+k.screenScale+") translate(100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","scale("+k.screenScale+") translate(-100%,0%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):k.moveDirection>0?(b.css(m,"transform","scale("+k.screenScale+") translate(0%,100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)):(b.css(m,"transform","scale("+k.screenScale+") translate(0%,-100%) "+e),b.css(l,"transform","translate(0%,0%) "+e)),k.exec("end",[a,c,f,g,h,i,j])}}};var k={newInstance:function(a,b,c,d){var e=new j(a,b,c,d);return{stage:e.stage,scenes:e.scenes,size:e.size,set:function(a,b){return e.set(a,b),this},setLocked:function(a){return e.setLocked(a),this},setDeg:function(a){return e.setDeg(a),this},setScreenScale:function(a){return e.setScreenScale(a),this},setDuration:function(a){return e.setDuration(a),this},setTiming:function(a){return e.setTiming(a),this},setPerspective:function(a){return e.setPerspective(a),this},setMoveRatio:function(a){return e.moveRatio=a,this},setShiftRatio:function(a){return e.shiftRatio=a,this},cancelBubble:function(){return e.cancelBubble(),this},preventDefault:function(){return e.preventDefault(),this},restore:function(){return e.restore(),this},off:function(){return e.off(),this},on:function(a){return e.bind(a),this}}}};module.exports=k});
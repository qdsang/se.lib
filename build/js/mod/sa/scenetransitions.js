/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=$.Listener=require("mod/se/listener"),b=require("mod/polyfill/css"),c=(require("mod/sa/lightanimation"),window.TransitionEffect={ZOOM:"zoom",ROTATE:"rotate"}),d={VERTICAL:"vertical",HORZIONTAL:"horizontal"},e=b.hasProperty("perspective")?"translateZ(0)":"",f=function(b,e,f){this.snap=b,this.scenes=$(b),this.index=0,this.size=this.scenes.length,this.parent=this.scenes.parent(),this.currentIndex=0,this.nextIndex=1,this.prevIndex=this.size-1,this.lastIndex=this.size-1,this.moveIndex=void 0,this.stayIndex=void 0,this.currentZIndex=3,this.nextZIndex=4,this.prevZIndex=2,this.queueZIndex=1,this.transitionEffect=e||c.ROTATE,this.direction=f||d.VERTICAL,this.moveDirection=0,this.lockedDirection=void 0,this.drawing=!1,this.moved=!1,this.enabled=!0,this.flipped=!1,this.initiated=0,this.startX=0,this.startY=0,this.shift=0,this.offset=0,this.deg=28,this.duration=.28,this.perspective="300px",this.listener=new a({onstart:null,ondrawing:null,onend:null,oncomplete:null});var g=this.parent.offset();if(this.offset=d.HORZIONTAL==this.direction?g.width:g.height,!(e in this))throw new Error("this effect("+e+") not yet implemented.");this.page(this.currentIndex),this.bind(),this.effect("init",[])};f.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()},effect:function(a,b){var c=this[this.transitionEffect];c[a].apply(c,[this].concat(b))},setDeg:function(a){this.deg=a},setDuration:function(a){this.duration=a},setPerspective:function(a){this.perspective=a},layout:function(){for(var a=this.scenes,c=this.size,f=null,g=this.currentIndex,h=this.lastIndex,i=this.nextIndex=g+1>h?0:g+1,j=this.prevIndex=0>g-1?h:g-1,k=0;c>k;k++)f=$(a[k]),f.css("visibility","hidden"),k===g?(f.css("z-index",this.currentZIndex),f.css("visibility","visible"),b.css(f,"transform","translate(0, 0) "+e)):k===i?(f.css("z-index",this.nextZIndex),f.css("visibility","visible"),b.css(f,"transform","translate("+(d.HORZIONTAL==this.direction?"100%,0":"0,100%")+") "+e)):k===j&&(f.css("z-index",this.prevZIndex),f.css("visibility","visible"),b.css(f,"transform","translate("+(d.HORZIONTAL==this.direction?"0,100%":"100%,0")+") "+e))},getPointerPosition:function(a){var b=a.data;a.changedTouches&&(a=a.changedTouches[a.changedTouches.length-1]);var c=0,d=0,e=a.clientX,f=a.clientY,g=document.body,h=g.scrollLeft,i=g.scrollTop,j=$(b.scenes[b.currentIndex]),k=j.offset();return this.stageOffsetX=k.left,this.stageOffsetY=k.top,c=(e+h||a.pageX)-k.left||0,d=(f+i||a.pageY)-k.top||0,{x:c,y:d}},page:function(a){"last"==a?a=this.lastIndex:"prev"==a?a--:"next"==a&&a++,0>a?a=0:a>this.lastIndex&&(a=this.lastIndex);var b=a-1,c=a+1;0>b&&(b=this.lastIndex),c>this.lastIndex&&(c=0),this.currentIndex=a,this.nextIndex=c,this.prevIndex=b,this.layout()},update:function(){{var a=this.index+this.moveIndex;this.moveIndex>0?this.nextIndex:this.prevIndex}0>a?a=this.lastIndex:a>this.lastIndex&&(a=0),this.enabled=!0},complete:function(a){var c=a.data,d=a.currentTarget;return d!=c.scenes[c.moveIndex]?0:(b.css(c.scenes,"transitionDuration","0s"),c.flipped?(c.index+=c.moveDirection,c.index>c.lastIndex?c.index=0:c.index<0&&(c.index=c.lastIndex),c.currentIndex+=c.moveDirection,c.currentIndex>c.lastIndex?c.currentIndex=0:c.currentIndex<0&&(c.currentIndex=c.lastIndex),c.prevIndex=c.currentIndex-1,c.prevIndex<0&&(c.prevIndex=c.lastIndex),c.nextIndex=c.currentIndex+1,c.nextIndex>c.lastIndex&&(c.nextIndex=0),c.layout(),c.update(),void c.exec("complete",[a,c.currentIndex])):(c.enabled=!0,0))},bind:function(){var a="ontouchstart"in window,b=a?"touchstart":"mousedown",c=a?"touchend":"mouseup",e=a?"touchmove":"mousemove";this.scenes.on(b,"",this,function(a){var b=a.data,c=(a.currentTarget,b.getPointerPosition(a));return!b.enabled||b.initiated&&1!==b.initiated?0:(b.drawing=!0,b.lockedDirection=0,b.moveIndex=void 0,b.stayIndex=void 0,b.moved=!1,b.initiated=1,b.flipped=!1,b.startX=c.x,void(b.startY=c.y))}).on(c,"",this,function(a){var b=a.data,c=a.currentTarget,d=b.getPointerPosition(a);return b.enabled&&1==b.initiated?(b.initiated=0,b.moved?(b.enabled=!1,b.effect("end",[a,d.x,d.y,c]),void $(b.scenes[b.moveIndex]).one("webkitTransitionEnd","",b,b.complete)):0):0}).on(e,"",this,function(a){var b=a.data,c=a.currentTarget,e=b.getPointerPosition(a),f=[a,e.x,e.y,c];if(!b.enabled||1!==b.initiated)return 0;var g=d.HORZIONTAL==b.direction?-(e.x-b.startX):e.y-b.startY,h=Math.abs(g);return b.moveDirection=-g/h,10>h?0:(b.moved=!0,(b.moveDirection!=b.lockedDirection||void 0===b.moveIndex)&&(b.moveIndex=b.moveDirection>0?b.prevIndex:b.nextIndex,b.lockedDirection=b.moveDirection,b.effect("start",f)),void(h<b.offset/3?b.effect("move",f.concat(g)):(b.flipped=!0,b.effect("animate",f.concat(g)))))})},rotate:{init:function(a){b.css(a.scenes,"transformOrigin","0 100%"),b.css(a.scenes,"transitionTimingFunction","ease-out"),b.css(a.parent,"perspective",a.perspective)},start:function(a,c,f,g,h){var i=null;a.moveDirection>0?(a.moveIndex=a.nextIndex,a.stayIndex=a.currentIndex,i=$(a.scenes[a.stayIndex]),d.HORZIONTAL==a.direction||b.css(i,"transform","rotateX("+a.deg+"deg) translate(0,0) "+e)):(a.moveIndex=a.currentIndex,a.stayIndex=a.prevIndex,i=$(a.scenes[a.stayIndex]),d.HORZIONTAL==a.direction?b.css(i,"transform","rotateY("+a.deg+"deg) translate(0,0) "+e):b.css(i,"transform","rotateX(0deg) translate(100%,0) "+e)),a.exec("start",[c,f,g,h,a.currentIndex])},end:function(a,c,f,g,h){var i=$(a.scenes[a.stayIndex]),j=$(a.scenes[a.moveIndex]);b.css(j,"transitionDuration",a.duration+"s"),b.css(i,"transitionDuration",a.duration+"s"),a.moveDirection>0?d.HORZIONTAL==a.direction?(b.css(j,"transform","rotateY(-"+a.deg+"deg) translate(-100%,0) "+e),b.css(i,"transform","rotateY(0deg) "+e)):(b.css(j,"transform","rotateX(0deg) translate(0,100%) "+e),b.css(i,"transform","rotateX(0deg) "+e)):d.HORZIONTAL==a.direction?(b.css(j,"transform","rotateY(0deg) translate(0,0) "+e),b.css(i,"transform","rotateY("+a.deg+"deg) "+e)):(b.css(j,"transform","rotateX(0deg) translate(0,0) "+e),b.css(i,"transform","rotateX("+a.deg+"deg) "+e)),a.exec("end",[c,f,g,h,a.currentIndex])},move:function(a,c,f,g,h,i){var j,k,l=$(a.scenes[a.stayIndex]),m=$(a.scenes[a.moveIndex]);d.HORZIONTAL==a.direction?(a.moveDirection>0?(j=-a.deg/a.offset*Math.abs(i),k=Math.min(-a.deg+a.deg/(a.offset/1.2)*Math.abs(i),0),i=-100-100/a.offset*i):(j=Math.min(-a.deg+a.deg/(a.offset/1.2)*Math.abs(i),0),k=-a.deg/a.offset*Math.abs(i),i=-100/a.offset*i),b.css(m,"transform","rotateY("+k+"deg) translate("+i+"%,0) "+e),b.css(l,"transform","rotateY("+-j+"deg) "+e)):(a.moveDirection>0?(j=a.deg/a.offset*Math.abs(i),k=Math.min(-a.deg+a.deg/(a.offset/1.2)*Math.abs(i),0),i=100+100/a.offset*i):(j=a.deg-a.deg/a.offset*Math.abs(i),k=Math.min(-a.deg/(a.offset/1.2)*Math.abs(i),0),i=100/a.offset*i),b.css(m,"transform","rotateX("+k+"deg) translate(0,"+i+"%) "+e),b.css(l,"transform","rotateX("+j+"deg) "+e)),a.exec("drawing",[c,f,g,h,a.currentIndex])},animate:function(a){var c=$(a.scenes[a.stayIndex]),f=$(a.scenes[a.moveIndex]);a.initiated=0,a.enabled=!1,b.css(f,"transitionDuration",a.duration+"s"),b.css(c,"transitionDuration",a.duration+"s"),a.moveDirection>0?d.HORZIONTAL==a.direction?(b.css(f,"transform","rotateY(0deg) translate(0,0) "+e),b.css(c,"transform","rotateY("+a.deg+"deg) "+e)):(b.css(f,"transform","rotateX(0deg) translate(0,0) "+e),b.css(c,"transform","rotateX("+a.deg+"deg) "+e)):d.HORZIONTAL==a.direction?(b.css(f,"transform","rotateY(-"+a.deg+"deg) translate(-100%,0) "+e),b.css(c,"transform","rotateY(0deg) "+e)):(b.css(f,"transform","rotateX(-"+a.deg+"deg) translate(0,100%) "+e),b.css(c,"transform","rotateX(0deg) "+e)),f.one("webkitTransitionEnd","",a,a.complete)}},zoom:{init:function(a){b.css(a.scenes,"transformOrigin","50%, 50%"),b.css(a.scenes,"transitionTimingFunction","ease-out")},start:function(a,b,c,d,e){a.exec("start",[b,c,d,e,a])},end:function(a,b,c,d,e){a.exec("end",[b,c,d,e,a])},move:function(a,b,c,d,e){a.exec("drawing",[b,c,d,e,a])},animate:function(){}}};var g={newInstance:function(a,b){var c=new f(a,b);return{set:function(a,b){return c.set(a,b),this},setDeg:function(a){return c.setDeg(a),this},setDuration:function(a){return c.setDuration(a),this},setPerspective:function(a){return c.setPerspective(a),this}}}};module.exports=g});
/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){require("mod/zepto/touch");var a=require("mod/sa/lightanimation"),b=require("mod/se/listener"),c=require("mod/se/util"),d=require("mod/polyfill/css"),e={},f="ALBUM_",g={VERTICAL:1,HORZIONTAL:0},h={ALBUM:'[data-type="album"]',THUMBNAIL:'[data-type="thumbnail"]',PHOTOS:'[data-type="photos"]',PHOTO:'[data-type="photo"]'},i=(d.hasProperty("perspective")?"translateZ(0)":"","ontouchstart"in window),j=i?"touchstart":"mousedown",k=i?"touchend":"mouseup",l=i?"touchmove":"mousemove",m={album:{show:function(a){var b=e[f+a];b.photoBox.removeClass("hide"),b.loadPhotos(),b.exec("loading",[])}}},n=function(a,c){this.id=a,this.album=$("#"+a),this.photos=this.album.find(h.PHOTO),this.size=this.photos.length,this.thumbnail=this.album.find(h.THUMBNAIL),this.photoBox=this.album.find(h.PHOTOS),this.root=null,this.options={direction:g.HORZIONTAL,thumbnail:!0,exit:30},this.albumAnimate=null,this.photosAnimate=[],this.binded=!1,this.lastIndex=this.size-1,this.currentIndex=this.lastIndex,this.queue=[],this.listener=new b({onloading:null,onready:null,onexit:null,onstart:null,onscrolling:null,onend:null}),!1!==c&&this.on(),this.create(),e[f+a]=this};n.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()},off:function(){var a=this.album,b=h.PHOTO;a.off(j,b).off(l,b).off(k,b)},on:function(a){var b=this.album,c=h.PHOTO;(!1===this.binded||!0===a)&&(this.off(),b.on(j,c,this,function(a){var b=a.data;if(!b.ready)return 1;var c="changedTouches"in a?a.changedTouches[0]:a;b.startX=c.pageX,b.startY=c.pageY,b.moved=!1}).on(l,c,this,function(a){var b=a.data;if(!b.ready)return 1;var c="changedTouches"in a?a.changedTouches[0]:a,d=b.endX=c.pageX,e=b.endY=c.pageY,f=d-b.startX,h=e-b.startY,i=g.HORZIONTAL==b.options.direction?f:h,j=Math.abs(i);return b.moveDirection=i/j,j<.05*b.offset?1:void(b.moved=!0)}).on(k,c,this,function(a){var b=a.data;return b.ready&&b.moved?void(1===b.moveDirection?b.prev():-1===b.moveDirection&&b.next()):1}))},next:function(){var a=this.currentIndex,b=a-1,c=($(this.photos[a]),null),d=this.photosAnimate[a];c=g.HORZIONTAL==this.options.direction?this.getSource(a,d.setting,{translate:"-100%, 0%",opacity:0},!1):this.getSource(a,d.setting,{translate:"%, -100%",opacity:0},!1),0>b&&(b=this.lastIndex),this.update(a,b,c)},prev:function(){var a=this.currentIndex,b=a-1,c=($(this.photos[a]),null),d=this.photosAnimate[a];c=g.HORZIONTAL==this.options.direction?this.getSource(a,d.setting,{translate:"100%, 0%",opacity:0},!1):this.getSource(a,d.setting,{translate:"%, 100%",opacity:0},!1),0>b&&(b=this.lastIndex),this.update(a,b,c)},update:function(a,b,c){for(var d=this.photos,e=this.size,f=null,g=0;e>g;g++)f=$(d[g]),f.css(g===a?{zIndex:3}:g===b&&b!==a?{zIndex:2}:{zIndex:1});if(this.currentIndex=a,c){var h=this.photosAnimate[a],i=h.animate,j=h.setting;i.updateTarget(h.target),i.source(c),i.set("complete",{callback:function(a,b,c,d,e){b.updateTarget(h.target),b.source(this.getSource(d,c,{translate:"0%, 0%",opacity:1},!1,!0)),b.set("complete",null),b.play(),this.update(e,e,null),this.repaint(d)},context:this,args:[i,j,a,b]}),i.play()}},repaint:function(){this.queue.push(this.queue.shift());for(var a=this.size,b=this.photosAnimate,c=this.queue,d=0,e=null,f=null,g=null,h=a-1;h>=0;h--)d=c[h],e=b[d],f=e.animate,g=this.getSource(h,e.setting,{rotateZ:e.setting.properties.rotateZ.replace(/</g,">")},!1,!1),f.updateTarget(e.target),f.source(g),f.play()},getRealValue:function(a,b){var c=this.size,d=[],e=0,f=0,g="";return b=String(b),-1!=b.indexOf("<")?(d=b.split("<"),e=Number(d[0]),f=Number(d[1]),g=d[2],b=(c-1-a)*f+g):-1!=b.indexOf(">")&&(d=b.split(">"),e=Number(d[0]),f=Number(d[1]),g=d[2],b=a*f+g),b},getAnimate:function(a,b,c,d){var e=[];return e.push(!0===d?"0s":b.duration+"s"),e.push(b.timing),c&&e.push(this.getRealValue(a,b.delay)),e.join(" ")},getSource:function(a,b,c,d,e){var f=b.properties,g=b.transition,h=c||{},i=[],j=null;f=$.extend(f,h);for(var k in f)f.hasOwnProperty(k)&&(j=this.getRealValue(a,f[k]),i.push(k+":"+j+"!"+this.getAnimate(a,g,d,e)));return"transition::"+i.join(";")},parsePhotos:function(){for(var b=this.photos,c=null,d=b.length,e=null,f=this.photoBox,g={properties:f.data("property"),transition:f.data("animate")},h=0;d>h;h++)c=$(b[h]),e=this.getSource(h,g,null,!0),c.attr("data-index",h),this.photosAnimate.push({animate:a.newInstance(c,e,!0),target:c,source:e,setting:g})},create:function(){var b=this.album,d=b.data("album"),e=b.data("in"),f=$(b.data("root")||"body");this.options=$.extend(!0,this.options,d),this.ready=!1,this.root=f,this.resetPhotoBox(),e&&(this.albumAnimate=a.newInstance(this.album,e,!0)),d.thumbnail?(this.thumbnail.removeClass("hide"),this.photoBox.addClass("hide")):(this.thumbnail.addClass("hide"),this.photoBox.removeClass("hide")),this.parsePhotos(),c.setActionHook(this.album),c.injectAction(m)},resetPhotoBox:function(){var a=this.root.offset();this.photoBox.css({width:a.width+"px",height:a.height+"px",position:"absolute",left:"0px",top:"0px"}),this.photos.css({width:a.width+"px",height:a.height+"px",position:"absolute",left:"0px",top:"0px",zIndex:"2"}),this.offset=g.HORZIONTAL==this.options.direction?a.width:a.height},loadPhotos:function(){var a=this.photosAnimate,b=a.length,c=null,d=0,e=null;this.queue=[],this.update(this.lastIndex,this.lastIndex,null);for(var f=this.lastIndex;f>=0;f--)this.queue.push(f);for(var f=0;b>f;f++)c=a[f],e=c.animate,e.set("complete",{callback:function(a,b,c){"in"==b&&(++d,d==c&&(this.ready=!0,this.exec("ready",[])))},context:this,args:["in",b,f]}).play()},load:function(){var a=this.options.thumbnail;this.albumAnimate?this.albumAnimate.set("complete",{callback:function(){this.options.thumbnail||this.loadPhotos()},context:this}).play():a||this.loadPhotos(),a||this.exec("loading",[])}},module.exports={newInstance:function(a,b){var c=new n(a,b);return{set:function(a,b){return c.set(a,b),this},load:function(){return c.load(),this}}}}});
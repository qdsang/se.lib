/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){function a(a){return e===!1?!1:""===e?a:e+a.charAt(0).toUpperCase()+a.substr(1)}require("mod/se/raf.f12274d2329a19c00b6b3a12a35ba1e3bace9239");var b=require("mod/sa/tween.84e1cc16938f38aa217f72977be085580be35bba"),c=$.Util=require("mod/se/util.5418ba8bf71f527f29091bc874d170aac4af716b"),d=document.createElement("div").style,e=function(){for(var a,b=["t","webkitT","MozT","msT","OT"],c=0,e=b.length;e>c;c++)if(a=b[c]+"ransform",a in d)return b[c].substr(0,b[c].length-1);return!1}(),f=function(a){this.selector=a,this.container=$(a),this.stage=null,this.context=null,this.rAF=null,this.angle=0,this.startTime=0,this.beginAngle=0,this.endAngle=360,this.changeAngle=this.endAngle-this.beginAngle,this.duration=1e3,this.image=null,this.prizes=[],this.complete=null,this.isRunning=!1,this.centerX=0,this.centerY=0,this.x=0,this.y=0,this.width=0,this.height=0,this.preparing=!1};f.prototype={setTweenParameter:function(a,b,c){this.beginAngle=a,this.endAngle=b,this.changeAngle=this.endAngle-this.beginAngle,this.duration=c},setPrizeList:function(a){this.prizes=a},addResource:function(a,b,c,d,e,f,g){var h="position:absolute; left:"+c+"px; top:"+d+"px; width:"+f+"px; height:"+g+"px;background:transparent url("+b+") no-repeat left top; background-size:100% 100%;z-index:"+e+";",i='<div id="'+a+'" style="'+h+'"></div>';this.container.append(i)},addRotatingBody:function(a,b,c,d,e,f){var g="position:absolute; left:"+b+"px; top:"+c+"px;z-index:"+d+";",h='<canvas id="'+a+'" style="'+g+'" width="'+e+'" height="'+f+'"></canvas>';this.container.append(h),this.stage=$("#"+a)[0],this.context=this.stage.getContext("2d")},setAction:function(a,b){$("#"+a).attr("data-action","Action://"+(b||"nul"))},setComplete:function(a){this.complete=a||null},setCenterCoordinates:function(a,b){this.centerX=a,this.centerX=b},setPreparing:function(a){this.preparing=a,this.startTime=(new Date).getTime()},paint:function(a,b,c,d,e){var f=new Image,g=this,h=g.stage,i=g.context;g.x=b,g.y=c,g.width=d,g.height=e,f.onload=function(){i.clearRect(b,c,h.width,h.height),i.drawImage(f,b,c)},f.src=a,this.image=f},repaintContext:function(a){var b=Math.PI/180,c=this.context,d=this.stage,e=d.width,f=d.height,g=this.centerX,h=this.centerX;this.angle=a,a=a%360*b,console.info(a),c.translate(g,h),c.rotate(a),c.translate(-g,-h),c.clearRect(0,0,e,f),c.drawImage(this.image,this.x,this.y)},repaintStage:function(b){var c=this.centerX,d=this.centerX;"number"==typeof c&&(c+="px"),"number"==typeof d&&(d+="px"),this.angle=b,this.stage.style[a("transform")]="rotate("+b%360+"deg)",this.stage.style[a("transformOrigin")]=c+" "+d},rotatePreparing:function(){var a=(new Date).getTime(),c=a-this.startTime;this.isRunning=!0;var d=b.Liner.easeOut(c,this.beginAngle,this.changeAngle,this.duration);this.repaintStage(~~(10*d)/10),c>this.duration&&(c=0,this.startTime=a)},rotate:function(){var a=(new Date).getTime(),d=a-this.startTime;this.isRunning=!0;var e=b.Sine.easeOut(d,this.beginAngle,this.changeAngle,this.duration);this.repaintStage(~~(10*e)/10),d>this.duration&&(this.rAF=void 0,this.isRunning=!1,c.execAfterMergerHandler(this.complete,[this.prizes,this.angle]))},run:function(){var a=this;a.preparing?a.rotatePreparing():a.rotate(),void 0!==a.rAF?this.rAF=window.requestAnimationFrame(function(){a.run()}):a.rAF=null},start:function(){this.rAF||!1!==this.isRunning||(this.startTime=(new Date).getTime(),this.run())}},module.exports=function(a){var b=new f(a),c={setTweenParameter:function(a,c,d){return b.setTweenParameter(a,c,d),this},setPrizeList:function(a){return b.setPrizeList(a),this},setComplete:function(a){return b.setComplete(a),this},setCenterCoordinates:function(a,c){return b.setCenterCoordinates(a,c),this},setPreparing:function(a){return b.setPreparing(a),this},addResource:function(a,c,d,e,f,g,h){return b.addResource(a,c,d,e,f,g,h),this},addRotatingBody:function(a,c,d,e,f,g){return b.addRotatingBody(a,c,d,e,f,g),this},setAction:function(a,c){return b.setAction(a,c),this},paint:function(a,c,d,e,f){b.paint(a,c,d,e,f)},start:function(){b.start()}};return c}});

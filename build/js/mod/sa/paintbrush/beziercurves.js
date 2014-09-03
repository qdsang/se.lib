/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=require("mod/sa/paintbrush/basebrush"),b=$.Listener,c=function(c){var d=this.brush=new a(c);this.setted=!1,this.listener=new b({onstart:null,ondrawing:null,onend:null}),d.bind(),d.setLineWidth(10),d.setLineJoin("round"),d.setLineCap("round"),d.set("start",{callback:function(a,b){var c=b.context,d=b.getPointerPosition(a);b.isDrawing=!0,!1===this.setted&&(c.lineWidth=b.lineWidth,c.lineJoin=b.lineJoin,c.lineCap=b.lineCap,this.setted=!0),b.addPoint(d.x,d.y),this.exec("start",[a,b])},context:this}),d.set("end",{callback:function(a,b){b.isDrawing=!1,b.clearPoints(),this.exec("end",[a,b])},context:this}),d.set("drawing",{callback:function(a,b){var c=b.context,d=b.getPointerPosition(a),e=d.x,f=d.y,g=null;if(b.isDrawing){b.addPoint(e,f);var h=b.getPoint(0),i=b.getPoint(1);c.beginPath(),c.moveTo(h.x,h.y);for(var j=1,k=b.points.length;k>j;j++)g=b.calcMiddlePointBetween(h,i),c.quadraticCurveTo(h.x,h.y,g.x,g.y),h=b.getPoint(j),i=b.getPoint(j+1);c.lineTo(h.x,h.y),c.stroke()}this.exec("drawing",[a,b])},context:this})};c.prototype={exec:function(a,b){return this.listener.exec(a,b)},set:function(a,b){this.listener.set(a,b)},remove:function(a){this.listener.remove(a)},get:function(a){return this.listener.get(a)},clear:function(){this.listener.clear()}};var d={createPaintBrush:function(a){var b=new c(a);return b}};module.exports=d});
/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=function(a,b,c){this.x=a,this.y=b,this.z=c};a.prototype={copy:function(){return new a(this.x,this.y,this.z)},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)},sqrLength:function(){return this.x*this.x+this.y*this.y+this.z*this.z},normalize:function(){var b=1/this.length();return new a(this.x*b,this.y*b,this.z*b)},negate:function(){return new a(-this.x,-this.y,-this.z)},add:function(b){return new a(this.x+b.x,this.y+b.y,this.z+b.z)},subtract:function(b){return new a(this.x-b.x,this.y-b.y,this.z-b.z)},multiply:function(b){return new a(this.x*b,this.y*b,this.z*b)},divide:function(b){var c=1/b;return new a(this.x*c,this.y*c,this.z*c)},dot:function(a){return this.x*a.x+this.y*a.y+this.z*a.z},cross:function(b){return new a(-this.z*b.y+this.y*b.z,this.z*b.x-this.x*b.z,-this.y*b.x+this.x*b.y)}},a.ZERO=new a(0,0,0),module.exports=a});
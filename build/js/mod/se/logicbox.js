/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=$.Util=require("mod/se/util"),b=".js-logicbox",c={},d='<div class="flexbox center middle logicbox-stage hide '+b.substr(1)+'">  <figure class="box logicbox-panel">    <!-- dynamic html -->  </figure>  <div class="logicbox-mask"></div></div>',e=null,f=null,g={maskclose:1,tpl:function(a,b){var d=c[a];return d||(d=$(b).html(),c[a]=d),d},size:function(a){var c=$(b+" .logicbox-panel");return c.length>0&&c.css(a),this},text:function(a){var c=$(b+" .logicbox-panel");return c.length>0&&c.html(a),this},callback:function(a){return a=a||{},e=a.show||null,f=a.hide||null,this},visible:function(c){var d=$(b);d.length>0&&(!0===c?(d.removeClass("hide"),a.execHandler(e)):(d.addClass("hide"),a.execHandler(f)))},show:function(){this.visible(!0)},hide:function(){this.visible(!1)}};$(function(){var c=$(b);0==c.length&&$("body").append(d),c=null,setTimeout(function(){var c=$(b+" .logicbox-mask");c.length>0&&c.on(a.CLICK_EVENT,function(a){a.preventDefault(),a.stopPropagation(),!0===g.maskclose&&g.hide()})},0)}),module.exports=g});
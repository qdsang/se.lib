/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
!function(a){String.prototype.trim===a&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),Array.prototype.reduce===a&&(Array.prototype.reduce=function(b){if(void 0===this||null===this)throw new TypeError;var c,d=Object(this),e=d.length>>>0,f=0;if("function"!=typeof b)throw new TypeError;if(0==e&&1==arguments.length)throw new TypeError;if(arguments.length>=2)c=arguments[1];else for(;;){if(f in d){c=d[f++];break}if(++f>=e)throw new TypeError}for(;e>f;)f in d&&(c=b.call(a,c,d[f],f,d)),f++;return c})}();
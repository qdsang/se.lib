/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com - Git: https://github.com/zwlijun/se.lib */
define(function(require,exports,module){var a=$.Util=require("mod/se/util.5418ba8bf71f527f29091bc874d170aac4af716b"),b=$.LayerBox=require("mod/se/layerbox.d35d084b8c3b144b87471da5d1848eff7afbf4a0"),c=$.DateUtil=require("mod/se/dateutil.362d6ba735f421c608cbd89c7caa041b11f81431"),d=".js-uploadbox",e='<div class="flexbox center middle upload-stage hide '+d.substr(1)+'">  <div class="box upload-panel">    <form name="upload_form" id="upload_form" enctype="multipart/form-data" method="POST" action="/jbin/upload">      <figure class="flexbox middle upload-head">        <dl class="flexbox upload-choose">          <dt class="flexbox center middle upload-drag" id="upload_ddzone">文件拖放区域</dt>          <dd class="upload-operates">            <div class="upload-operate"><input type="file" name="uploadfiles" id="uploadfiles" multiple="multiple" /></div>            <div class="upload-operate"><button type="button" class="blue-button js-uploadall" data-action="Action://upload#all" id="upload_all">上&nbsp;&nbsp;传</button><button type="button" class="white-button js-cancelall" data-action="Action://cancel#all" id="cancel_all">取&nbsp;&nbsp;消</button></div>          </dd>        </dl>      </figure>      <div class="upload-files" id="uploadFileList">        <!-- dynamic html -->      </div>      <div class="upload-message" id="upload_status">初始化</div>    </form>  </div>  <div class="upload-mask" data-action="Action://hideUploadStage"></div></div>',f='<dl class="flexbox middle upload-file js-file${fileKey}" id="file_${fileIndex}">  <dt class="flexbox center middle upload-thumbnails"><!--缩略图-->${thumb}</dt>  <dd class="upload-attrs">    <p>Name: ${name}</p>    <p>Type: ${type}</p>    <p>Size: ${fileSize}</p>    <p>Last Modified: $!{lastModifiedFormat}</p>  </dd>  <dd class="upload-progress">    <div class="upload-line">      <a href="#" data-action="Action://upload#${fileIndex}" class="js-upload${fileKey}">上传</a>      <span>|</span>      <a href="#" data-action="Action://cancel#${fileIndex}" class="js-cancel${fileKey}">取消</a>      <span>|</span>      <a href="#" data-action="Action://remove#${fileIndex}" class="js-remove${fileKey}">移除</a>    </div>    <div class="progress">      <div class="progress-percent js-progressbar${fileKey}" style="width:0%">&nbsp;</div>      <div class="progress-number js-progress${fileKey}"></div>    </div>  </dd></dl>',g=!1,h=0,i=[],j=0,k=0,l=function(){};l.prototype={uploading:!1,xhr:null,setPercent:function(a,b){a=o.getServiceKey(a);var c=$(".js-progressbar"+a),d=$(".js-progress"+a);c.css("width",b),d.html(b)},start:function(b,c){var d=this.xhr=new XMLHttpRequest,e=this,f=o.heads,g=null;e.setPercent(b,"0%"),d.open("POST","/jbin/upload",!0);for(var h=0,i=f.length;i>h;h++)g=f[h],d.setRequestHeader(g.name,g.value);d.onload=function(){e.uploading=!1,o.updateUploadStatus(b,"uploaded"),a.execAfterMergerHandler(o.handler.loaded,[b,e])},d.onreadystatechange=function(){var c=d.status,f=d.readyState;if(e.uploading=!0,4==f)if(--k,c>=200&&300>c){var g=JSON.parse(d.responseText||"{}");e.uploading=!1,o.setUploadStatus("uploaded"),a.execAfterMergerHandler(o.handler.complete,[b,e,g])}else e.uploading=!1,o.setUploadStatus("net"),a.execAfterMergerHandler(o.handler.net,[b,e])},d.onabort=function(){--k,e.uploading=!1,o.updateUploadStatus(b,"abort"),a.execAfterMergerHandler(o.handler.abort,[b,e])},d.upload.onprogress=function(c){if(e.uploading=!0,o.updateUploadStatus(b,"uploading"),o.setUploadStatus("uploading"),c.lengthComputable){var f=c.loaded/c.total*100|0,g=f+"%";c.total>o.maxsize?d.abort():e.setPercent(b,g),a.execAfterMergerHandler(o.handler.progress,[b,e,g])}},d.send(c),e.uploading=!0,o.updateUploadStatus(b,"uploading")},abort:function(){this.xhr&&!0===this.uploading&&(this.xhr.abort(),o.setUploadStatus("abort"))},destory:function(){var a=this.xhr;a&&(a.onload=null,a.onabort=null,a.onreadystatechange=null,a.upload.onprogress=null,a=this.xhr=null)}};var m={Service:{},FormData:{},startAll:function(){var a=o.single,b=!1;if(!0===a){for(var c in this.Service)this.Service.hasOwnProperty(c)&&(this.start(c),b=!0);b||o.setUploadStatus("choose")}else this.start("all")},start:function(a){var b=o.getServiceKey(a),c=this.Service[b],d=this.FormData[b];c?c.start(a,d):o.setUploadStatus("choose")},cancelAll:function(){for(var a in this.Service)this.Service.hasOwnProperty(a)&&this.cancel(a)},cancel:function(a){var b=o.getServiceKey(a),c=this.Service[b];c&&(c.abort(),c.destory(),c.uploading=!1)},removeAll:function(){for(var a in this.Service)this.Service.hasOwnProperty(a)&&this.remove(a)},remove:function(a){var b=o.getServiceKey(a),c=this.Service[b];c&&(this.cancel(a),o.single?--j:j=0,--k,delete this.Service[b],delete this.FormData[b])}},n={upload:function(a){o.checkEnv()?j>o.maxupload?o.setUploadStatus("maxupload",{count:j,max:o.maxupload}):"all"==a?m.startAll():m.start(a):o.setUploadStatus("unsupport")},cancel:function(a){"all"==a?m.cancelAll():m.cancel(a)},remove:function(a){n.cancel(a),!0!==o.single?($(".js-file"+o.getServiceKey(a)).remove(),i=[],m.removeAll()):($("#file_"+a).remove(),i.splice(a,1),m.remove(a))},hideUploadStage:function(){0>=k?o.hide():b.data({title:"X-Upload Confirm",content:"确认退出吗？退出后将取消所有任务。",btns:[{label:"确定",callback:function(){o.hide(),b.hide()}},{label:"取消",callback:function(){b.hide()}}]}).show()}},o={filter:/^(image\/jpeg|image\/jpg|image\/gif|image\/png|image\/bmp)$/i,maxupload:10,maxsize:2*Math.pow(2,20),single:!0,heads:[],handler:{show:null,hide:null,loaded:null,net:null,complete:null,abort:null,progress:null},status:{init:"初始化",choose:"请选择文件",uploading:"上传中...",uploaded:"上传完毕",abort:"取消上传",net:"网络请求异常",maxupload:"超出单次最大上传数(${count}, ${max})",unsupport:"当前浏览器不支持，建议使用chrome浏览器",complete:"上传完成$!{cause}(失败：${failed}, 成功：${success})"},setUploadStatus:function(b,c){var d=c||null;$("#upload_status").html(a.formatData(this.status[b],d))},updateUploadStatus:function(a,b){a=this.getServiceKey(a);var c=null,d="data-action",e="上传中...",f="重新上传",g="上传",h=$(".js-uploadall"),c=$(".js-upload"+a),i="Action://upload#",j=i+"all";"uploading"==b?(h.removeAttr(d),c.removeAttr(d),h.html(e),c.html(e)):"uploaded"==b||"abort"==b?(k>0?(h.removeAttr(d),h.html(e)):(h.attr(d,j),h.html(f)),c.attr(d,i+a),c.html(f)):(h.attr(d,j),h.html(g),"all"!=a&&(c.attr(d,i+a),c.html(g)))},checkEnv:function(){return!!(window.File&&window.FileReader&&window.FileList&&window.FormData&&window.Blob)},isImage:function(a){switch(a){case"image/jpeg":case"image/png":case"image/gif":case"image/jpg":case"image/bmp":return!0}return!1},getFileSize:function(a){var b=Math.pow(2,10),c=Math.pow(2,20),d=Math.pow(2,30),e=Math.pow(2,40),f=a+"Bytes";return a>=e?f=Math.ceil(a/e)+"TB":a>=d?f=Math.ceil(a/d)+"GB":a>=c?f=Math.ceil(a/c)+"MB":a>=b&&(f=Math.ceil(a/b)+"KB"),f},getServiceKey:function(a){var b=a;return!0!==this.single&&(b="all"),b},regist:function(a,b){var c=this.getServiceKey(a);m.Service[c]||(m.Service[c]=new l,m.FormData[c]=new FormData),m.FormData[c].append("files_"+a,b)},output:function(b){for(var d=b.length,e=null,g=null,l=null,m=null,n=0,p=0;d>p;p++)e=b[p],g=e.type||"unknown",e.size>o.maxsize||!o.filter.test(g)||(l=new FileReader,e.lastModifiedDate&&(e.lastModifiedFormat=c.format(e.lastModifiedDate,"%d/%M/%y %h:%m:%s")),e.fileIndex=h,e.fileSize=o.getFileSize(e.size),e.fileKey=o.getServiceKey(""+h),m=a.formatData(f,e),this.regist(e.fileKey,e),h++,k++,j++,!0!==o.single&&(k=1),o.isImage(g)?(l.onload=function(b){return function(c){b=a.formatData(b,{thumb:'<img src="'+c.target.result+'" width="100%" height="100%" />'}),i.push(b),n++}}(m),l.readAsDataURL(e)):(m=a.formatData(m,{thumb:"Thumb."}),i.push(m),n++));var q=setInterval(function(){n>=d&&(clearInterval(q),o.flush())})},bindDropDrag:function(){var a=$("#upload_ddzone");a.on("dragover",function(b){b.stopPropagation(),b.preventDefault(),b.dataTransfer.dropEffect="copy",a.addClass("upload-dragenter")}),a.on("drop",function(b){b.stopPropagation(),b.preventDefault(),a.removeClass("upload-dragenter");var c=b.dataTransfer.files;o.output(c)}),$("#uploadfiles").on("change",function(a){a.preventDefault(),a.stopPropagation();var b=a.target.files;o.output(b)})},flush:function(){$("#uploadFileList").html(i.join(""))},visible:function(b){var c=$(d),e=document.getElementById("upload_form");h=0,j=0,k=0,i=[],e&&e.reset(),m.removeAll(),this.flush(),c.length>0&&(!0===b?this.checkEnv()?(this.updateUploadStatus("all"),c.removeClass("hide"),a.execAfterMergerHandler(this.handler.showHandler,[g])):this.setUploadStatus("unsupport"):(c.addClass("hide"),a.execAfterMergerHandler(this.handler._hideHandler,[g])))},show:function(){this.setUploadStatus("init"),this.visible(!0)},hide:function(){this.visible(!1)}};$(function(){var b=$(d);0==b.length&&$("body").append(e),b=null,setTimeout(function(){o.bindDropDrag(),a.setActionHook(),a.injectAction(n)},0)});var p={setUploadStatus:function(a,b){o.setUploadStatus(a,b)},show:function(){return o.show(),this},hide:function(){return o.hide(),this},listen:function(a){a=a||{};var b=a.single;return o.maxupload=a.maxupload||"10",o.maxsize=a.maxsize||2*Math.pow(2,20),o.single="boolean"==typeof b?b:!0,o.heads=a.heads||[],o.handler.show=a.show||null,o.handler.hide=a.hide||null,o.handler.loaded=a.loaded||null,o.handler.complete=a.complete||null,o.handler.net=a.net||null,o.handler.abort=a.abort||null,o.handler.progress=a.progress||null,this}};module.exports=p});

/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 文件上传模块，仅支持XMLHttpReqeust Level 2
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function Upload(require, exports, module){
    var Util     = $.Util     = require("mod/se/util");
    var LayerBox = $.LayerBox = require("mod/se/layerbox");
    var DateUtil = $.DateUtil = require("mod/se/dateutil");

    //选择器
    var _selector = ".js-uploadbox";
    //html结构
    var _html = ''
              + '<div class="flexbox center middle upload-stage hide ' + (_selector.substr(1)) + '">'
              + '  <div class="box upload-panel">'
              + '    <form name="upload_form" id="upload_form" enctype="multipart/form-data" method="POST" action="/jbin/upload">'              
              + '      <figure class="flexbox middle upload-head">'
              + '        <dl class="flexbox upload-choose">'
              + '          <dt class="flexbox center middle upload-drag" id="upload_ddzone">文件拖放区域</dt>'
              + '          <dd class="upload-operates">'
              + '            <div class="upload-operate"><input type="file" name="uploadfiles" id="uploadfiles" multiple="multiple" /></div>'
              + '            <div class="upload-operate"><button type="button" class="blue-button js-uploadall" data-action="Action://upload#all" id="upload_all">上&nbsp;&nbsp;传</button><button type="button" class="white-button js-cancelall" data-action="Action://cancel#all" id="cancel_all">取&nbsp;&nbsp;消</button></div>'
              + '          </dd>'
              + '        </dl>'
              + '      </figure>'
              + '      <div class="upload-files" id="uploadFileList">'
              + '        <!-- dynamic html -->'
              + '      </div>'
              + '      <div class="upload-message" id="upload_status">初始化</div>'
              + '    </form>'
              + '  </div>'
              + '  <div class="upload-mask" data-action="Action://hideUploadStage"></div>'
              + '</div>';              
    //文件信息HTML结构              
    var _file = ''
              + '<dl class="flexbox middle upload-file js-file${fileKey}" id="file_${fileIndex}">'
              + '  <dt class="flexbox center middle upload-thumbnails"><!--缩略图-->${thumb}</dt>'
              + '  <dd class="upload-attrs">'
              + '    <p>Name: ${name}</p>'
              + '    <p>Type: ${type}</p>'
              + '    <p>Size: ${fileSize}</p>'
              + '    <p>Last Modified: $!{lastModifiedFormat}</p>'
              + '  </dd>'
              + '  <dd class="upload-progress">'
              + '    <div class="upload-line">'
              + '      <a href="#" data-action="Action://upload#${fileIndex}" class="js-upload${fileKey}">上传</a>'
              + '      <span>|</span>'
              + '      <a href="#" data-action="Action://cancel#${fileIndex}" class="js-cancel${fileKey}">取消</a>'
              + '      <span>|</span>'
              + '      <a href="#" data-action="Action://remove#${fileIndex}" class="js-remove${fileKey}">移除</a>'
              + '    </div>'
              + '    <div class="progress">'
              + '      <div class="progress-percent js-progressbar${fileKey}" style="width:0%">&nbsp;</div>'
              + '      <div class="progress-number js-progress${fileKey}"></div>'
              + '    </div>'
              + '  </dd>'
              + '</dl>'; 

    var uploading = false;
    var fileIndex = 0;
    var _htmlFileList = [];
    var _fileCount = 0;
    var _serviceCount = 0;

    //上传服务
    var Service = function(){
        //
    };

    Service.prototype = {
        uploading : false,
        xhr : null,
        setPercent : function(key, percent){
            key = _Upload.getServiceKey(key);

            var pb = $(".js-progressbar" + key);
            var pn = $(".js-progress" + key);

            pb.css("width", percent);
            pn.html(percent);
        },        
        start : function(key, formData){
            var xhr = this.xhr = new XMLHttpRequest();
            var S = this;
            var heads = _Upload.heads;
            var head = null;

            S.setPercent(key, "0%");

            xhr.open("POST", "/jbin/upload", true);

            for(var i = 0, size = heads.length; i < size; i++){
                head = heads[i];
                xhr.setRequestHeader(head.name, head.value);
            }

            xhr.onload = function(){
                S.uploading = false;
                _Upload.updateUploadStatus(key, "uploaded");
                Util.execAfterMergerHandler(_Upload.handler.loaded, [key, S]);
            };

            xhr.onreadystatechange = function(){
                var status = xhr.status;
                var state = xhr.readyState;
                S.uploading = true;

                if(4 == state){
                    --_serviceCount;
                    if(status >= 200 && status < 300){
                        var resp = JSON.parse(xhr.responseText||"{}");
                        //todo
                        S.uploading = false;                        
                        _Upload.setUploadStatus("uploaded");
                        Util.execAfterMergerHandler(_Upload.handler.complete, [key, S, resp]);
                    }else{
                        S.uploading = false;
                        _Upload.setUploadStatus("net");
                        //http error
                        Util.execAfterMergerHandler(_Upload.handler.net, [key, S]);
                    }
                }
            };

            xhr.onabort = function(){
                --_serviceCount;
                S.uploading = false;                
                _Upload.updateUploadStatus(key, "abort");
                Util.execAfterMergerHandler(_Upload.handler.abort, [key, S]);
            }

            xhr.upload.onprogress = function(e){
                S.uploading = true;    
                _Upload.updateUploadStatus(key, "uploading");
                _Upload.setUploadStatus("uploading");

                if(e.lengthComputable){                    
                    var i = (e.loaded / e.total * 100 | 0);
                    var percent = i + "%";

                    if(e.total > _Upload.maxsize){
                        xhr.abort();
                    }else{
                        S.setPercent(key, percent);                        
                    }

                    //progress
                    Util.execAfterMergerHandler(_Upload.handler.progress, [key, S, percent]);
                }
            }

            xhr.send(formData);
            S.uploading = true;
            _Upload.updateUploadStatus(key, "uploading");
        },
        abort : function(){
            if(this.xhr && true === this.uploading){
                this.xhr.abort();
                _Upload.setUploadStatus("abort");
            }
        },
        destory : function(){
            var xhr = this.xhr;
            if(xhr){
                xhr.onload = null;
                xhr.onabort = null;
                xhr.onreadystatechange = null;
                xhr.upload.onprogress = null;
                xhr = this.xhr = null;
            }
        }
    };

    //上传服务MAP
    var ServiceMap = {
        Service : {
            /*<indexKey>:Service service*/
        },
        FormData : {
            /*<indexKey>:FormData formData*/
        },
        startAll : function(){
            var formData = null;
            var service = null;
            var isSingle = _Upload.single;
            var flag = false;

            if(true === isSingle){
                for(var key in this.Service){
                    if(this.Service.hasOwnProperty(key)){ 
                        this.start(key);
                        flag = true;
                    }
                }

                if(!flag){
                    _Upload.setUploadStatus("choose");
                }
            }else{                
                this.start("all");
            }
        },
        start : function(key){
            var serviceKey = _Upload.getServiceKey(key);
            var service = this.Service[serviceKey];
            var formData = this.FormData[serviceKey];

            if(service){
                service.start(key, formData);
            }else{
                _Upload.setUploadStatus("choose");
            }
        },
        cancelAll : function(){
            for(var key in this.Service){
                if(this.Service.hasOwnProperty(key)){                      
                    this.cancel(key);
                }
            }
        },
        cancel : function(key){
            var serviceKey = _Upload.getServiceKey(key);
            var Service = this.Service[serviceKey];

            if(Service){
                Service.abort();
                Service.destory();
                Service.uploading = false;
            }
        },
        removeAll : function(){
            for(var key in this.Service){
                if(this.Service.hasOwnProperty(key)){                      
                    this.remove(key);
                }
            }
        },
        remove : function(key){
            var serviceKey = _Upload.getServiceKey(key);
            var Service = this.Service[serviceKey];

            if(Service){
                this.cancel(key);
                
                if(_Upload.single){
                    --_fileCount;
                }else{
                    _fileCount = 0;
                }
                --_serviceCount;
                delete this.Service[serviceKey];
                delete this.FormData[serviceKey];
            }
        }
    };

    //操作
    var _Action = {
        upload : function(index){
            if(!_Upload.checkEnv()){
                _Upload.setUploadStatus("unsupport");
            }else{ 
                if(_fileCount > _Upload.maxupload){
                    _Upload.setUploadStatus("maxupload", {count:_fileCount, max:_Upload.maxupload});
                }else{
                    if("all" == index){
                        ServiceMap.startAll();
                    }else{
                        ServiceMap.start(index);
                    }
                }
            }
        },
        cancel : function(index){
            if("all" == index){
                ServiceMap.cancelAll();
            }else{
                ServiceMap.cancel(index);
            }
        },
        remove : function(index){
            _Action.cancel(index);

            if(true !== _Upload.single){
                $(".js-file" + _Upload.getServiceKey(index)).remove();
                _htmlFileList = [];
                ServiceMap.removeAll();
            }else{
                $("#file_" + index).remove();
                _htmlFileList.splice(index, 1);
                ServiceMap.remove(index);
            }
        },
        hideUploadStage : function(){
            if(_serviceCount <= 0){
                _Upload.hide();
            }else{
                //todo
                LayerBox.data({
                    "title" : "X-Upload Confirm",
                    "content" : "确认退出吗？退出后将取消所有任务。",
                    "btns" : [
                        {"label" : "确定", "callback" : function(){
                            _Upload.hide();
                            LayerBox.hide();
                        }},
                        {"label" : "取消", "callback" : function(){
                            LayerBox.hide();
                        }}
                    ]
                }).show();
            }
        }
    };

    var _Upload = {
        filter : /^(image\/jpeg|image\/jpg|image\/gif|image\/png|image\/bmp)$/i,
        maxupload : 10,
        maxsize : Math.pow(2, 20) * 2,
        single : true,
        heads : [],
        //上传回调句柄
        handler : {
            show : null,      //[uploading]
            hide : null,      //[uploading]
            loaded : null,    //[fileIndexKey, Service]
            net : null,       //[fileIndexKey, Service]
            complete : null,  //[fileIndexKey, Service, response]
            abort : null,     //[fileIndexKey, Service]
            progress : null   //[fileIndexKey, Service, percent]
        },
        status : {
            "init" : "初始化",
            "choose" : "请选择文件",
            "uploading" : "上传中...",
            "uploaded" : "上传完毕",
            "abort" : "取消上传",
            "net" : "网络请求异常",
            "maxupload" : "超出单次最大上传数(${count}, ${max})",
            "unsupport" : "当前浏览器不支持，建议使用chrome浏览器",
            "complete" : "上传完成$!{cause}(失败：${failed}, 成功：${success})"
        },
        /**
         * 设置上传状态
         * @param String status
         */
        setUploadStatus : function(status, data){
            var meta = data || null;
            $("#upload_status").html(Util.formatData(this.status[status], meta));
        },
        updateUploadStatus : function(key, status){
            key = this.getServiceKey(key);

            var up = null;
            var attr = "data-action";
            var uploading = "上传中...";
            var uploaded = "重新上传";
            var upload = "上传";
            var all = $(".js-uploadall");
            var up = $(".js-upload" + key);

            var action = "Action://upload#";
            var actionAll = action + 'all';
            
            if("uploading" == status){
                all.removeAttr(attr);
                up.removeAttr(attr);
                all.html(uploading);
                up.html(uploading);
            }else if("uploaded" == status || "abort" == status){
                if(_serviceCount > 0){
                    all.removeAttr(attr);
                    all.html(uploading);
                }else{
                    all.attr(attr, actionAll);
                    all.html(uploaded);
                }
                up.attr(attr, action + key);                
                up.html(uploaded);
            }else{
                all.attr(attr, actionAll);
                all.html(upload);

                if(key != "all"){
                    up.attr(attr, action + key);                
                    up.html(upload);
                }
            }
        },
        /**
         * 检测环境是否支持
         * @return Boolean true/fasle
         */
        checkEnv : function(){
            return !!(window.File && window.FileReader && window.FileList && window.FormData && window.Blob);
        },
        /**
         * 是否为图片
         * @param String type
         * @return Boolean image
         */
        isImage : function(type){
            switch(type){
                case "image/jpeg":
                case "image/png":
                case "image/gif":
                case "image/jpg":
                case "image/bmp":
                    return true;
            }

            return false;
        },
        /**
         * 获取文件大小
         * @param int size 字节数
         * @return String size 转换后带单位的大小
         */
        getFileSize : function(size){
            var KB = Math.pow(2, 10);           
            var MB = Math.pow(2, 20);
            var GB = Math.pow(2, 30);
            var TB = Math.pow(2, 40);

            var str = size + "Bytes";

            if(size >= TB){
                str = Math.ceil((size / TB)) + "TB";
            }else if(size >= GB){
                str = Math.ceil((size / GB)) + "GB";
            }else if(size >= MB){
                str = Math.ceil((size / MB)) + "MB";
            }else if(size >= KB){
                str = Math.ceil((size / KB)) + "KB";
            }

            return str;
        },
        /**
         * 获取Service的key
         * @param String key
         * @return String registKey
         */
        getServiceKey : function(key){
            var registKey = key;

            if(true !== this.single){
                registKey = "all";
            }

            return registKey;
        },
        /**
         * 注册Service及文件
         */
        regist : function(key, file){
            //注册
            var registKey = this.getServiceKey(key);

            if(!ServiceMap.Service[registKey]){
                ServiceMap.Service[registKey] = new Service();
                ServiceMap.FormData[registKey] = new FormData();
            }

            ServiceMap.FormData[registKey].append("files_" + key, file);
        },
        /**
         * 输出文件
         * @param FileList files 文件列表
         */
        output : function(files){
            var len = files.length;
            var file = null;
            var fileType = null;
            var reader = null;
            var fileInfo = null;
            var count = 0;

            for(var i = 0; i < len; i++){
                file = files[i];
                fileType = file.type || "unknown";

                if(file.size > _Upload.maxsize || !_Upload.filter.test(fileType)){
                    continue;
                }

                
                reader = new FileReader();
                
                if(file.lastModifiedDate){
                    file.lastModifiedFormat = DateUtil.format(file.lastModifiedDate, "%d/%M/%y %h:%m:%s");
                }

                file.fileIndex = fileIndex;
                file.fileSize = _Upload.getFileSize(file.size);
                file.fileKey = _Upload.getServiceKey("" + fileIndex);

                fileInfo = Util.formatData(_file, file);

                this.regist(file.fileKey, file);

                fileIndex++;

                _serviceCount++;
                _fileCount++;
                if(true !== _Upload.single){
                    _serviceCount = 1;
                }

                if(_Upload.isImage(fileType)){
                    reader.onload = (function(_fileInfo){
                        return function(e){
                            _fileInfo = Util.formatData(_fileInfo, {                                    
                                "thumb" : '<img src="' + e.target.result + '" width="100%" height="100%" />'
                            });

                            _htmlFileList.push(_fileInfo);
                            count++;
                        }
                    })(fileInfo);
                    reader.readAsDataURL(file);
                }else{
                    fileInfo = Util.formatData(fileInfo, {
                        "thumb" : 'Thumb.'
                    });

                    _htmlFileList.push(fileInfo);
                    count++;
                }
            }

            var timer = setInterval(function(){
                if(count >= len){
                    clearInterval(timer);

                    _Upload.flush();
                }
            });
        },
        /**
         * 绑定拖拽上传
         */
        bindDropDrag : function(){
            var zone = $("#upload_ddzone");

            zone.on("dragover", function(e){
                e.stopPropagation();
                e.preventDefault();

                e.dataTransfer.dropEffect = 'copy';
                zone.addClass("upload-dragenter");
            });

            zone.on("drop", function(e){
                e.stopPropagation();
                e.preventDefault();

                zone.removeClass("upload-dragenter");

                var files = e.dataTransfer.files;                
                
                _Upload.output(files);                
            });

            $("#uploadfiles").on("change", function(e){
                e.preventDefault();
                e.stopPropagation();

                var files = e.target.files;

                _Upload.output(files);
            });
        },
        /**
         * 从缓存里输出
         */
        flush : function(){
            $("#uploadFileList").html(_htmlFileList.join(""));
        },  

        /**
         * 显示或隐藏 
         * @param Boolean visible 是否显示
         */
        visible : function(visible){
            var o = $(_selector);
            var upf = document.getElementById("upload_form");

            fileIndex = 0;
            _fileCount = 0;
            _serviceCount = 0;
            _htmlFileList = [];

            (upf && upf.reset());
            ServiceMap.removeAll();            
            this.flush();

            if(o.length > 0){
                if(true === visible){                    
                    if(!this.checkEnv()){
                        this.setUploadStatus("unsupport");
                    }else{
                        this.updateUploadStatus("all");
                        o.removeClass("hide");
                        Util.execAfterMergerHandler(this.handler.showHandler, [uploading]);
                    }
                }else{                    
                    o.addClass("hide");                    
                    Util.execAfterMergerHandler(this.handler._hideHandler, [uploading]);
                }
            }
        },
        /**
         * 显示
         */
        show : function(){
            this.setUploadStatus("init");
            this.visible(true);
        },
        /**
         * 隐藏
         */
        hide : function(){
            this.visible(false);
        }
    }

    //--------------------------------------------------------------------------    
    $(function InsertStage(){
        var stage = $(_selector);

        if(stage.length == 0){
            $("body").append(_html);
        }

        stage = null;

        setTimeout(function(){
            _Upload.bindDropDrag();

            Util.setActionHook();
            Util.injectAction(_Action);
        }, 0);
    });
    //---------------------------------------------------------------------
    var _public = {
        setUploadStatus : function(status, meta){
            _Upload.setUploadStatus(status, meta);
        },
        show : function(){
            _Upload.show();

            return this;
        },
        hide : function(){
            _Upload.hide();

            return this;
        },
        listen : function(options){
            options = options || {};
            var _single = options.single;            

            _Upload.maxupload = options.maxupload || "10";
            _Upload.maxsize = options.maxsize || (2 * Math.pow(2, 20));
            _Upload.single = (typeof(_single) == "boolean" ? _single : true);
            _Upload.heads = options.heads || [];
            _Upload.handler.show = options.show || null;
            _Upload.handler.hide = options.hide || null;
            _Upload.handler.loaded = options.loaded || null;
            _Upload.handler.complete = options.complete || null;
            _Upload.handler.net = options.net || null;
            _Upload.handler.abort = options.abort || null;
            _Upload.handler.progress = options.progress || null;

            return this;
        }
    };  

    module.exports = _public;                      
});
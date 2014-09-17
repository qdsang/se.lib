/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 媒体模块
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.4
 */
;define(function Media(require, exports, module){
    $.Util = require("mod/se/util");

    var MediaType = window["MediaType"] = {
        "AUDIO": "audio",
        "VIDEO": "video"
    };

    var MediaMIME = {
        "MP3": {type: "/mpeg", "codec": {"audio":"", "video":""}},
        "MP4": {type: "/mp4", "codec": {"audio":"mp4a.40.5", "video":"avc1.4D401E, mp4a.40.2"}},
        "OGG": {type: "/ogg", "codec": {"audio":"vorbis", "video":"theora, vorbis"}},
        "WAV": {type: "/wav", "codec": {"audio":"", "video":""}},
        "WEBM": {type: "/webm", "codec": {"audio":"", "video":"vp8.0, vorbis"}},
        parse : function(type, src){
            var p = /\.(mp3|mp4|ogg|wav|webm)(\?.*)?$/gi;
            var result = null;
            var format = null;
            var mime = null;

            if(null != (result = p.exec(src))){
                format = result[1].toUpperCase();
                mime = MediaMIME[format];
                mime.type = type + mime.type;

                return mime;
            }else{
                throw new Error(" the media type is not supported, source(" + src + ")");
            }
        }
    };

    //event order:
    //1. loadstart
    //2. durationchange
    //3. loadedmetadata
    //4. loadeddata
    //5. progress
    //6. canplay
    //7. canplaythrough

    var _Media = function(type, name, src, bubble){
        this.type = type || Media.AUDIO;
        this.src = src || "";
        this.name = name || "se_" + this.type;
        this.mime =  MediaMIME.parse(this.type, this.src);
        this.bubble = typeof(bubble) == "boolean" ? bubble : true;
        this.mediaNode = $("#" + this.name);
    };

    _Media.prototype = {
        setProperty : function(name, value){
            this.mediaNode.prop(name, value);
        },
        getProperty : function(name){
            return this.mediaNode.prop(name);
        },
        source : function(src, type){
            var source = $('<source />');

            source.attr("src", src);
            source.attr("type", type);

            this.mediaNode.append(source);
        },

        on : function(){
            this.mediaNode.on.apply(this.mediaNode, arguments);
        },
        off : function(){
            this.mediaNode.off.apply(this.mediaNode, arguments);
        },
        addTextTrack : function(kind, label, language){
            return this.mediaNode[0].addTextTrack(kind, label, language);
        },
        canPlayType : function(type){
            return this.mediaNode[0].canPlayType(type);
        },
        load : function(){
            this.mediaNode[0].load();
        },
        play : function(){
            this.mediaNode[0].play();
        },
        pause : function(){
            this.mediaNode[0].pause();
        },
        cancelBubble : function(e){
            e.stopPropagation();
        },
        insert : function(target, attributes){
            if(this.mediaNode.length == 0){
                this.mediaNode = $('<' + this.type + ' />');

                if(this.canPlayType(this.mime.type)){
                    for(var name in attributes){
                        if(attributes.hasOwnProperty(name)){
                            this.setProperty(name, attributes[name]);
                        }
                    }

                    this.setProperty("id", this.name);
                    this.source(this.src, this.mime.type);
                    this.mediaNode.append("Your browser does not support the " + this.type + " element.");

                    $(target).append(this.mediaNode);

                    $(target).on("touchstart", this.cancelBubble)
                             .on("touchmove", this.cancelBubble)
                             .on("touchend", this.cancelBubble);

                }else{
                    throw new Error("the media dose not support this MIME type(" + this.mime.type + ")");
                }
            }
        }
    };

    var _pub = {
        newInstance : function(type, name, src){
            var ins = new _Media(type, name, src);

            return {
                setProperty : function(name, value){
                    ins.setProperty(name, value);
                },
                getProperty : function(name){
                    return ins.getProperty(name);
                },
                on : function(){
                    ins.on.apply(ins, arguments);
                },
                off : function(){
                    ins.off.apply(ins, arguments);
                },
                addTextTrack : function(kind, label, language){
                    return ins.addTextTrack(kind, label, language);
                },
                canPlayType : function(type){
                    return ins.canPlayType(type);
                },
                load : function(){
                    ins.load();
                },
                play : function(){
                    ins.play();
                },
                pause : function(){
                    ins.pause();
                },
                insert : function(target, attributes){
                    ins.insert(target, attributes);
                }
            };
        }
    };

    module.exports = _pub;
});
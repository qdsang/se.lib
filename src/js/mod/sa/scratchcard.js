/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 刮刮卡模块
 * @charset utf-8
 * @author lijun
 * @date 2014.7
 */
;define(function (require, exports, module){
    var ImageUtil = require("mod/sa/image");
    var Util      = $.Util;

    var ScratchCard = function(canvas){
        this.ImageUtil = null;
        this.stage = canvas;
        this.context = canvas.getContext("2d");
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.touched = false;
        this.offsetX = this.stage.offsetLeft;
        this.offsetY = this.stage.offsetTop;
        this.brushSize = 5;
        this.blurRadius = 40;
        this.complete = null;
        this.scratchText = null;

        this.setStageStyle("background-color", "transparent");
    };

    ScratchCard.prototype = {
        setStageStyle : function(name, property){
            $(this.stage).css(name, property);
        },
        start : function(e){                 
            e.preventDefault();
            e.stopPropagation();

            var offset = $(this.stage).offset();
            this.offsetX = offset.left;
            this.offsetY = offset.top;

            var data = this;
            data.touched = true;
        },
        end : function(e){                 
            e.preventDefault();
            e.stopPropagation();

            var data = this;
            data.touched = false;

            var pixel = data.context.getImageData(data.x, data.y, data.width, data.height).data;

            for(var i = 0, removed = 0, remain = 0, size = pixel.length; i < size; i += 4){
                if(pixel[i] && pixel[i + 1] && pixel[i + 2] && pixel[i + 3]){
                    remain++;
                }else{
                    removed++;
                }
            }

            Util.execAfterMergerHandler(data.complete, [remain, removed]);
        },
        move : function(e){                 
            e.preventDefault();
            e.stopPropagation();

            var data = this;

            if(data.touched){                     
                if(e.changedTouches){                         
                    e = e.changedTouches[e.changedTouches.length - 1];
                }                     
                var x = (e.clientX + document.body.scrollLeft || e.pageX) - data.offsetX || 0;
                var y = (e.clientY + document.body.scrollTop || e.pageY) - data.offsetY || 0;

                console.info("e.clientX: " + e.clientX);
                console.info("e.clientY: " + e.clientY);
                console.info("e.pageX: " + e.pageX);
                console.info("e.pageY: " + e.pageY);
                console.info("data.offsetX: " + data.offsetX);
                console.info("data.offsetY: " + data.offsetY);
                console.info("body.scrollLeft: " + document.body.scrollLeft);
                console.info("body.scrollTop: " + document.body.scrollTop);

                data.context.beginPath()
                data.context.arc(x, y, data.brushSize, 0, Math.PI * 2);
                data.context.fill();
            }             
        },
        mask : function(width, height){
            var canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            return canvas;
        },
        setBrushSize : function(size){
            this.brushSize = size;
        },
        setBlurRadius : function(radius){
            this.blurRadius = radius;
        },
        setComplete : function(handler){
            this.complete = handler || null;
        },
        setScratchText : function(txt){
            //{font, textAlign, textBaseline, color, x, y, text}
            this.scratchText = txt;
        },
        appendText : function(t){
            if(!t) return;

            var ctx = this.context;

            t.text && (ctx.font = t.font);
            t.textAlign && (ctx.textAlign = t.textAlign);
            t.textBaseline && (ctx.textBaseline = t.textBaseline);
            t.color && (ctx.fillStyle = t.color);

            ctx.fillText(t.text, t.x, t.y);
        },
        bind : function(){
            var o = this.stage;
            var ins = this;

            if(Util.CLICK_EVENT == "tap"){
                o.addEventListener("touchstart", function(e){
                    ins.start(e);
                }, false);
                o.addEventListener("touchmove", function(e){
                    ins.move(e);
                }, false);
                o.addEventListener("touchend", function(e){
                    ins.end(e);
                }, false);
            }else{
                o.addEventListener("mousedown", function(e){
                    ins.start(e);
                }, false);
                o.addEventListener("mousemove", function(e){
                    ins.move(e);
                }, false);
                o.addEventListener("mouseup", function(e){
                    ins.end(e);
                }, false);
            }
        },
        paintImage : function(background, frontimage, x, y, width, height){
            this.ImageUtil = new ImageUtil(this.mask(width, height));
            this.x = x;
            this.y = y;
            this.stage.width = this.width = width;
            this.stage.height = this.height = height;

            this.ImageUtil.drawImage(frontimage, {
                callback : function(stage, ctx, imageData, x, y, width, height){
                    var img = this.ImageUtil;

                    img.pixel({
                        callback: img.blur,
                        context: img,
                        args:[this.blurRadius, true]
                    });

                    this.setStageStyle("background-image", "url(" + background + ")");

                    this.context.fillStyle = "transparent";             
                    this.context.fillRect(x, y, width, height);

                    this.context.fillStyle = this.context.createPattern(img.stage, "no-repeat");
                    this.context.fillRect(x, y, width, height);

                    this.appendText(this.scratchText)

                    this.context.globalCompositeOperation = "destination-out"; 
                },
                context : this,
                args : []
            }, x, y, width, height);

            this.bind();
        },
        paintColor : function(background, color, x, y, width, height){
            this.ImageUtil = new ImageUtil(this.mask(width, height));
            this.x = x;
            this.y = y;
            this.stage.width = this.width = width;
            this.stage.height = this.height = height;

            this.setStageStyle("background-image", "url(" + background + ")");
    
            this.context.fillStyle = "transparent";             
            this.context.fillRect(x, y, width, height);

            this.context.fillStyle = color;
            this.context.fillRect(x, y, width, height);

            this.appendText(this.scratchText);

            this.context.globalCompositeOperation = "destination-out";

            this.bind();
        }
    };

    module.exports = function(canvas){
        var _sc = new ScratchCard(canvas);

        var pub = {
            "setBlurRadius" : function(radius){
                _sc.setBlurRadius(radius);

                return this;
            },
            "setBrushSize" : function(size){
                _sc.setBrushSize(size);

                return this;
            },
            "setComplete" : function(handler){
                _sc.setComplete(handler);

                return this;
            },
            "setScratchText" : function(txt){
                _sc.setScratchText(txt);

                return this;
            },
            "paintImage" : function(background, frontimage, x, y, width, height){
                _sc.paintImage(background, frontimage, x, y, width, height);
            },
            "paintColor" : function(background, color, x, y, width, height){
                _sc.paintColor(background, color, x, y, width, height);
            }
        }

        return pub;
    };
});
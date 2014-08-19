/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 图片处理模块
 * @charset utf-8
 * @author lijun
 * @date 2014.7
 */
;define(function (require, exports, module){
    var Util = $.Util = require("mod/se/util");
    var Blur          = require("mod/sa/stackblur");

    var _Image = function(canvas){
        this.stage = canvas;
        this.context = canvas.getContext("2d");
    };

    _Image.prototype = {
        drawImage : function(source, handler, x, y, width, height){
            var stage = this.stage;
            var ctx = this.context;

            var src = source;
            var _x = x || 0;
            var _y = y || 0;
            var _w = width || stage.width;
            var _h = height || stage.height;

            var img = new Image();
            var ins = this;

            img.onload = function(){
                ctx.clearRect(_x, _y, stage.width, stage.height);
                ctx.drawImage(img, _x, _y, _w, _h);

                Util.execAfterMergerHandler(handler, [stage, ctx, ins.readImageData(_x, _y, _w, _h), _x, _y, _w, _h]);
            }

            img.src = src;
        },
        readImageData : function(x, y, width, height){
            var stage = this.stage;
            var ctx = this.context;

            var _x = x || 0;
            var _y = y || 0;
            var _w = width || stage.width;
            var _h = height || stage.height;

            return ctx.getImageData(_x, _y, _w, _h); 
        },
        writeImageData : function(imageData, x, y){
            var stage = this.stage;
            var ctx = this.context;

            var _x = x || 0;
            var _y = y || 0;

            ctx.putImageData(imageData, _x, _y);
        },
        stage2image : function(){
            var img = new Image();

            img.src = this.stage.toDataURL("image/png");

            return img;
        },
        pixel : function(handler, x, y, width, height){
            var stage = this.stage;
            var ctx = this.context;

            var _x = x || 0;
            var _y = y || 0;
            var _w = width || stage.width;
            var _h = height || stage.height;

            var imageData = this.readImageData(_x, _y, _w, _h);

            Util.execAfterMergerHandler(handler, [stage, ctx, imageData, _x, _y, _w, _h]);
        },
        grayscale : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i] = data[i + 1] = data[i + 2] = (r + g + b)/3;
            }

            this.writeImageData(imageData, x, y);
        },
        sepia : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i]     = (r * 0.393) + (g * 0.769) + (b * 0.189); // red
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
            }

            this.writeImageData(imageData, x, y);
        },
        red : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i] = (r + g + b) / 3;        // 红色通道取平均值
                data[i + 1] = data[i + 2] = 0;    // 绿色通道和蓝色通道都设为0
            }

            this.writeImageData(imageData, x, y);
        },
        green : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i + 1] = (r + g + b) / 3;        // 绿色通道取平均值
                data[i] = data[i + 2] = 0;            // 红色通道和蓝色通道都设为0
            }

            this.writeImageData(imageData, x, y);
        },
        blue : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i + 2] = (r + g + b) / 3;        // 蓝色通道取平均值
                data[i] = data[i + 1] = 0;            // 红色通道和绿色通道都设为0
            }

            this.writeImageData(imageData, x, y);
        },
        rgba : function(stage, context, imageData, x, y, width, height, rd, gd, bd, ad){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                a = data[i + 3];

                data[i]     = r + rd;
                data[i + 1] = g + gd;
                data[i + 2] = b + bd;
                data[i + 3] = a + ad;
            }

            this.writeImageData(imageData, x, y);
        },
        rgb : function(stage, context, imageData, x, y, width, height, rd, gd, bd){
            this.rgba(stage, context, imageData, x, y, width, height, rd, gd, bd, 0);
        },
        brightness : function(stage, context, imageData, x, y, width, height, delta){
            this.rgb(stage, context, imageData, x, y, width, height, delta, delta, delta);
        },
        invert : function(stage, context, imageData, x, y, width, height){
            var data = imageData.data;
            var r = 0;
            var g = 0;
            var b = 0;

            for (var i = 0; i < data.length; i += 4) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i]     = 255 - r;
                data[i + 1] = 255 - g;
                data[i + 2] = 255 - b;
            }

            this.writeImageData(imageData, x, y);
        },
        blur : function(stage, context, imageData, x, y, width, height, radius, alpha){
            if(radius > 0){
                if(true === alpha){
                    imageData = Blur.getRGBAData(imageData, width, height, radius);
                }else{
                    imageData = Blur.getRGBData(imageData, width, height, radius);
                }
            }

            this.writeImageData(imageData, x, y);
        }
    };

    module.exports = _Image;
});
/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 颜色
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Color = function(r, g, b) { 
        this.r = r; 
        this.g = g; 
        this.b = b;
    };

    Color.prototype = {
        copy : function() { 
            return new Color(this.r, this.g, this.b); 
        },
        add : function(c) { 
            return new Color(this.r + c.r, this.g + c.g, this.b + c.b); 
        },
        multiply : function(s) { 
            return new Color(this.r * s, this.g * s, this.b * s); 
        },
        modulate : function(c) { 
            return new Color(this.r * c.r, this.g * c.g, this.b * c.b); 
        },
        saturate : function() { 
            this.r = Math.min(this.r, 1); 
            this.g = Math.min(this.g, 1); 
            this.b = Math.min(this.b, 1); 
        }
    };

    Color.BLACK = new Color(0, 0, 0);
    Color.WHITE = new Color(1, 1, 1);
    Color.RED = new Color(1, 0, 0);
    Color.GREEN = new Color(0, 1, 0);
    Color.BLUE = new Color(0, 0, 1);
    Color.YELLOW = new Color(1, 1, 0);
    Color.CYAN = new Color(0, 1, 1);
    Color.PURPLE = new Color(1, 0, 1);

    module.exports = Color;
});
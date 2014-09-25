/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 粒子
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.9
 */
;define(function (require, exports, module){
    var Vector2D = require("mod/sa/physical/vector2d");

    var Particle = function(position, velocity, life, color, size) {
        this.position = position;
        this.velocity = velocity;
        this.acceleration = Vector2D.ZERO;
        this.age = 0;
        this.life = life;
        this.color = color;
        this.size = size;
    };

    module.exports = Particle;
});
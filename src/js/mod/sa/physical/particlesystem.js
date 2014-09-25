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
    var Particle = require("mod/sa/physical/particle");
    var Listener = require("mod/se/listener");
    var Util     = require("mod/se/util");

    var ParticleSystem = function(){
        this.particles = new Array();
        this.gravity = new Vector2D(0, 100);
        this.effectors = new Array();

        this.listener = new Listener({ 
            onend : null  
        });
    };

    ParticleSystem.prototype = {
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listener.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listener.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listener.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listener.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listener.clear();
        },
        emit : function(particle) {
            this.particles.push(particle);
        },
        effect : function(x1, y1, x2, y2){
            this.effectors.push(new ChamberBox(x1, y1, x2, y2))
        },
        setGravity : function(x, y){
            this.gravity = new Vector2D(x, y);
        },
        simulate : function(dt) {
            this.aging(dt);
            this.applyGravity();
            this.applyEffectors();
            this.kinematics(dt);
        },
        _render : function(ctx, particle, alpha){
            var p = particle;

            ctx.fillStyle = "rgba("
                + Math.floor(p.color.r * 255) + ","
                + Math.floor(p.color.g * 255) + ","
                + Math.floor(p.color.b * 255) + ","
                + alpha.toFixed(2) + ")";
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        },
        render : function(target, handler) {
            var _hander = handler || {
                "callback": this._render
            };
            for (var i in this.particles) {
                var p = this.particles[i];
                var alpha = 1 - p.age / p.life;
                
                Util.execAfterMergerHandler(_hander, [target, p, alpha]);
            }
        },
        aging : function(dt) {
            for (var i = 0; i < this.particles.length; ) {
                var p = this.particles[i];

                p.age += dt;

                if (p.age >= p.life){
                    this.kill(i);
                }else{
                    i++;
                }
            }
        },
        kill : function(index) {
            if (this.particles.length > 1){
                this.particles[index] = this.particles[this.particles.length - 1];
            }
            this.particles.pop();

            this.exec("end", []);
        },
        applyGravity : function() {
            for (var i in this.particles){
                this.particles[i].acceleration = this.gravity;
            }
        },
        applyEffectors : function() {
            for (var j in this.effectors) {
                var apply = this.effectors[j].apply;

                for (var i in this.particles){
                    apply(this.particles[i]); 
                }   
            }
        },
        kinematics : function(dt) {
            for (var i in this.particles) {
                var p = this.particles[i];

                p.position = p.position.add(p.velocity.multiply(dt));
                p.velocity = p.velocity.add(p.acceleration.multiply(dt));
            }
        }
    };

    var ChamberBox = function(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    };

    ChamberBox.prototype = {
        apply : function(particle) {
            if (particle.position.x - particle.size < this.x1 || particle.position.x + particle.size > this.x2){
                particle.velocity.x = -particle.velocity.x;
            }

            if (particle.position.y - particle.size < this.y1 || particle.position.y + particle.size > this.y2){
                particle.velocity.y = -particle.velocity.y;
            }
        }
    };

    var _pub = {
        ChamberBox : ChamberBox,
        newInstance : function(x, y){
            var _ps = new ParticleSystem(x, y);

            return {
                set : function(type, option){
                    _ps.set(type, option);

                    return this;
                },
                emit : function(particle){
                    _ps.emit(particle);

                    return this;
                },
                effect : function(x1, y1, x2, y2){
                    _ps.effect(x1, y1, x2, y2);

                    return this;
                },
                setGravity : function(x, y){
                    _ps.setGravity(x, y);

                    return this;
                },
                simulate : function(dt){
                    _ps.simulate(dt);

                    return this;
                },
                render : function(target, handler){
                    _ps.render(target, handler);

                    return this;
                }
            }
        }
    };

    module.exports = _pub;
});
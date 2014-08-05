/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * 表单工具模块
 * @charset utf-8
 * @author lijun
 * @date 2014.4
 */
;define(function FormUtil(require, exports, module){
    var Listener   = $.Listener   = require("mod/se/listener");
    var StringUtil = $.StringUtil = require("mod/se/stringutil");
    var Request    = $.Request    = require("mod/se/request");

    /**
     * 校驗方法
     */
    var _Checker = {
        /**
         * 是否為中國大陸身份證
         * @param String v 需要校驗的值
         * @return Boolean true/false
         */
        CNID : function(v){
            var wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
            var vi = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            var ai = [];
            var tmp = null;
            if(v.length != 15 && v.length != 18){
                return false;
            }
            function getVerify(id){ //獲取末尾示識
                var remain = 0;
                var sum = 0;
                var k = 0;
                if(id.length == 18){
                    id = id.substring(0, 17);
                }
                for(var i = 0; i < 17; i++){
                    k = id.substring(i, i + 1);
                    ai[i] = k * 1;
                }
                for(var j = 0; j < 17; j++){
                    sum += wi[j] * ai[j];
                }
                remain = sum % 11;
                return vi[remain];
            }
            if(v.length == 15){ //將15位身份證升級到18位再校驗
                tmp = v.substring(0, 6);
                tmp = tmp + "19";
                tmp = tmp + v.substring(6, 15);
                tmp = tmp + getVerify(tmp);
                v = tmp;
            }
            return (getVerify(v) == v.substring(17, 18));
        },
        /**
         * 是否為香港身份證
         * @param String v 需要校驗的值
         * @return Boolean true/false
         */
        HKID : function(v){
            var wi = {'A':1, 'B':2, 'C':3, 'D':4, 'E':5, 'F':6, 'G':7, 'H':8, 'I':9, 'J':10, 'K':11, 'L':12, 'M':13, 'N':14, 'O':15, 'P':16, 'Q':17, 'R':18, 'S':19, 'T':20, 'U':21, 'V':22, 'W':23, 'X':24, 'Y':25, 'Z':26};
            var tmp = v.substring(0, 7);
            var a = tmp.split("");
            var t = null;
            var sum = 0;
            var verify = 0;
            var vi = v.substring(8, 9) * 1;
            for(var i = 0, j = 8; i < 7; i++, j--)
            {
                t = wi[a[i]] || a[i];
                sum += t * j;
            }
            verify = sum % 11 == 0 ? 0 : 11 - sum % 11;
            return (vi == verify);
        }
    };
    /**
     * 表單校驗
     * @param String name
     * @param String prefix
     */
    var _Form = function(name, prefix){
        this.name = name;
        this.prefix = prefix || "";
        this.form = $(this.prefix + 'form[name="' + this.name + '"]');

        this.listner = new Listener({
            ontips : null,         //提示信息的回调{Function callback, Array args, Object context}
            oncustomcheck : null,  //自定義校驗回調{Function callback, Array args, Object context}
            ondone:null,           //校验完成的回调{Function callback, Array args, Object context}
            onbefore : null,       //校验前前的回调{Function callback, Array args, Object context}
            onbeforecheck : null,  //开始前校验的回调{Function callback, Array args, Object context}
            onsubmit : null        //提交时的回调{Function callback, Array args, Object context}
        });
        
        this.bindSubmit();
    };
    _Form.prototype = {
        /**
         * 更新form表单实例
         */
        updateForm : function(){
            this.form = $(this.prefix + 'form[name="' + this.name + '"]');
        },
        /**
         * 执行回调函数
         * @param String type 类型
         * @param Array args 消息
         * @return * result 返回值
         */
        exec : function(type, args){
            return this.listner.exec(type, args);
        },
        /**
         * 设置回调
         * @param String type 类型
         * @param Object option 配置 {Function callback, Array args, Object context, Boolean returnValue}
         */
        set : function(type, option){
            this.listner.set(type, option);
        },
        /**
         * 移除回调
         * @param String type 类型
         */
        remove : function(type){
            this.listner.remove(type);
        },
        /**
         * 获取回调
         * @param String type 类型
         * @return Object on
         */
        get : function(type){
            return this.listner.get(type);
        },
        /**
         * 清除所有回调
         */
        clear : function(){
            this.listner.clear();
        },
        /**
         * 校驗
         ************************************************************************************
         * <form>
         *   <element data-empty="string"             //为空时的提示内容
         *            data-invalid="string"           //校验不符合规范时的提示内容
         *            data-filter="0|1"               //是否过滤/忽略当前字段         
         *            data-encode="0|1"               //是否进行encodeURIComponent编码
         *            data-xss="0|1"                  //是否进行XSS过滤
         *            data-compare="name"             //确认输入比较的元素的name值
         *            data-different="string"         //两次输入比较不一致时的提示内容
         *            data-lbound="number"            //最小限定值
         *            data-ubound="number"            //最大限定值
         *            data-refer="selector"           //当前元素的值为data-refer所指向节点的值，data-refer为目标元素的selector
         *            data-custom="function"          //用户自定义校验方法的名称，如：T.O.ucheck, check
         *            data-placeholder="string"       //自定义placeholder的值
         *            data-required="0|1"             //是否为必须项
         *            required                        //必填项，与data-required二选一
         *            data-pattern="regexp"           //正则表达式
         *            pattern="regexp"                //正则表达式，与data-pattern二选一
         * />               
         * </form> 
         * </script>        
         */
        doCheck : function(){
            var f = this.form;
            var els = f.prop("elements");
            var size = els.length;
            var el = null;
            var name = null;
            var value = null;
            var length = 0;
            var pattern = null;            
            var empty = null;
            var invalid = null;
            var different = null;
            var custome_tips = null;
            var filter = false;
            var encoder = false;
            var xss = true;
            var compare = null;
            var lbound = 0;
            var ubound = 0;
            var refer = null;
            var custom = null;
            var holder = null;
            var data = {};

            for(var i = 0; i < size; i++){
                el = $(els[i]);
                name = el.attr("name");
                
                if(!name){ continue; }

                value = StringUtil.trim(el.val());
                filter = (el.prop("disabled") || ("1" == el.attr("data-filter")));
                holder = (el.attr("placeholder") || el.attr("data-placeholder") || "");

                if(true === filter){ continue; }

                if(holder && holder == value){
                    value = "";
                }

                length = StringUtil.length(value);
                required = (el.prop("required") || ("1" == el.attr("data-required")));
                pattern = (el.attr("pattern") || el.attr("data-pattern"));
                empty = el.attr("data-empty") || "";
                invalid = el.attr("data-invalid")||"";
                different = el.attr("data-different")||"";
                encode = ("1" == el.attr("data-encode"));
                xss = ("1" == el.attr("data-xss"));
                lbound = Number(el.attr("data-lbound")||0);
                ubound = Number(el.attr("data-ubound")||0);
                compare = el.attr("data-compare");
                refer = el.attr("data-refer");
                custom = el.attr("data-custom");                

                if(required && value == ""){
                    this.exec("tips", [el, empty]);
                    return null;
                }
                
                if(value != "" && pattern){
                    var regExp = new RegExp(pattern);

                    if(!regExp.test(value)){
                        this.exec("tips", [el, invalid]);
                        return null;
                    }

                    pattern = null; regExp = null;
                }

                if(lbound > 0 || ubound > 0){
                    if(lbound > 0 && length < lbound){
                        this.exec("tips", [el, invalid]);
                        return null;
                    }

                    if(ubound > 0 && length > ubound){
                        this.exec("tips", [el, invalid]);
                        return null;
                    }
                }
                
                if(custom && this.get("customcheck")){
                    /**
                     * @param Object _Checker 是预设的检查器，内部对象。 
                     * @see _Checker对象
                     * @param String functionName|packageName  用户自定义校验方法的名称，如：T.O.ucheck, check
                     * @param Element el 当前元素
                     * @return String 校验提示，如果通过返回null，不通过反回提示内容
                     */
                    if(null != (custome_tips = this.exec("customcheck", [_Checker, functionName, el]))){
                        this.exec("tips", [el, custome_tips]);
                        return null;
                    }
                }
                
                if(compare){
                    var compareValue = StringUtil.trim(els[compare].value);
                    
                    if(value != compareValue){
                        this.exec("tips", [el, different]);
                        return null;
                    }
                }
                
                if(xss){
                    value = Request.filterScript(value);
                }
                if(encode){
                    value = encodeURIComponent(value);
                }

                data[name] = value;

                if(refer && (el = $(refer)).length > 0){
                    data[name] = StringUtil.trim(el.val());
                }
            }
            
            this.exec("done", [{
                "action" : f.attr("action"),
                "method" : f.attr("method"),
                "data" : data
            }]);

            return true;
        },
        /**
         * 校驗
         * @param String formName 表單名稱
         * @param String cacheName 緩存KEY
         * @param Boolean useMac 是否使用MAC地址，針對加密時，默認為true
         * @param String prefix 选择器前缀
         * @return Object data {String action, String method, String data} 校驗失敗時返回null
         */
        check : function(){
            var chk = this.get("beforecheck");
            
            this.exec("before", []);
            
            if((null == chk) ||                               //没有设置beforecheck
               (null != chk && true !== chk.returnValue) ||   //没有设置returnValue属性或returnValue属性不为true
               (null != chk && this.exe("beforecheck", []))   //有设置beforecheck并且条件为真
            ){
                this.doCheck();
            }
        },
        /**
         * 提交表单处理句柄
         * @param Event e
         */
        submitHandler : function(e){
            var ins = e.data;
            
            if(ins && ins.exec){
                ins.exec("submit", [e]);
            }

            ins = null;
        },
        /**
         * 绑定表单的submit事件
         * @param String formName 表單名稱
         * @param String prefix 选择器前缀
         */
        bindSubmit : function(){
            var form = this.form;
            if(form.length > 0){
                form.attr("data-form", this.name);
                form.on("submit", form, this.submitHandler);
            }
        }    
    };

    var _Cache = {};

    module.exports = {
        "getInstance" : function(name, prefix){
            var ins = (_Cache[name] || new _Form(name, prefix)); 
            
            ins.updateForm();

            var cfg = {
                "name" : ins.name,
                "prefix" : ins.prefix,
                "form" : ins.form,
                //-----------------------------------------------------------------
                "set" : function(type, option){ins.set(type, option);},
                "remove" : function(type){ins.remove(type);},
                "get" : function(type){return ins.get(type);},
                "exec" : function(type, args){return ins.exec(type, args);},
                "clear" : function(){ins.clear();},
                "check" : function(){ins.check();}
            };

            _Cache[name] = ins;

            return cfg;
        }
    };
});
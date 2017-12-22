;
var tool=(function () {

    /**
     * 添加事件监听
     * @param el 元素
     * @param type 事件类型
     * @param fn 回调函数
     */
    var addEvent=function (el,type,fn) {
        if (el.addEventListener){
            el.addEventListener(type,fn,false);
        }else if (el.attachEvent){
            el.attachEvent('on'+type,fn);
        }else {
            el['on'+type]=fn;
        }
    };

    /**
     * 移除事件监听
     * @param el 元素
     * @param type 事件类型
     * @param fn 回调函数名
     */
    var removeEvent=function (el,type,fn) {
        if (el.removeEventListener){
            el.removeEventListener(type,fn);
        }else if (el.detachEvent){
            el.detachEvent('on'+type,fn);
        }else {
            el['on'+type]=null;
        }
    };
    /**
     *取消事件冒泡
     * @param ev 事件对象
     */
    var cancelBubble=function (ev) {
        if (ev.stopPropagation){
            ev.stopPropagation();
        }else {
            ev.cancelBubble=true;
        }
    };

    /**
     * 取消事件的默认行为
     * @param ev
     */
    var cancelDefault=function (ev) {
        if (ev.preventDefault){
            ev.preventDefault();
        }else {
            ev.returnValue=false;
        }
    };

    /**
     * 获取计算后的样式
     * @param el 元素节点
     * @param style 样式类型
     * @returns {*} 返回基本类型的样式值
     */
    var getStyle=function (el,style) {
        if (window.getComputedStyle){
            return getComputedStyle(el,null)[style];
        }else {
            if (style==='opacity'){
                if(el.currentStyle['filter']){//低版本ie下获取filter样式
                    return (el.currentStyle['filter'].replace(/[\S\s]*opacity\D+?(\d+)[\S\s]+/,'$1'))/100;
                }
                return 1;
            }
            return el.currentStyle[style];
        }
    };

    /**
     * 设置样式
     * @param nodeList
     * @param options
     */
    var setStyle=function (nodeList,options) {
        var typeList=Object.keys(options);
        for (var n=0,l=nodeList.length;n<l;i++){
            for (var i=0,len=typeList.length;i<len;i++){
                nodeList[n].style[typeList[i]]=options[typeList[i]];
            }
        }
    };


    //获取元素class属性值
    var _getClass=function (el) {
        return el.getAttribute('class') || "";
    };

    /**
     * 添加一个类名
     * @param el 元素
     * @param className 类名
     */
    var addClass=function (el,className) {
        var classList=_getClass(el).trim().split(/\s+/);
        //判断添加的类名是否已存在
        if(classList.indexOf(className)>-1){
            return;
        }else {
            classList.push(className);
        }
        el.setAttribute('class',classList.join(' '));
    };

    /**
     * 移除一个类名
     * @param el 元素
     * @param className 类名
     * 若类名参数为空则移除所有类名
     */
    var removeClass=function (el,className) {
        if(!className){
            return el.removeAttribute('class');
        }
        var classList=_getClass(el).replace(/^\s*([\s\S]*)\s*$/,'$1').split(/\s+/);
        var i=classList.indexOf(className);
        if (i>-1){
            classList.splice(i,1);
            el.setAttribute('class',classList.join(' '));
        }
    };

    /**
     * 判断是否有指定类名
     * @param el
     * @param className
     * @returns {boolean}
     */
    var hasClass=function (el,className) {
        var classList=_getClass(el).trim().split(/\s+/);
        return classList.indexOf(className)>-1;
    };


    //url编码
    var _encodeData=function (data) {
        if (typeof (data)==='object'){
            var list=[];
            Object.keys(data).forEach(function (name) {
                list.push(encodeURIComponent(name)+'='+encodeURIComponent(data[name]+''));
            });

            return list.join('&');
        }else {
            return encodeURIComponent(data.toString().trim());
        }
    };

    /**
     * ajax异步请求
     * @param options  //{
     * url: 请求地址
     * method: 请求方法[GET||POST]
     * type:  请求数据类型 可选 默认 text/plain
     * data:  请求主体 string||object
     * success: 请求成功回调函数 （响应文本，xhr）
     * failed: 请求失败回调函数 （xhr）
     * }
     * @returns {object} xhr
     */
    var ajax=function (options) {
        var xhr=null;
        if (window.XMLHttpRequest){
            xhr=new XMLHttpRequest();
        }else {
            try {
                xhr=new ActiveXObject('Msxml2.XMLHTTP.6.0');
            }
            catch (er0){
                try {
                    xhr=new ActiveXObject('Msxml.XMLHTTP.3.0');
                }
                catch (er1){
                    throw new Error('浏览器不支持xhr');
                }
            }
        }
        options.data=_encodeData(options.data);
        //若是GET请求，则将参数添加到url中
        if (options.method==='GET'){
            options.url=options.url+'?'+options.data;
            options.data=null;
        }
        xhr.open(options.method,options.url,true);
        xhr.onreadystatechange=function () {
            if (xhr.readyState===4){
                if (xhr.status===200){
                    options.success(xhr.responseText,xhr);
                }else {
                    options.failed(xhr);
                }
            }
        };
        options.type=options.type||'text/plain';
        xhr.setRequestHeader('Content-Type',options.type);
        xhr.send(options.data);
        return xhr;
    };


    //缓动函数
    //参数p为动画进行的进程
    var _easing={
        linear:function (p) {
            return p;
        },
        swing:function (p) {
            return 0.5-Math.cos(p*Math.PI)/2;
        },
        easeInOutQuart: function(p){
            if ((p/=0.5) < 1) return 0.5*Math.pow(p,4);
            return -0.5 * ((p-=2)*Math.pow(p,3) - 2);
        },
        easeOutQuad: function(p){
            return -(Math.pow((p-1), 2) -1);
        },
        easeInOutQuad: function(p){
            if ((p/=0.5) < 1) return 0.5*Math.pow(p,2);
            return -0.5 * ((p-=2)*p - 2);
        },
        easeOutCubic: function(p){
            return (Math.pow((p-1), 3) +1);
        },
        easeInCirc: function(p){
            return -(Math.sqrt(1 - (p*p)) - 1);
        },
        easeOutCirc: function(p){
            return Math.sqrt(1 - Math.pow((p-1), 2))
        }
    };

    /**
     * 动画函数
     * @param el
     * @param options 动画目标设置名值对类数组对象
     * @param duration 动画时长
     * @param delay 动画延迟时间
     * @param easing 缓动函数
     * @param fn 回调函数
     */
    var animation=function (el,options,duration,delay,easing,fn) {
        var current=[],//存放初始样式值
            target=[],//存放目标样式值
            change=[],//存放变化量
            next=[],//下一步移动的位置
            timestamp=0;//记录动画执行了多长时间
        easing=easing||'swing';
        delay=delay||0;
        for (var name in options){
            if (!options.hasOwnProperty(name)){
                continue;
            }
            if(name==='opacity'){
                current[name]=getStyle(el,name)*100;
                target[name]=options[name]*100;
            }else {
                current[name]=parseInt(getStyle(el,name));
                target[name]=parseInt(options[name]);
            }
            change[name]=target[name]-current[name];//变化量
            next[name]=0;
        }
        setTimeout(function () {
            clearInterval(el.tmier);
            var flag=true;
            //设置定时器
            el.tmier=setInterval(function () {
                timestamp+=30;
                flag=true;
                for (var name in current) {
                    if(next[name]!==change[name]) {
                        flag=false;
                        next[name]=change[name]>0?Math.ceil(_easing[easing](timestamp/duration)*change[name]):Math.floor(_easing[easing](timestamp/duration)*change[name]);
                        // 判断临界点
                        if((change[name]<0&&next[name]<change[name])||(change[name]>0&&next[name]>change[name])) {
                            next[name] = change[name];
                        }
                        if (name==='opacity'){
                            el.style[name]=(current[name]+next[name])/100;
                            el.style.filter='alpha(opacity:'+(current[name]+next[name])+')';
                        }else {
                            el.style[name]=current[name]+next[name]+'px';
                        }
                    }
                }
                // 判断是否达到结束条件
                if (flag){
                    clearInterval(el.tmier);
                    if (fn) {
                        fn();
                    }
                }
            },30)
        },delay);
    };

    //自定义事件；
    var _eventList=[];
    /**
     * 发布事件
     * 第一个参数为发布事件的类型，后续参数为附带的数据
     * @returns {boolean}
     */
    var triggerEvent=function () {
        var type=Array.prototype.shift.call(arguments);
        if (_eventList[type].length===0){
            return false;
        }
        for (var i=0,len=_eventList[type].length;i<len;i++){

            _eventList[type][i].fn.apply(_eventList[type][i].obj,arguments);
        }

    };
    /**
     * 监听事件
     * @param type 监听的类型
     * @param fn 事件触发的函数
     * @param obj 事件函数的上下文对象
     */
    var addListen=function (type,fn,obj) {
        if (typeof fn!=='function'){
            throw new Error('参数错误');
        }
        if (!_eventList[type]){
            _eventList[type]=[];
        }
        _eventList[type].push({fn:fn,obj:obj});
    };

    return {
        addEvent:addEvent,
        removeEvent:removeEvent,
        cancelBubble:cancelBubble,
        cancelDefault:cancelDefault,
        getStyle:getStyle,
        setStyle:setStyle,
        addClass:addClass,
        removeClass:removeClass,
        hasClass:hasClass,
        ajax:ajax,
        animation:animation,
        triggerEvent:triggerEvent,
        addListen:addListen
    }

})();

Function.prototype.bind=function () {
    var self=this;
    var obj=Array.prototype.shift.call(arguments);
    var arg=arguments;
    return function () {
        self.apply(obj,arg);
    }
};

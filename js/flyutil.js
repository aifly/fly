/*
  * by fly 2014-11-24
  */
var flyUtil = {
    browerKernel: function () {//获取支持VisibilityState事件的浏览器的内核前缀。
        var result;
        var arr = ['webkit', 'moz', 'o', 'ms'];
        for (var i = 0; i < arr.length; i++) {
            if (typeof document[arr[i] + 'Hidden'] != 'undefined') {
                result = arr[i];
            }
        }
        return result;
    },
    pageChange: function (fnEnter, fnLeave) {//当页面切换到其它的窗口或者最小化的时候触发，和当页面正常显示的时候触发。
        var prefix = this.browerKernel();
        document.addEventListener && document.addEventListener(prefix + 'visibilitychange', function (e) {
            if (document[prefix + 'VisibilityState'] === 'visible') {
                fnEnter.call(document);
            }
            else if (document[prefix + 'VisibilityState'] === 'hidden') {
                fnLeave.call(document);
            }

        });
    },
    loadImgByCanvas: function (aImgSrc, canvas, x, y, scaleX, scaleY, canvasW, canvasH, fn) {
        var img = new Image();
        var context = canvas.getContext && canvas.getContext("2d");
        if (context) {
            var width = context.measureText("图片加载中,请稍等...").width;
            context.fillText("图片加载中,请稍等...", (canvas.width - width) / 2, canvas.height / 2);
        };
        img.onload = function () {
            scaleX = scaleX || 1;
            scaleY = scaleY || 1;
            canvas.width = canvasW || this.width * scaleX;
            canvas.height = canvasH || this.height * scaleY;
            if (canvas.getContext) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(this, x, y, canvas.width, canvas.height);
            }
            else {
                var newImg = document.createElement("img");
                newImg.src = aImgSrc;
                newImg.id = canvas.id;
                newImg.width = canvasW || this.width * scaleX;
                newImg.height = canvasH || this.height * scaleY;
                document.body.appendChild(newImg);
                canvas.parentNode.replaceChild(newImg, canvas);
            }
            fn && fn();
            return aImgSrc;
        };
        img.onerror = function (e) {

        }
        img.src = aImgSrc;
    },
    loadImgByLocalStorage: function (src, fnSuccess) {
        var img = new Image();
        var canvas = document.createElement("canvas");
        var context = null;
        if (canvas.getContext) {
            context = canvas.getContext("2d");
        }
        var url = "", data = "";
        img.onload = function () {
            if (context) {
                context.canvas.width = this.width;
                context.canvas.height = this.height;
                context.drawImage(this, 0, 0, context.canvas.width, context.canvas.height);
                url = canvas.toDataURL();

            }
            if (window.localStorage) {
                try {
                    if (!localStorage.getItem(src)) {
                        localStorage.setItem(src, url); //ie8支持window.loacalStorage但是没有getItem();

                    }
                    if (localStorage.getItem(src)) {
                        data = localStorage.getItem(src);

                    }
                    else {
                        data = src;

                    }
                } catch (e) {
                    //如果苹果的浏览器的无痕浏览模式，就会抛出这个异常
                    data = src;//把当前的src返回给data ;
                }
            }
            else {
                data = src;
            }
            fnSuccess && fnSuccess(data);
        };
        img.src = src;
    },

    setCss3: function (obj, attr) {
        for (var i in attr) {
            var newI = i;
            if (newI.indexOf('-') > 0) {
                var num = newI.indexOf('-');
                newI = newI.replace(newI.substr(num, 2), newI.substr(num + 1, 1).toUpperCase());
            }
            obj.style[newI] = attr[i];
            newI = newI.replace(newI.charAt(0), newI.charAt(0).toUpperCase());
            obj.style["webkit" + newI] = attr[i];
            obj.style["moz" + newI] = attr[i];
            obj.style["ms" + newI] = attr[i];
            obj.style["o" + newI] = attr[i];
        }
        return obj;
    },
    isSupportTransition: function () { //判断浏览器是否支持css3的transition属性
        var oDiv = document.createElement("div");
        return oDiv.style.webkitTransition !== undefined ||
            oDiv.style.transition !== undefined ||
            oDiv.style.oTransition !== undefined ||
            oDiv.style.mozTransition !== undefined;
    },
    isSupportTransform: function () {
        var oDiv = document.createElement("div");
        return oDiv.style.webkitTransform !== undefined ||
            oDiv.style.transform !== undefined ||
            oDiv.style.msTransform !== undefined ||
            oDiv.style.oTransform !== undefined ||
            oDiv.style.mozTransform !== undefined;
    },
    requestAnimFrame: (function () { //用来做动画的。
        var lastTime = 0;
        var vendors = ['webkit', 'moz', 'ms'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestNextAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelNextAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                                          window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestNextAnimationFrame) {

            window.requestNextAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelNextAnimationFrame) {
            window.cancelNextAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    })(),
    ltLoading: function (arr, fn, option) {
        if (arr.length<=0) {
            fn();
            return;
        }
        var box = (option && option.id) ? option.id : "linten_loading";
        var color = (option && option.color) ? option.color : "rgba(149,30,35,1)";
        var src = (option && option.src) ? option.src : "images/lt_loading.png";
        var isPicLogo = (option && option.isPicLogo === false) ? option.isPicLogo : true;
        var oC = document.createElement("canvas");
        if (!oC.getContext) {
            return;
        }
        oC.width = 500;
        oC.height = 200;
        var cxt = oC.getContext("2d");
        cxt.beginPath();
        var x1 = 183, y1 = 34, x2 = 225, y2 = -2;//x1 = 183, y1 = 32, x2 = 225, y2 = 2;
        cxt.moveTo(0, 15);
        cxt.bezierCurveTo(x1, y1, x2, y2, oC.width, 27); // 
        cxt.lineTo(oC.width, oC.height);
        cxt.lineTo(0, oC.height);
        cxt.closePath();
        cxt.fillStyle = color;
        cxt.fill();

        var canvas = document.createElement("canvas");
        var proc = document.createElement("div");//用来存储百分比数字变化的容器。
        proc.style.width = "130px";
        proc.style.textAlign = "center";
        proc.style.fontFamily = "Georgia";
        canvas.width = 129;
        canvas.height = 43;
        var container = document.getElementById(box);
        if (!container) {
            alert("容器id配置错误");
            return false;
        }

        container.innerHTML = "";
        container.appendChild(canvas);
        container.appendChild(proc);
        var context = canvas.getContext("2d");
        var img1 = new Image();
        var img = new Image();
        var bg = null;
        var id = null;
        context.globalCompositeOperation = "destination-atop";//像素的合成。这是关键啊。
        var _this = this;
        img1.onload = function () {
            img.onload = function () {
                id = window.requestNextAnimationFrame(render);
            }
            img.src = src;
        };
        img1.src = oC.toDataURL();
        var initX = -320;
        var disX = initX;
        var len = arr.length;
        var count = 0;
        var i = 0;
        loadimg();
        function loadimg() {
            if (i === len) {
                return;
            }
            var img = new Image();
            img.onload = function () {
                count++;
                if (i < len - 1) {
                    i++;
                    loadimg();
                };
            };
            img.onerror = function () {
                count++;
                if (i < len - 1) {
                    i++;
                    loadimg();
                };
            }
            img.src = arr[i];
        }
        function render() {
            disX +=8;
            if (disX > 0) {
                disX = initX;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (len > 0) {
                context.drawImage(img1, disX, 20 - 36 * (count / len));//70 - 90 * (count / len)
                //context.drawImage(img1, disX, 70 - 90 * (count / len));//70-90*(count/len)
                if (count / len >= 1) { //加载完成了。。
                    window.cancelNextAnimationFrame(id)
                    fn && fn();
                }
                else {
                    id = window.requestNextAnimationFrame(render);
                }
                  
            }
            proc.innerHTML = parseInt(count / len * 100) + "%";
            context.drawImage(img, 0, 0);
        }
    },
    ltLoading2: function (arr, fn, option) { //加载2
        //var box = (option && (typeof option === "object") && option.id) ? option.id : "ltLoading";
        var box = (option && option.id) ? option.id : "ltLoading";
        var src = (option && (typeof option === "object") && option.src) ? option.src : "images/lt_loading1.png"
        var color = (option && (typeof option === "object") && option.color) ? option.color : "#951e23";
        var html = "#" + box + "{width: 430px;margin-top:50px;height: 20px;position: relative;border-radius:5px; border:1px solid " + color + ";padding: 1px;box-sizing:border-box;}\
                #"+ box + " span{width: 100%;height:100%;background: " + color + ";border-radius: 5px;display: inline-block;}\
                #"+ box + " div{width:0;height: 100%;position: absolute;left: 0;top:0;z-index: 1;background: #fff;border-radius: 5px 0 0 5px;text-align: right;line-height: 25px;}\
                #"+ box + " div label{position: relative;top:-3px;color:" + color + "}\
                #"+ box + " div img{position: absolute;top:-40px;}\
                @media all and (max-width: 480px) {\
                     #"+ box + "{width:100%;}\
                }"
        var loading_container = _$(box);
        if (!loading_container) {
            alert("容器id配置错误");
            return false;
        }

        var doc = document;
        loading_container.appendChild(doc.createElement("span"));
        loading_container.appendChild(doc.createElement("div"));
        var oDiv = _$(box).getElementsByTagName("div")[0];
        oDiv.appendChild(doc.createElement("label"));
        var oImg = new Image();
        oImg.src = src;
        oDiv.appendChild(oImg);
        var proc = oDiv.getElementsByTagName("label")[0];
        var style = doc.createElement("style");
        doc.getElementsByTagName("head")[0].appendChild(style);
        //style.innerHTML = 1234;
        try {
            style.innerHTML = html;
        }
        catch (e) {
            alert("浏览器不支持此加载特效");
            return false;
        }
        var len = arr.length;
        var count = 0;
        var i = 0;
        loadimg();
        function loadimg() {
            if (i === len) {
                return;
            }
            var img = new Image();
            img.onload = function () {
                count++;
                if (i < len - 1) {
                    i++;
                    loadimg();
                };
                move(count, len)
            };
            img.onerror = function () {
                count++;
                if (i < len - 1) {
                    i++;
                    loadimg();
                };
                move(count, len);
            }
            img.src = arr[i];
        }
        function move(i, n) {
            if (i / n > .1) {
                proc.innerHTML = parseInt(i / n) * 100 + "%";
            }
            oDiv.style.width = (loading_container.offsetWidth - 85) * (i / n) + "px";
            if (i / n >= 1) {//图片加载完成
                fn && typeof fn === "function" && fn();
            }
        }
        function _$(id) {
            return document.getElementById(id);
        }
    },
    clearCache: function (cache) {//清除离线缓存。
        
        cache.onupdateready = function () {
            cache.swapCache();
            location.href = location.href;
        }
    },
    getStyle: function (obj, attr) {//得到css文件里面定义的样式属性值
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
    },
    startMove: function (obj, json, times, fx, fn) { //运动框架
        var iCur = {};
        var startTime = now();
        for (var attr in json) {//当为透明度变化的时候.
            iCur[attr] = 0;
            if (attr === 'opacity') {
                iCur[attr] = Math.round(this.getStyle(obj, attr) * 100);
            } else if (attr === "transformX") {
                iCur[attr] = parseFloat(obj.getAttribute("transX")) || 0;
            } else if (attr === "transformY") {
                iCur[attr] = parseFloat(obj.getAttribute("transY")) || 0;
            } else if (attr === "scale") {
                iCur[attr] = parseFloat(obj.getAttribute("scale")) || 0;
            } else {
                iCur[attr] = parseInt(this.getStyle(obj, attr)) || 0;
            }
        }
        window.cancelNextAnimationFrame(obj.timer);
        obj.timer = window.requestNextAnimationFrame(move);
        function now() {
            return (new Date()).getTime();
        }
        var _this = this;
        function move() {
            var changeTime = now();
            var scale = 1 - Math.max(0, startTime - changeTime + times) / times;
            for (var attr in json) {

                var value = ltTween[fx](scale * times, parseFloat(iCur[attr]), parseFloat(json[attr]) - parseFloat(iCur[attr]), times);
                //alert(value)
                switch (attr.toLowerCase()) {
                    case "opacity":
                        obj.style.filter = 'alpha(oapcity=' + value + ')';
                        obj.style.opacity = value / 100;
                        break;
                    case "scrollTop":
                        document.body.scrollTop = value;
                        document.documentElement.scrollTop = value;
                        break;
                    case "width":
                    case "height":
                    case "left":
                    case "top":
                    case "bottom":
                    case "right":
                        if (json[attr].toString().indexOf("%") > -1) {//带百分比的距离
                            obj.style[attr] = value + '%';
                        } else {
                            obj.style[attr] = value + 'px';
                        }

                        break;
                    case "backgroundposition"://火孤下不支持backgroundPositionY(X)
                        if (json[attr].toString().indexOf("%") > -1) {//带百分比的距离
                            obj.style[attr] = value + '%';
                        } else {
                            obj.style[attr] = value;
                        }
                        break;
                    case "transformx":
                        obj.setAttribute("transX", value);
                        var prefix = "px";
                        if (json[attr].toString().indexOf("%") > -1) {//带百分比的距离
                            prefix = "%";
                        }
                        _this.setCss3(obj, { transform: "translateX(" + value + "" + prefix + ")" })
                        break;
                    case "transformy":
                        obj.setAttribute("transY", value);
                        var prefix = "px";
                        if (json[attr].toString().indexOf("%") > -1) {//带百分比的距离
                            prefix = "%";
                        }
                        _this.setCss3(obj, { transform: "translateY(" + value + "" + prefix + ")" })
                        break;
                    case "scale":
                        obj.setAttribute("scale", value);
                        _this.setCss3(obj, { transform: "scale(" + value + ")" });
                        break;
                }

            }
            if (scale === 1) {
                //_this.requestAnimFrame.cancel(obj.timer);
                window.cancelNextAnimationFrame(obj.timer);
                fn && typeof fn === "function" && fn.call(obj);
            }
            else {
                obj.timer = window.requestNextAnimationFrame(move);
            }
        }
    },
    getXYByElement: function (el) { // 得到一个元素距离左侧的距离和距离顶部的距离
        var left = 0,
            top = 0;
        while (el.offsetParent) {
            left += el.offsetLeft;
            top += el.offsetTop;
            el = el.offsetParent;
        }
        return {
            left: left,
            top: top
        };
    },
    isWeiXin: function () {//判断一个页面是否是在微信页面打开
        var ua = window.navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) === 'micromessenger';
    },
    imgLoader: function (arr, fn,callBack) {//图片的加载器。
        var len = arr.length;
        var count = 0;
        var i = 0;
        loader();
        function loader() {
            var img = new Image();
            count++;
            img.onload = img.onerror = function () {
                if (count < len) {
                    loader();
                }
                else if (count / len === 1) {
                    fn && fn();
                }
                callBack && callBack(count / len);
            }

            img.src = arr[count - 1];
        }
    },
    shake: function (fn, responesTime) {//手机摇一摇触发的函数
        responesTime = responesTime || 1000;//响应时间
        var last_update = 0;
        var x = y = z = last_x = last_y = last_z = 0;
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        }
        function deviceMotionHandler(eventData) {
            var acceleration = eventData.accelerationIncludingGravity;
            var curTime = new Date().getTime();
            if ((curTime - last_update) > 100) {
                var diffTime = curTime - last_update;
                last_update = curTime;
                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
                if (speed > responesTime) {
                    fn && fn();
                }
                last_x = x;
                last_y = y;
                last_z = z;
            }
        }
    }
     ,
    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    styleOnload: function (href, callback) {
         
        var node = document.createElement("link");
        node.setAttribute("rel", "stylesheet");
        node.setAttribute("type", "text/css");
        node.setAttribute("href", href);
        document.body.appendChild(node);
        
        function load(href, callback) {
            // for IE6-9 and Opera
            if (node.attachEvent) {
                node.attachEvent('onload', callback);
                // NOTICE:
                // 1. "onload" will be fired in IE6-9 when the file is 404, but in
                // this situation, Opera does nothing, so fallback to timeout.
                // 2. "onerror" doesn't fire in any browsers!
            }
                // polling for Firefox, Chrome, Safari
            else {
                setTimeout(function () {
                    poll(node, callback);
                }, 0); // for cache
            }
        }

        function poll(node, callback) {
            if (callback.isCalled) {
                return;
            }

            var isLoaded = false;

            if (/webkit/i.test(navigator.userAgent)) {//webkit
                if (node['sheet']) {
                    isLoaded = true;
                }
            }
                // for Firefox
            else if (node['sheet']) {
                try {
                    if (node['sheet'].cssRules) {
                        isLoaded = true;
                    }
                } catch (ex) {
                    // NS_ERROR_DOM_SECURITY_ERR
                    if (ex.code === 1000) {
                        isLoaded = true;
                    }
                }
            }

            if (isLoaded) {
                // give time to render.
                setTimeout(function () {
                    callback();
                }, 1);
            }
            else {
                setTimeout(function () {
                    poll(node, callback);
                }, 1);
            }
        }

       
        load(href, callback);
    }
}
    

Array.prototype.unique = function () { //数组去重
    var res = [];
    var json = {};
    for (var i = 0; i < this.length; i++) {
        if (!json[this[i]]) {
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
}
Array.prototype.clear = function () {//清空数组。
    this.length = 0;
}
//两端去空格函数
String.prototype.trim = function () { return this.replace(/(^\s*)|(\s*$)/g, ""); }
//动画函数
!function (w) {
    var Tween = {
        //t : 当前时间   b : 初始值  c : 变化值   d : 总时间  //return : 当前的位置
        linear: function (t, b, c, d) {  //匀速
            return c * t / d + b;
        },
        easeIn: function (t, b, c, d) {  //加速曲线
            return c * (t /= d) * t + b;
        },
        easeOut: function (t, b, c, d) {  //减速曲线
            return -c * (t /= d) * (t - 2) + b;
        },
        easeBoth: function (t, b, c, d) {  //加速减速曲线
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInStrong: function (t, b, c, d) {  //加加速曲线
            return c * (t /= d) * t * t * t + b;
        },
        easeOutStrong: function (t, b, c, d) {  //减减速曲线
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeBothStrong: function (t, b, c, d) {  //加加速减减速曲线
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        elasticIn: function (t, b, c, d, a, p) {  //正弦衰减曲线（弹动渐入）
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        elasticOut: function (t, b, c, d, a, p) {    //正弦增强曲线（弹动渐出）
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        elasticBoth: function (t, b, c, d, a, p) {
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) == 2) {
                return b + c;
            }
            if (!p) {
                p = d * (0.3 * 1.5);
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
                    Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) *
                Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        },
        backIn: function (t, b, c, d, s) {     //回退加速（回退渐入）
            if (typeof s == 'undefined') {
                s = 1.70158;
            }
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        backOut: function (t, b, c, d, s) {
            if (typeof s == 'undefined') {
                s = 3.70158;  //回缩的距离
            }
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        backBoth: function (t, b, c, d, s) {
            if (typeof s == 'undefined') {
                s = 1.70158;
            }
            if ((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        bounceIn: function (t, b, c, d) {    //弹球减振（弹球渐出）
            return c - Tween['bounceOut'](d - t, 0, c, d) + b;
        },
        bounceOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            }
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        },
        bounceBoth: function (t, b, c, d) {
            if (t < d / 2) {
                return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
            }
            return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    }
    w.ltTween = Tween;
}(window);

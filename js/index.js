(function () { //用来做动画的。
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
})();

var model = angular.module("myApp", ["ngRoute"]);

model.controller("myCtrl", ["$scope", "$location", function ($scope, $location) {

    $scope.$location = $location;
}]);
model.provider("flyService", function () {
    return {
        $get: function () {
            return {
                textEffect: function ($text) {
                    var transitionend = "onwebkittransitionend" in window ? "webkitTransitionEnd" : "transitionend";
                    var html = "";
                    var arr = $text.html().trim().split("");
                    angular.forEach(arr, function (item) {
                        html += "<span>" + item + "</span>";
                    });
                    $text.html(html).css("opacity", 1);
                    var aSpan = $text.find("span");
                    var m = Math, width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;

                    aSpan.each(function (i, item) {
                        $(this).css("transform", "translate3d(" + (m.random() - .5) * width * (m.random() - .5 > 0 ? 2 : -2) + "px," + (m.random() - .5) * height * (m.random() - .5 > 0 ? 2 : -2) + "px,0)").css("transition-delay", 100 * i + "ms");
                    });
                    var ableMove = false;
                    $(function () {
                        setTimeout(function () {
                            aSpan.each(function (i, item) {
                                $(this).css("transform", "none").css("opacity", 1);
                            });
                            aSpan.eq(-1).off(transitionend).on(transitionend, function () {
                                aSpan.css("transition", "none");
                                ableMove = true;
                            });
                        }, 3000);
                    });

                    var aSpanWidth = aSpan.width(), aSpanHeight = aSpan.height();

                    $(document).on("mousemove", function (e) {
                        if (ableMove) {
                            var x = e.clientX, y = e.clientY;

                            angular.forEach(aSpan, function (item) {
                                var disX = m.pow(($(item).offset().left + aSpanWidth / 2 - x), 2),
                                  disY = m.pow(($(item).offset().top + aSpanHeight / 2 - y), 2);
                                var dis = m.sqrt(disX + disY);
                                if (dis < 200) {
                                    $(item).css("transform", "translate3d(0," + (dis - 200) + "px,0)");
                                }
                                else {
                                    $(item).css("transform", "none");
                                }

                            });
                        }

                    })
                },
                transitionEnd: function () {
                    var transitionend = "onwebkittransitionend" in window ? "webkitTransitionEnd" : "transitionend";
                    return transitionend;
                }
            }
        }
    }
});
model.run(["$rootScope", "flyService", function ($rootScope, flyService) {
    if (!applicationCache) {
        return;
    }
   
    var appCache = window.applicationCache;
    flyUtil.clearCache(appCache);

    var arr = ["images/bg1.jpg", "images/bg2.jpg", "images/bg3.jpg","images/logo.png"];
    
    //flyUtil.styleOnload("css/index.css", function () {
        
    //});
    init();
    var imgLoadingDone = false;
    var canvasTextDone = false;
    function init() {
        var once = 0;
        flyUtil.imgLoader(arr, function () {
            imgLoadingDone = true;
            if (canvasTextDone) {
                var i = 0;
                var oBg = $(".bg");
               // flyService.canvasEffect();
                flyService.textEffect($(".fly-header-title"));
                loading.remove();
                setInterval(function () {
                    oBg.css({ opacity: 0 }).eq(i).css({ opacity: 1, background: "url(" + arr[i] + ") no-repeat center center", backgroundSize: "cover" });
                    i++;
                    if (i > 2) {
                        i = 0;
                    }
                }, 6000);
            }
           
        }, function (scale) {
            if (scale>.8) {
                once === 0 && $(".bg").eq(0).css({ opacity: 1, background: "url(images/bg1.jpg) no-repeat center center", backgroundSize: "cover" });
                once++;
            }
            //var value = parseInt(scale * 100) + "%";
            //progress.width(value);
            //prec.html(value)
        });

        flyUtil.loadImgByCanvas("images/logo.png",$("#logo")[0],0,0);

        var S = {
            init: function () {
                var action = window.location.href,
                    i = action.indexOf('?a=');

                S.Drawing.init('.canvas');
                document.body.classList.add('body--ready');

                if (i !== -1) {
                    S.UI.simulate(decodeURI(action).substring(i + 3));
                } else {
                    S.UI.simulate('ifly|html5|css3|to start|#rectangle|#time|#countdown 10||');
                }

                S.Drawing.loop(function () {
                    S.Shape.render();
                });
            }
        };

        S.Drawing = (function () {
            var canvas,
                context,
                renderFn
            requestFrame = window.requestAnimationFrame ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame ||
                           window.oRequestAnimationFrame ||
                           window.msRequestAnimationFrame ||
                           function (callback) {
                               window.setTimeout(callback, 1000 / 60);
                           };

            return {
                init: function (el) {
                    canvas = document.querySelector(el);
                    context = canvas.getContext('2d');
                    this.adjustCanvas();

                    window.addEventListener('resize', function (e) {
                        S.Drawing.adjustCanvas();
                    });
                },

                loop: function (fn) {
                    renderFn = !renderFn ? fn : renderFn;
                    this.clearFrame();
                    renderFn();
                    requestFrame.call(window, this.loop.bind(this));
                },

                adjustCanvas: function () {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                },

                clearFrame: function () {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                },

                getArea: function () {
                    return { w: canvas.width, h: canvas.height };
                },

                drawCircle: function (p, c) {
                    context.fillStyle = c.render();
                    context.beginPath();
                    context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
                    context.closePath();
                    context.fill();
                }
            }
        }());

        S.UI = (function () {
            var canvas = document.querySelector('.canvas'),
                interval,
                isTouch = false, //('ontouchstart' in window || navigator.msMaxTouchPoints),
                currentAction,
                resizeTimer,
                time,
                maxShapeSize = 30,
                firstAction = true,
                sequence = [],
                cmd = '#';

            function formatTime(date) {
                var h = date.getHours(),
                    m = date.getMinutes(),
                m = m < 10 ? '0' + m : m;
                return h + ':' + m;
            }

            function getValue(value) {
                return value && value.split(' ')[1];
            }

            function getAction(value) {
                value = value && value.split(' ')[0];
                return value && value[0] === cmd && value.substring(1);
            }

            function timedAction(fn, delay, max, reverse) {
                clearInterval(interval);
                currentAction = reverse ? max : 1;
                fn(currentAction);

                if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
                    interval = setInterval(function () {
                        currentAction = reverse ? currentAction - 1 : currentAction + 1;
                        fn(currentAction);

                        if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
                            clearInterval(interval);
                        }
                    }, delay);
                }
            }

            function reset(destroy) {
                clearInterval(interval);
                sequence = [];
                time = null;
                destroy && S.Shape.switchShape(S.ShapeBuilder.letter(''));
            }

            function performAction(value) {
                var action,
                    value,
                    current;

                sequence = typeof (value) === 'object' ? value : sequence.concat(value.split('|'));

                timedAction(function (index) {
                    current = sequence.shift();
                    action = getAction(current);
                    value = getValue(current);

                    switch (action) {
                        case 'countdown':
                            value = parseInt(value) || 10;
                            value = value > 0 ? value : 10;

                            timedAction(function (index) {
                                if (index === 0) {
                                    var oBg = $(".bg");
                                    oBg.eq(0).css({ opacity: 1, background: "url(images/bg1.jpg) no-repeat center center", backgroundSize: "cover" });
                                    setTimeout(function () {
                                        canvasTextDone = true;
                                        if (imgLoadingDone) {
                                            var transitionEnd = "onwebkittransitionend" in window ? "webkitTransitionEnd" : "transitionend";
                                            $(".canvas").css({ "-webkit-transform": "translate3d(0,-100%,0)", "transform": "translate3d(0,-100%,0)" }).off(transitionEnd).on(transitionEnd, function () {
                                                $(this).remove();
                                            });
                                           // flyService.canvasEffect();
                                            flyService.textEffect($(".fly-header-title"));

                                            var i = 0;
                                            setInterval(function () {
                                                oBg.css({ opacity: 0 }).eq(i).css({ opacity: 1, background: "url(" + arr[i] + ") no-repeat center center", backgroundSize: "cover" });
                                                i++;
                                                if (i > 2) {
                                                    i = 0;
                                                }
                                            }, 6000);
                                        }
                                    },500);
                                    if (sequence.length === 0) {
                                        S.Shape.switchShape(S.ShapeBuilder.letter(''));
                                    } else {
                                        performAction(sequence);
                                    }
                                  
                                } else {
                                    S.Shape.switchShape(S.ShapeBuilder.letter(index), true);
                                }
                                
                            }, 1000, value, true);
                            break;

                        case 'rectangle':
                            value = value && value.split('x');
                            value = (value && value.length === 2) ? value : [maxShapeSize, maxShapeSize / 2];

                            S.Shape.switchShape(S.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(value[0])), Math.min(maxShapeSize, parseInt(value[1]))));
                            break;

                        case 'circle':
                            value = parseInt(value) || maxShapeSize;
                            value = Math.min(value, maxShapeSize);
                            S.Shape.switchShape(S.ShapeBuilder.circle(value));
                            break;

                        case 'time':
                            var t = formatTime(new Date());

                            if (sequence.length > 0) {
                                S.Shape.switchShape(S.ShapeBuilder.letter(t));
                            } else {
                                timedAction(function () {
                                    t = formatTime(new Date());
                                    if (t !== time) {
                                        time = t;
                                        S.Shape.switchShape(S.ShapeBuilder.letter(time));
                                    }
                                }, 1000);
                            }
                            break;

                        default:
                            S.Shape.switchShape(S.ShapeBuilder.letter(current[0] === cmd ? 'What?' : current));
                    }
                }, 3000, sequence.length);
            }





            function init() {
                isTouch && document.body.classList.add('touch');
            }

            // Init
            init();

            return {
                simulate: function (action) {
                    performAction(action);
                }
            }
        }());

        S.Point = function (args) {
            this.x = args.x;
            this.y = args.y;
            this.z = args.z;
            this.a = args.a;
            this.h = args.h;
        };
        S.Color = function (r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        };

        S.Color.prototype = {
            render: function () {
                return 'rgba(' + this.r + ',' + +this.g + ',' + this.b + ',' + this.a + ')';
            }
        };


        S.Dot = function (x, y) {
            this.p = new S.Point({
                x: x,
                y: y,
                z: 5,
                a: 1,
                h: 0
            });

            this.e = 0.07;
            this.s = true;

            this.c = new S.Color(255, 255, 255, this.p.a);

            this.t = this.clone();
            this.q = [];
        };

        S.Dot.prototype = {
            clone: function () {
                return new S.Point({
                    x: this.x,
                    y: this.y,
                    z: this.z,
                    a: this.a,
                    h: this.h
                });
            },

            _draw: function () {
                this.c.a = this.p.a;
                S.Drawing.drawCircle(this.p, this.c);
            },

            _moveTowards: function (n) {
                var details = this.distanceTo(n, true),
                    dx = details[0],
                    dy = details[1],
                    d = details[2],
                    e = this.e * d;

                if (this.p.h === -1) {
                    this.p.x = n.x;
                    this.p.y = n.y;
                    return true;
                }

                if (d > 1) {
                    this.p.x -= ((dx / d) * e);
                    this.p.y -= ((dy / d) * e);
                } else {
                    if (this.p.h > 0) {
                        this.p.h--;
                    } else {
                        return true;
                    }
                }

                return false;
            },

            _update: function () {
                if (this._moveTowards(this.t)) {
                    var p = this.q.shift();

                    if (p) {
                        this.t.x = p.x || this.p.x;
                        this.t.y = p.y || this.p.y;
                        this.t.z = p.z || this.p.z;
                        this.t.a = p.a || this.p.a;
                        this.p.h = p.h || 0;
                    } else {
                        if (this.s) {
                            this.p.x -= Math.sin(Math.random() * 3.142);
                            this.p.y -= Math.sin(Math.random() * 3.142);
                        } else {
                            this.move(new S.Point({
                                x: this.p.x + (Math.random() * 50) - 25,
                                y: this.p.y + (Math.random() * 50) - 25
                            }));
                        }
                    }
                }

                d = this.p.a - this.t.a;
                this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
                d = this.p.z - this.t.z;
                this.p.z = Math.max(1, this.p.z - (d * 0.05));
            },

            distanceTo: function (n, details) {
                var dx = this.p.x - n.x,
                    dy = this.p.y - n.y,
                    d = Math.sqrt(dx * dx + dy * dy);

                return details ? [dx, dy, d] : d;
            },

            move: function (p, avoidStatic) {
                if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
                    this.q.push(p);
                }
            },

            render: function () {
                this._update();
                this._draw();
            }
        }


        S.ShapeBuilder = (function () {
            var gap = 13,
                shapeCanvas = document.createElement('canvas'),
                shapeContext = shapeCanvas.getContext('2d'),
                fontSize = 500,
                fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

            function fit() {
                shapeCanvas.width = Math.floor(window.innerWidth / gap) * gap;
                shapeCanvas.height = Math.floor(window.innerHeight / gap) * gap;
                shapeContext.fillStyle = 'red';
                shapeContext.textBaseline = 'middle';
                shapeContext.textAlign = 'center';
            }

            function processCanvas() {
                var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data;
                dots = [],
                pixels,
                x = 0,
                y = 0,
                fx = shapeCanvas.width,
                fy = shapeCanvas.height,
                w = 0,
                h = 0;

                for (var p = 0; p < pixels.length; p += (4 * gap)) {
                    if (pixels[p + 3] > 0) {
                        dots.push(new S.Point({
                            x: x,
                            y: y
                        }));

                        w = x > w ? x : w;
                        h = y > h ? y : h;
                        fx = x < fx ? x : fx;
                        fy = y < fy ? y : fy;
                    }

                    x += gap;

                    if (x >= shapeCanvas.width) {
                        x = 0;
                        y += gap;
                        p += gap * 4 * shapeCanvas.width;
                    }
                }

                return { dots: dots, w: w + fx, h: h + fy };
            }

            function setFontSize(s) {
                shapeContext.font = 'bold ' + s + 'px ' + fontFamily;
            }

            function isNumber(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }

            function init() {
                fit();
                window.addEventListener('resize', fit);
            }

            // Init
            init();

            return {
                imageFile: function (url, callback) {
                    var image = new Image(),
                        a = S.Drawing.getArea();

                    image.onload = function () {
                        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
                        shapeContext.drawImage(this, 0, 0, a.h * 0.6, a.h * 0.6);
                        callback(processCanvas());
                    };

                    image.onerror = function () {
                        callback(S.ShapeBuilder.letter('What?'));
                    }

                    image.src = url;
                },

                circle: function (d) {
                    var r = Math.max(0, d) / 2;
                    shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
                    shapeContext.beginPath();
                    shapeContext.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false);
                    shapeContext.fill();
                    shapeContext.closePath();

                    return processCanvas();
                },

                letter: function (l) {
                    var s = 0;

                    setFontSize(fontSize);
                    s = Math.min(fontSize,
                                (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * fontSize,
                                (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize);
                    setFontSize(s);

                    shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
                    shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);

                    return processCanvas();
                },

                rectangle: function (w, h) {
                    var dots = [],
                        width = gap * w,
                        height = gap * h;

                    for (var y = 0; y < height; y += gap) {
                        for (var x = 0; x < width; x += gap) {
                            dots.push(new S.Point({
                                x: x,
                                y: y
                            }));
                        }
                    }

                    return { dots: dots, w: width, h: height };
                }
            };
        }());


        S.Shape = (function () {
            var dots = [],
                width = 0,
                height = 0,
                cx = 0,
                cy = 0;

            function compensate() {
                var a = S.Drawing.getArea();

                cx = a.w / 2 - width / 2;
                cy = a.h / 2 - height / 2;
            }

            return {
                shuffleIdle: function () {
                    var a = S.Drawing.getArea();

                    for (var d = 0; d < dots.length; d++) {
                        if (!dots[d].s) {
                            dots[d].move({
                                x: Math.random() * a.w,
                                y: Math.random() * a.h
                            });
                        }
                    }
                },

                switchShape: function (n, fast) {
                    var size,
                        a = S.Drawing.getArea();

                    width = n.w;
                    height = n.h;

                    compensate();

                    if (n.dots.length > dots.length) {
                        size = n.dots.length - dots.length;
                        for (var d = 1; d <= size; d++) {
                            dots.push(new S.Dot(a.w / 2, a.h / 2));
                        }
                    }

                    var d = 0,
                        i = 0;

                    while (n.dots.length > 0) {
                        i = Math.floor(Math.random() * n.dots.length);
                        dots[d].e = fast ? 0.25 : (dots[d].s ? 0.14 : 0.11);

                        if (dots[d].s) {
                            dots[d].move(new S.Point({
                                z: Math.random() * 20 + 10,
                                a: Math.random(),
                                h: 18
                            }));
                        } else {
                            dots[d].move(new S.Point({
                                z: Math.random() * 5 + 5,
                                h: fast ? 18 : 30
                            }));
                        }

                        dots[d].s = true;
                        dots[d].move(new S.Point({
                            x: n.dots[i].x + cx,
                            y: n.dots[i].y + cy,
                            a: 1,
                            z: 5,
                            h: 0
                        }));

                        n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1));
                        d++;
                    }

                    for (var i = d; i < dots.length; i++) {
                        if (dots[i].s) {
                            dots[i].move(new S.Point({
                                z: Math.random() * 20 + 10,
                                a: Math.random(),
                                h: 20
                            }));

                            dots[i].s = false;
                            dots[i].e = 0.04;
                            dots[i].move(new S.Point({
                                x: Math.random() * a.w,
                                y: Math.random() * a.h,
                                a: 0.3, //.4
                                z: Math.random() * 4,
                                h: 0
                            }));
                        }
                    }
                },

                render: function () {
                    for (var d = 0; d < dots.length; d++) {
                        dots[d].render();
                    }
                }
            }
        }());


        S.init();
    }
    
    
    ////$(".bg").css({ "-webkit-animation": "bgchange 10s linear infinite", "animation": "bgchange 30s linear infinite" });
    //appCache.addEventListener("noupdate", function () {
    //    //不需要更新缓存
    //    loading.find(".fly-progress").width("100%")
    //    loading.find(".prec").html("100%");
    //    setTimeout(function () {
    //        loading.hide();
    //        $(".bg").css("-webkit-filter", "blur(0)");
    //        flyService.canvasEffect();
    //        flyService.textEffect($(".fly-header-title"));
    //    }, 1000);
       
    //    document.title = "大前端,小分享";
    //})
    //appCache.addEventListener("checking", function (e) {
    //    //开始缓存
    //    loading.show();
    //    //document.title = "checking...";
    //});
    //appCache.addEventListener("downloading", function (e) {
    //    document.title = "开始下载...";
    //});

    //appCache.addEventListener("progress", function (e) {
    //    //在清单文件下载过程中周期性触发
    //    var scale = e.loaded / e.total;
    //    loading.find(".fly-progress").width(parseInt(scale) * 100 + "%")
    //    loading.find(".prec").html(parseInt(scale) * 100 + "%");

    //});
    //appCache.addEventListener("cached", function (e) {
    //    //下载完毕及缓存成功
       
    //    document.title = "下载完成";
    //    setTimeout(function () {
    //        loading.hide();
    //        document.title = "大前端,小分享";
    //        $(".bg").css("-webkit-filter", "blur(0)");
    //        flyService.canvasEffect();
    //        flyService.textEffect($(".fly-header-title"));
    //    }, 1020);
    //});
    //appCache.addEventListener("obsolete", function (e) {
    //    //未找到缓存清单.
         
    //});

    //appCache.addEventListener("error", function (e) {
        
    //    /*
    //     * 若要达到触发该事件，需要满足一下几种情况之一：
    //    1、已经触发obsolete事件
    //    2、manifest文件没有改变，但缓存文件中存在文件下载失败
    //    3、获取manifest资源文件时发生致命错误。
    //    4、当更新本地缓存时，manifest文件再次被更改。
    //     */
    //})

}]);

angular.element(document).ready(function () {
    //angular.bootstrap(document, ["myApp"]);

     
  
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

   
  
});

model.run(["$rootScope", "$location", function ($rootScope, $location) {
    $rootScope.$on("$viewContentLoaded", function () {
       
    });
}]);
model.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/index", {
        templateUrl: "templates/index.html"
    }).when("/news", {
        templateUrl: "templates/news.html"
    }).when("/html5", {
        templateUrl: "templates/html5.html"
    }).when("/css3", {
        templateUrl: "templates/css3.html"
    }).when("/js", {
        templateUrl: "templates/js.html"
    }).otherwise({
        redirectTo: "/index"
    });
}]);

model.directive("flyHeaderTitle", ["$timeout", function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
           
            
        }
    }
}]).directive("flyStartBtn", [function () {
    return {
        restrict: "A",
        link: function (scope, element, attr) {
            var flyNav = $("#fly-nav li");
            var len = flyNav.size();
            $(element).on("click", function () {
                var _arguments = arguments;
                _arguments.callee.open = !_arguments.callee.open;
                flyNav.each(function (i) {
                    var _this = $(this);
                    if (_arguments.callee.open) {
                        var startAng = -90;
                        _this.css({ opacity: 1, "-webkit-transition-delay": i * 100 + "ms", "transition-delay": i * 100 + "ms", "-webkit-transform": "rotate(" + (i * 72 + startAng) + "deg)", "transform": "rotate(" + (i * 72 + startAng) + "deg)" }).find("a").css({ "-webkit-transform": "rotate(" + (-(i * 72 + startAng)) + "deg)", "transform": "rotate(" + (-(i * 72 + startAng)) + "deg)" });
                        $(element).css({ background: "rgba(51, 51, 51, 0.9)", color: "#fff", "box-shadow": " 0 0 10px #f1f1f1" });
                    }
                    else {
                        _this.css({ opacity: 0, "-webkit-transition-delay": (len - i) * 100 + "ms", "transition-delay": (len - i) * 100 + "ms", "-webkit-transform": "rotate(" + ((i + 1) * 144) + "deg)", "transform": "rotate(" + ((i + 1) * 144) + "deg)" }).find("a").css({ "-webkit-transform": "rotate(144deg)", "transform": "rotate(144deg)" });
                        $(element).css({ background: "rgba(255, 255, 255, 0.9)", color: "#000", "box-shadow": "0 0 15px #222222" });
                    }
                });
              
            });
        }
    }
}]);

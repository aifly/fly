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
angular.element(document).ready(function () {
    //angular.bootstrap(document, ["myApp"]);

  
    !function () {

        var canvas = document.getElementById("logo");
        var context = canvas.getContext("2d");
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        var w = canvas.width, h = canvas.height;

        imgLoader("images/logo.png", loaded);
        var defaultPos = [];
        var lastPos = [];
        var m = Math;
        function loaded(img, undefined) {
            var imgW = img.width, imgH = img.height;
            var pixX = 80, pixY = 40;
            var oneW = imgW / pixX, oneH = imgH / pixY;
            var left = 200, top = 20;
            if (typeof Worker === undefined) {
                alert("你的浏览器不支持webworker,请用最新的chrome浏览器");
                return;
            }
            var worker = new Worker("js/worker/savedefaultpos.js");
            worker.postMessage({ pixX: pixX, pixY: pixY, oneW: oneW, oneH: oneH, left: left, top: top });
            worker.onmessage = function (e) {
                defaultPos = angular.copy(e.data);
                for (var i = 0; i < defaultPos.length; i++) {
                    context.save();
                    // context.scale(m.sin(m.random() * m.PI), m.sin(m.random() *m.PI));
                    var endX = w * m.sin(m.random() * m.PI), endY = h * 1 * m.sin(m.random() * m.PI);
                    context.drawImage(img, defaultPos[i].sx, defaultPos[i].sy, defaultPos[i].sw, defaultPos[i].sh, endX, endY, defaultPos[i].ew, defaultPos[i].eh);
                    context.restore();
                    context.globalAlpha = 0;
                    lastPos.push({ x: endX, y: endY });
                }

                worker.terminate();
            }

            var bStop = false;
            canvas.onclick = function (e) {
                if (!bStop) {
                    arguments.callee.open = !arguments.callee.open;
                    bStop = true;
                    if (arguments.callee.open) {
                        startMove(lastPos, defaultPos, 2000, "easeBothStrong");
                    }
                    else {
                        startMove(defaultPos, lastPos, 2000, "easeBothStrong", null, "open");
                    }
                }
            }
            setTimeout(function () {
                canvas.click();
            }, 1000);

            var timer = null;

            function startMove(sourceArr, targetArr, times, fx, fn, type) {
                var len = lastPos.length;

                var startTime = now();
                //window.cancelNextAnimationFrame(timer);
                timer = window.requestNextAnimationFrame(move);
                context.fillStyle = "#f00";

                function move() {
                    context.clearRect(0, 0, w, h);
                    var changeTime = now();

                    var scale = 1 - Math.max(0, startTime - changeTime + times) / times;
                    context.globalAlpha = type === "open" ? (1 - scale) : scale;
                    var i = 0

                    for (; i < len; i++) {
                        var valueX = ltTween[fx](scale * times, parseFloat(sourceArr[i]["x"]), parseFloat(targetArr[i]["x"]) - parseFloat(sourceArr[i]["x"]), times);
                        var valueY = ltTween[fx](scale * times, parseFloat(sourceArr[i]["y"]), parseFloat(targetArr[i]["y"]) - parseFloat(sourceArr[i]["y"]), times);
                        context.drawImage(img, defaultPos[i].sx, defaultPos[i].sy, defaultPos[i].sw, defaultPos[i].sh, valueX, valueY, defaultPos[i].ew, defaultPos[i].eh);
                    }

                    if (scale === 1) {
                        window.cancelNextAnimationFrame(timer);
                        bStop = false;
                        fn && fn();
                    }
                    else {
                        timer = window.requestNextAnimationFrame(move);
                    }
                }
                function now() {
                    return (new Date()).getTime();
                }

            }
        }
        function imgLoader(src, fn) {
            var img = new Image();
            img.onload = function () {
                fn && fn(this);
            }
            img.src = src;
        }
    }();
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

    var img = new Image();
    img.onload = function () {
        $(".bg").css("-webkit-filter", "blur(0)");
    };
    img.src = "images/bg.jpg";
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
           
            var transitionend = "onwebkittransitionend" in window ? "webkitTransitionEnd" : "transitionend";
            var html = "";
            var arr = $(element).html().trim().split("");
            angular.forEach(arr, function (item) {
                html += "<span>" + item + "</span>";
            });
            $(element).html(html).css("opacity", 1);
            var aSpan = $(element).find("span");
            var m = Math, width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;

            aSpan.each(function (i, item) {
                $(this).css("transform", "translate3d(" + (m.random() - .5) * width * (m.random() - .5 > 0 ? 2 : -2) + "px," + (m.random() - .5) * height * (m.random() - .5 > 0 ? 2 : -2) + "px,0)").css("transition-delay", 100 * i + "ms");
            });
            var ableMove = false;
            $(function () {
                $timeout(function () {
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

﻿requirejs.config({
    baseUrl:"js",
    paths: {
        "jquery": "jquery-1.11.0.min",
        "angular": "angular.min",
        "context":"context.min"
    },
    urlArgs: "bust=" + (new Date()).getTime()//防止读取缓存，调试用
});

requirejs(["jquery", "flyutil", "angular","context"], function ($, flyUtil) {
    'use strict';
    var flyHeader = $("#fly-header");
    if (navigator.appName === "Microsoft Internet Explorer" || navigator.userAgent.toLowerCase().indexOf("rv:11.0") > -1) {

    }
    else {
        $.get("fonts/fzxjl.ttf", {}, function (data, status) {
            if (status === "success") {
                $(".fly-nav-item a", flyHeader).css({ fontSize: 24, fontFamily: "fzxjl" });
            }
        });
    }
   
  

    var flyBlogApp = angular.module("flyBlogApp", ["ngRoute","ngAnimate"]);

    flyBlogApp.config(["$routeProvider", function ($routProvider) {
        $routProvider.when("/index", {
            templateUrl: "templates/index.html?t="+new Date().getTime()
        }).when("/aboutme", {
            templateUrl: "templates/aboutme.html?t=" + new Date().getTime()
        }).when("/slowlive", {
            templateUrl: "templates/slowlive.html?t=" + new Date().getTime()
        }).when("/somewords", {
            templateUrl: "templates/somewords.html?t=" + new Date().getTime()
        }).when("/share", {
            templateUrl: "templates/share.html?t=" + new Date().getTime()
        }).when("/message", {
            templateUrl: "templates/message.html?t=" + new Date().getTime()
        }).otherwise({
            redirectTo: "/index"
        });
    }]);

    flyBlogApp.controller("flyBlogController", ["$scope","$location", function ($scope,$location) {
        $scope.$location = $location;
    }]);
    flyBlogApp.run(["$rootScope","$location", function ($rootScope,$location) {
        $rootScope.$on("$viewContentLoaded", function () {
            if ($location.path() === "/index") {
                var $text = $("#fly-content .fly-index .fly-center p");
                var arr = $text.html().trim().split("");
                var html = "";
                angular.forEach(arr, function (item) {
                    html += "<span>" + item + "</span>";
                });
                $text.html(html);

                var aSpan = $text.find("span");
                var m = Math, width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;

                var aSpanWidth = aSpan.width(), aSpanHeight = aSpan.height();
                $(document).on("mousemove", function (e) {
                    var x = e.clientX, y = e.clientY;
                    angular.forEach(aSpan, function (item) {
                        var disX = m.pow(($(item).offset().left + aSpanWidth / 2 - x), 2),
                          disY = m.pow(($(item).offset().top + aSpanHeight / 2 - y), 2);
                        var dis = m.sqrt(disX + disY);
                        if (dis < 100) {
                            $(item).css("transform", "translate3d(0," + (dis - 100) + "px,0)");
                        }
                        else {
                            $(item).css("transform", "none");
                        }
                    });

                })
            } else {
                $(document).off("mousemove");
            }
        });
    }]);
    flyBlogApp.provider("flyBlogService", function () {//自定义服务
        return {
            $get: function () {
                return {
                    getQueryString: function (name) { //解析url地址参数
                        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                        var r = window.location.search.substr(1).match(reg);
                        if (r != null) return unescape(r[2]); return null;
                    },
                    createBg: function (src, fn, times, w, h) {
                        var doc = document;
                        var canvas = doc.createElement("canvas");
                        var context = canvas.getContext("2d");
                        canvas.width = w || doc.documentElement.clientWidth;
                        canvas.height = h || doc.documentElement.clientHeight;
                        context.stackBlurImage(src, times || 100, false, function () {
                            fn && fn(canvas.toDataURL());
                        });
                    }
                }
            }
        }
    }).directive("flyBody", ["flyBlogService", function (flyBlogService) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                // $(element).css({ background: "url(images/1.jpg) no-repeat center center", backgroundSize: "cover" });
                var aSpanLine = $(".fly-author span", flyHeader);
                $(".fly-author", flyHeader).on("mouseover", function () {
                    aSpanLine.each(function (i) {
                        $(this).css({ "-webkit-transform": "scale(1)", "transform": "scale(1)", "-webkit-transition-delay": i * 600 + "ms", "transition-delay": i * 400 + "ms" });
                    });
                }).on("mouseout", function () {
                    aSpanLine.each(function (i) {
                        $(this).css({ "-webkit-transform": "scale(0)", "transform": "scale(0)", "-webkit-transition-delay": (4 - i) * 600 + "ms", "transition-delay": (4 - i) * 400 + "ms" });
                    });
                });

                $("#fly-container").height(document.documentElement.clientHeight - flyHeader.height());

            }
        }
    }]);
    angular.bootstrap(document, ["flyBlogApp"]);
});
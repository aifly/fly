requirejs.config({
    baseUrl:"js",
    paths: {
        "jquery": "jquery-1.11.0.min",
        "angular":"angular.min"
    },
    urlArgs: "bust=" + (new Date()).getTime()//防止读取缓存，调试用
});

requirejs(["jquery", "flyutil", "angular"], function ($, flyUtil) {
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

    var flyBlogApp = angular.module("flyBlogApp", ["ngRoute"]);

    flyBlogApp.config(["$routeProvider", function ($routProvider) {
        $routProvider.when("/index", {
            templateUrl: "templates/index.html"
        }).when("/aboutme", {
            templateUrl: "templates/aboutme.html"
        }).when("/slowlive", {
            templateUrl: "templates/slowlive.html"
        }).when("/somewords", {
            templateUrl: "templates/somewords.html"
        }).when("/share", {
            templateUrl: "templates/share.html"
        }).when("/message", {
            templateUrl: "templates/message.html"
        }).otherwise({
            redirectTo: "/index"
        });
    }]);

    flyBlogApp.controller("flyBlogController", ["$scope","$location", function ($scope,$location) {
        $scope.$location = $location;
    }]);

    flyBlogApp.provider("flyBlogService", function () {//自定义服务
        return {
            $get: function () {
                return {
                    getQueryString: function (name) { //解析url地址参数
                        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                        var r = window.location.search.substr(1).match(reg);
                        if (r != null) return unescape(r[2]); return null;
                    }
                }
            }
        }
    });
    angular.bootstrap(document, ["flyBlogApp"]);
});
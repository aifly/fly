requirejs.config({
    baseUrl:"js",
    paths: {
        "jquery": "jquery-1.11.0.min",
        "angular":"angular.min"
    },
    urlArgs: "bust=" + (new Date()).getTime()//防止读取缓存，调试用
});

requirejs(["jquery", "flyUtil", "angular"], function ($, flyUtil) {
    'use strict';
    var flyHeader = $("#fly-header");
    if (navigator.appName === "Microsoft Internet Explorer" || navigator.userAgent.toLowerCase().indexOf("rv:11.0")>-1) {
       
    }
    else {
        $.get("fonts/fzxjl.ttf", {}, function (data, status) {
            if (status === "success") {
                $(".fly-nav-item a", flyHeader).css({ fontSize: 30, fontFamily: "fzxjl" });
            }
        });
    }
    var flyBlogApp = angular.module("flyBlogApp", []);
    flyBlogApp.controller("flyBlogController", ["$scope", function ($scope) {
    }]);

    angular.bootstrap(document, ["flyBlogApp"]);

    angular.element(document).ready(function () {
       
    });

  


});
'use strict';

angular
    .module('teachersApp', ['ngRoute', 'ui.bootstrap'], function ($httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        var param = function (obj) {
            var query = '',
                name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        $httpProvider.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	}];
    })
    .config(function ($routeProvider) {
        $routeProvider
            .when('/welcome', {
                templateUrl: 'views/welcome.html',
                controller: 'WelcomeCtrl',
                controllerAs: 'welcome'
            })
            .when('/teacher', {
                templateUrl: 'views/teacher.html',
                controller: 'TeacherCtrl',
                controllerAs: 'teacher'
            })
            .when('/class', {
                templateUrl: 'views/class.html',
                controller: 'ClassCtrl',
                controllerAs: 'class'
            })
            .when('/unavailable', {
                templateUrl: 'views/unavailable.html',
                controller: 'UnavailableCtrl',
                controllerAs: 'unavailable'
            })
            .otherwise({
                redirectTo: '/welcome'
            })
    })

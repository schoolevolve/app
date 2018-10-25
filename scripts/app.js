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
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .when('/payment', {
                templateUrl: 'views/payment.html',
                controller: 'PaymentCtrl',
                controllerAs: 'payment'
            })
            .when('/feed', {
                templateUrl: 'views/feed.html',
                controller: 'FeedCtrl',
                controllerAs: 'feed'
            })
            .when('/responses', {
                templateUrl: 'views/responses.html',
                controller: 'ResponsesCtrl',
                controllerAs: 'responses'
            })
            .when('/class', {
                templateUrl: 'views/class.html',
                controller: 'ClassCtrl',
                controllerAs: 'class'
            })
            .when('/settings', {
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl',
                controllerAs: 'settings'
            })
            .when('/logout', {
                templateUrl: 'views/logout.html',
                controller: 'LogoutCtrl',
                controllerAs: 'logout'
            })
            .when('/clear', {
                templateUrl: 'views/logout.html',
                controller: 'ClearCtrl',
                controllerAs: 'clear'
            })
            .otherwise({
                redirectTo: '/login'
            })
    })
    .directive('googleSignInButton', function ($window, $interval) {
        return {
            scope: {
                buttonId: '@',
                options: '&'
            },
            template: '<div></div>',
            link: function (scope, element, attrs) {
                var div = element.find('div')[0];
                div.id = attrs.buttonId;
                if (!$window.gapi) {
                    $interval(renderGapi, 1000, 1);
                } else renderGapi();

                function renderGapi() {
                    var options = scope.options();
                    options.longtitle = true;
                    $window.gapi.signin2.render(div.id, options);
                    $interval(() => {
                        jQuery('[id^=not_signed_in]').text("Teacher's sign in");
                    }, 500, 3);
                }
            }
        };
    });

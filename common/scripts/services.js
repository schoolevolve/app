'use strict';

angular.module('teachersApp')
    .service('mainService', function ($http, $uibModal, baseURL) {
        this.putRequest = function (fun, file, data) {
            data.fun = fun;
            return $http({
                method: 'POST',
                url: 'core/' + file + '.php',
                data: data
            });
        }

        function twoDigits(d) {
            if (0 <= d && d < 10) return "0" + d.toString();
            if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
            return d.toString();
        }
        Date.prototype.toMysqlFormat = function () {
            return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
        };

        this.errorHandler = function (error) {
			$http({
                method: 'POST',
                url: baseURL+'/common/core/logger.php',
                data: {
					fun:'logServerError',
					error: error.data
				}
            }).then(function (response) {}, function (error) {
                showErrorNotification(error);
            });
            /*this.putRequest('logServerError', '../common/core/logger', {
                error: error.data
            }).then(function (response) {}, function (error) {
                showErrorNotification(error)
            });*/

            showErrorNotification(error);
        }

        function showErrorNotification(error) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: baseURL + '/common/views/modals/notification.html',
                controller: 'NotificationModalCtrl',
                resolve: {
                    message: function () {
                        return error.data
                    },
                    isError: function () {
                        return true
                    },
                }
            });
            modalInstance.result.then(function () {}, function () {});
        }
    })
    .service('cacheService', function () {
        this.cache = {};
        this.setVar = function (name, value) {
            this.cache[name] = value;
        };
        this.getVar = function (name) {
            return this.cache[name];
        };
        this.setProperty = function (obj, id, prop, val) {
            if (!this.cache[obj]) this.cache[obj] = {};
            if (!this.cache[obj][id]) this.cache[obj][id] = {};
            this.cache[obj][id][prop] = val;
        }
        this.getProperty = function (obj, id, prop) {
            if (!this.cache[obj] || !this.cache[obj][id]) return null;
            else return this.cache[obj][id][prop];
        }
        this.clearAll = function () {
            this.cache = {};
        }
    });

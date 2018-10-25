'use strict';

angular.module('teachersApp')
    .controller('RegisterModalCtrl', function ($scope, mainService, classService, $uibModalInstance, classInfo, credentials) {
        $scope.process = {};
        $scope.classInfo = classInfo;
        $scope.reg = {
            credentials: credentials,
            errors: {}
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.registerToClass = function () {
            $scope.registerBlock = true;
            console.log('register to class');
            $scope.reg.errors = {};

            classService.registerToClass(classInfo.class_id, $scope.reg, function (response) {
                //response = response.trim();
                console.log("'" + response + "'");
                //console.log(response == '-1');
                if (response == '-1') {
                    $scope.registerBlock = false;
                    $scope.reg.errors.alreadyRegistered = true;
                } else if (response == '-2') {
                    $scope.registerBlock = false;
                    $scope.reg.errors.studentsLimit = true;
                } else $uibModalInstance.close({
                    credentials_id: response,
                    credentials: $scope.reg.credentials
                });
            }, function (response) {
                mainService.errorHandler(response);
            });
        };
    });

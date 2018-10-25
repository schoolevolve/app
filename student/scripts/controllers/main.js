'use strict';

angular.module('teachersApp')
    .controller('LoginCtrl', function ($scope, loginService, mainService, $location) {
        // console.log('login');
        $scope.loginTried = false;
        $scope.authorized = false;

        // console.log('login1 ' + (propertyService.getTeacherId() == -1));
        if (propertyService.getTeacherId() != -1) {
            //console.log('login2 ' + (propertyService.getTeacherId() == -1));
            loginService.login(0, function (response) {
                //console.log(response + ' = ' + propertyService.getTeacherId());
                if (response != '-1') authorizationSuccess(response);
                else $scope.loginTried = true;
            }, function (error) {
                mainService.errorHandler(error);
            });
        }

        $scope.teachers = ['Ilya', 'Pierre'];
        $scope.selectedTeacher = 'Ilya';

        $scope.tryLogin = function () {
            //if(!$scope.loginTried) return;

            var userId = 1;
            if ($scope.selectedTeacher != 'Ilya') userId = 2;
            // console.log('login = ' + $scope.selectedTeacher);
            loginService.login(userId, function (response) {
                if (response != '-1') + authorizationSuccess(response);
                else $scope.loginFailed = true;
            }, function (error) {
                mainService.errorHandler(error);
            });
        };


        function authorizationSuccess(teacherId) {
            //teacherId = parseInt(teacherId);
            //console.log('logged = ' + teacherId);
            propertyService.setTeacherId(teacherId);
            $scope.authorized = true;
            $location.path('responses');
        }


    })
    .controller('LogoutCtrl', function ($scope, loginService, mainService, propertyService, $location) {
        //console.log('logout');
    })
    .controller('HeaderCtrl', function ($scope, $location) {
        // console.log('header');
        $scope.location = $location;
    });

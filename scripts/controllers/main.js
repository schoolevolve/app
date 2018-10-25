'use strict';

angular.module('teachersApp')
    .controller('LoginCtrl', function ($scope, $window, loginService, mainService, teacherService, cacheService, $location, $timeout, baseURL) {
        loginService.tryStudent(goToTeacher, function () {
            // console.log('try teacher');
            loginService.tryLogin(loginSuccessful, function () {
                //console.log('try teacher f');
                $scope.loaded = true;
            });
        });

        $scope.tryLogin = function (userToken) {
            loginService.login(userToken, function (response, tutorial) {
                if (response.teacher_id != '-1') loginSuccessful(response.teacher_id, response.tutorial);
                else $scope.loginFailed = true;
            }, function (error) {
                mainService.errorHandler(error);
            });
        };

        var loggedIn = false;

        function loginSuccessful(teacherId, tutorial) {
            //console.log('try teacher s');
            loggedIn = true;
            $scope.loaded = true;

            teacherService.loadTeacherInfo(function (teacherInfo) {
                $scope.loaded = true;
                $scope.teacher = teacherInfo;
                $scope.teacher.introduced = teacherInfo.teacher_lastName.trim() != '';
                //console.log('try teacher info');
                if ($scope.teacher.introduced) $location.path('responses');

            }, function (error) {
                mainService.errorHandler(error);
            });
        }


        $scope.options = {
            'onsuccess': function (googleUser) {
                $scope.loaded = false;
                if (loggedIn) return;
                var profile = googleUser.getBasicProfile();

                $scope.teacherEmail = profile.getEmail();
                $scope.id_token = googleUser.getAuthResponse().id_token;
                loginService.checkRegistered($scope.teacherEmail, function (response) {
                    $scope.loaded = true;
                    if (response != '"0"') {
                        $scope.tryLogin($scope.id_token);
                    } else {
                        $scope.notRegistered = true;
                    }
                }, function (error) {
                    mainService.errorHandler(error);
                })

            }
        }

        $scope.proceedLogin = function () {
            $scope.loaded = false;
            $scope.tryLogin($scope.id_token);
        }

        $scope.updateTeacherInfo = function () {
            $scope.updateInfoBlock = true;
            teacherService.updateTeacherInfo($scope.teacher, function (response) {
                $scope.updateInfoBlock = false;
                $scope.teacher.introduced = true;
                if (!$scope.tutorial) $location.path('responses');
            }, function (error) {
                mainService.errorHandler(error);
            });
        }

        $scope.tryTeacherCode = function () {
            $scope.student.wrongCode = false;
            loginService.tryTeacherCode($scope.student.teacherCode, function (response) {
                if (response.trim() == '-1') {
                    $scope.student.wrongCode = true;
                    /*$timeout(function () {
                        $scope.student.wrongCode = false;
                    }, 2000);*/
                } else goToTeacher($scope.student.teacherCode);
            }, function (error) {
                mainService.errorHandler(error);
            });
        }

        function goToTeacher(teacherLabel) {
            loginService.updateCookies(teacherLabel, function () {
                $window.location = baseURL + '/student/#!/teacher?teacherId=' + teacherLabel;
            }, function (error) {
                mainService.errorHandler(error);
            });
        }

        //function goToClass(classLabel) {
        //$window.location = baseURL + '/student/#!/class?classId=' + classLabel;
        //}
    })
    .controller('ClearCtrl', function ($location, loginService) {
        loginService.clearStudent(function (response) {
            $location.path('login');
        }, function (error) {
            mainService.errorHandler(error);
        });
    })
    .controller('LogoutCtrl', function ($scope, $window, loginService, mainService, cacheService, $location) {
        $window.gapi.load('auth2', function () {
            $window.gapi.auth2.init().then(function () {
                var auth2 = $window.gapi.auth2.getAuthInstance();
                auth2.signOut().then(function () {
                    loginService.logout(function (response) {

                        cacheService.clearAll();
                        $scope.loaded = true;
                    }, function (error) {
                        mainService.errorHandler(error);
                    });
                });
            });
        });

        $scope.goToLogin = function () {
            $window.location = '';
        }
    })
    .controller('HeaderCtrl', function ($scope, $location, $window) {
        $scope.location = $location;
    })
    .controller('PaymentCtrl', function ($scope, $location, mainService, paymentService, loginService, $window) {
        var params = $location.search();

        var paymentId = params.payment_id;
        var customerId = params.customer_id;


        if (customerId) paymentService.checkCustomer(customerId, handleResponse, function (error) {
            mainService.errorHandler(error);
        });
        else if (paymentId) paymentService.checkPayment(paymentId, handleResponse, function (error) {
            mainService.errorHandler(error);
        })
        else {
            $scope.paymentFailed = true;
        };


        function handleResponse(response) {

            if (response == -1) $scope.paymentFailed = true;
            else {
                $location.search({});
                loginService.tryLogin(function () {
                    $location.path('settings');
                });
            }
        }
    });

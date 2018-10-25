'use strict';

angular.module('teachersApp')
    .controller('WelcomeCtrl', function ($scope, $location, $timeout) {})
    .controller('LoginCtrl', function ($scope, loginService, mainService, $location, $uibModal, $window, baseURL) {
        $scope.logout = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../common/views/modals/confirmation.html',
                controller: 'ConfirmationModalCtrl',
                resolve: {
                    header: function () {
                        return `Are you sure you want to remove cookies?`;
                    },
                    question: function () {
                        return `By clicking Forget me, all cookie data is deleted`;
                    },
                    btnText: function () {
                        return 'Forget me';
                    },
                    btnClass: function () {
                        return 'ui-btn-delete';
                    }
                }
            });
            modalInstance.result.then(function () {
                loginService.logout(function (response) {
                    //$location.path('/welcome');
                    //$location.search({});
                    $window.location = baseURL + '/#!/clear';
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }, function () {});
        }
    })
    .controller('TeacherCtrl', function ($scope, $location, $window, baseURL, teacherService, mainService) {
        var params = $location.search();
        ////console.log(params);
        if (params.teacherId) {
            teacherService.loadClasses(params.teacherId, function (response) {
                if (response == 'null') $scope.invalidURL = true;
                else $scope.teacherClasses = response;
            }, function (error) {
                mainService.errorHandler(error)
            });

            teacherService.loadTeacherInfo(params.teacherId, function (response) {
                $scope.loaded = true;
                //console.log(response);
                if (response == 'null') $scope.invalidURL = true;
                else $scope.teacherInfo = response;

                //if ($scope.teacherInfo.unavailable == '1') $location.path('unavailable').search({});
            }, function (error) {
                mainService.errorHandler(error)
            });
        } else if (params.classId) $location.path('/class').search({
            classId: params.classId
        });
        else $scope.invalidURL = true;
        //else $location.path('/welcome');

        $scope.goToClass = function (classId) {
            //propertyService.setClassObj(classObj);
            $location.path('/class').search({
                classId: classId
            });
        };

        $scope.clearData = function () {
            $window.location = baseURL + '/#!/clear';
        };
    })
    .controller('ClassCtrl', function ($scope, loginService, classService, teacherService, mainService, $location, $uibModal, $timeout, $window) {
        var params = $location.search();
        //$scope.loadObj = {};
        ////console.log(params);
        if (params.classId) {
            classService.loadClassInfo(params.classId, function (classInfo) {
                //console.log('!! ' + classInfo);
                if (classInfo == 'null') $scope.invalidURL = true;
                $scope.classInfo = classInfo;

                //if (classInfo.unavailable == '1') $location.path('unavailable').search({});
                loginSuccessful(classInfo.class_id);
            }, function (error) {
                mainService.errorHandler(error)
            });
        } else if (params.teacherId) $location.path('/teacher').search({
            teacherId: params.teacherId
        });
        else $scope.invalidURL = true;

        function loginSuccessful(classId) {
            $scope.loaded = true;
            //$scope.prompts = [];
            $scope.feedback = {};
            //console.log(classId);

            classService.getClassCredentials(classId, function (response) {
                ////console.log(response);
                if (response) response = response.credentials;
                $scope.classCredentials = response;
                $scope.feedback.credentials = response;
            }, function (error) {
                mainService.errorHandler(error);
            });

            classService.loadPrompts(classId, function (prompts) {
                ////console.log(classId);
                $scope.prompts = prompts;
            }, function (error) {
                mainService.errorHandler(error);
            });

            /*teacherService.loadRemovalPolicy(classId, function (removalPolicy) {
                $scope.removalPolicy = removalPolicy;
            }, function (error) {
                mainService.errorHandler(error);
            });*/

            $scope.openRegister = function (credentials) {
                $scope.proposedCredentials = credentials;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/modals/register.html',
                    controller: 'RegisterModalCtrl',
                    resolve: {
                        classInfo: function () {
                            return $scope.classInfo;
                        },
                        credentials: function () {
                            return $scope.proposedCredentials;
                        }
                    }
                });
                modalInstance.result.then(function (credentials) {
                    $scope.classCredentials = credentials;
                    $scope.feedback.credentials = credentials.credentials;
                }, function () {});
            }

            $scope.goBack = function () {
                $window.history.back();
            }

            $scope.submitResponse = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '../common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Check your response`;
                        },
                        question: function () {
                            return `JumpID: ${$scope.feedback.credentials}\nTimestamp: ${new Date().toLocaleDateString()}\nPrompt: ${$scope.feedback.prompt.prompt_body}\n\nAre you sure this information is correct?\n\n "${$scope.feedback.feedback}"`;
                        },
                        btnText: function () {
                            return 'Ok';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        },
                    }
                });
                modalInstance.result.then(function () {
                    $scope.unregisteredSubmit = false;
                    $scope.responseBlock = true;
                    classService.submitResponse($scope.feedback, classId, function (response) {
                        if (response == '-1') {
                            $scope.unauthorizedError = true;
                        } else if (response == '-2') {
                            $scope.unregisteredSubmit = true;
                        } else {
                            $scope.submitSuccess = true;
                            $scope.feedback.prompt = '';
                            $scope.feedback.feedback = '';
                            $timeout(function () {
                                $scope.submitSuccess = false;
                            }, 2000);
                        }
                        $scope.responseBlock = false;
                    }, function (error) {
                        mainService.errorHandler(error);
                    });
                }, function () {});
            }
        }
        /*var teacherId = propertyService.getTeacherId();
        	//console.log(teacherId);
        if(!teacherId  || teacherId=="-1") $location.path('/login');*/

        /*teacherService.loadPrompts(teacherId, function(prompts){
        	$scope.prompts = prompts;
        	}, function(error){
        mainService.errorHandler(error)});*/
    })
    .controller('UnavailableCtrl', function () {

    });

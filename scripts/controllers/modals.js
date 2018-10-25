'use strict';

angular.module('teachersApp').controller('AddPromptModalCtrl', function ($uibModalInstance, $scope, promptsService) {

        $scope.addNewPrompt = function () {
            $scope.newPromptBlock = true;
            promptsService.addNewPrompt($scope.addPrompt, function (prompt_id) {
                $uibModalInstance.close({
                    prompt_id: prompt_id,
                    prompt_body: $scope.addPrompt.newPromptBody,
                    prompt_body_teacher: $scope.addPrompt.newPromptBodyTeacher,
                    prompt_body_student: $scope.addPrompt.newPromptBodyStudent,
                    category_id: '0'
                });
            }, function (error) {
                mainService.errorHandler(error);
                $scope.newPromptBlock = false;
            });
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }).controller('EditPromptModalCtrl', function ($uibModalInstance, $scope, promptsService, prompt) {
        $scope.prompt = prompt;
        //console.log(prompt);
        $scope.editPrompt = {
            promptId: prompt.prompt_id,
            newBody: prompt.prompt_body,
            newBodyStudent: prompt.prompt_body_student,
            newBodyTeacher: prompt.prompt_body_teacher,
        };

        $scope.updatePromptBody = function () {
            $scope.promptBlock = true;
            promptsService.updatePromptBody($scope.editPrompt, function () {
                $scope.prompt.prompt_body = $scope.editPrompt.newBody;
                $scope.prompt.prompt_body_teacher = $scope.editPrompt.newBodyTeacher;
                $scope.prompt.prompt_body_student = $scope.editPrompt.newBodyStudent;
                $uibModalInstance.close($scope.prompt);
            }, function (error) {
                mainService.errorHandler(error);
                $scope.promptBlock = false;
            });
        }

        $scope.deletePrompt = function () {
            promptsService.removePrompt($scope.prompt.prompt_id, function () {
                $uibModalInstance.close();
            }, function (error) {
                mainService.errorHandler(error);
            });
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };


    }).controller('AddClassModalCtrl', function ($uibModalInstance, $scope, teacherService, limited) {
        $scope.limited = limited;
        $scope.addClass = {};
        $scope.addNewClass = function () {
            if ($scope.limited) return;
            teacherService.addNewClass($scope.addClass.className, function (response) {
                $uibModalInstance.close({
                    class_id: response,
                    class_name: $scope.addClass.className
                });
            }, function (error) {
                mainService.errorHandler(error)
            });
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    })
    .controller('RegisterModalCtrl', function ($scope, mainService, classService, $uibModalInstance, classInfo) {
        $scope.process = {};
        $scope.classInfo = classInfo;
        $scope.reg = {
            //credentials: credentials,
            errors: {}
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.registerToClass = function () {
            $scope.registerBlock = true;
            //console.log('register to class');
            $scope.reg.errors = {};

            classService.registerToClass(classInfo.class_id, $scope.reg, function (response) {
                //console.log("'" + response + "'");
                if (response == '-1') {
                    $scope.registerBlock = false;
                    $scope.reg.errors.alreadyRegistered = true;
                } else if (response == '-2') {
                    $scope.registerBlock = false;
                    $scope.reg.errors.studentsLimit = true;
                } else $uibModalInstance.close({
                    credentials_id: response,
                    credentials: $scope.reg.credentials,
                    student_firstName: $scope.reg.firstName,
                    student_lastName: $scope.reg.lastName
                });
            }, function (response) {
                mainService.errorHandler(response);
            });
        };
    });;

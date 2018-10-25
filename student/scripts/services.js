'use strict';

angular.module('teachersApp')
    .service('loginService', function (mainService) {
        this.logout = function (successHandler, errorHandler) {
            mainService.putRequest('logout', 'login', {}).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }
    })
    .service('teacherService', function (mainService, cacheService) {
        this.loadClasses = function (teacherId, successHandler, errorHandler) {
            var teacherId = teacherId;
            var teacherClasses = cacheService.getVar('teacherClasses');
            if (!teacherClasses) {
                mainService.putRequest('loadClasses', 'teacher', {
                    teacherId: teacherId
                }).then(function (myClasses) {
                    ////console.log(myClasses);
                    cacheService.setVar('teacherClasses', myClasses.data);
                    successHandler(myClasses.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(teacherClasses);
        }

        this.loadTeacherInfo = function (teacherId, successHandler, errorHandler) {
            var teacherId = teacherId;
            var teacherInfo = cacheService.getVar('teacherInfo');
            if (!teacherInfo) {
                mainService.putRequest('loadTeacherInfo', 'teacher', {
                    teacherId: teacherId
                }).then(function (teacherInfo) {
                    //console.log(teacherInfo);
                    cacheService.setVar('teacherInfo', teacherInfo.data);
                    successHandler(teacherInfo.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(teacherInfo);
        }

        this.loadRemovalPolicy = function (classId, successHandler, errorHandler) {
            var teacherId = teacherId;
            var removalPolicy = cacheService.getVar('removalPolicy');
            if (!removalPolicy) {
                mainService.putRequest('loadRemovalPolicy', 'teacher', {
                    classId: classId
                }).then(function (removalPolicy) {
                    removalPolicy = removalPolicy.data;
                    removalPolicy.remove_responses = removalPolicy.remove_responses == '1';
                    ////console.log(removalPolicy);
                    cacheService.setVar('removalPolicy', removalPolicy);
                    successHandler(removalPolicy);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(removalPolicy);
        }
    })
    .service('classService', function (mainService, cacheService) {

        this.getClassCredentials = function (classId, successHandler, errorHandler) {
            var classId = classId;
            var credentials = cacheService.getVar('credentials');
            if (!credentials) {
                mainService.putRequest('loadCredentials', 'class', {}).then(function (credentials) {
                    var result = [];
                    credentials.data.forEach(function (cred) {
                        result[cred.class_id] = cred;
                    });
                    //console.log(credentials);
                    cacheService.setVar('credentials', result);
                    successHandler(result[classId]);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(credentials[classId]);
        }

        this.loadClassInfo = function (classId, successHandler, errorHandler) {
            var classId = classId;
            var classInfo = cacheService.getProperty('classes', classId, 'info');
            if (!classInfo) {
                mainService.putRequest('loadClassInfo', 'class', {
                    classId: classId
                }).then(function (classInfo) {
                    cacheService.setProperty('classes', classId, 'info', classInfo.data);
                    successHandler(classInfo.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(classInfo);
        }

        this.loadPrompts = function (classId, successHandler, errorHandler) {
            var classId = classId;
            var classPrompts = cacheService.getProperty('classes', classId, 'prompts');
            if (!classPrompts) {
                mainService.putRequest('loadPrompts', 'class', {
                    classId: classId
                }).then(function (classPrompts) {
                    cacheService.setProperty('classes', classId, 'prompts', classPrompts.data);
                    successHandler(classPrompts.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(classPrompts);
        }

        this.registerToClass = function (classId, regForm, successHandler, errorHandler) {
            mainService.putRequest('registerToClass', 'class', {
                classId: classId,
                cred: regForm.credentials,
                firstName: regForm.firstName,
                lastName: regForm.lastName
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.submitResponse = function (feedback, classId, successHandler, errorHandler) {
            var responseDate = new Date();
            responseDate.setHours(responseDate.getHours() + 4);
            responseDate = new Date(Date.UTC(responseDate.getFullYear(), responseDate.getMonth(), responseDate.getDate(), responseDate.getHours(), responseDate.getMinutes(), responseDate.getSeconds()));
            mainService.putRequest('submitResponse', 'class', {
                cred: feedback.credentials,
                promptId: feedback.prompt.prompt_id,
                feedback: feedback.feedback,
                classId: classId,
                timestamp: responseDate.getTime()
            }).then(function (response) {
                //console.log(response);
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }
    });

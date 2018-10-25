'use strict';

angular.module('teachersApp')
    .service('loginService', function (mainService, cacheService, $location) {
        this.login = function (teacherToken, successHandler, errorHandler) {
            mainService.putRequest('login', 'login', {
                teacherToken: teacherToken
            }).then(function (response) {
                response = response.data;
                successHandler(response);
            }, function (error) {
                errorHandler(error);
            });
        };

        this.logout = function (successHandler, errorHandler) {
            mainService.putRequest('logout', 'login', {}).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        };

        this.checkRegistered = function (email, successHandler, errorHandler) {
            mainService.putRequest('checkRegistered', 'login', {
                email: email
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        };

        this.tryStudent = function (loginSuccessful, loginFailed) {
            mainService.putRequest('loginStudent', 'login', {}).then(function (response) {
                //console.log(response.data);
                if (response.data.studentTeacher != '-1') loginSuccessful(response.data.studentTeacher);
                else loginFailed();
            }, function (error) {
                loginFailed(error);
            });
        }

        this.clearStudent = function (successHandler, errorHandler) {
            mainService.putRequest('clearStudent', 'login', {}).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updateCookies = function (teacherLabel, successHandler, errorHandler) {
            //console.log('update');
            mainService.putRequest('createStudent', 'login', {
                teacherLabel: teacherLabel
            }).then(function (response) {
                //console.log(response.data);
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.tryTeacherCode = function (code, successHandler, errorHandler) {
            mainService.putRequest('tryCode', 'login', {
                code: code
            }).then(function (response) {
                //console.log(response.data);
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.tryLogin = function (loginSuccessful, loginFailed) {
            var teacherId = cacheService.getVar('teacherId');
            var tutorial = cacheService.getVar('tutorial');

            if (!teacherId || teacherId == '-1') {
                this.login(0, function (response) {

                    if (response.teacher_id != '-1') {
                        cacheService.setVar('teacherId', response.teacher_id);
                        var tutorial = response.tutorial == '1';
                        cacheService.setVar('tutorial', tutorial);
                        var paid = response.paid == '1';

                        loginSuccessful(response.teacher_id, tutorial);
                    } else {
                        if (loginFailed) loginFailed(response.teacher_id);
                        $location.path('/login');
                    }
                }, function (error) {
                    mainService.errorHandler(error);
                });
            } else {

                loginSuccessful(teacherId, tutorial);
            }
        };
    })
    .service('teacherService', function (mainService, cacheService) {

        this.loadTeacherInfo = function (successHandler, errorHandler) {
            var teacherInfo = cacheService.getVar('teacherInfo');
            if (!teacherInfo) {
                mainService.putRequest('loadTeacherInfo', 'teacher', {}).then(function (teacherInfo) {
                    teacherInfo = teacherInfo.data;
                    teacherInfo.last_visit = new Date(teacherInfo.last_visit);
                    teacherInfo.paid_until = new Date(teacherInfo.paid_until).toLocaleDateString();

                    cacheService.setVar('teacherInfo', teacherInfo);
                    successHandler(teacherInfo);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(teacherInfo);
        }

        this.setTutorial = function (hide, successHandler, errorHandler) {
            mainService.putRequest('setTutorial', 'teacher', {
                showTutorial: (hide) ? 0 : 1
            }).then(function (response) {
                cacheService.setVar('tutorial', !hide);
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.sendReport = function (classId, successHandler, errorHandler) {
            mainService.putRequest('sendReport', 'teacher', {
                classId: classId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.loadSettings = function (successHandler, errorHandler) {
            var settings = cacheService.getVar('settings');
            var notifications = cacheService.getVar('notifications');
            if (!settings) {
                mainService.putRequest('loadSettings', 'teacher', {}).then(function (settings) {
                    var data = settings.data;
                    var settingsObj = {};
                    var notificationsObj = {};

                    settingsObj.remove_responses = data.remove_responses == '1';
                    settingsObj.keep_pin = data.keep_pin == '1';
                    settingsObj.remove_after = data.remove_after;
                    settingsObj.category_id = data.category_id;

                    notificationsObj.send_reports = data.send_reports == '1';
                    notificationsObj.send_reports_type = data.send_reports_type;
                    notificationsObj.send_reports_time = data.send_reports_time;

                    cacheService.setVar('settings', settingsObj);
                    cacheService.setVar('notifications', notificationsObj);
                    successHandler(settingsObj, notificationsObj);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(settings, notifications);
        }

        this.updateTeacherInfo = function (teacher, successHandler, errorHandler) {
            var data = {
                teacher_title: teacher.teacher_title,
                teacher_firstName: teacher.teacher_firstName,
                teacher_lastName: teacher.teacher_lastName
            };
            mainService.putRequest('updateTeacherInfo', 'teacher', data).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updateSettings = function (settings, successHandler, errorHandler) {
            var data = {
                removeResponses: (settings.remove_responses) ? 1 : 0,
                removeCategory: settings.category_id,
                removeAfter: settings.remove_after,
                keepPin: (settings.keep_pin) ? 1 : 0
            };
            mainService.putRequest('updateSettings', 'teacher', data).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updateNotifications = function (notifications, successHandler, errorHandler) {
            var data = {
                sendReports: (notifications.send_reports) ? 1 : 0,
                sendReportsType: notifications.send_reports_type,
                sendReportsTime: notifications.send_reports_time,
            };

            mainService.putRequest('updateNotifications', 'teacher', data).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.loadClasses = function (successHandler, errorHandler) {
            var myClasses = cacheService.getVar('myClasses');
            if (!myClasses) {
                mainService.putRequest('loadClasses', 'teacher', {}).then(function (myClasses) {
                    cacheService.setVar('myClasses', myClasses.data);
                    successHandler(myClasses.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(myClasses);
        }

        this.loadPromptsAmount = function (successHandler, errorHandler) {

            mainService.putRequest('loadPromptsAmount', 'teacher', {}).then(function (promptsAmount) {

                var result = [];
                promptsAmount.data.forEach(function (classData) {
                    result[classData.class_id] = classData.prompts_amount;
                });

                successHandler(result);
            }, function (error) {
                errorHandler(error);
            });

        }

        this.addNewClass = function (className, successHandler, errorHandler) {
            mainService.putRequest('addNewClass', 'teacher', {
                className: className
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removeClass = function (classId, successHandler, errorHandler) {
            mainService.putRequest('removeClass', 'teacher', {
                classId: classId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removeClasses = function (successHandler, errorHandler) {
            mainService.putRequest('removeClasses', 'teacher', {}).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removeResponse = function (responseId, successHandler, errorHandler) {
            mainService.putRequest('removeResponse', 'teacher', {
                responseId: responseId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removeResponses = function (classId, successHandler, errorHandler) {
            mainService.putRequest('removeResponses', 'teacher', {
                classId: classId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

    })
    .service('classService', function (mainService, cacheService) {

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

        this.loadStudentInfo = function (studentId, successHandler, errorHandler) {
            var studentId = studentId;
            var studentInfo = cacheService.getProperty('students', studentId, 'info');
            if (!studentInfo) {
                mainService.putRequest('loadStudentInfo', 'class', {
                    studentId: studentId
                }).then(function (studentInfo) {

                    cacheService.setProperty('students', studentId, 'info', studentInfo.data);
                    successHandler(studentInfo.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(studentInfo);
        }

        this.loadClassPrompts = function (classId, successHandler, errorHandler) {
            var classId = classId;
            var classPrompts = cacheService.getProperty('classes', classId, 'prompts');
            if (!classPrompts) {
                mainService.putRequest('loadClassPrompts', 'class', {
                    classId: classId
                }).then(function (classPrompts) {
                    cacheService.setProperty('classes', classId, 'prompts', classPrompts.data);
                    successHandler(classPrompts.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(classPrompts);
        }

        this.loadRegisteredStudents = function (classId, successHandler, errorHandler) {
            var classId = classId;
            var classStudents = cacheService.getProperty('classes', classId, 'students');
            if (!classStudents) {
                mainService.putRequest('loadRegisteredStudents', 'class', {
                    classId: classId
                }).then(function (classStudents) {
                    cacheService.setProperty('classes', classId, 'students', classStudents.data);
                    successHandler(classStudents.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(classStudents);
        }

        this.addPromptToClass = function (add, promptId, classId, successHandler, errorHandler) {
            mainService.putRequest('addPromptToClass', 'class', {
                classId: classId,
                promptId: promptId,
                add: (add) ? 1 : 0
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removeStudent = function (classId, credId, successHandler, errorHandler) {
            mainService.putRequest('removeStudent', 'class', {
                classId: classId,
                credId: credId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updateClassName = function (classId, className, successHandler, errorHandler) {
            mainService.putRequest('updateClassName', 'class', {
                classId: classId,
                className: className
            }).then(function (response) {
                cacheService.setVar('myClasses', undefined);
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.registerToClass = function (classId, regForm, successHandler, errorHandler) {
            mainService.putRequest('registerToClass', '../../student/core/class', {
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
    })
    .service('promptsService', function (mainService, cacheService) {
        this.loadCategories = function (successHandler, errorHandler) {
            var categories = cacheService.getVar('categories');
            if (!categories) {
                mainService.putRequest('loadCategories', 'prompt', {}).then(function (categories) {
                    cacheService.setVar('categories', categories.data);
                    successHandler(categories.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(categories);
        }

        this.loadPrompts = function (successHandler, errorHandler) {
            var prompts = cacheService.getVar('prompts');
            if (!prompts) {
                mainService.putRequest('loadPrompts', 'prompt', {}).then(function (prompts) {
                    cacheService.setVar('prompts', prompts.data);
                    successHandler(prompts.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(prompts);
        }

        this.addNewPrompt = function (prompt, successHandler, errorHandler) {
            mainService.putRequest('addNewPrompt', 'prompt', {
                promptBody: prompt.newPromptBody,
                promptBodyTeacher: prompt.newPromptBodyTeacher,
                promptBodyStudent: prompt.newPromptBodyStudent
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updatePromptBody = function (prompt, successHandler, errorHandler) {
            mainService.putRequest('updatePromptBody', 'prompt', {
                promptId: prompt.promptId,
                promptBody: prompt.newBody,
                promptBodyTeacher: prompt.newBodyTeacher,
                promptBodyStudent: prompt.newBodyStudent,
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.removePrompt = function (promptId, successHandler, errorHandler) {
            mainService.putRequest('removePrompt', 'prompt', {
                promptId: promptId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }
    })
    .service('responsesService', function (mainService, cacheService) {
        this.loadResponses = function (reload, successHandler, errorHandler) {
            var responses = cacheService.getVar('responses');
            if (reload || !responses) {
                mainService.putRequest('loadResponses', 'response', {}).then(function (responses) {
                    responses.data.forEach(function (response) {
                        var timestamp = Date.parse(response.response_date)
                        if (isNaN(timestamp) == false) response.response_date = new Date(timestamp);
                        else response.response_date = null;
                    });
                    cacheService.setVar('responses', responses.data);
                    successHandler(responses.data);
                }, function (error) {
                    errorHandler(error);
                });
            } else successHandler(responses);
        }

        this.pinResponse = function (responseId, pinned, wasted, credentialsId, successHandler, errorHandler) {
            mainService.putRequest('pinResponse', 'response', {
                responseId: responseId,
                responsePinned: pinned,
                responseWasted: wasted,
                credentialsId: credentialsId,
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }


        this.updateResponsesStudent = function (credId, successHandler, errorHandler) {
            mainService.putRequest('updateResponsesStudent', 'response', {
                credId: credId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.updateResponsesClass = function (classId, successHandler, errorHandler) {
            mainService.putRequest('updateResponsesClass', 'response', {
                classId: classId
            }).then(function (response) {
                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }
    })
    .service('paymentService', function (mainService, cacheService) {
        this.checkPayment = function (paymentId, successHandler, errorHandler) {
            mainService.putRequest('checkPayment', 'payment', {
                paymentId: paymentId
            }).then(function (response) {

                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }

        this.checkCustomer = function (customerId, successHandler, errorHandler) {
            mainService.putRequest('checkCustomer', 'payment', {
                customerId: customerId
            }).then(function (response) {

                successHandler(response.data);
            }, function (error) {
                errorHandler(error);
            });
        }
    });

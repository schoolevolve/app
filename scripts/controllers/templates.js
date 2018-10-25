'use strict';

angular.module('teachersApp')
    .controller('ResponsesCtrl', function ($scope, $location, teacherService, mainService, loginService, responsesService, $uibModal, $interval, $window) {
        $window.scrollTo(0, 0);
        loginService.tryLogin(loginSuccessful);

        function loginSuccessful(teacherId, tutorial) {
            //console.log(teacherId + ' ' + tutorial);
            $scope.myClasses = [];
            $scope.responsesObj = {};
            //$scope.tutorial = tutorial;

            $scope.filteredResponsesArr = [];
            $scope.classResponsesArr = [];

            $scope.dynamicPopover = {
                templateUrl: 'tutorialTemplate.html',
                isOpen: tutorial,
            };

            $scope.classSort = function (c) {
                var classResponses = $scope.classResponsesArr[c.class_id];
                if (classResponses && classResponses[0] && classResponses[0].response_date) return classResponses[0].response_date.valueOf();
                else return 0;
            }

            teacherService.loadClasses(function (myClasses) {
                $scope.loaded = true;
                $scope.myClasses = myClasses;
            }, function (error) {
                mainService.errorHandler(error)
            });

            teacherService.loadTeacherInfo(function (teacherInfo) {
                $scope.teacherInfo = teacherInfo;
                $scope.dateComparator = function (a) {
                    ////console.log(new Date(a.valueOf() + a.getTimezoneOffset() * 60000));
                    ////console.log($scope.teacherInfo.last_visit);
                    return new Date(a.valueOf() + a.getTimezoneOffset() * 60000) > $scope.teacherInfo.last_visit;
                }
            }, function (error) {
                mainService.errorHandler(error);
            });

            responsesService.loadResponses(true, function (responses) {
                //console.log(responses);
                $scope.responsesObj.responses = responses;
            }, function (error) {
                mainService.errorHandler(error);
            });

            teacherService.loadPromptsAmount(function (promptsAmount) {
                $scope.promptsAmount = promptsAmount;
            }, function (error) {
                mainService.errorHandler(error)
            });

            $scope.goToClass = function (classId) {
                $location.path('/feed').search({
                    classId: classId
                });
            };

            $scope.editClass = function (classId) {
                $location.path('/class').search({
                    classId: classId
                });
            };

            $scope.setTutorial = function (hide) {
                teacherService.setTutorial(hide, function () {
                    $scope.dynamicPopover = {};
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }

            $scope.openRemove = function (open) {
                $scope.dynamicPopover = {};
                $scope.removeOpened = open;
            }

            $scope.refreshDashboard = function () {
                responsesService.loadResponses(true, function (responses) {
                    if ($scope.responsesObj.responses.length != responses.length) {
                        $interval($scope.refreshDashboard, 10000, 1);
                    }
                    // //console.log(responses);
                    $scope.responsesObj.responses = responses;
                }, function (error) {
                    mainService.errorHandler(error);
                });
            }

            $scope.addNewClass = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/modals/addClass.html',
                    controller: 'AddClassModalCtrl',
                    resolve: {
                        limited: function () {
                            return false; //$scope.myClasses.length >= 8;
                        }
                    }
                });
                modalInstance.result.then(function (newClass) {
                    $scope.myClasses.push(newClass);
                }, function () {});
            };


            $scope.removeClass = function (c) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to remove class ${c.class_name}?`;
                        },
                        question: function () {
                            return 'The data from your class will not be saved!';
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    teacherService.removeClass(c.class_id, function () {
                        removeClassLocal(c.class_id);
                    }, function (error) {
                        mainService.errorHandler(error)
                    });
                }, function () {});
            };

            function removeClassLocal(id) {
                for (var i = 0; i < $scope.myClasses.length; i++) {
                    if ($scope.myClasses[i].class_id != id) continue;

                    $scope.myClasses.splice(i, 1);
                    break;
                };
            }

            $scope.goToTutorial2 = function () {
                $location.path('/settings');
            }

            $scope.removeAll = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to remove all your classes?`;
                        },
                        question: function () {
                            return 'The data from your classes will not be saved!';
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    teacherService.removeClasses(function () {
                        $scope.myClasses = [];
                    }, function (error) {
                        mainService.errorHandler(error);
                    });
                }, function () {});
            }
        }
    })
    .controller('SettingsCtrl', function ($scope, teacherService, mainService, loginService, promptsService, $location, $timeout, baseURL, $uibModal) {
        loginService.tryLogin(loginSuccessful);

        function loginSuccessful(teacherId, tutorial) {
            $scope.form = {};
            $scope.settingsObj = {};

            //console.log(teacherId);
            teacherId = parseInt(teacherId, 10);

            $scope.dynamicPopover = {
                templateUrl: 'tutorialTemplate.html',
                isOpen: tutorial,
            };

            $scope.setTutorial = function (hide) {
                teacherService.setTutorial(hide, function () {}, function (error) {
                    mainService.errorHandler(error)
                });
            }

            teacherService.loadTeacherInfo(function (teacherInfo) {
                $scope.loaded = true;
                $scope.teacher = teacherInfo;
                //console.log(teacherInfo);
                //$scope.teacherLink = (teacherInfo.short_url != '') ? teacherInfo.short_url : baseURL + "/student/#!/teacher?teacherId=" + teacherInfo.teacher_label + teacherId;
                $scope.teacherLink = teacherInfo.teacher_label + teacherId;
            }, function (error) {
                mainService.errorHandler(error);
            });

            $scope.updateTeacherInfo = function () {
                $scope.updateInfoBlock = true;
                teacherService.updateTeacherInfo($scope.teacher, function (response) {
                    $scope.infoUpdated = true;
                    $scope.updateInfoBlock = false;
                    $scope.form.teachersName.$setPristine();
                    $timeout(function () {
                        $scope.infoUpdated = false;
                    }, 2000);
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }

            promptsService.loadCategories(function (categories) {
                $scope.categories = categories;
            }, function (error) {
                mainService.errorHandler(error)
            });

            teacherService.loadSettings(function (settings, notifications) {
                //console.log(settings);
                $scope.settingsLoaded = true;
                $scope.settingsObj.settings = settings;
                $scope.settingsObj.notifications = notifications;
            }, function (error) {
                mainService.errorHandler(error);
            });

            $scope.updateSettings = function () {
                $scope.settingsBlock = true;
                teacherService.updateSettings($scope.settingsObj.settings, function (response) {
                    $scope.settingsUpdated = true;
                    $scope.settingsBlock = false;
                    $scope.form.settings.$setPristine();
                    $timeout(function () {
                        $scope.settingsUpdated = false;
                    }, 2000);
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }

            $scope.updateNotifications = function () {
                $scope.notificationsBlock = true;
                teacherService.updateNotifications($scope.settingsObj.notifications, function (response) {
                    $scope.notificationsUpdated = true;
                    $scope.notificationsBlock = false;
                    $scope.form.notifications.$setPristine();
                    $timeout(function () {
                        $scope.notificationsUpdated = false;
                    }, 2000);
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }

            $scope.backupData = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Backup data`;
                        },
                        question: function () {
                            return `Are you sure you want to backup all the data and send it to your email?`;
                        },
                        btnText: function () {
                            return 'Backup';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    //console.log('backup');
                }, function () {});
            }

            $scope.deleteAccount = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Delete account`;
                        },
                        question: function () {
                            return `Are you sure you want to delete your account? All the data will be removed!`;
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    //console.log('delete');
                }, function () {});
            }
        }
    })
    .controller('FeedCtrl', function ($scope, baseURL, responsesService, mainService, loginService, teacherService, promptsService, classService, $location, $filter, $window, $uibModal, $interval) {
        $window.scrollTo(0, 0);
        loginService.tryLogin(function (teacherId, tutorial) {
            var classId = $location.search().classId;
            var studentId = $location.search().studentId;
            if (!classId && !studentId) $location.path('responses');
            else loginSuccessful(classId, studentId, tutorial);
        });

        function loginSuccessful(classId, studentId, tutorial) {
            $scope.filter = {
                promptFilter: '',
                sort: 'response_date'
            };

            $scope.isPromptActive = function (prompt) {
                if ($scope.activePrompts.indexOf(prompt.prompt_id) != -1) return true;
                else return false;
            }

            $scope.dynamicPopover = {
                templateUrl: 'tutorialTemplate.html',
                isOpen: tutorial,
            };

            $scope.dynamicPopover2 = {
                templateUrl: 'tutorialTemplate2.html',
                isOpen: false
            };

            $scope.pinResponse = function (response) {
                var pinned = (response.response_pinned == '1') ? '0' : '1';
                responsesService.pinResponse(response.response_id, pinned, response.response_wasted, response.credentials_id, function () {
                    response.response_pinned = pinned;

                    if (pinned == '0' && response.response_wasted == '0') {
                        response.response_wasted = '1';
                        var calledOn = +response.called_on;
                        calledOn++
                        $scope.responses.forEach(function (r) {
                            if (r.credentials_id == response.credentials_id) r.called_on = calledOn.toString();
                        });
                    }
                }, function (error) {
                    mainService.errorHandler(error);
                });
            }

            $scope.getCalledOnClass = function (calledOn) {
                switch (calledOn) {
                    case '0':
                        return 'called-no-response';
                    case '1':
                        return 'called-good';
                    case '2':
                        return 'called-great';
                    default:
                        return 'called-outstanding';
                }
            }

            $scope.getCalledOnText = function (calledOn) {
                switch (calledOn) {
                    case '0':
                        return 'No responses from this student used.';
                    case '1':
                        return 'Good work! Used 1 response of this student.';
                    case '2':
                        return 'Great! Used 2 responses of this student.';
                    default:
                        return 'Outstanding! 3 or more responses used!';
                }
            }

            teacherService.loadTeacherInfo(function (teacherInfo) {
                $scope.teacherInfo = teacherInfo;
                $scope.dateComparator = function (a) {
                    return a > $scope.teacherInfo.last_visit;
                }
                $scope.teacherLink = (teacherInfo.short_url != '') ? teacherInfo.short_url : baseURL + "/student/#!/teacher?teacherId=" + teacherInfo.teacher_label + teacherInfo.teacher_id;
                //console.log($scope.teacherLink);
            }, function (error) {
                mainService.errorHandler(error);
            });

            promptsService.loadPrompts(function (prompts) {
                $scope.prompts = prompts;
                $scope.arrangedPrompts = rearrangePrompts(prompts);
                //console.log($scope.arrangedPrompts);
            }, function (error) {
                mainService.errorHandler(error);
            });

            function rearrangePrompts(prompts) {
                var result = [];
                prompts.forEach(function (prompt) {
                    result[prompt.prompt_id] = prompt;
                });
                return result;
            }

            $scope.classId = classId;
            if (studentId) {
                $scope.studentFeed = true;
                classService.loadStudentInfo(studentId, function (studentInfo) {
                        $scope.studentName = `${studentInfo.student_firstName} ${studentInfo.student_lastName} (${studentInfo.credentials})`;
                    },
                    function (error) {
                        mainService.errorHandler(error)
                    });
                classService.loadClassInfo(classId, function (classInfo) {
                        ////console.log(classInfo);
                        $scope.className = classInfo.class_name;
                    },
                    function (error) {
                        mainService.errorHandler(error)
                    });

            } else {
                classService.loadClassInfo(classId, function (classInfo) {
                        //console.log(classInfo);
                        $scope.className = classInfo.class_name;
                    },
                    function (error) {
                        mainService.errorHandler(error)
                    });
            }

            responsesService.loadResponses(false, function (responses) {
                    $scope.responses = (studentId) ? $filter('filter')(responses, {
                        'credentials_id': studentId
                    }, true) : $filter('filter')(responses, {
                        'class_id': classId
                    }, true);
                    //console.log($scope.responses);
                    $scope.activePrompts = [];
                    $scope.responses.forEach(function (response) {
                        if ($scope.activePrompts.indexOf(response.prompt_id) == -1) $scope.activePrompts.push(response.prompt_id);
                    });

                    $scope.loaded = true;

                    var newResponses = $filter('filter')($scope.responses, {
                        'response_new': '1'
                    });
                    //console.log(studentId);
                    if (newResponses.length) {
                        if (studentId) responsesService.updateResponsesStudent(studentId, function () {}, function (error) {
                            mainService.errorHandler(error)
                        });
                        else responsesService.updateResponsesClass(classId, function () {}, function (error) {
                            mainService.errorHandler(error)
                        });
                    }
                },
                function (error) {
                    mainService.errorHandler(error)
                });

            $scope.getCategoryClass = function (category_id) {
                switch (category_id) {
                    case '1':
                        return 'category-effective';
                    case '2':
                        return 'category-talk';
                    case '3':
                        return 'category-facilitating';
                    case '4':
                        return 'category-formative';
                    case '5':
                        return 'category-socio';
                }
                return 'category-custom';
            }

            $scope.refreshResponses = function () {
                //console.log('refresh');
                responsesService.loadResponses(true, function (responses) {
                        var prevAmount = $scope.responses.length;
                        $scope.responses = (studentId) ? $filter('filter')(responses, {
                            'credentials_id': studentId
                        }, true) : $filter('filter')(responses, {
                            'class_id': classId
                        }, true);
                        if (prevAmount != $scope.responses.length) {
                            $interval($scope.refreshResponses, 10000, 1);
                        }

                        var newResponses = $filter('filter')($scope.responses, {
                            'response_new': '1'
                        });
                        if (newResponses.length) {
                            if (studentId) responsesService.updateResponsesStudent(studentId, function () {}, function (error) {
                                mainService.errorHandler(error)
                            });
                            else responsesService.updateResponsesClass(classId, function () {}, function (error) {
                                mainService.errorHandler(error)
                            });
                        }
                    },
                    function (error) {
                        mainService.errorHandler(error)
                    });
            }

            $scope.removeResponse = function (response) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to remove a response?`;
                        },
                        question: function () {
                            return `${response.student_firstName} ${response.student_lastName} (${response.credentials})`;
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    teacherService.removeResponse(response.response_id, function () {
                        removeResponseLocal(response.response_id);
                    }, function (error) {
                        mainService.errorHandler(error);
                    });
                }, function () {});
            }

            function removeResponseLocal(responseId) {
                for (var i = 0; i < $scope.responses.length; i++) {
                    if ($scope.responses[i].response_id != responseId) continue;

                    $scope.responses.splice(i, 1);
                    break;
                }
            }

            $scope.removeAll = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to remove all class responses?`;
                        },
                        question: function () {
                            return `Data will not be saved!`;
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    teacherService.removeResponses($scope.classId, function (response) {
                        $scope.responses = {};
                    }, function (error) {
                        mainService.errorHandler(error);
                    });
                }, function () {});
            }

            $scope.goToStudent = function (studentId) {
                $location.path('/feed').search({
                    studentId: studentId,
                    classId: classId
                });
            }

            $scope.editClass = function () {
                //console.log($scope.classId);
                $location.path('/class').search({
                    classId: $scope.classId
                });
            }

            $scope.sendReport = function () {
                if (!$scope.responses.length) {
                    showNoReport();
                    return;
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to send a report?`;
                        },
                        question: function () {
                            return `${$scope.className}`;
                        },
                        btnText: function () {
                            return 'Send';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    teacherService.sendReport($scope.classId, function (response) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'common/views/modals/notification.html',
                            controller: 'NotificationModalCtrl',
                            resolve: {
                                message: function () {
                                    return `The report for ${$scope.className} was successfully sent.\n\nPlease check your spam folder if you cannot find the report in your inbox!`
                                },
                                isError: function () {
                                    return false
                                },
                            }
                        });
                        modalInstance.result.then(function () {}, function () {});
                    }, function (error) {
                        mainService.errorHandler(error)
                    });
                }, function () {});
            }

            function showNoReport() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/notification.html',
                    controller: 'NotificationModalCtrl',
                    resolve: {
                        message: function () {
                            return `You don't have any responses yet.`
                        },
                        isError: function () {
                            return false
                        },
                    }
                });
                modalInstance.result.then(function () {}, function () {});
            }

            $scope.openRemove = function (open) {
                $scope.dynamicPopover = {};
                $scope.dynamicPopover2 = {};
                $scope.removeOpened = open;
            }

            $scope.setTutorial = function (hide) {
                teacherService.setTutorial(hide, function () {
                    $scope.dynamicPopover = {};
                    $scope.dynamicPopover2 = {};
                }, function (error) {
                    mainService.errorHandler(error)
                });
            }

            $scope.goBack = function () {
                $window.history.back();
            }

            $scope.checkPinned = function () {
                $scope.filter.response_pinned = ($scope.filter.response_pinned == '1') ? '' : '1';
            }
        }
    })
    .controller('ClassCtrl', function ($scope, classService, mainService, loginService, promptsService, teacherService, $location, $uibModal, baseURL, $window) {
        loginService.tryLogin(function (teacherId) {
            var classId = $location.search().classId;
            if (!classId) $location.path('classes');
            else loginSuccessful(teacherId, classId);
        });

        function loginSuccessful(teacherId, classId) {
            $scope.promptsObj = {
                prompts: []
            };
            $scope.categories = [];
            $scope.mainCategoriesOpened = [];
            $scope.otherCategoriesOpened = [];
            $scope.classPrompts = [];
            $scope.promptIndexes = [];

            $scope.filteredPrompts = [];

            $scope.goToStudent = function (studentId) {
                $location.path('/feed').search({
                    studentId: studentId,
                    classId: classId
                });
            }

            $scope.getCalledOnClass = function (calledOn) {
                switch (calledOn) {
                    case '0':
                        return 'called-no-response';
                    case '1':
                        return 'called-good';
                    case '2':
                        return 'called-great';
                    default:
                        return 'called-outstanding';
                }
            }

            $scope.getCalledOnText = function (calledOn) {
                switch (calledOn) {
                    case '0':
                        return 'No responses from this student used.';
                    case '1':
                        return 'Good work! Used 1 response of this student.';
                    case '2':
                        return 'Great! Used 2 responses of this student.';
                    default:
                        return 'Outstanding! 3 or more responses used!';
                }
            }

            $scope.filterMainCategories = function (category) {
                if (['1', '2', '3'].indexOf(category.category_id) != -1) return true;
                else return false;
            }

            $scope.filterOtherCategories = function (category) {
                if (['1', '2', '3'].indexOf(category.category_id) == -1) return true;
                else return false;
            }

            teacherService.loadTeacherInfo(function (teacherInfo) {
                $scope.teacherLink = (teacherInfo.short_url != '') ? teacherInfo.short_url : baseURL + "/student/#!/teacher?teacherId=" + teacherInfo.teacher_label + teacherId;
            }, function (error) {
                mainService.errorHandler(error);
            });

            classService.loadClassInfo(classId, function (classInfo) {
                ////console.log(classInfo);
                $scope.classLink = baseURL + "/student/#!/class?classId=" + classInfo.class_label + classId;
                $scope.classInfo = classInfo;
                $scope.loaded = true;
            }, function (error) {
                mainService.errorHandler(error);
            });

            $scope.newClassName = {};

            promptsService.loadPrompts(function (prompts) {
                $scope.promptsLoaded = true;
                $scope.promptsObj.prompts = prompts;
                $scope.promptsLoaded = true;
            }, function (error) {
                mainService.errorHandler(error)
            });

            promptsService.loadCategories(function (categories) {
                $scope.promptsObj.categories = categories;
            }, function (error) {
                mainService.errorHandler(error)
            });

            classService.loadClassPrompts(classId, function (classPrompts) {
                $scope.promptIndexes = [];
                classPrompts.forEach(function (prompt) {
                    if (!$scope.promptIndexes[prompt.category_id]) $scope.promptIndexes[prompt.category_id] = [];
                    $scope.promptIndexes[prompt.category_id].push(prompt.prompt_id);
                });
                //console.log($scope.promptIndexes);
                $scope.classPrompts = classPrompts;
                $scope.classPromptsLoaded = true;
            }, function (error) {
                mainService.errorHandler(error)
            });

            classService.loadRegisteredStudents(classId, function (students) {
                $scope.studentsLoaded = true;
                $scope.registeredStudents = students;
            }, function (error) {
                mainService.errorHandler(error)
            });


            $scope.updateClassName = function () {
                $scope.updateNameBlock = true;
                //console.log($scope.classInfo.class_name);
                classService.updateClassName(classId, $scope.classInfo.class_name, function (response) {
                    //$scope.className = $scope.newClassName.className;
                    //$scope.newClassName.editMode = false;
                    $scope.updateNameBlock = false;
                }, function (error) {
                    mainService.errorHandler(error);
                });
            }

            $scope.removeStudent = function (student) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/confirmation.html',
                    controller: 'ConfirmationModalCtrl',
                    resolve: {
                        header: function () {
                            return `Are you sure you want to remove student registration?`;
                        },
                        question: function () {
                            return `${student.student_firstName} ${student.student_lastName} (${student.credentials})`;
                        },
                        btnText: function () {
                            return 'Delete';
                        },
                        btnClass: function () {
                            return 'ui-btn-delete';
                        }
                    }
                });
                modalInstance.result.then(function () {
                    var credentials = student.credentials_id;
                    classService.removeStudent(classId, credentials, function (response) {
                        removeStudentLocal(credentials);
                    }, function (error) {
                        mainService.errorHandler(error)
                    });
                }, function () {});
            };

            $scope.removePrompt = function (prompt) {
                if ($scope.promptIndexes.length == 1 && $scope.promptIndexes[0] == prompt.prompt_id) rejectRemoval();
                else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'common/views/modals/confirmation.html',
                        controller: 'ConfirmationModalCtrl',
                        resolve: {
                            header: function () {
                                return `Are you sure you want to remove prompt "${prompt.prompt_body}"?`;
                            },
                            question: function () {
                                return `Then you will not be able to sort student responses according to that prompt anymore!`;
                            },
                            btnText: function () {
                                return 'Delete';
                            },
                            btnClass: function () {
                                return 'ui-btn-delete';
                            }
                        }
                    });
                    modalInstance.result.then(function () {
                        //$scope.promptBlock = true;
                        promptsService.removePrompt(prompt.prompt_id, function () {
                            //prompt.editMode = false;
                            removePromptLocal(prompt);
                            //$scope.promptBlock = false;
                        }, function (error) {
                            mainService.errorHandler(error);
                        });
                    }, function () {
                        // prompt.editMode = false;
                    });
                }
            }

            $scope.addStudent = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'student/views/modals/register.html',
                    controller: 'RegisterModalCtrl',
                    resolve: {
                        classInfo: function () {
                            return $scope.classInfo;
                        }
                    }
                });
                modalInstance.result.then(function (student) {
                    //console.log(student);
                    $scope.registeredStudents.push(student);
                    //$scope.classCredentials = credentials;
                    //$scope.feedback.credentials = credentials.credentials;
                }, function () {});
            }

            $scope.addPromptToClass = function (add, prompt) {
                var newPrompt = prompt;
                var actionType = add;

                if ($scope.classPrompts.length == 1 && !add) rejectRemoval();
                else classService.addPromptToClass(add, prompt.prompt_id, classId, function (response) {
                    if (actionType) {
                        $scope.classPrompts.push(newPrompt);
                        if (!$scope.promptIndexes[prompt.category_id]) $scope.promptIndexes[prompt.category_id] = [];
                        $scope.promptIndexes[prompt.category_id].push(newPrompt.prompt_id);
                    } else removePromptFromClassLocal(newPrompt);
                }, function (error) {
                    mainService.errorHandler(error)
                });

            }

            $scope.addNewCustomPrompt = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/modals/addPrompt.html',
                    controller: 'AddPromptModalCtrl',
                });
                modalInstance.result.then(function (prompt) {
                    //console.log(prompt);
                    $scope.promptsObj.prompts.push(prompt);
                    //console.log($scope.promptsObj.prompts);
                }, function () {});
            }

            $scope.editCustomPrompt = function (prompt) {
                $scope.selectedPrompt = prompt;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/modals/editPrompt.html',
                    controller: 'EditPromptModalCtrl',
                    resolve: {
                        prompt: function () {
                            return prompt;
                        }
                    }
                });
                modalInstance.result.then(function (prompt) {
                    // //console.log(prompt);
                    if (!prompt) removePromptLocal($scope.selectedPrompt);
                    // //console.log($scope.promptsObj.prompts);
                }, function () {});
            }

            function rejectRemoval() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'common/views/modals/notification.html',
                    controller: 'NotificationModalCtrl',
                    resolve: {
                        message: function () {
                            return 'A class must have at least one prompt. To remove this specific prompt, please add another prompt first.'
                        },
                        isError: function () {
                            return false
                        },
                    }
                });
                modalInstance.result.then(function () {}, function () {});
            }

            function removeStudentLocal(credId) {
                for (var i = 0; i < $scope.registeredStudents.length; i++) {
                    if ($scope.registeredStudents[i].credentials_id != credId) continue;

                    $scope.registeredStudents.splice(i, 1);
                    break;
                }
            }

            function removePromptFromClassLocal(prompt) {
                $scope.promptIndexes[prompt.category_id].splice($scope.promptIndexes[prompt.category_id].indexOf(prompt.prompt_id), 1);
                for (var i = 0; i < $scope.classPrompts.length; i++) {
                    if ($scope.classPrompts[i].prompt_id != prompt.prompt_id) continue;

                    $scope.classPrompts.splice(i, 1);
                    break;
                }
            }

            function removePromptLocal(prompt) {
                for (var i = 0; i < $scope.promptsObj.prompts.length; i++) {
                    if ($scope.promptsObj.prompts[i].prompt_id != prompt.prompt_id) continue;

                    $scope.promptsObj.prompts.splice(i, 1);
                    break;
                };
                removePromptFromClassLocal(prompt);
            }

            $scope.goBack = function () {
                $window.history.back();
            }

            /* function updatePromptLocal(prompt) {
                             for (var i = 0; i < $scope.promptsObj.prompts.length; i++) {
                                 if ($scope.promptsObj.prompts[i].prompt_id != prompt.prompt_id) continue;

                                 $scope.promptsObj.prompts[i] = prompt;
                                 break;
                             }
                         }*/
        }
    });

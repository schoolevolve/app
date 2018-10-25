'use strict';

angular.module('teachersApp')
.controller('NotificationModalCtrl', function ($uibModalInstance, $scope, message, isError) {
	$scope.isError = isError;
	$scope.message = message;
	$scope.ok = function () {
		$uibModalInstance.close();
	}
})
.controller('ConfirmationModalCtrl', function ($uibModalInstance, $scope, header, question, btnText, btnClass) {
        $scope.question = question;
		$scope.modalHeader = header;
		$scope.btnText = btnText;
		$scope.btnClass = btnClass;
        $scope.ok = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    })
;
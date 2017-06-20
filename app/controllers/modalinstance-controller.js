(function() {
  'use strict';

  angular
    .module('ga.modalinstancecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('ModalInstanceController', ModalInstanceController);

  ModalInstanceController.$inject = ['$scope', '$uibModalInstance', 'feedback'];

  function ModalInstanceController ($scope, $uibModalInstance, feedback) {

    $scope.feedback = feedback;

    $scope.ok = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();

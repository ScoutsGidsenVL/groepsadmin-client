(function() {
  'use strict';

  angular
    .module('ga.modalinstancecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('ModalInstanceController', ModalInstanceController);

  ModalInstanceController.$inject = ['$scope', '$uibModalInstance', 'feedback', 'items'];

  function ModalInstanceController ($scope, $uibModalInstance, feedback, items) {

    $scope.feedback = feedback;

    $scope.items = items;

    $scope.selected = {
      item: $scope.items[0]
    };

    $scope.ok = function () {
      $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();

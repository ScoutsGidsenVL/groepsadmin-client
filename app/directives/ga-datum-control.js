(function () {
  'use strict';

  angular
    .module('ga.datum.control', [])
    .directive('datumControl', datumControl);

  function datumControl() {
    return {
      restrict: 'E',
      templateUrl: 'partials/datum-control.html',
      replace: true,
      scope: {
        model: '=?ngModel',
        disabled: '=?ngDisabled',
        name: '@name',
        id: '@id',
        defaultToday: '@'
      },
      controller: datumControlController
    };
  }

  datumControlController.$inject = ['$scope'];

  function datumControlController($scope) {
    $scope.disabled = $scope.disabled || false;
    $scope.defaultToday = $scope.defaultToday !== undefined ? true : false;

    if ($scope.defaultToday && $scope.model === undefined) {
      $scope.model = new Date()
    }

    $scope.dateOptions= {
      formatYear: 'yyyy',
        startingDay: 1,
        datepickerMode: 'year'
    };
    $scope.popupCal = {
      opened: false
    };
    $scope.format = 'dd/MM/yyyy';
    $scope.openPopupCal = function () {
      $scope.popupCal.opened = true;
    }

  }

})();

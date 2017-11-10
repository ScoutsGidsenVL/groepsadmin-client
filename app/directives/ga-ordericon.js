(function() {
  'use strict';

  angular
    .module('ga.ordericon', [])
    .directive('ordericon', ordericon);

  function ordericon() {
    return {
      restrict: 'E',
      templateUrl: 'partials/ordericon.html',
      replace: false,
      scope: {
        kolommen: '=',
        kolom: '=',
        filter: '='
      },
      controller: OrderIconController
    };
  }

  function OrderIconController($scope, $attrs) {
    $scope.$watch('filter', function() {
        $scope.iconsize = _.indexOf($scope.filter.sortering, $scope.kolom.id);
    }, true);

  }

})();

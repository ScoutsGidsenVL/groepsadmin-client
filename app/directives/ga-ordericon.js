(function () {
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

  function OrderIconController($scope) {
    var mapping = {
      'be.vvksm.groepsadmin.model.column.VVKSMGroepsNamenColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
      'be.vvksm.groepsadmin.model.column.VVKSMGroepsNummersColumn': 'be.vvksm.groepsadmin.model.column.VVKSMGroepenColumn',
      'be.vvksm.groepsadmin.model.column.LeeftijdColumn': 'be.vvksm.groepsadmin.model.column.GeboorteDatumColumn'
    };

    $scope.$watch('filter', function () {
      var iconsize = _.indexOf($scope.filter.sortering, $scope.kolom.id);

      if (iconsize === -1 && mapping[$scope.kolom.id] !== undefined) {
        iconsize = _.indexOf($scope.filter.sortering, mapping[$scope.kolom.id]);

        if (iconsize !== -1) {
          iconsize = _.indexOf($scope.filter.kolommen, $scope.kolom.id);
        }
      }

      $scope.iconsize = iconsize;
    }, true);

  }

})();

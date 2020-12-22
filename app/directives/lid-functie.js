(function () {
  'use strict';

  angular
    .module('ga.lid.velden', [])
    .directive('gaFunctie', [function () {
      return {
        restrict: 'EAC',
        scope: {
          functie: '=',
          functieslijst: '=',
          groepenlijst: '=',
          stopFunctie: '=',
          editable: '=',
          patchSecties: '='
        },
        controller: FunctieController,
        /*link: function(scope, elem, attrs, controller) {
         },*/
        templateUrl: 'partials/lid-functie.html'
      };
    }])
    .filter('collapsedFilter', [function () {
      return function (input, isCollapsed) {
        if (isCollapsed) {
          return $.grep(input, function (fn) {
            return fn.einde == undefined;
          });
        }
        else {
          return input;
        }
      };
    }]);


  FunctieController.$inject = ['$scope'];

  function FunctieController($scope) {
    $scope.hasPermission = function (val) {
      if ($scope.patchSecties) {
        return $scope.patchSecties.indexOf(val) > -1;
      }
    }

    $scope.isGeenCrucialeFunctie = function (functie){
      return $scope.functieslijst[functie.functie].code === 'VGA' ||
          $scope.functieslijst[functie.functie].code === 'FV';
    }
  }

})();

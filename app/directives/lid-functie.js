(function() {
  'use strict';

  angular
    .module('ga.lid.velden', [])
    .directive('gaFunctie', gaFunctie)
    .filter('collapsedFilter', collapsedFilter);

  function gaFunctie() {
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
  }

  //FunctieController.$inject = ['$scope'];

  function FunctieController($scope) {
    $scope.hasPermission = function(val) {
      if ($scope.patchSecties) {
        return $scope.patchSecties.indexOf(val) > -1;
      }
    }
  }
  
  function collapsedFilter() {
    return function(input, isCollapsed) {
      if (isCollapsed) {
        return $.grep(input, function(fn){
          return fn.einde == undefined;
        });
      }
      else {
        return input;
      }
    };
  }


})();

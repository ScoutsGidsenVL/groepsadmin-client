(function() {
  'use strict';

  angular
    .module('ga.lid.velden', [])
    .directive('gaFunctie', gaFunctie);

  function gaFunctie() {
    return {
      restrict: 'EAC',
      scope: {
        functie: '=',
        functieslijst: '=',
        groepenlijst: '=',
        stopFunctie: '='
      },
      //controller: FunctieController,
      /*link: function(scope, elem, attrs, controller) {
      },*/
      templateUrl: 'partials/lid-functie.html'
    };
  }

  //FunctieController.$inject = ['$scope'];

  //function FunctieController($scope) {}

})();
(function() {
  'use strict';

  angular
    .module('ga.dynamischevelden', [])
    .directive('dynamischveld', dynamischveld);

  function dynamischveld() {
    return {
      restrict: 'E',
      controller: FieldController,
      templateUrl: 'partials/dynamisch-veld.html',
      transclude: true,
      replace: true,
      scope: {
        waarden : '=',
        veld: '='
      }
    };
  }
  function FieldController($scope, $attrs) {

  }

})();

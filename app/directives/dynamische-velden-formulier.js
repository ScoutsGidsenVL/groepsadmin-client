(function() {
  'use strict';

  angular
    .module('ga.dynamischformulier', [])
    .directive('dynamischformulier', dynamischformulier);

  function dynamischformulier() {
    return {
      restrict: 'E',
      templateUrl: 'partials/dynamische-velden-formulier.html',
      replace: false,
      scope: {
        waarden : '=',
        velden: '='
      }
    };
  }

})();

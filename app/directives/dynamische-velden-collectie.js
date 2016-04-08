(function() {
  'use strict';

  angular
    .module('ga.dynamischevelden', [])
    .directive('dynamischveldcolectie', dynamischveldcolectie);

  function dynamischveldcolectie() {
    return {
      restrict: 'E',
      templateUrl: 'partials/dynamische-velden-collectie.html',
      replace: true,
      scope: {
        waarden : '=',
        velden: '='
      }
    };
  }

})();

(function () {
  'use strict';

  angular
    .module('ga.dynamischevelden', [])
    .directive('dynamischveldcolectie', [function () {
      return {
        restrict: 'E',
        templateUrl: 'partials/dynamische-velden-collectie.html',
        replace: true,
        scope: {
          waarden: '=',
          velden: '=',
          formulier: '='
        }
      };
    }

    ]);


})();

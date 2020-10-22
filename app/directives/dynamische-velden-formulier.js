(function () {
  'use strict';

  angular
    .module('ga.dynamischformulier', [])
    .directive('dynamischformulier', [function () {
      return {
        restrict: 'E',
        templateUrl: 'partials/dynamische-velden-formulier.html',
        replace: false,
        scope: {
          waarden: '=',
          velden: '=',
          formulier: '=',
          bewerkbaar: '='
        }
      };
    }

    ]);


})();

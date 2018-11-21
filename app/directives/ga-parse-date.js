(function () {
  'use strict';

  angular
    .module('ga.parseDate', [])
    .directive('gaParseDate', [function () {
      // Datums moeten van type Date Object zijn in Angular
      // Moet geparsed worden vóór Model geüpdatet wordt
      return {
        restrict: 'AC',
        require: 'ngModel',
        link: function (scope, elem, attrs, controller) {
          // Change how view values will be saved in the model
          controller.$formatters.push(formatAsDate);
          controller.$parsers.unshift(parseAsDate);
        }
      };
    }]);


  function parseAsDate(input) {
    if (input == null) {
      return;
    }
    return moment(input, ['D/M/YYYY','DD/MM/YYYY'], true).toDate();
  }

  function formatAsDate(input) {
    if (input == null) {
      return;
    }
    return new Date(input);
  }

})();

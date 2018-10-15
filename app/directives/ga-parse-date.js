(function() {
  'use strict';

  angular
    .module('ga.parseDate', [])
    .directive('gaParseDate', gaParseDate);

  function gaParseDate() {
    // Datums moeten van type Date Object zijn in Angular
    // Moet geparsed worden vóór Model geüpdatet wordt
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function(scope, elem, attrs, controller) {
        // Change how view values will be saved in the model
        controller.$parsers.push(formatAsDate);
      }
    };
  }

  function formatAsDate(input) {
    if (input == null) {
      return;
    }
    return moment(input, 'DD/MM/YYYY').toDate();
  }

})();

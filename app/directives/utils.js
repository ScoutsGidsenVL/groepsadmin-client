(function() {
  'use strict';

  angular
    .module('ga.utils', [])
    .directive('gaParseDate', gaParseDate);
  
  function gaParseDate() {
    // Datums moeten van type Date Object zijn in Angular
    // Moet geparsed worden vóór Model geüpdatet wordt
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function(scope, elem, attrs, controller) {
        // Change how model values will appear in the view
        controller.$formatters.push(formatAsDate);
        // Change how view values will be saved in the model
        controller.$parsers.push(formatAsDate);
      }
    };
  }
        
  function formatAsDate(input) {
    if (input == null) {
      return;
    }
    return new Date(input);
  }
  
})();
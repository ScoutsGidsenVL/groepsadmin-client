(function () {
  'use strict';

  angular
    .module('ga.validatie.rekeningnummer', [])
    .directive('rekeningnummer', [function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
          ctrl.$validators.rekeningnummer = function (modelValue) {
            if (ctrl.$isEmpty(modelValue)) {
              // consider empty models to be valid
              return true;
            }

            return IBAN.isValid(modelValue);
          };
        }

      };

    }]);

})();

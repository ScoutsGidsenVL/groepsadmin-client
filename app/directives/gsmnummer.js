(function () {
  'use strict';

  angular
    .module('ga.validatie.gsmnummer', [])
    .directive('gsmnummer', [function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
          ctrl.$parsers.push(function (value) {
            if (value) {
              var regex = /[-\.\/]/gi;
              return value.replace(regex, ' ');
            }
          });

          ctrl.$validators.gsmnummer = function (modelValue) {
            var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

            if (ctrl.$isEmpty(modelValue)) {
              // consider empty models to be valid
              return true;
            }

            var regex = /^(((\+|00)31\s?)|((\+|00)32\s?|(0[1-9]))|((\+|00)33\s?)|((\+|00\s?)352))/;
            var found = regex.test(modelValue);
            var validated = false;

            if (found) {
              var regularExpressions = [
                /^((\+|00)32\s?|0)4(60|[789]\d)(\s?\d{2}){3}$/, //BE
                /^((\+|00)31\s?)(6)(\s?\d{2}){4}$/, //NL
                /^((\+|00)33\s?)[679](\s?\d{2}){4}$/, //FR
                /^((\+|00\s?)352)?\s?6[269]1(\s?\d{3}){2}$/ //LUX
              ];

              var i = 0;

              while (i < regularExpressions.length && validated === false) {
                validated = regularExpressions[i].test(modelValue);
                i++;
              }
            }
            else {
              var parsedNumber;

              try {
                parsedNumber = phoneUtil.parse(modelValue);
                validated = phoneUtil.isValidNumber(parsedNumber);
              }
              catch (e) {
                console.log(e.message);
              }
            }

            return validated;
          };
        }

      };

    }]);

})();

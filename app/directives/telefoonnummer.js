(function () {
  'use strict';

  angular
    .module('ga.validatie.telefoonnummer', [])
    .directive('telefoonnummer', [function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
          var checkGsm = attrs.hasOwnProperty("isGsm") ? true : false;

          var formatNumber = function (value) {
            var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

            if (value === undefined) return value;

            if (value.match(/[A-Za-z]/i)) {
              return value;
            }
            else if (value) {
              var regex = /[-\.\/ ]/gi;
              value = value.replace(regex, '');
            }

            try {
              var number = phoneUtil.parseAndKeepRawInput(value, 'BE');

              var isPossible = phoneUtil.isPossibleNumber(number);
              if (isPossible) {
                var isNumberValid = phoneUtil.isValidNumber(number);
                if(isNumberValid) {
                  value = phoneUtil.formatInOriginalFormat(number);
                }
              }
            }
            catch (e) {
              console.log(e.message);
            }

            return value;
          };

          var validateNumber = function (modelValue) {
            var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
            var PNT = libphonenumber.PhoneNumberType;
            var mobileTypes = [
              PNT.MOBILE,
              PNT.FIXED_LINE_OR_MOBILE,
              PNT.UNKNOWN
            ];
            var validated = false;

            if (ctrl.$isEmpty(modelValue)) {
              // consider empty models to be valid
              return true;
            }
            else if (modelValue.match(/[a-z]/i)) {
              return false;
            }

            try {
              var number = phoneUtil.parseAndKeepRawInput(modelValue, 'BE');
              var isPossible = phoneUtil.isPossibleNumber(number);
              var numberWithoutSpaces = modelValue.replace(/\s+/g, '');

              if (isPossible) {
                var isNumberValid = phoneUtil.isValidNumber(number);
                if(isNumberValid) {
                  if(!checkGsm) {
                    validated = true;
                  }
                  else if (mobileTypes.indexOf(phoneUtil.getNumberType(number)) !== -1 && ( numberWithoutSpaces.length >= 10 && numberWithoutSpaces.length <= 12)) {
                    validated = true;
                  }
                }
              }
            }
            catch (e) {
              console.log(e.message);
            }

            return validated;
          };

          ctrl.$formatters.push(formatNumber);
          ctrl.$parsers.push(formatNumber);

          if(checkGsm) {
            ctrl.$validators.gsmnummer = validateNumber;
          }
          else {
            ctrl.$validators.telefoonnummer = validateNumber;
          }

        }

      };

    }]);

})();

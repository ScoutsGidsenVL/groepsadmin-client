(function () {
  'use strict';
  angular
    .module('ga.validatie.email', [])
    .directive('email', [function () {
      var EMAIL_REGEXP = /^[-!#-'*+\/-9=?^-~]+(?:\.[-!#-'*+\/-9=?^-~]+)*@[-!#-'*+\/-9=?^-~]+(?:\.[-!#-'*+\/-9=?^-~]+)+$/i;
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
          ctrl.$validators.email = function (modelValue) {
            if (ctrl.$isEmpty(modelValue)){
              return true;
            }
            if (!modelValue.indexOf(";") < 0) {
              return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
            } else {
              var result = true;
              var emailAdressen = [];
              // Wanneer er meerdere emailadressen worden ingevoerd gaan we deze splitsen
              while (modelValue.indexOf(";") > -1) {
                var index = modelValue.indexOf(";");
                var adres = modelValue.substring(0, index);
                emailAdressen.push(adres.trim());
                modelValue = modelValue.substring(index + 1, modelValue.length)
              }
              adres = modelValue.substring(0, modelValue.length)
              if (adres.length > 0) {
                emailAdressen.push(adres.trim());
              }

              _.each(emailAdressen, function (adres) {
                if (!EMAIL_REGEXP.test(adres)) {
                  result = false;
                }
              })
              return result;
            }
          };
        }
      };
    }]);
})();

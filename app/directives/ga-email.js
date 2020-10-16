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
            if (!modelValue.includes(";")) {
              return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
            } else {
              var result = true;
              var emailAdressen = filterAdressen(modelValue);
              _.each(emailAdressen, function (adres){
                  if (!EMAIL_REGEXP.test(adres)){
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

// Wanneer er meerdere emailadressen worden ingevoerd gaan we deze splitsen
filterAdressen = function (adressen) {
  var emailCollection = [];
  while (adressen.includes(";")) {
    var index = adressen.indexOf(";");
    var adres = adressen.substring(0, index);
    emailCollection.push(adres);
    adressen = adressen.substring(index + 1, adressen.length)
  }
  adres = adressen.substring(0, adressen.length)
  if (adres.length > 0){
    emailCollection.push(adres);
  }
  return emailCollection;
}

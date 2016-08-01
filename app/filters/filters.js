angular.module('ga.filters', [])
  .filter('formValidator', function () {
    return function (field, validationErrors) {
      var returnValue = "";
      angular.forEach(validationErrors, function (value) {
        if (value.veld == field) {
          returnValue = "has-validation-error";
        }
      })
      return returnValue;

    }
  })
  .filter('formValidatorError', function () {
    return function (field, validationErrors) {
      var returnValue = "";
      angular.forEach(validationErrors, function (value) {
        if (value.veld == field) {
          returnValue = value.titel.charAt(0).toUpperCase() + value.titel.slice(1);
        }
      })
      return returnValue;
    }
  })
;

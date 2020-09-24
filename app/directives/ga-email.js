(function () {
  'use strict';
  angular
    .module('ga.validatie.email', [])
    .directive('email', [function () {
      var EMAIL_REGEXP = /^[_a-zA-Z0-9ïéè]+(\.[_a-zA-Z0-9ïéè]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,5})$/;
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.email = function (modelValue) {
              return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
            };
        }
      };
    }]);
})();

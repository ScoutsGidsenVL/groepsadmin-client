(function () {
  'use strict';

  angular
    .module('ga.ui.selectpicker', [])
    .directive('selectpicker', [function () {
      return {
        restrict: 'EAC',
        require: '?ngModel',
        priority: 10,
        compile: function () {
          return function (scope, elem, attrs, ngModel) {
            if (!ngModel) return;
            // Opmerking: Als ng-model statisch is (m.a.w. niet geüpdatet wordt), zal $watch expression niet uitgevoerd worden.
            // Dan zal een normaal <select>-element gerendered worden
            scope.$watch(attrs.ngModel, function (newVal) {
              scope.$evalAsync(function () {
                if (!attrs.ngOptions || /track by/.test(attrs.ngOptions)) elem.val(newVal);
                elem.selectpicker('refresh');
              });
            });
            /*
             ngModel.$render = function () {
             scope.$evalAsync(function () {
             elem.selectpicker('refresh');
             });
             }*/
          };
        }

      };
    }]);


})();

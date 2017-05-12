(function() {
  'use strict';
  angular
    .module('ga.lid', [])
    .directive('gaLid', ['$location', function ($location) {
      return {
        restrict: 'A',
        link: function (scope, elem, attr) {
          elem.click(function () {
            $location.path('/lid/' + attr.gaLid);
            scope.$apply();
          });
        }
      }
    }])
})();

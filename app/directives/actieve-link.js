(function() {
  'use strict';

  angular
  .module('ga.actievelink', [])
  .directive('activeLink', ['$location', function(location) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs, controller) {
              var clazz = attrs.activeLink;
              var path = element[0].firstElementChild.hash;
              path = path.substring(1); //hack because path does bot return including hashbang
              scope.location = location;
              scope.$watch('location.path()', function(newPath) {
                  if (path === newPath) {
                      element.addClass(clazz);
                  } else {
                      element.removeClass(clazz);
                  }
              });
          }

      };

  }]);


})();

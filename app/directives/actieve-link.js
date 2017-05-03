(function() {
  'use strict';

  angular
  .module('ga.actievelink', [])
  .directive('activeLink', ['$location', function(location) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs, controller) {
              var clazz = attrs.activeLink;
              var path;
              if (element[0].id == 'search') {
                  path = 'zoeken';
              } else {
                  path = element[0].firstElementChild.hash.substring(1);
              }
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

(function() {
  'use strict';

  angular.module('ga', [
    'ga.route',
    'ga.services.rest',
    'ga.services.http',
    'ga.services.alert',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.searchcontroller',
    'ga.ui',
    'ga.typeahead',
    'ui.bootstrap'
  ]);


  angular.module('ga')
    .directive('gaLid', ['$location', function ($location) {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          element.click(function () {
            $location.path('/lid/' + attr.gaLid);
            scope.$apply();
          });
        }
      }
    }])
  /*
.filter("mydate", function() {
    var re = /\\\/Date\(([0-9]*)\)\\\//;
    return function(x) {
        var m = x.match(re);
        if( m ) return new Date(parseInt(m[1]));
        else return null;
    };
})*/


})();
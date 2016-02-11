(function() {
  'use strict';

  angular.module('ga', [
    'ga.route',
    'ga.services.rest',
    'ga.services.http',
    'ga.services.alert',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.lid.velden',
    'ga.searchcontroller',
    'ga.typeahead',
    'ga.ui.selectpicker',
    'ga.ui.alert',
    'ga.ui.dialog',
    'ui.bootstrap',
    'ga.utils'
  ]);


  angular.module('ga')
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

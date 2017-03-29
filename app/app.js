(function() {
  'use strict';

  angular.module('ga', [
    'ga.route',
    'ga.services.rest',
    'ga.services.http',
    'ga.services.alert',
    'ga.services.ledenfilter',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.usercontroller',
    'ga.lidtoevoegencontroller',
    'ga.lidindividuelesteekkaartcontroller',
    'ga.groepcontroller',
    'ga.orakelcontroller',
    'ga.lid.velden',
    'ga.dynamischveld',
    'ga.dynamischevelden',
    'ga.dynamischformulier',
    'ga.actievelink',
    'ga.searchcontroller',
    'ga.ui.selectpicker',
    'ga.ui.alert',
    'ga.ui.dialog',
    'ga.filters',
    'ui.bootstrap',
    'ga.utils',
    'infinite-scroll',
    'ngSanitize'
  ])
  // lodash for use in controllers, unit tests
  .constant('_', window._)
  // for use in views, f.e. ng-repeat="x in _.range(3)"
  .run(function ($rootScope) {
     $rootScope._ = window._;
  });

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
  angular.module('ga').factory('keycloak', function($window) {
    return $window._keycloak;
  });

})();

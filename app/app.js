(function() {
  'use strict';

  angular.module('ga', [
    'ga.route',
    'ga.services.rest',
    'ga.services.useraccess',
    'ga.services.http',
    'ga.services.alert',
    'ga.services.formvalidation',
    'ga.services.ledenfilter',
    'ga.services.ledenlijst',
    'ga.services.email',
    'ga.services.etiketten',
    'ga.services.lid',
    'ga.services.cache',
    'ga.alert-controller',
    'ga.aanvragencontroller',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.usercontroller',
    'ga.lidtoevoegencontroller',
    'ga.lidindividuelesteekkaartcontroller',
    'ga.menucontroller',
    'ga.formerrorbutton',
    'ga.loadingSection',
    'ga.ordericon',
    'ga.parseDate',
    'ga.groepcontroller',
    'ga.ledenaantallencontroller',
    'ga.websitecontroller',
    'ga.emailcontroller',
    'ga.etikettencontroller',
    'ga.modalinstancecontroller',
    'ga.lid',
    'ga.lid.velden',
    'ga.dynamischveld',
    'ga.dynamischevelden',
    'ga.dynamischformulier',
    'ga.actievelink',
    'ga.wikilink',
    'ga.sparkline',
    'ga.searchcontroller',
    'ga.ui.selectpicker',
    'ga.ui.dialog',
    'ga.filters',
    'ga.utils',
    'ui.bootstrap',
    'infinite-scroll',
    'ngSanitize',
    'ngMessages',
    'angular.filter',
    'angulartics',
    'angulartics.piwik',
    'fixed.table.header'
  ])

  // lodash for use in controllers, unit tests
  .constant('_', window._)

  .run(["$rootScope", "UserAccess", "$location", "$log", function ($rootScope, UserAccess, $location, $log) {
    $rootScope._ = window._;

    $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
      switch (rejection) {
        case UserAccess.FORBIDDEN:
          $log.warn("$stateChangeError event catched", UserAccess.FORBIDDEN);
          $location.path("/lid/profiel");
          break;
        default:
          $log.warn("$stateChangeError event catched");
          break;
      }
    });


  }]);

  angular.module('ga').factory('keycloak', function($window) {
    return $window._keycloak;
  });

  angular.element(document).ready(function() {
    window._keycloak = Keycloak(getClient());

    window._keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: true
      })
      .success(bootstrapApp);
  });

  var bootstrapApp = function(){
    angular.bootstrap(document, ['ga']); // manually bootstrap Angular
  }
})();

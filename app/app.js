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
    'ga.alert-controller',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.usercontroller',
    'ga.lidtoevoegencontroller',
    'ga.lidindividuelesteekkaartcontroller',
    'ga.menucontroller',
    'ga.groepcontroller',
    'ga.orakelcontroller',
    'ga.websitecontroller',
    'ga.emailcontroller',
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
    'angulartics.piwik'
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

  var googleMapsKey = '';
  switch (window.location.origin){
    case 'http://localhost:8000':
      googleMapsKey = 'AIzaSyBQRUONtrmAcJ96_NILKeRvj5F5nXRh2MM';
      break;
    case 'https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be':
      googleMapsKey = 'AIzaSyBiKzCCqMUyu4mW0rKk777CU3pW86FZiJ8';
      break;
    case 'https://groepsadmin-develop.scoutsengidsenvlaanderen.net':
      googleMapsKey = 'AIzaSyBZU1SgLDbOfAlROSnR_cb_wWQGlQRqMqc';
      break;
  }
  var script = document.createElement('script');
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + googleMapsKey;
  document.body.appendChild(script);

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

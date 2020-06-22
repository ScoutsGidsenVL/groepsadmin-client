(function () {
  'use strict';

  angular.module('ga', [
    'ga.route',
    'ga.services.apiinfo',
    'ga.services.keycloak',
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
    'ga.datum.control',
    'ga.gemeente.control',
    'ga.straat.control',
    'ga.formerrorbutton',
    'ga.loadingSection',
    'ga.ordericon',
    'ga.parseDate',
    'ga.wysiwyg',
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
    'ga.validatie.rekeningnummer',
    'ga.validatie.telefoonnummer',
    'ui.bootstrap',
    'infinite-scroll',
    'ngSanitize',
    'ngMessages',
    'angular.filter',
    'fixed.table.header',
    'ngStorage'
  ])

  // lodash for use in controllers, unit tests
    .constant('_', window._)
    .constant('APP_INFO', {
      name: '<%= pkg.name %>',
      version: '<%= pkg.version %>',
      description: '<%= pkg.description %>',
      gitDescribe: '<%= pkg.gitDescribe %>'
    })

    .run(["$rootScope", "UserAccess", "$location", "$log", "APP_INFO", function ($rootScope, UserAccess, $location, $log, APP_INFO) {
      $rootScope._ = window._;
      $rootScope.APP_INFO = APP_INFO;
      console.log(APP_INFO);

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

  angular.element(document).ready(function () {
    window._keycloak = Keycloak(getClient());

    window._keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: true
      })
      .success(bootstrapApp);
  });

  var bootstrapApp = function () {
    angular.bootstrap(document, ['ga']); // manually bootstrap Angular
  }
})();

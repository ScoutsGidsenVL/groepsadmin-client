(function () {
  'use strict';

  angular
    .module('ga.route', ['ngRoute'])
    .config(configure);

  configure.$inject = ['$routeProvider', '$locationProvider'];

  function configure($routeProvider, $locationProvider) {
    // Configure the routes
    $routeProvider
    // Leden tabel
      .when('/', {
        templateUrl: 'partials/leden.html',
        controller: 'LedenlijstController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("ledenlijst"); }]
        }
      })
      // Lid toevoegen
      .when('/lid/toevoegen', {
        templateUrl: 'partials/lid-toevoegen.html',
        controller: 'LidToevoegenController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("groepen"); }]
        }
      })
      // Lid individuelestekkaart
      .when('/lid/individuelesteekkaart/:id', {
        templateUrl: 'partials/lid-individuele-steekkaart.html',
        controller: 'LidIndividueleSteekkaartController'
      })
      // Lid detailpagina
      .when('/lid/:id', {
        templateUrl: 'partials/lid.html',
        controller: 'LidController'
      })

      // Groepsinstellingen
      .when('/groepsinstellingen', {
        templateUrl: 'partials/groepsinstellingen.html',
        controller: 'GroepController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("groepen"); }]
        }
      })

      // Orakel
      .when('/orakel', {
        templateUrl: 'partials/orakel.html',
        controller: 'OrakelController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("groepen"); }]
        }
      });

    //$locationProvider.html5Mode(true).hashPrefix('!');
  }
})();

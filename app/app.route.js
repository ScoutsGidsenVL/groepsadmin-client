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
      .when('/ledenlijst', {
        templateUrl: 'partials/leden.html',
        controller: 'LedenlijstController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("ledenlijst").then(function(res){ return res }); }]
        }
      })
      // Lid toevoegen
      .when('/lid/toevoegen', {
        templateUrl: 'partials/lid-toevoegen.html',
        controller: 'LidToevoegenController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessToGroepen().then(function(res){ return res }); }]
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
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessToGroepen().then(function(res){ return res }); }]
        }
      })

      // Orakel
      .when('/orakel', {
        templateUrl: 'partials/orakel.html',
        controller: 'OrakelController',
        resolve : {
          access: ["UserAccess", function (UserAccess) { return UserAccess.hasAccessTo("ledenlijst").then(function(res){ return res }); }]
        }
      })
      .otherwise({
        redirectTo: '/ledenlijst'
      });



    //$locationProvider.html5Mode(true).hashPrefix('!');
  }
})();

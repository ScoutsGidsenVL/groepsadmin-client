(function () {
  'use strict';

  angular
    .module('ga-public.route', ['ngRoute'])
    .config(configure);

  configure.$inject = ['$routeProvider', '$locationProvider'];

  function configure($routeProvider) {
    // Configure the routes
    $routeProvider

      .when('/lidworden', {
        templateUrl: 'partials/lidworden.html',
        controller: 'LidwordenController'
      })

      .otherwise({
        redirectTo: '/lidworden'
      });
  }
})();

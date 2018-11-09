(function () {
  'use strict';

  angular
    .module('ga.usercontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('UserController', UserController);

  UserController.$inject = ['$analytics', '$scope', 'KeyCloak'];

  function UserController($analytics, $scope, keycloak) {
    var username = keycloak.idTokenParsed.name;
    if (!keycloak.idTokenParsed.name) {
      username = keycloak.idTokenParsed.preferred_username;
    }

    $scope.username = username;
    $analytics.setUsername(username);

    $scope.logout = function () {
      keycloak.logout();
    }
  }
})();

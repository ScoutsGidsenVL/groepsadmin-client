(function() {
  'use strict';

  angular
    .module('ga.usercontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', 'keycloak' ];

  function UserController ($scope, keycloak) {
    console.log('login = ' + keycloak.authenticated);
    $scope.username = keycloak.idTokenParsed.name
    $scope.logout = function(){
      keycloak.logout();
    }

  }
})();

(function() {
  'use strict';

  angular
    .module('ga.usercontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', 'keycloak', '$window' ];

  function UserController ($scope, keycloak, $window) {
    $scope.username = keycloak.idTokenParsed.name;
    if(!keycloak.idTokenParsed.name){
      $scope.username = keycloak.idTokenParsed.preferred_username;
    }
    $scope.logout = function(){
      keycloak.logout();
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('ga.usercontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', 'keycloak', '$window' ];

  function UserController ($scope, keycloak, $window) {
    $scope.username = keycloak.idTokenParsed.name;
    console.log(keycloak.idTokenParsed);
    if(!keycloak.idTokenParsed.name){
      $scope.username = keycloak.idTokenParsed.preferred_username;
    }
    $scope.logout = function(){
      console.log('logout');
      keycloak.logout();
      $window.location.href = 'http://login.scoutsengidsenvlaanderenen.be';
    }

  }
})();

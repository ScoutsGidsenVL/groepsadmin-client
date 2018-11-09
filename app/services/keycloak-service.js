(function() {
  'use strict';

  angular
    .module('ga.services.keycloak', [])
    .factory('KeyCloak', KeyCloak);

  KeyCloak.$inject = ['$window'];

  function KeyCloak($window) {
    return $window._keycloak;
  }
})();

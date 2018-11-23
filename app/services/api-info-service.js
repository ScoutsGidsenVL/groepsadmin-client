(function() {
  'use strict';

  angular
    .module('ga.services.apiinfo', [])
    .factory('ApiInfo', ApiInfo);

  ApiInfo.$inject = [];

  function ApiInfo() {
    var apiHost;
    if (window.location.protocol === "https:") {
      apiHost = window.location.origin;
    } else {
      //apiHost = 'https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be';
      apiHost = '';
      // Alternatief als de groepsadmin lokaal draait:
      //apiHost = 'http://localhost:8080';
    }
    return {
      host: apiHost
    }
  }
})();

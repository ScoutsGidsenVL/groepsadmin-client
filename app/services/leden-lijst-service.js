(function() {
  'use strict';

  angular
    .module('ga.services.ledenlijst', [])
    .factory('LedenLijstService', LedenLijstService);

  LedenLijstService.$inject = ['$log'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het laden van de ledenlijst

  function LedenLijstService($log) {
    var ledenFilterService = {};

    ledenFilterService.functieGroepNaamMaken = function(){

    }

    return ledenFilterService;
  };
})();

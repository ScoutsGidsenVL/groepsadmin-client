(function() {
  'use strict';

  angular
    .module('ga.services.ledenlijst', [])
    .factory('LedenLijstService', LedenLijstService);

  LedenLijstService.$inject = ['$log','$q','RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het laden van de ledenlijst

  function LedenLijstService($log,$q,RestService) {
    var ledenFilterService = {};

    ledenFilterService.loadingLeden = false;

    ledenFilterService.getLeden = function(aantalPerPagina, offset){
      ledenFilterService.loadingLeden = true;

      return $q(function(resolve,reject){
        RestService.Leden.get({aantal: aantalPerPagina, offset: offset}).$promise.then(
          function (response) {
            ledenFilterService.loadingLeden = false;
            resolve(response);
            //console.log('leden', response);
          }
        );
      })


    }





    return ledenFilterService;
  };
})();

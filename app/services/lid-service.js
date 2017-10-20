(function() {
  'use strict';

  angular
    .module('ga.services.lid', [])
    .factory('LidService', LidService);

  LidService.$inject = ['$q','$rootScope', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LidController en de LidToevoegenController

  function LidService($q, $rootScope, RestService) {
    var lidService = {};

    lidService.zoekGemeente = function(zoekterm){
      var resultaatGemeentes = [];
      return RestService.Gemeente.get({zoekterm:zoekterm, token:1}).$promise.then(
          function(result){
            angular.forEach(result, function(val){
              if(typeof val == 'string'){
                resultaatGemeentes.push(val);
              }
            });
            return resultaatGemeentes;
        });
    }

    return lidService;
  };
})();

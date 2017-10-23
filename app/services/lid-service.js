(function() {
  'use strict';

  angular
    .module('ga.services.lid', [])
    .factory('LidService', LidService);

  LidService.$inject = ['$q','$rootScope', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LidController en de LidToevoegenController

  function LidService($q, $rootScope, RestService) {
    var lidService = {};
    var functies, groepen = {};

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

    lidService.getFuncties = function(){
      var deferred = $q.defer();
      if(!_.isEmpty(functies)){
        deferred.resolve(functies);
      }else{
        RestService.Functies.get().$promise.then(
          function(result){
            functies = result;
            deferred.resolve(functies);
          }
        );
      }
      return deferred.promise;
    }

    lidService.getGroepen = function(){
      var deferred = $q.defer();
      if(!_.isEmpty(groepen)){
        deferred.resolve(groepen);
      }else{
        RestService.Groepen.get().$promise.then(
          function(result){
            groepen = result;
            deferred.resolve(groepen);
          }
        );
      }
      return deferred.promise;
    }

    return lidService;
  };
})();

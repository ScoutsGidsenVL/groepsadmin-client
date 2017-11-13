(function() {
  'use strict';

  angular
    .module('ga.services.cache', [])
    .factory('CacheService', CacheService);

  CacheService.$inject = ['RestService', '$q'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function CacheService(RestService, $q) {
    var resGroepen,resFuncties = {};
    return {
      Groepen : function(){
        if(_.isEmpty(resGroepen)){
          return RestService.Groepen.get().$promise.then(function (response) {
            resGroepen = response;
            return resGroepen;
          });
        }else{
          var deferred = $q.defer();
          deferred.resolve(resGroepen);
          return deferred.promise;
        }
      },
      Functies : function(){
        if(_.isEmpty(resGroepen)){
          return RestService.Functies.get().$promise.then(function (response) {
            resFuncties = response;
            return resFuncties;
          });
        }else{
          var deferred = $q.defer();
          deferred.resolve(resFuncties);
          return deferred.promise;
        }
      }
    };
  };
})();

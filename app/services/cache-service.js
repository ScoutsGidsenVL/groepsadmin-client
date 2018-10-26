(function () {
  'use strict';

  angular
    .module('ga.services.cache', [])
    .factory('CacheService', CacheService);

  CacheService.$inject = ['RestService', '$q', '$rootScope'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function CacheService(RestService, $q, $rootScope) {
    var resGroepen, resFuncties = {}, waitingGroepen = false, waitingFuncties = false;

    var indexedGroepen = {}, deferredGroepen = {};
    var indexedFuncties = {}, deferredFuncties = {};

    function getGroepById(id) {
      var deferred = $q.defer();

      if (indexedGroepen[id]) {
        if (indexedGroepen[id].waiting) {
          if (deferredGroepen[id] === undefined) {
            deferredGroepen[id] = [];
          }
          deferredGroepen[id].push(deferred);
        }
        else {
          deferred.resolve(indexedGroepen[id]);
        }

      }
      else {
        indexedGroepen[id] = {
          waiting: true
        };

        RestService.Groep.get({id: id}).$promise
          .then(function (result) {
            indexedGroepen[id] = result;
            angular.forEach(deferredGroepen[result.id], function (deferredGroep) {
              deferredGroep.resolve(result);
            });
            delete deferredGroepen[result.id];
            deferred.resolve(result);
          });
      }

      return deferred.promise;
    }

    function getFunctieById(id) {
      var deferred = $q.defer();

      if (indexedFuncties[id]) {
        if (indexedFuncties[id].waiting) {
          if (deferredFuncties[id] === undefined) {
            deferredFuncties[id] = [];
          }
          deferredFuncties[id].push(deferred);
        }
        else {
          deferred.resolve(indexedFuncties[id]);
        }

      }
      else {
        indexedFuncties[id] = {
          waiting: true
        };

        RestService.Functie.get({id: id}).$promise
          .then(function (result) {
            indexedFuncties[id] = result;
            angular.forEach(deferredFuncties[result.id], function (deferredFunctie) {
              deferredFunctie.resolve(result);
            });
            delete deferredFuncties[result.id];
            deferred.resolve(result);
          });
      }

      return deferred.promise;
    }

    var clearGroepQueue = function () {
      angular.forEach(deferredGroepen, function (deferred, id) {
        getGroepById(id).then(function (result) {
          angular.forEach(deferredGroepen[result.id], function (deferredGroep) {
            deferredGroep.resolve(result);
          });
          delete deferredGroepen[result.id];
        });
      });
    };

    var clearFunctieQueue = function () {
      angular.forEach(deferredFuncties, function (deferred, id) {
        getFunctieById(id).then(function (result) {
          angular.forEach(deferredFuncties[result.id], function (deferredFunctie) {
            deferredFunctie.resolve(result);
          });
          delete deferredFuncties[result.id];
        });
      });
    };

    return {
      Groep: function (id) {
        var deferred = $q.defer();

        if (waitingGroepen) {
          if (deferredGroepen[id] === undefined) {
            deferredGroepen[id] = [];
          }
          deferredGroepen[id].push(deferred);
        }
        else {
          getGroepById(id).then(function (result) {
            deferred.resolve(result);
          });
        }

        return deferred.promise;
      },
      Groepen: function (force) {
        if (force || _.isEmpty(resGroepen)) {
          waitingGroepen = true;
          return RestService.Groepen.get().$promise
            .then(function (response) {
              $rootScope.$broadcast('ga-groepen-geladen', response);
              resGroepen = response;

              angular.forEach(response.groepen, function (groep) {
                indexedGroepen[groep.id] = groep;
              });

              clearGroepQueue();

              return resGroepen;
            })
            .finally(function () {
              waitingGroepen = false;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve(resGroepen);
          return deferred.promise;
        }
      },
      Functie: function (id) {
        var deferred = $q.defer();

        if (waitingFuncties) {
          if (deferredFuncties[id] === undefined) {
            deferredFuncties[id] = [];
          }
          deferredFuncties[id].push(deferred);
        }
        else {
          getFunctieById(id).then(function (result) {
            deferred.resolve(result);
          });
        }

        return deferred.promise;
      },
      Functies: function () {
        if (_.isEmpty(resGroepen)) {
          waitingFuncties = true;
          return RestService.Functies.get().$promise
            .then(function (response) {
              resFuncties = response;

              angular.forEach(response.functies, function (functie) {
                indexedFuncties[functie.id] = functie;
              });

              clearFunctieQueue();

              return resFuncties;
            })
            .finally(function () {
              waitingFuncties = false;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve(resFuncties);
          return deferred.promise;
        }
      }
    };
  }
})();

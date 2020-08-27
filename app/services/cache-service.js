(function () {
  'use strict';

  angular
    .module('ga.services.cache', [])
    .factory('CacheService', CacheService);

  CacheService.$inject = ['RestService', '$q', '$rootScope'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function CacheService(RestService, $q, $rootScope) {
    var resGroepen, resFuncties, resGroepenVga = {}, waitingGroepen = false, waitingFuncties = false, waitingGroepenVga = false;

    var indexedGroepen = {}, deferredGroepen = {};
    var indexedGroepenVga = {}, deferredGroepenVga = {};
    var indexedFuncties = {}, deferredFuncties = {};

    function returnGroepenVga() {
      var copy = {
        groepenVga: []
      };

      angular.forEach(resGroepenVga.groepen, function (groep) {
        copy.groepenVga.push(angular.merge({}, groep));
      });
      return copy;
    }


    function returnGroepen() {
      var copy = {
        groepen: []
      };

      angular.forEach(resGroepen.groepen, function (groep) {
        copy.groepen.push(angular.merge({}, groep));
      });

      return copy;
    }

    function returnFuncties() {
      var copy = {
        functies: []
      };

      angular.forEach(resFuncties.functies, function (functie) {
        copy.functies.push(angular.merge({}, functie));
      });

      return copy;
    }

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
          deferred.resolve(angular.merge({}, indexedGroepen[id]));
        }

      }
      else {
        indexedGroepen[id] = {
          waiting: true
        };

        RestService.Groep.get({id: id}).$promise
          .then(function (result) {
            delete result.$promise;
            indexedGroepen[id] = result;
            angular.forEach(deferredGroepen[result.id], function (deferredGroep) {
              deferredGroep.resolve(angular.merge({}, result));
            });
            delete deferredGroepen[result.id];
            deferred.resolve(angular.merge({}, result));
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
          deferred.resolve(angular.merge({}, indexedFuncties[id]));
        }

      }
      else {
        indexedFuncties[id] = {
          waiting: true
        };

        RestService.Functie.get({id: id}).$promise
          .then(function (result) {
            delete result.$promise;
            indexedFuncties[id] = result;
            angular.forEach(deferredFuncties[result.id], function (deferredFunctie) {
              deferredFunctie.resolve(angular.merge({}, result));
            });
            delete deferredFuncties[result.id];
            deferred.resolve(angular.merge({}, result));
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
      UpdateGroep: function (id, groep) {
        var groepen = [];
        angular.forEach(resGroepen.groepen, function (cacheGroep) {
          if (cacheGroep.id === id) {
            groepen.push(groep);
          }
          else {
            groepen.push(cacheGroep);
          }
        });
        indexedGroepen[id] = groep;
        resGroepen.groepen = groepen;
      },
      Groepen: function (force) {
        if (force || _.isEmpty(resGroepen)) {
          waitingGroepen = true;
          return RestService.Groepen.get().$promise
            .then(function (response) {
              resGroepen = response;
              var copiedResponse = returnGroepen();
              $rootScope.$broadcast('ga-groepen-geladen', copiedResponse);

              angular.forEach(response.groepen, function (groep) {
                indexedGroepen[groep.id] = groep;
              });

              clearGroepQueue();

              return copiedResponse;
            })
            .finally(function () {
              waitingGroepen = false;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve(returnGroepen());
          return deferred.promise;
        }
      },
      GroepenVga: function (force) {
        if (force || _.isEmpty(resGroepenVga)) {
          waitingGroepenVga = true;
          return RestService.GroepWaarvanGebruikerVGA.get().$promise
            .then(function (response) {
              resGroepenVga = response;
              var copiedResponse = returnGroepenVga();
              $rootScope.$broadcast('ga-groepen-geladen', copiedResponse);

              angular.forEach(response.groepen, function (groep) {
                indexedGroepenVga[groep.id] = groep;
              });
              return copiedResponse;
            })
            .finally(function () {
              waitingGroepenVga = false;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve(returnGroepenVga());
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
        if (_.isEmpty(resFuncties)) {
          waitingFuncties = true;
          return RestService.Functies.get().$promise
            .then(function (response) {
              resFuncties = response;

              angular.forEach(response.functies, function (functie) {
                indexedFuncties[functie.id] = functie;
              });

              clearFunctieQueue();

              return returnFuncties();
            })
            .finally(function () {
              waitingFuncties = false;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve(returnFuncties());
          return deferred.promise;
        }
      }
    };
  }
})();

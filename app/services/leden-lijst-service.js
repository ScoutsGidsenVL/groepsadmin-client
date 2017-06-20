(function() {
  'use strict';

  angular
    .module('ga.services.ledenlijst', [])
    .factory('LedenLijstService', LedenLijstService);

  LedenLijstService.$inject = ['$log', '$q', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het laden van de ledenlijst

  function LedenLijstService($log, $q, RestService) {
    var ledenFilterService = {};

    ledenFilterService.loadingLeden = false;

    ledenFilterService.getLeden = function(offset){
      ledenFilterService.loadingLeden = true;

      return $q(function(resolve,reject){
        RestService.Leden.get({offset: offset}).$promise.then(
          function (response) {
            ledenFilterService.loadingLeden = false;
            resolve(response);
          }
        );
      })
    }

    ledenFilterService.export = function(type){
      var deferred = $q.defer();
      var file, fileUrl;

      if(type == 'csv'){
        RestService.LedenCsv.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'text/csv'});
          fileUrl = URL.createObjectURL(file);
          deferred.resolve(fileUrl);
        });
      }
      if(type == 'pdf'){
        RestService.LedenPdf.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'application/pdf'});
          fileUrl = URL.createObjectURL(file);
          deferred.resolve(fileUrl);
        });
      }
      if(type == 'steekkaarten'){
        RestService.LedenSteekkaarten.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'application/pdf'});
          fileUrl = URL.createObjectURL(file);
          deferred.resolve(fileUrl);
        });
      }

      return deferred.promise;
    }

    return ledenFilterService;
  };
})();

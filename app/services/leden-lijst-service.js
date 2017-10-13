(function() {
  'use strict';

  angular
    .module('ga.services.ledenlijst', [])
    .factory('LedenLijstService', LedenLijstService);

  LedenLijstService.$inject = ['$log', '$q', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het laden van de ledenlijst

  function LedenLijstService($log, $q, RestService) {
    var ledenLijstService = {};

    ledenLijstService.loadingLeden = false;

    ledenLijstService.getLeden = function(offset){
      ledenLijstService.loadingLeden = true;

      return $q(function(resolve,reject){
        RestService.Leden.get({offset: offset}).$promise.then(
          function (response) {
            ledenLijstService.loadingLeden = false;
            resolve(response);
          }
        );
      })
    }

    ledenLijstService.export = function(type){
      var deferred = $q.defer();
      var file, fileUrl, obj = {};

      if(type == 'csv'){
        RestService.LedenCsv.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'text/csv'});
          obj.fileUrl = URL.createObjectURL(file);
          obj.title = 'ledenlijst';
          deferred.resolve(obj);
        });
      }
      if(type == 'pdf'){
        RestService.LedenPdf.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'application/pdf'});
          obj.fileUrl = URL.createObjectURL(file);
          obj.title = 'ledenlijst';
          deferred.resolve(obj);
        });
      }
      if(type == 'steekkaarten'){
        RestService.LedenSteekkaarten.get({offset:0}).$promise.then(function(res){
          file = new Blob([res.response], {type: 'application/pdf'});
          obj.fileUrl = URL.createObjectURL(file);
          obj.title = 'steekkaarten';
          deferred.resolve(obj);
        });
      }

      return deferred.promise;
    }


    ledenLijstService.getNextPrevLid = function(lidId, ledenlijst){
      var nextLid, prevLid;

      // ledenlijst uit rootScope ontdubbelen, op basis van lid.id
      ledenlijst = _.uniqBy(ledenlijst, 'id');
      // zoek index van lidId param
      var indexLid = _.findIndex(ledenlijst, { 'id': lidId});
      // neem volgende en vorige lid id uit de ontdubbelde lijst
      if(ledenlijst[indexLid + 1]){
        nextLid = ledenlijst[indexLid + 1];
      }else{
        nextLid = ledenlijst[0];
      }
      if(ledenlijst[indexLid - 1]){
        prevLid = ledenlijst[indexLid -1];
      }else{
        prevLid = ledenlijst[ledenlijst.length-1];
      }

      return [prevLid, nextLid];


    }

    return ledenLijstService;
  };

})();

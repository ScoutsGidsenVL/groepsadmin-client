(function () {
  'use strict';

  angular
    .module('ga.services.ledenlijst', [])
    .factory('LedenLijstService', LedenLijstService);

  LedenLijstService.$inject = ['$log', '$q', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het laden van de ledenlijst

  function LedenLijstService($log, $q, RestService) {
    var ledenLijstService = {};
    var ledenLijstVoorVersturen = [];
    ledenLijstService.alleLedenGeselecteerd = false;

    ledenLijstService.loadingLeden = false;

    ledenLijstService.getLeden = function (offset) {
      ledenLijstService.loadingLeden = true;

      return $q(function (resolve, reject) {
        RestService.Leden.get({offset: offset}).$promise.then(
          function (response) {
            ledenLijstService.loadingLeden = false;
            resolve(response);
          }
        );
      })
    }

    ledenLijstService.voegLidToeAanMailLijst = function (lid) {
      ledenLijstVoorVersturen.push(lid);
    }

    ledenLijstService.verwijderLidUitLijst = function (lid) {
      var index = -1;
      for (var i = 0; i < ledenLijstVoorVersturen.length; i++) {
        if (ledenLijstVoorVersturen[i].id === lid.id) {
          index = i;
          break;
        }
      }
      if (index >= 0){
        ledenLijstVoorVersturen.splice(index, 1);
      }
    }

    ledenLijstService.getGeselecteerdeLeden = function () {
      return ledenLijstVoorVersturen;
    }

    ledenLijstService.voegAlleLedenToe = function() {
      ledenLijstService.alleLedenGeselecteerd = !ledenLijstService.alleLedenGeselecteerd;
    }

    ledenLijstService.wisGeselecteerdeLeden = function () {
      ledenLijstVoorVersturen = [];
    }

    ledenLijstService.getAantalGeselecteerdeLeden = function () {
      return ledenLijstVoorVersturen.length;
    }

    ledenLijstService.isLidInLijst = function (lid) {
      var index = -1;
      for (var i = 0; i < ledenLijstVoorVersturen.length; i++) {
        if (ledenLijstVoorVersturen[i].id === lid.id) {
          index = i;
          break;
        }
      }
      return index >= 0;
    }

    ledenLijstService.checkAlleLedenGeselecteerd = function () {
      return ledenLijstService.alleLedenGeselecteerd;
    }

    ledenLijstService.export = function (type, extension) {
      var deferred = $q.defer();
      var blob, obj = {};

      var ledenIds = {
        "lidIds": []
      }

      if (ledenLijstVoorVersturen.length > 0) {
        _.forEach(ledenLijstVoorVersturen, function (lid) {
          ledenIds.lidIds.push(lid.id);
        })
      }

      if (type == 'lijst' && extension == 'csv') {
        RestService.LedenCsv.post({offset: 0}, ledenIds).$promise.then(function (res) {
          blob = new Blob([res.response], {type: 'text/csv'});
          obj.fileUrl = window.URL.createObjectURL(blob);
          obj.title = type + '.' + extension;
          deferred.resolve(obj);
        });
      }
      if (type == 'lijst' && extension == 'pdf') {
        RestService.LedenPdf.get({offset: 0}).$promise.then(function (res) {
          blob = new Blob([res.response], {type: 'application/pdf'});
          obj.fileUrl = window.URL.createObjectURL(blob);
          obj.title = type + '.' + extension;
          deferred.resolve(obj);
        });
      }
      if (type == 'steekkaarten' && extension == 'pdf') {
        RestService.LedenSteekkaarten.get({offset: 0}).$promise.then(function (res) {
          blob = new Blob([res.response], {type: 'application/pdf'});
          obj.fileUrl = window.URL.createObjectURL(blob);
          obj.title = type + '.' + extension;
          deferred.resolve(obj);
        });
      }

      return deferred.promise;
    }


    ledenLijstService.getNextPrevLid = function (lidId, ledenlijst) {
      var nextLid, prevLid;

      // ledenlijst uit rootScope ontdubbelen, op basis van lid.id
      ledenlijst = _.uniqBy(ledenlijst, 'id');
      // zoek index van lidId param
      var indexLid = _.findIndex(ledenlijst, {'id': lidId});
      // neem volgende en vorige lid id uit de ontdubbelde lijst
      if (ledenlijst[indexLid + 1]) {
        nextLid = ledenlijst[indexLid + 1];
      } else {
        nextLid = ledenlijst[0];
      }
      if (ledenlijst[indexLid - 1]) {
        prevLid = ledenlijst[indexLid - 1];
      } else {
        prevLid = ledenlijst[ledenlijst.length - 1];
      }

      return [prevLid, nextLid];


    }

    return ledenLijstService;
  };

})
();

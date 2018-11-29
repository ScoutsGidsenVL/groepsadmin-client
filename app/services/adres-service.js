(function () {
  'use strict';

  angular
    .module('ga.services.adres', [])
    .factory('AdresService', AdresService);

  AdresService.$inject = ['RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LidController en de LidToevoegenController

  function AdresService(RestService) {
    var AdresService = {};

    AdresService.publicMethods = {
      zoekGemeente: function (zoekterm) {
        var resultaatGemeentes = [];
        return RestService.Gemeente.get({zoekterm: zoekterm, token: 1}).$promise.then(
          function (result) {
            angular.forEach(result, function (val) {
              if (typeof val == 'string') {
                resultaatGemeentes.push(val);
              }
            });
            return resultaatGemeentes;
          });
      },
      bevestigGemeente: function (item, adres) {
        adres.postcode = item.substring(0, 4);
        adres.gemeente = item.substring(5);
        adres.straat = null;
        adres.bus = null;
        adres.nummer = null;
        adres.giscode = null;
        adres.land = adres.land || 'BE';
      },
      zoekStraat: function (zoekterm, adres) {
        var resultaatStraten = [];
        return RestService.Code.query({zoekterm: zoekterm, postcode: adres.postcode}).$promise.then(
          function (result) {
            angular.forEach(result, function (val) {
              resultaatStraten.push(val);
            });
            return resultaatStraten;
          });
      },
      bevestigStraat: function (item, adres) {
        adres.straat = item.straat;
        adres.giscode = item.code;
      }
    };

    return AdresService;
  }
})();

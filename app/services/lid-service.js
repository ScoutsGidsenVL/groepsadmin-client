(function () {
  'use strict';

  angular
    .module('ga.services.lid', [])
    .factory('LidService', LidService);

  LidService.$inject = ['$timeout', 'RestService', 'AlertService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LidController en de LidToevoegenController

  function LidService($timeout, RestService, AlertService) {
    var lidService = {};

    lidService.publicProperties = {
      contactRollen: [
        {
          'value': 'moeder',
          'label': 'Moeder'
        },
        {
          'value': 'vader',
          'label': 'Vader'
        },
        {
          'value': 'voogd',
          'label': 'Voogd'
        },
      ],
      dateOptions: {
        formatYear: 'yyyy',
        startingDay: 1,
        datepickerMode: 'year'
      },
      popupCal: {
        opened: false
      },
      format: 'dd/MM/yyyy'
    };

    lidService.publicMethods = {
      openPopupCal: function () {
        var scope = this;
        scope.popupCal.opened = true;
      },
      changePostadres: function (adresID) {
        var scope = this;
        angular.forEach(scope.lid.adressen, function (value) {
          value.postadres = value.id == adresID;
        });
      },
      deleteContact: function (contactID) {
        var scope = this;
        _.remove(scope.lid.contacten, {id: contactID});
      },
      contactToevoegen: function (formIsValid) {
        var scope = this;
        if (formIsValid) {
          var newcontact = {
            'rol': 'moeder',
            'adres': scope.lid.adressen[0].id,
            'id': '' + Date.now()
          };
          $timeout(function () {
            newcontact.showme = true
          }, 0);
          scope.lid.contacten.push(newcontact);

        } else {
          AlertService.add('danger', "Nieuwe contacten kunnen pas worden toegevoegd wanneer alle andere formuliervelden correct werden ingevuld.");
        }
      },
      addAdres: function (formIsValid) {
        var scope = this;
        if (formIsValid) {
          var newadres = {
            land: "BE",
            postadres: false,
            omschrijving: "",
            id: 'tempadres' + Date.now(),
            bus: null
          };
          if (!_.find(scope.lid.adressen, {postadres: true})) {
            newadres.postadres = true;
          }
          var lid = {};
          lid.id = scope.lid.id;
          lid.adressen = scope.lid.adressen;
          lid.adressen.push(newadres);

        } else {
          AlertService.add('danger', "Nieuwe adressen kunnen pas worden toegevoegd wanneer alle andere formuliervelden correct werden ingevuld.");
        }
      },
      deleteAdres: function (adresID) {
        var scope = this;
        angular.forEach(scope.lid.adressen, function (value, index) {
          if (value.id == adresID) {
            if (value.postadres) {
              AlertService.add('error', 'Het postadres kan niet gewist worden.');
            } else {
              //controle wissen van adres gekoppeld aan een contact
              var kanwissen = _.every(scope.lid.contacten, function (contact) {
                return adresID != contact.adres;
              });

              if (kanwissen) {
                scope.lid.adressen.splice(index, 1);
              } else {
                AlertService.add('danger', "Dit adres is nog gekoppeld aan een contact, het kan daarom niet gewist worden.");
              }
            }
          }
        });
      },
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
      },
      functieToevoegen: function (groepsnummer, functie, type) {
        var scope = this;
        if (type == 'add') {
          var functieInstantie = {};
          functieInstantie.functie = functie;
          functieInstantie.groep = groepsnummer;


          functieInstantie.begin = '2016-01-01T00:00:00.000+01:00'; // set static date
          functieInstantie.temp = "tijdelijk";

          scope.lid.functies.push(functieInstantie);
          return 'stop';
        }
        else {
          angular.forEach(scope.lid.functies, function (value, key) {
            if (value.groep == groepsnummer && value.functie == functie && value.temp == "tijdelijk") {
              scope.lid.functies.splice(key, 1);
            }
          });
          return 'add'
        }
      },
      openAndHighlightCollapsedInvalidBlocks: function () {
        var scope = this;
        _.each(scope.lidForm.$error, function (errorTypes) {
          _.each(errorTypes, function (error) {
            var str = error.$name.match(/\d+/g, "") + '';
            var s = str.split(',').join('');

            if (error.$name.indexOf('adressen') > -1) {
              scope.lid.adressen[s].showme = true;
              // hilight error
              scope.lid.adressen[s].hasErrors = true;
            }
            else if (error.$name.indexOf('contacten') > -1) {
              scope.lid.contacten[s].showme = true;
              // hilight error
              scope.lid.contacten[s].hasErrors = true;
            }
          })
        });
      },
      unHighlightInvalidBlocks: function () {
        var scope = this;
        if (scope.lid && scope.lid.adressen) {
          _.each(scope.lid.adressen, function (adres) {
            adres.hasErrors = false
          });
        }

        if (scope.lid && scope.lid.contacten) {
          _.each(scope.lid.contacten, function (contact) {
            contact.hasErrors = false
          });
        }
      }
    };

    return lidService;
  }
})();

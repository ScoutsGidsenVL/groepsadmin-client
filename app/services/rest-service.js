(function () {
  'use strict';

  angular
    .module('ga.services.rest', ['ngResource'])
    .factory('RestService', RestService);

  RestService.$inject = ['$resource', '$cacheFactory', 'ApiInfo'];

  function RestService($resource, $cacheFactory, ApiInfo) {

    var apiHost = ApiInfo.host;

    // Alteratief:
    //var apiRoot = apiHost + '/ga';
    var apiRoot = apiHost + '/groepsadmin';

    var base = apiRoot + '/rest-ga/';
    var basejson = "data/";

    return {
      Root: $resource(
        base,
        {},
        {
          get: {
            method: 'GET',
            cache: $cacheFactory('rootCache')
          }
        },
        {
          stripTrailingSlashes: false
        }
      ),
      Lid: $resource(
        base + 'lid/:id?:bevestiging',
        {id: '@id', bevestiging: '@bevestiging'},
        {
          'update': {
            method: 'PATCH', transformRequest: changesOnly, cache: false
          }
        }
      ),
      LidAdd: $resource(
        base + 'lid/',
        {},
        {
          'save': {
            method: 'POST'
          },
          'options': {
            method: 'OPTIONS',
            transformResponse: function (data) {
              var result = {};
              result.data = data;
              return result;
            }
          }
        }
      ),
      LidAanvraag: $resource(
        base + 'lid/aanvraag',
        {},
        {
          'lijst': {method: 'GET'},
          'save': {method: 'POST'},
          'options': {
            method: 'OPTIONS',
            transformResponse: function (data) {
              var result = {};
              result.data = data;
              return result;
            }
          }
        }
      ),
      LidIndividueleSteekkaart: $resource(
        base + 'lid/:id/steekkaart',
        {id: '@id'},
        {
          get: {method: 'GET'},
          patch: {method: 'PATCH'}
        }
      ),
      Functie: $resource(
        base + 'functie/:functieId',
        {functieId: '@functieId'},
        {
          'get': {method: 'GET', cache: false},
          'update': {method: 'PATCH', cache: false},
          'delete': {method: 'DELETE', cache: false}
        }
      ),
      Functies: $resource(
        base + 'functie/',
        {},
        {
          'get': {method: 'GET', cache: false},
          'post': {method: 'POST', cache: false}
        }
      ),
      EmailGeblokkeerd: $resource(
        basejson + 'emailgeblokkeerd.json',
        {},
        {get: {method: 'GET'}}
      ),
      GeblokkeerdAdres: $resource(
        basejson + 'geblokkeerdadres.json',
        {},
        {get: {method: 'GET'}}
      ),
      Geslacht: $resource(
        basejson + 'geslacht.json',
        {},
        {get: {method: 'GET'}}
      ),
      Groep: $resource(
        base + 'groep/:id',
        {groepsnummer: '@id'},
        {
          'get': {method: 'GET', cache: false},
          'update': {method: 'PATCH', cache: false},
          'delete': {method: 'DELETE', cache: false}
        }
      ),
      Groepen: $resource(
        base + 'groep/',
        {},
        {get: {method: 'GET'}}
      ),
      IndividueleSteekkaart: $resource(
        basejson + 'individuelesteekkaart.json',
        {},
        {get: {method: 'GET'}}
      ),
      ledenaantallen: $resource(
        base + 'groep/:groepsnummer/ledenaantallen',
        {groepsnummer: '@groepsnummer'},
        {get: {method: 'GET', cache: true}}
      ),
      Oudleden: $resource(
        basejson + 'oudleden.json',
        {},
        {get: {method: 'GET'}}
      ),
      Leden: $resource(
        base + 'ledenlijst?offset=:offset',
        {offset: '@offset'},
        {'get': {method: 'GET', cache: false}}
      ),
      EtikettenPdf: $resource(
        base + 'ledenlijst/etiket?offset=:offset',
        {offset: '@offset'},
        {
          'post': {
            method: 'POST',
            headers: {accept: 'application/pdf'},
            responseType: 'arraybuffer',
            transformResponse: function (data) {
              var pdf;
              if (data) {
                pdf = new Blob([data], {type: 'application/pdf'});
              }
              return {response: pdf};
            }
          }
        }
      ),
      LedenPdf: $resource(
        base + 'ledenlijst?offset=:offset',
        {offset: '@offset'},
        {
          'get': {
            method: 'GET',
            headers: {accept: 'application/pdf'},
            responseType: 'arraybuffer',
            transformResponse: function (data) {
              var pdf;
              if (data) {
                pdf = new Blob([data], {type: 'application/pdf'});
              }
              return {response: pdf};
            }
          }
        }
      ),
      LedenCsv: $resource(
        base + 'ledenlijst?offset=:offset',
        {offset: '@offset'},
        {
          'get': {
            method: 'GET',
            headers: {accept: 'text/csv'},
            responseType: 'arraybuffer',
            transformResponse: function (data) {
              var csv;
              if (data) {
                csv = new Blob([data], {type: 'text/csv'});
              }
              return {response: csv};
            }
          }
        }
      ),
      LedenSteekkaarten: $resource(
        base + 'ledenlijst/steekkaart',
        {offset: '@offset'},
        {
          'get': {
            method: 'GET',
            headers: {accept: 'application/pdf'},
            responseType: 'arraybuffer',
            transformResponse: function (data) {
              var pdf;
              if (data) {
                pdf = new Blob([data], {type: 'application/pdf'});
              }
              return {response: pdf};
            }
          }
        }
      ),
      LidMail: $resource(
        base + 'lid/:id/mail',
        {bevestiging: '@bevestiging'},
        {
          'post': {
            method: 'POST',
            // content-type moet undefined om formdata() correct te laten werken.
            headers: {'Content-Type': undefined},
            cache: false
          }
        }
      ),
      LedenMail: $resource(
        base + 'ledenlijst/mail',
        {bevestiging: '@bevestiging'},
        {
          'post': {
            method: 'POST',
            // content-type moet undefined om formdata() correct te laten werken.
            headers: {'Content-Type': undefined},
            cache: false
          }
        }
      ),
      Filter: $resource(
        base + 'ledenlijst/filter/:id',
        {id: '@id'},
        {
          'get': {method: 'GET', cache: false},
          'update': {method: 'PATCH', transformRequest: changesOnly, cache: false},
          'delete': {method: 'DELETE', cache: false}
        }
      ),
      createNewFilter: $resource(
        base + 'ledenlijst/filter/',
        {},
        {
          'post': {
            method: 'POST', transformRequest: changesOnly, cache: false
          }
        }
      ),
      Filters: $resource(
        base + 'ledenlijst/filter',
        {},
        {'get': {method: 'GET', cache: false}}
      ),
      GelijkaardigZoeken: $resource(
        base + 'zoeken/gelijkaardig?voornaam=:voornaam&achternaam=:achternaam',
        {
          voornaam: '@voornaam',
          achternaam: '@achternaam'
        },
        {'query': {method: 'GET', isArray: true, cache: false}}
      ),
      Kolommen: $resource(
        base + 'ledenlijst/kolom-type',
        {},
        {'get': {method: 'GET', cache: true}}
      ),
      Gemeente: $resource(
        base + 'gis/gemeente?term=:zoekterm',
        {zoekterm: '@zoekterm'},
        {'get': {method: 'GET', isArray: true, cache: true}}
      ),
      Straat: $resource(
        base + 'gis/straat?term=:zoekterm&postcode=:postcode',
        {zoekterm: '@zoekterm', postcode: '@postcode'},
        {'get': {method: 'GET', isArray: true, cache: true}}
      ),
      Emailsjabloon: $resource(
        base + 'sjabloon/mail/:id',
        {id: '@id', bevestiging: '@bevestiging'},
        {
          'get': {method: 'GET', cache: false},
          'post': {method: 'POST', cache: false},
          'update': {method: 'PATCH', transformRequest: changesOnly, cache: false},
          'delete': {method: 'DELETE', cache: false}
        }
      ),
      Etiketsjabloon: $resource(
        base + 'sjabloon/etiket/:id',
        {id: '@id'},
        {
          'get': {method: 'GET', cache: false},
          'update': {method: 'PATCH', transformRequest: changesOnly, cache: false},
          'delete': {method: 'DELETE', cache: false}
        }
      ),
      EtiketPostsjabloon: $resource(
        base + 'sjabloon/etiket/dummyid',
        {},
        {
          'post': {method: 'POST', cache: false}
        }
      ),
      Websites: $resource(
        base + 'website',
        {},
        {'query': {method: 'GET', isArray: true, cache: true}}
      ),
      Zoeken: $resource(
        base + 'zoeken?query=:zoekterm',
        {zoekterm: '@zoekterm'},
        {
          'get': {method: 'GET', cancellable: true},
          'query': {method: 'GET', isArray: true, cache: false, cancellable: true}
        }
      )
    }
  }

  function changesOnly(data) {
    if (data.changes) {
      var changes = {};
      //changes.id = data.id;  // id verplicht meesturen

      data.changes.forEach(function (val) {
        changes[val] = data[val];
      });

      return JSON.stringify(changes);
    } else {
      return JSON.stringify(data);
    }
  }
})();

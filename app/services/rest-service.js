(function() {
  'use strict';

  angular
    .module('ga.services.rest', ['ngResource'])
    .factory('RestService', RestService);

  RestService.$inject = ['$resource', '$cacheFactory'];

  function RestService($resource, $cacheFactory) {
    var base = '/groepsadmin/rest-ga/';
    var baseGis = '/groepsadmin/rest/gis/';
    var basejson = "/";

    return {
      Lid: $resource(
        base + 'lid/:id?bevestig=:bevestiging',
        {id: '@id', bevestiging: '@bevestiging'},
        {
          'update': {
            method: 'PATCH', transformRequest: changesOnly,cache: false
          }
        }
      ),
      LidAdd: $resource(
        base + 'lid/',
        {},
        {'save': {
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
      LidIndividueleSteekkaart: $resource(
        basejson + 'medischesteekkaart.json',
        {get: {method: 'GET'}}
      ),
      Functie: $resource(
        base + 'functie/:functieId',
        {functieId: '@functieId'},
        {get: {method: 'GET', cache: $cacheFactory('functiesCache')}}
      ),
      Functies: $resource(
        base + 'functie/',
        {get: {method: 'GET', cache: $cacheFactory('allFunctiesCache')}}
      ),
      Groep: $resource(
        base + 'groep/:id',
        {groepsnummer: '@id'},
        {get: {method: 'GET'}}
      ),
      Groepen: $resource(
        base + 'groep/',
        {get: {method: 'GET'}}
      ),
      Orakel: $resource(
        basejson + 'orakel.json',
        {get: {method: 'GET'}}
      ),
      Leden: $resource(
        base + 'ledenlijst?aantal=:aantal&offset=:offset',
        {aantal: '@aantal', offset: '@offset'},
        {'get': {method: 'GET', cache: false}}
      ),
      FilterDetails: $resource(
        base + 'ledenlijst/filter/:id',
        {id: '@id'},
        {'get': {method: 'GET', cache: false}}
      ),
      Filters: $resource(
        base + 'ledenlijst/filter',
        {},
        {'get': {method: 'GET', cache: false}}
      ),
      Gemeente: $resource(
        baseGis + 'gemeente?term=:zoekterm',
        {zoekterm: '@zoekterm'},
        {'get': {method: 'GET', cache: false}}
      ),
      Code: $resource(
        baseGis + 'code?term=:zoekterm&postcode=:postcode',
        {zoekterm: '@zoekterm', postcode: '@postcode'},
        {'query': {method: 'GET', isArray:true, cache: false}}
      ),
      Zoeken: $resource(
        base + 'zoeken?query=:zoekterm&token=:token',
        {zoekterm: '@zoekterm', token: '@token'},
        {'query': {method: 'GET', isArray:true, cache: false}}
      )


    }
  }

  function changesOnly(data) {
    if(data.changes) {
      var changes = new Object();
      //changes.id = data.id;  // id verplicht meesturen

      data.changes.forEach(function (val, key, array) {
        changes[val] = data[val];
      });

      return JSON.stringify(changes);
    } else {
      return JSON.stringify(data);
    }
  }
})();

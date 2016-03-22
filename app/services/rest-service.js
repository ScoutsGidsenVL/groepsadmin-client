(function() {
  'use strict';

  angular
    .module('ga.services.rest', ['ngResource'])
    .factory('RestService', RestService);

  RestService.$inject = ['$resource', '$cacheFactory'];

  function RestService($resource, $cacheFactory) {
    var base = 'http://localhost/groepsadmin/rest-ga/';

    return {
      Lid: $resource(
        base + 'lid/:id?bevestig=:bevestiging',
        {id: '@id',bevestiging: '@bevestiging'},
        {'update': {method: 'PATCH', transformRequest: changesOnly, cache: false}}
      ),
      LidAdd: $resource(
        base + 'lid/',
        {},
        {'save': {method: 'POST'}}
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
        {functieId: '@id'},
        {get: {method: 'GET'}}
      ),
      Groepen: $resource(
        base + 'groep/',
        {get: {method: 'GET'}}
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

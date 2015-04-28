(function() {
  'use strict';

  angular
    .module('ga.services.rest', ['ngResource'])
    .factory('RestService', RestService);

  RestService.$inject = ['$resource'];

  function RestService($resource) {
    return $resource(
      'https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be/groepsadmin/rest-ga/lid/:id',
      {id: '@id'},
      {'update': {method: 'PATCH', transformRequest: changesOnly, cache: false}}
    );
  }
  
  function changesOnly(data) {
    if(data.dirty) {
      var changes = new Object();
      data.dirty.forEach(function (val, key, array) {
        changes[val] = data[val];
      });
      return changes;
    } else {
      return data;
    }
  }
})();
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
      {'update': {method: 'PATCH', transformRequest: changesOnly}}
    );
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
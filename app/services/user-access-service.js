(function() {
  'use strict';

  angular
    .module('ga.services.useraccess', [])
    .factory('UserAccess', UserAccess);

  UserAccess.$inject = ['$q', 'CacheService', 'RestService'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function UserAccess($q, CS, RS) {
    var responseHasAccessToGroepen = {};
    return {
      hasAccessTo : function(term){
        return RS.Root.get().$promise.then(function (response) {
          return _.some(response.links, {'rel' : term});
        });
      },
      hasAccessToGroepen : function(){
          return CS.Groepen().then(function (response) {
            responseHasAccessToGroepen = response;
            return _.some(response.groepen,'contacten');
          });

      }
    };
  };
})();

(function() {
  'use strict';

  angular
    .module('ga.services.useraccess', [])
    .factory('UserAccess', UserAccess);

  UserAccess.$inject = ['RestService'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function UserAccess(RestService) {
    return {
      hasAccessTo : function(term){
        return RestService.Root.get().$promise.then(function (response) {
          return _.some(response.links, {'rel' : term});
        });
      }
    };
  };
})();

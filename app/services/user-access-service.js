(function() {
  'use strict';

  angular
    .module('ga.services.useraccess', [])
    .factory('UserAccess', UserAccess);

  UserAccess.$inject = ['RestService', '$q'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function UserAccess(RestService, $q) {
    var responseHasAccessToGroepen = {};
    return {
      hasAccessTo : function(term){
        return RestService.Root.get().$promise.then(function (response) {
          return _.some(response.links, {'rel' : term});
        });
      },
      hasAccessToGroepen : function(){
        if(_.isEmpty(responseHasAccessToGroepen)){
          return RestService.Groepen.get().$promise.then(function (response) {
            responseHasAccessToGroepen = response;
            return _.some(response.groepen,'contacten');
          });
        }else{
          var deferred = $q.defer();
          deferred.resolve(_.some(responseHasAccessToGroepen.groepen,'contacten'));
          return deferred.promise;
        }

      }
    };
  };
})();

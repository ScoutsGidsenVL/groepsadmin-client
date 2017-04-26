(function() {
  'use strict';

  angular
    .module('ga.services.useraccess', [])
    .factory('UserAccess', UserAccess);

  UserAccess.$inject = ['$log','$q','RestService','UserProfile'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function UserAccess($log,$q,RestService, UserProfile) {
    var Access = {
      OK:200,
      FORBIDDEN:403,
      hasRole : function(role){
          if(UserProfile.hasRole(role)){
            return Access.OK;
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
      },
      hasAccessTo : function(term){
          if(UserProfile.hasPermission(term)){
            return Access.OK;
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
      }
    };

    return Access;
  };
})();

(function() {
  'use strict';

  angular
    .module('ga.services.useraccess', [])
    .factory('UserAccess', UserAccess);

  UserAccess.$inject = ['$log','$q','RestService','UserProfile','userInfo'];

  // Deze service bevat logica om te bepalen of een gebruiker ergens wel/geen toegang tot heeft

  function UserAccess($log,$q,RestService, UserProfile, userInfo) {
    var Access = {
      OK:200,
      FORBIDDEN:403,
      hasRole : function(role){
          if(UserProfile.hasRole(role)){
            console.log('=====********+++++++++++ userInfo', userInfo);
            return Access.OK;
          } else {
            return $q.reject(Access.FORBIDDEN);
          }
      }
    };

    return Access;
  };
})();

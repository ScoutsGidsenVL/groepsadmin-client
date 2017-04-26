(function() {
  'use strict';

  angular
    .module('ga.services.userprofile', [])
    .factory('UserProfile', UserProfile);

  UserProfile.$inject = ['$log','$q','RestService','userInfo'];

  function UserProfile($log,$q,RestService, userInfo) {
    var userProfile = {};

    userProfile.hasRole = function (role) {
      // check if the ROLE is ok
      if(role == "ROLE_ADMIN"){
        return true;
      }

    }

    userProfile.hasPermission = function (permission) {
      // check if the permission occurs in 'userInfo'
      if(_.find(userInfo, {'rel' : permission })){
        return true;
      }else{
        return false;
      }

    }


    return userProfile;
  };
})();

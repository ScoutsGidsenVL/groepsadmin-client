(function() {
  'use strict';

  angular
    .module('ga.services.userprofile', [])
    .factory('UserProfile', UserProfile);

  UserProfile.$inject = ['$log','$q','RestService'];

  // http://stackoverflow.com/questions/20969835/angularjs-login-and-authentication-in-each-route-and-controller

  function UserProfile($log,$q,RestService) {
    var userProfile = {};

    userProfile.hasRole = function (role) {
      // check if the ROLE is ok
      if(role == "ROLE_ADMIN"){
        console.log('your role is : ', role, 'so please come in');
        return true;
      }

    }


    return userProfile;
  };
})();

(function() {
  'use strict';

  angular
    .module('ga.services.email', [])
    .factory('EmailService', EmailService);

  EmailService.$inject = ['$log','$q','RestService'];

  // Deze service wordt gebruikt door de email-controller

  function EmailService($log,$q,RestService) {
    var emailService = {};

    emailService.getTemplates = function(){
      var deferred = $q.defer();
      RestService.Emailsjabloon.get().$promise.then(function(res){
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    return emailService;
  };
})();

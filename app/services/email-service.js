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

    emailService.patchTemplate = function(){
      var deferred = $q.defer();
      RestService.Emailsjabloon.post().$promise.then(function(res){
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    emailService.saveSjabloon = function(sjabloonId, sObj){
      console.log('ES.saveSjabloon sjabloonId:',sjabloonId, ' -- sjabloonObject:  ', sObj);
      var deferred = $q.defer();
      if(sjabloonId){
        RestService.Emailsjabloon.update({id: sjabloonId, bevestig:true}, sObj).$promise.then(
          function(res){
            deferred.resolve(res);
          }
        );
      }
      return deferred.promise;
    }

    emailService.sendMail = function(obj){
      console.log('ES.sendMail(), ', obj);
      var deferred = $q.defer();
      RestService.LedenMail.post({bevestig:true}, obj).$promise.then(
        function(res){
          deferred.resolve(res);
        }
      );
      return deferred.promise;

    }



    return emailService;
  };
})();

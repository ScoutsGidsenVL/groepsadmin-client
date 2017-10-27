(function() {
  'use strict';

  angular
    .module('ga.services.etiketten', [])
    .factory('EtikettenService', EtikettenService);

  EtikettenService.$inject = ['$log','$q','RestService'];

  // Deze service wordt gebruikt door de email-controller

  function EtikettenService($log,$q,RestService) {
    var etikettenService = {};

    etikettenService.getSjablonen = function(){
      var deferred = $q.defer();
      RestService.Etiketsjabloon.get().$promise.then(function(res){
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    etikettenService.patchTemplate = function(){
      var deferred = $q.defer();
      RestService.Etiketsjabloon.post().$promise.then(function(res){
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    etikettenService.saveSjabloon = function(sjabloonId, sObj){
      console.log('ES.saveSjabloon sjabloonId:',sjabloonId, ' -- sjabloonObject:  ', sObj);
      var deferred = $q.defer();
      if(sjabloonId){
        RestService.Etiketsjabloon.update({id: sjabloonId, bevestig:true}, sObj).$promise.then(
          function(res){
            deferred.resolve(res);
          }
        );
      }
      return deferred.promise;
    }

    etikettenService.createLabels = function(data){

      var deferred = $q.defer();
      RestService.EtikettenPdf.post(data).$promise.then(function(res){
        var file = new Blob([res.response], {type: 'application/pdf'});
        var obj = {};
        obj.fileUrl = URL.createObjectURL(file);
        obj.title = 'etiketten';
        deferred.resolve(obj);
      });
      return deferred.promise;

    }

    /*

    etikettenService.sendMail = function(obj, lidId){
      console.log('ES.sendMail(), ', obj);
      var deferred = $q.defer();
      if(lidId == undefined){
        RestService.LedenMail.post({bevestig:true}, obj).$promise.then(
          function(res){
            deferred.resolve(res);
          }
        );
      }else{
        RestService.LidMail.post({id:lidId, bevestig:true}, obj).$promise.then(
          function(res){
            deferred.resolve(res);
          }
        );
      }

      return deferred.promise;
    }

    etikettenService.getMailReportMessage = function(obj){
      var addressesOk = new Array(); // array
      var failMessages = new Array(); // objects

      var successCounter = 0;
      if(obj.gelukt){
        addressesOk = obj.gelukt; // array
        successCounter += addressesOk.length;
      }

      var messagesNok = {};
      var failMessages = obj.mislukt; // objects
      var failedCounter = 0;
      _.each(failMessages, function(val,key){
        failedCounter += val.length;
        messagesNok[key] = [];
        _.each(val,function(v){
          messagesNok[key].push(v);
        });
      });

      var totalSent = addressesOk.length + failedCounter;
      var messageOk = "Jouw e-mail werd succesvol verzonden naar " + successCounter + " van de " + totalSent + " ontvangers";
      var feedbackObj = {};

      feedbackObj.messageOk = messageOk;
      feedbackObj.messagesNok = messagesNok;

      return feedbackObj;

    }

    */

    return etikettenService;
  };
})();

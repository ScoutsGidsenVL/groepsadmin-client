(function() {
  'use strict';
  
  angular
    .module('ga.services.alert', [])
    .factory('AlertService', AlertService);

  AlertService.$inject = ['$rootScope', '$timeout'];

  function AlertService($rootScope, $timeout) {
    var alertService = {};
    $rootScope.alerts = [];

    return alertService = {
      add: function(type, msg, timeout) {
        var alert = {
          type: type,
          msg: msg,
          close: function() {
            return alertService.closeAlert(this);
          }
        };
        $rootScope.alerts.push(alert);

        if (timeout) { 
          $timeout(function(){ 
            alertService.closeAlert(alert); 
          }, timeout); 
        }
      },

      closeAlert: function(alert) {
        return this.closeAlertByIndex($rootScope.alerts.indexOf(alert));
      },

      closeAlertByIndex: function(index) {
        return index>-1 && $rootScope.alerts.splice(index, 1);
      },

      clear: function(){
        $rootScope.alerts = [];
      }
    };
  };
})();
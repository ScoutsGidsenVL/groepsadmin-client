(function() {
  'use strict';

  angular
    .module('ga.services.alert', [])
    .factory('AlertService', AlertService);

  AlertService.$inject = ['$rootScope', '$timeout'];

  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    return {
      add: function(type, msg, timeout, suggesties) {
        var alert = {
          'type': type,
          'msg': msg,
          'suggesties': suggesties,
          'hash': type + msg + _.map(suggesties, _.property('id')).join(),
          'close': function() {
            var index = $rootScope.alerts.indexOf(alert);
            if (0 <= index) {
              $rootScope.alerts.splice(index, 1);
            }
          }
        };

        if (_.findIndex($rootScope.alerts, {'hash': alert.hash}) < 0) {
          $rootScope.alerts.push(alert);
        }

        if (timeout) {
          $timeout(function(){
            alert.close();
          }, timeout);
        }
      }
    };
  };
})();

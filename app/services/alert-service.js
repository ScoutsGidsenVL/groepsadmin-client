(function() {
  'use strict';

  angular
    .module('ga.services.alert', [])
    .factory('AlertService', AlertService);

  AlertService.$inject = ['$rootScope', '$timeout'];

  function AlertService($rootScope, $timeout) {
    $rootScope.alerts = [];

    return {
      add: function(type, error, suggesties) {

        var msg;
        if (error.data && error.data.fouten && error.data.fouten.length > 0) {
          msg = '';
          _.each(error.data.fouten, function(val, key) {
            if (val.veld) {
              msg += val.veld + ': ';
            }
            msg += val.beschrijving + ', ';
          })
          msg = msg.slice(0, -2);
        } else if (error.data && error.data.beschrijving) {
          msg = error.data.beschrijving;
        } else if (error.data && error.data.vraag) {
          throw error.data.boodschap + ' - ' + error.data.vraag;
        } else if (error.statusText) {
          msg = "Error " + error.status + ' - ' + error.statusText;
        } else {
          msg = error;
        }

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

        console.log(alert);

        if (_.findIndex($rootScope.alerts, {'hash': alert.hash}) < 0) {
          $rootScope.alerts.push(alert);
        }

        if (type == 'succes') {
          $timeout(alert.close, 5000);
        }
      },

      onvoorzieneFout: function() {
        var msg = 'Er is een onvoorziene fout opgetreden. Mail deze boodschap en wat je aan het doen was naar groepsadmin@scoutsengidsenvlaanderen.be .';

        this.add('error', msg);
        console.assert(false, msg);
        throw msg;
      }
    };
  };
})();

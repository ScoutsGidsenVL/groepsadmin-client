(function() {
  'use strict';

  angular
    .module('ga.services.http', ['ga.services.alert'])
    .factory('httpInterceptor', httpInterceptor)

  httpInterceptor.$inject = ['$q', '$window', '$injector', 'AlertService', 'DialogService', 'keycloak'];

  function httpInterceptor($q, $window, $injector, AlertService, DialogService, keycloak) {
    return {
      'request': function(config) {

        // add keycloak header if request goes to groepsadmin API
        if (config.url.lastIndexOf('/groepsadmin/rest-ga/') >= 0) {
            var deferred = $q.defer();
            keycloak.updateToken().success(function() {
              config.headers = config.headers || {};
              config.headers.Authorization = 'Bearer ' + keycloak.token;
              deferred.resolve(config);
            }).error(function(err) {
              deferred.reject('Failed to refresh token', err);
            });
            return deferred.promise;
        }

        return config;
      },
      'response': function(response) {
        return response;
      },
      'responseError': function(rejection) {
        if (!navigator.onLine || rejection.status == 0) {
          // Note: Browsers implement the NavigatorOnLine.onLine property differently.
          // See the docs: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
          AlertService.add('danger', "Er kon geen verbinding gemaakt worden met de Groepsadministratie.");
        }
        else if (rejection.status == 403) {
          if (rejection.data && rejection.data.beschrijving) {
            AlertService.add('danger', rejection.data.beschrijving);
          } else {
            AlertService.add('danger', "Je bent niet ingelogd");
          }
        }
        else if (rejection.data) {
          if (rejection.data.vraag) {
            DialogService.bevestig(rejection.data, function (result) {
              if (result) {
                var config = Object.assign({}, rejection.config); // shallow copy
                config.url = rejection.data.link; // nu met &bevestig=true

                var $http = $injector.get('$http');
                $http(config);
              }
            });
          } else if (rejection.data.fouten && rejection.data.fouten.length > 0) {

            _.remove(rejection.data.fouten, function(o) {
              // false -> geen alert
              return (
                // check if there are errors on contacten
                (o.veld && 0 <= o.veld.indexOf("contacten.contacten"))
                // check for size warnings
                || (o.beschijving && 0 <= o.beschijving.indexOf('size must be between'))
              );
            });

            if (rejection.data.fouten.lenght > 0) {
              AlertService.add('danger', rejection);
            }
          } else if (_.includes(rejection.data, 'Je hebt de Groepsadministratie kapotgemaakt')) {
              $window.location.href = '/';
          } else {
              AlertService.add('danger', "<b>" + JSON.stringify(rejection.data) + "</b><br/>");
          }
        } else if (rejection.error && rejection.error_description) {
            AlertService.add('danger', rejection.error_description);
        } else if (rejection == "Failed to refresh token") {
          // als de token expired is, refreshen we de huidige pagina
          $window.location.reload();
        } else {
          AlertService.add('danger', "Er ging iets fout tijdens de verwerking van de aanvraag.");
        }
        return $q.reject(rejection);
      }
    };
  }
})();

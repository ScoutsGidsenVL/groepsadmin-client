(function() {
  'use strict';

  angular
    .module('ga.services.http', ['ga.services.alert'])
    .factory('httpInterceptor', httpInterceptor)

  httpInterceptor.$inject = ['$q', 'AlertService', 'keycloak'];

  function httpInterceptor($q, AlertService, keycloak) {
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
          AlertService.add('danger', "Je bent niet ingelogd");
        }
        else if (rejection.data) {
          console.log(rejection);
          // Tijdelijke server errors (Todo)
          AlertService.add('danger', "<b>" + JSON.stringify(rejection.data) + "</b><br/>" );
        }
        else{
          console.log(rejection);
          AlertService.add('danger', "Er ging iets fout tijdens de verwerking van de aanvraag.");
        }
        return $q.reject(rejection);
      }
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('ga.groepcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('GroepController', GroepController);

  GroepController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak'];

  function GroepController($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {
    // profiel op halen
    RestService.Lid.get({id: 'profiel'}).$promise.then(
      function (result) {
        $scope.lid = result;
        loadGroups();
      },
      function (error) {
        AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
      }
    );

    $scope.activegroup = null;


    var loadGroups = function () {
        $scope.groepenlijst = [];
        angular.forEach($scope.lid.functies, function (value, key) {
          var gr = RestService.Groep.get({id: value.groep}).$promise.then(
            function (result) {
              result.vga = {
                "naam": "Nathan Wuyts",
                "email": "vga@scoutslatem.be"
              };
              result.groepsleiding = [
                {
                  "naam": "Joke Scheerder",
                  "email": "joke@scheerder.be"
                             },
                {
                  "naam": "Bram Scheerder",
                  "email": "bram@scheerder.be"
                             }
                           ];
              result.adres = [
                {
                  "id": "d5f75b320b812440010b8125513002ac",
                  "land": "BE",
                  "postcode": "9830",
                  "gemeente": "Sint-Martens-Latem",
                  "straat": "Albijn Van Den Abeelelaan",
                  "nummer": "14",
                  "postadres": false,
                  "status": "normaal",
                  "positie": {
                    "latitude": 51.0006802,
                    "longitude": 3.6286672
                  },
                    "giscode": "0063"
                  }
              ]
              if ($scope.activegroup == null) {
                $scope.activegroup = result;
              }
              $scope.groepenlijst.push(result);
            });


        });
      }
      // On Change dropdown
    $scope.ChangeGroep = function () {

    }




  }
})();

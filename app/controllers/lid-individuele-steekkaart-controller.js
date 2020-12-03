(function () {
  'use strict';

  angular
    .module('ga.lidindividuelesteekkaartcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('LidIndividueleSteekkaartController', LidIndividueleSteekkaartController);

  LidIndividueleSteekkaartController.$inject = ['$scope', '$routeParams', '$location', 'RestService', 'AlertService', '$rootScope', 'LedenLijstService', 'LidService'];

  function LidIndividueleSteekkaartController($scope, $routeParams, $location, RestService, AlertService, $rootScope, LLS, LS) {
    /*
     * Init
     * --------------------------------------
     */
    // lid ophalen
    RestService.Lid.get({id: $routeParams.id}).$promise.then(
      function (result) {
        $scope.lid = result;
      },
      function (error) {
        if (error.data.beschrijving == "Geen leesrechten op dit lid") {
          //redirect to lid overzicht.
          $location.path('/');
          AlertService.add('danger', "Je hebt geen leesrechten op dit lid.");
        } else {
          AlertService.add('danger', error);
        }
      }
    );

    $scope.isEigenProfiel = false;
    RestService.Lid.get({id: 'profiel'}).$promise.then(
      function (result) {
        $scope.ingelogdLid = result;
        if ($scope.ingelogdLid.id === $routeParams.id) {
          $scope.isEigenProfiel = true;
        }
      },
      function (error) {
        AlertService.add('danger', error);
      }
    );

    if (!$scope.isEigenProfiel) {
      $scope.prevLid = LLS.getNextPrevLid($routeParams.id, $rootScope.leden)[0];
      $scope.nextLid = LLS.getNextPrevLid($routeParams.id, $rootScope.leden)[1];
      // tonen van de knop "individuele steekkaart enkel indien de gebruiker toegang heeft
    }

    // steekkaart ophalen.
    RestService.LidIndividueleSteekkaart.get({id: $routeParams.id}).$promise.then(
      function (result) {
        $scope.individueleSteekkaartWaarden = result.gegevens.waarden;

        //compare functie
        function compare(a, b) {
          if (a.sort < b.sort)
            return -1;
          if (a.sort > b.sort)
            return 1;
          return 0;
        }

        var individueleSteekkaartLayout = result.gegevens.schema.sort(compare);

        // bevat de groepering van de layout van input velden.
        // de teruggave van de API beschrijft enkel waar een groepstart en niet waar een groep stopt.
        $scope.individueleSteekkaartLayoutGroups = [];
        var tempGroup = [];
        angular.forEach(individueleSteekkaartLayout, function (value, index) {
          if (value.type == "groep") {
            if (tempGroup.length == 0) {
              tempGroup.push(value);
            } else {
              $scope.individueleSteekkaartLayoutGroups.push(tempGroup);
              tempGroup = [];
              tempGroup.push(value);
            }
          } else {
            tempGroup.push(value);
            if (index == individueleSteekkaartLayout.length - 1) {
              $scope.individueleSteekkaartLayoutGroups.push(tempGroup);
            }
          }
        });
        $scope.watchable = true;
      },
      function (error) {
        if (error.data.beschrijving == "Geen leesrechten op dit lid") {
          //redirect to lid overzicht.
          $location.path('/');
          AlertService.add('danger', "Je hebt geen leesrechten op dit lid.");
        } else {
          AlertService.add('danger', error);
        }
      }
    );

    $scope.opslaan = function () {

      // velden met lege strings omzetten naar null waarden, want backend accepteert geen lege strings (lijsten)
      var waarden = {};
      angular.copy($scope.individueleSteekkaartWaarden, waarden);
      _.each(waarden, function (val, key) {
        if (val === "") {
          waarden[key] = null;
        }
      });

      var request = {
        gegevens: {
          waarden: waarden
        }
      };

      $scope.saving = true;
      RestService.LidIndividueleSteekkaart.patch({id: $routeParams.id}, request).$promise.then(
        function () {
          $scope.saving = false;
          AlertService.add('success ', "Aanpassingen opgeslagen");
          $scope.individueleSteekaart.$setPristine();
        },
        function (error) {
          $scope.saving = false;
          if (error.data && error.data.fouten) {

            _.each(error.data.fouten, function (val) {
              var index = val.veld;
              $scope.individueleSteekaart[index].$setValidity('required', false);
              $scope.setFocusFirstInvalid();


            });
          }

        }
      );
    };

    $scope.gotoLid = function (direction) {
      if (direction == "next") {
        $location.path("/lid/individuelesteekkaart/" + $scope.nextLid.id);
      }
      if (direction == "prev") {
        $location.path("/lid/individuelesteekkaart/" + $scope.prevLid.id);
      }
    };

    /*
    * Pagina event listeners
    * ---------------------------------------
    */
    /*
    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if ($scope.individueleSteekaart.$dirty) {
        event.preventDefault();
        DialogService.paginaVerlaten($scope.locationChange, newUrl);
      }
    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function(result, url){
      if (result) {
        $window.onbeforeunload = null;
        $window.location.href = url;
      }
    }

    // refresh of navigatie naar een andere pagina.
    $window.onbeforeunload = function(e) {
      if ($scope.individueleSteekaart.$dirty) {
        var waarschuwing = "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?";
        e.returnValue = waarschuwing; // werkt niet in alle browsers
        return e.returnValue; // werkt niet in andere browsers
      }
    };*/
  }
})();

(function () {
  'use strict';

  angular
    .module('ga.communicatiecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('CommunicatieController', CommunicatieController);

  CommunicatieController.$inject = ['$location', '$rootScope', '$routeParams', '$scope', '$timeout', '$window', 'AlertService',
    'DialogService', 'LidService', 'RestService', 'UserAccess', 'FormValidationService'];

  function CommunicatieController($location, $rootScope, $routeParams, $scope, $timeout, $window, AlertService,
                         DialogService, LS, RestService, UserAccess, FVS) {

    $scope.lidPropertiesWatchable = false;
    angular.extend($scope, LS.publicProperties, LS.publicMethods);

    var init = function () {
      $scope.validationErrors = [];
      $scope.isEigenProfiel = true;

      RestService.CommunicatieProducten.get().$promise.then(
        function (result) {
          $scope.communicatieProducten = result.communicatieProducten;
        });

      RestService.Lid.get({id: 'profiel'}).$promise.then(
        function (result) {
          $scope.lid = result;
          loadSuccess($scope.lid);
          initModel();
        },
      );
    };

    /*
     * Algemeen
     * ---------------------------------------
     */

    // initialisatie

    $scope.$watch('lidPropertiesWatchable', function (watchable) {
      if (watchable && !communicatieForm.$valid) {
        $scope.openAndHighlightCollapsedInvalidBlocks();
      }
    });

    function loadSuccess() {
      var sectie;

      // init watch, naar welke secties/objecten/delen van het lid object moet er gekeken worden om aanpassingen bij te houden?
      angular.forEach(['lid.persoonsgegevens'], function (value) {
        $scope.$watch(value, function (newVal, oldVal, scope) {
            if ($scope.lidPropertiesWatchable) {
              if (newVal == oldVal) return;
              // sectie is bvb. vgagegevens of functies of persoonsgegevens
              sectie = value.split(".").pop();
              // de gewijzigde sectie toevoegen aan de changes, indien deze sectie nog niet werd toegevoegd
              if ($scope.lid.changes) {
                if ($scope.lid.changes.indexOf(sectie) < 0) {
                  $scope.lid.changes.push(sectie);
                }
              }

              if ($scope.communicatieForm.$dirty) {
                $window.onbeforeunload = unload;
              }
            }
          },
          true);
      });

      // $scope.patchObj bevat hierna alle secties die kunnen worden gepatched
      $scope.patchObj = $.grep($scope.lid.links, function (e) {
        return e.method == "PATCH";
      })[0];

      // kan de gebruiker functies stoppen van het lid?
      if ($scope.patchObj) {
        var someSect = _.some($scope.patchObj.secties, function (value) {
          return value.indexOf('functies.') != -1;
        });

        // kan de gebruiker functie stoppen van het lid?
        $scope.canSave = _.has($scope, 'patchObj.secties');

        if (($scope.canSave && someSect) || $scope.isEigenProfiel) {
          $scope.kanSchrappen = true;
        }
      }
    }

    $scope.verwerkCommunicatie = function(communicatieproduct) {
      console.log($scope.lid.communicatieProducten)
    }

    function initModel() {
      // Changes object bijhouden: enkel de gewijzigde properties meesturen met PATCH
      $scope.lid.changes = [];
      $scope.lid.communicatieProducten = [];
      $scope.selectedCommunicatieProducten = [];
      var counter = 0;
      _.each($scope.communicatieProducten, function (product) {

      })
    }

    // nieuw lid initialiseren na update.
    function initAangepastLid() {
      //changes array aanmaken
      $timeout(function () {
        initModel();
      }, 20);
    }

    // alle aanpassingen opslaan
    $scope.opslaan = function () {
      $scope.saving = true;
      $scope.lid.$update(
        function () {
          $scope.saving = false;
          AlertService.add('success', "Aanpassingen opgeslagen");
          initAangepastLid();
          $window.onbeforeunload = null;
          $scope.validationErrors = [];
          $scope.communicatieForm.$setPristine();
        },
        function (error) {
          $scope.saving = false;
          console.log('error bij update van lid', error);

          if (error.data.fouten && error.data.fouten.length >= 1) {
            _.each(error.data.fouten, function (fout) {

              // de backend geeft om een nog onduidelijke reden soms 'veld is verplicht' terug op contactnamen terwijl ze niet verplicht zijn
              // tijdelijk vangen we dit op met een isRequired property
              // TODO: onderstaande lijn verwijderen en in de template 'ng-required' niet meer checken op isRequired zodra backend deze fout niet meer geeft

              if (fout.veld.indexOf('contacten') > -1) {
                var formElemNameCont = FVS.getFormElemByErrData('contacten', fout);
                $scope.communicatieForm[formElemNameCont].isRequired = true;
              }

              if (fout.veld.indexOf('adressen') > -1) {
                var formElemNameAdr = FVS.getFormElemByErrData('adressen', fout);
                $scope.communicatieForm[formElemNameAdr].isRequired = true;
              }
            });
          }

          if (error.data.titel == "Validatie faalde voor Lid") {
            $scope.validationErrors = error.data.details;
          }
        }
      );
    };

    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl) {
      if ($scope.communicatieForm.$dirty) {
        event.preventDefault();
        DialogService.paginaVerlaten($scope.locationChange, newUrl);
      }
    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function (result, url) {
      if (result) {
        $scope.communicatieForm.$setPristine();
        $window.onbeforeunload = null;
        $scope.lid.changes = [];
        $window.location.href = url;
      }
    };

    $scope.submitForm = function () {
      $scope.opslaan();
    };


    // refresh of navigatie naar een andere pagina.
    var unload = function (e) {
      e.returnValue = "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?";
      return e.returnValue;
    };

    init();
  }
})();

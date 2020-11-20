(function() {
  'use strict';

  angular
    .module('ga.lidwordencontroller', [])
    .controller('LidwordenController', LidwordenController);

  LidwordenController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService', '$location', '$window'];

  function LidwordenController ($scope, $routeParams, RestService, AlertService, $location, $window) {
    $scope.aanvraagverstuurd = false;
    $scope.groepGeladen = false;
    $scope.publiekInschrijven = true;
    $scope.groepNr = $routeParams.groep;
    $scope.voornaam = $window.localStorage.getItem('voornaam');
    init();


    $scope.popupCal = function() {
      $scope.popupCal.opened = true;
    };

    RestService.Groep.get({id:$scope.groepNr})
      .$promise
      .then(
        function(result) {
          if(result['publiek-inschrijven']) {
            $scope.groep = result;
            $scope.lid.groepsnummer = result.id;
          }
          else {
            $scope.publiekInschrijven = false;
          }
        })
      .finally(
        function() {
          $scope.groepGeladen = true;
        });

    function init(groepsnummer) {
      $scope.lid = {
        persoonsgegevens: {
          geslacht: 'man'
        },
        adres: {
          land: 'BE'
        }
      };

      if(groepsnummer) {
        $scope.lid.groepsnummer = groepsnummer;
      }

      // item verwijderen uit localstorage om vervuiling tegen te gaan
      if ($scope.voornaam){
        $window.localStorage.removeItem('voornaam')
      }
    }

    $scope.clearSpacesFromNumber = function() {
      $scope.lid.adres.nummer = $scope.lid.adres.nummer.replace(/\s+/g, '');
    }

    $scope.submitForm = function(form) {
      if (form.$valid) {
        this.clearSpacesFromNumber()
        $scope.formsubmitting = true;
        if($scope.lid.persoonsgegevens.rekeningnummer === '') {
          delete $scope.lid.persoonsgegevens.rekeningnummer;
        }
        RestService.LidAanvraag.save($scope.lid).$promise
          .then(
            function () {
              $window.localStorage.setItem('voornaam',$scope.lid.voornaam);
              $scope.lidwordenForm.$setPristine();
              $scope.lidwordenForm.$setUntouched();
              $scope.formsubmitting = false;
              $location.path("/lidworden/verstuurd");
              init($scope.lid.groepsnummer);
            })
          .catch(function(error) {
            $scope.saving = false;
            if (error.status == 403) {
              AlertService.add('warning', error);
            }
            else if (error.data.fouten && error.data.fouten.length >=1) {
              _.each(error.data.fouten, function(fout) {
                console.log("FOUT", fout);
                $scope[fout.veld + 'Error'] = true;
                if (fout.beschrijving == 'Onbestaand adres'){
                  AlertService.add('warning', 'Adres niet gekend! Gelieve contact op te nemen met de verantwoordelijke van de groep.');
                }
              });
            }
            else {
              AlertService.add('danger', error);
            }
          })
          .finally(
            function() {
              $scope.formsubmitting = false;
            }
          );
      }
    };
  }
})();

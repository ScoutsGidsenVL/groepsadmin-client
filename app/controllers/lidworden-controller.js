(function() {
  'use strict';

  angular
    .module('ga.lidwordencontroller', [])
    .controller('LidwordenController', LidwordenController);

  LidwordenController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService'];

  function LidwordenController ($scope, $routeParams, RestService, AlertService) {
    $scope.aanvraagverstuurd = false;
    $scope.groepGeladen = false;
    $scope.publiekInschrijven = true;
    $scope.groepNr = $routeParams.groep;

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
    }

    $scope.submitForm = function(form) {
      if (form.$valid) {
        $scope.formsubmitting = true;
        if($scope.lid.persoonsgegevens.rekeningnummer === '') {
          delete $scope.lid.persoonsgegevens.rekeningnummer;
        }
        RestService.LidAanvraag.save($scope.lid).$promise
          .then(
            function () {
              $scope.lidwordenForm.$setPristine();
              $scope.lidwordenForm.$setUntouched();
              $scope.formsubmitting = false;
              AlertService.add('success ', "Aanvraag is verstuurd.");
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

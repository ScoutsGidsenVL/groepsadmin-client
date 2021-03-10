(function() {
  'use strict';

  angular
    .module('ga.lidwordencontroller', [])
    .controller('LidwordenController', LidwordenController);

  LidwordenController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService', '$location', '$window', 'LidService'];

  function LidwordenController ($scope, $routeParams, RestService, AlertService, $location, $window, LS) {
    $scope.aanvraagverstuurd = false;
    $scope.groepGeladen = false;
    $scope.publiekInschrijven = true;
    $scope.groepNr = $routeParams.groep;
    $scope.voornaam = $window.localStorage.getItem('voornaam');
    init();
    angular.extend($scope, LS.publicProperties, LS.publicMethods);


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

    RestService.Groepseigengegevens.get({ groepsnummer:$scope.groepNr })
      .$promise
      .then(function (result){
          $scope.lid.groepsEigenGegevens = result;
      })

    function init(groepsnummer) {
      $scope.lid = {
        persoonsgegevens: {
          geslacht: 'man'
        },
        adres: {
          land: 'BE'
        },
        contacten: [],
        gegevens: {}
      };

      if(groepsnummer) {
        $scope.lid.groepsnummer = groepsnummer;
      }

      // item verwijderen uit localstorage om vervuiling tegen te gaan
      if ($scope.voornaam){
        $window.localStorage.removeItem('voornaam')
      }
    }

    $scope.contactToevoegen = function (formIsValid) {
      var scope = this;
        var newcontact = {
          'rol': 'moeder',
          'adres': {
            'land': 'BE'
          },
          'id': '' + Date.now()
        };
        newcontact.showme = true
        $scope.lid.contacten.push(newcontact);
    }


    $scope.neemAdresOver = function(index){
      if (!$scope.checkAdres(index)){
        $scope.lid.contacten[index].adres.land = $scope.lid.adres.land;
        $scope.lid.contacten[index].adres.straat = $scope.lid.adres.straat;
        $scope.lid.contacten[index].adres.nummer = $scope.lid.adres.nummer;
        $scope.lid.contacten[index].adres.bus = $scope.lid.adres.bus;
        $scope.lid.contacten[index].adres.postcode = $scope.lid.adres.postcode;
        $scope.lid.contacten[index].adres.gemeente = $scope.lid.adres.gemeente;
      } else{
        $scope.lid.contacten[index].adres.land = 'BE';
        $scope.lid.contacten[index].adres.straat = '';
        $scope.lid.contacten[index].adres.nummer = '';
        $scope.lid.contacten[index].adres.bus = '';
        $scope.lid.contacten[index].adres.postcode = '';
        $scope.lid.contacten[index].adres.gemeente = '';
      }

    }

    $scope.checkAdres = function (index) {
      return $scope.lid.contacten[index].adres.gemeente && $scope.lid.contacten[index].adres.postcode &&
      $scope.lid.contacten[index].adres.straat && $scope.lid.contacten[index].adres.postcode &&
      $scope.lid.contacten[index].adres.land === $scope.lid.adres.land &&
      $scope.lid.contacten[index].adres.straat === $scope.lid.adres.straat &&
      $scope.lid.contacten[index].adres.nummer === $scope.lid.adres.nummer &&
      $scope.lid.contacten[index].adres.bus === $scope.lid.adres.bus &&
      $scope.lid.contacten[index].adres.postcode === $scope.lid.adres.postcode &&
      $scope.lid.contacten[index].adres.gemeente === $scope.lid.adres.gemeente;
    }

    $scope.clearSpacesFromNumber = function() {
      $scope.lid.adres.nummer = $scope.lid.adres.nummer.replace(/\s+/g, '');
    }

    $scope.submitForm = function(form) {
      console.log($scope.lid)
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

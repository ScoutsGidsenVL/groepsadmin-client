(function() {
  'use strict';

  angular
    .module('ga.lidwordencontroller', [])
    .controller('LidwordenController', LidwordenController);

  LidwordenController.$inject = ['$scope', '$routeParams', 'RestService', 'LidService', 'FormValidationService', 'AlertService'];

  function LidwordenController ($scope, $routeParams, RestService, LS, FVS, AlertService) {
    var gemeenteScope;

    $scope.aanvraagverstuurd = false;
    $scope.groepGeladen = false;
    $scope.groepNr = $routeParams.groep;
    $scope.formats = ['dd/MM/yyyy'];
    $scope.format = $scope.formats[0];

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1,
      datepickerMode: 'year'
    };
    $scope.popupCal = {
      opened: false
    };

    init();


    $scope.popupCal = function() {
      $scope.popupCal.opened = true;
    };

    RestService.Groep.get({id:$scope.groepNr})
      .$promise
      .then(
        function(result) {
          $scope.groep = result;
          $scope.lid.groepsnummer = result.id;
        })
      .finally(
        function() {
          $scope.groepGeladen = true;
        });

    function init(groepsnummer) {
      if(gemeenteScope) {
        gemeenteScope.gemeenteWrap = '';
      }
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

    $scope.zoekGemeente = function(zoekterm){
      gemeenteScope = this;
      return LS.zoekGemeente(zoekterm);
    };

    $scope.bevestigGemeente = function(item, adres) {
      adres.postcode = item.substring(0,4);
      adres.gemeente = item.substring(5);
    };

    // zoek straten en giscodes
    $scope.zoekStraat = function(zoekterm, adres){
      var resultaatStraten = [];
      return RestService.Code.query({zoekterm:zoekterm, postcode: adres.postcode}).$promise.then(
        function(result){
          angular.forEach(result, function(val){
            resultaatStraten.push(val);
          });
          return resultaatStraten;
        });
    };

    // straat en giscode opslaan in het adres
    $scope.bevestigStraat = function(item, adres) {
      adres.straat = item.straat;
      adres.giscode = item.code;

    };

    $scope.checkField = function(formfield) {
      formfield.$setValidity(formfield.$name,FVS.checkField(formfield));
    };

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

(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$scope', 'RestService'];

  function LedenlijstController($scope, RestService) {
    $scope.opgeslagenFilters = [
      {
        naam: "Export",
        label: "Persoonlijke filters"
      },
      {
        naam: "Wanbetalers",
        label: "Persoonlijke filters"
      },
      {
        naam: "Leden met geblokkeerd adres",
        label: "Standaard filters"
      }
      ];
    $scope.currentFilter = $scope.opgeslagenFilters[1];
    $scope.isFilterCollapsed = true;

    //waarden van de huidige filter aanpassen

/*
    RestService.Leden.get().$promise.then(
      function (response) {
        console.log(response);
        $scope.leden = response.leden;

        $scope.totaalAantalLeden = response.totaal;
        $scope.offset = response.offset;
        $scope.aantalPerPagina = response.aantal;

      },
      function (error) {
      }
    );*/

    $scope.busy = false;
    $scope.end = false
    $scope.aantalPerPagina = 25
    $scope.leden = [];
    $scope.nextPage = function(){
      if ($scope.busy) return;
      $scope.busy = true;
      // voorkom dat er request gedaanworden wanneer alle resultaaten geladen zijn
      if($scope.leden.length !== $scope.totaalAantalLeden-1){
        console.log("nieuwe leden ophalen");
        RestService.Leden.get({aantal: $scope.aantalPerPagina, offset: ($scope.leden.length == 0) ? 0 : ($scope.leden.length+1) }).$promise.then(
          function (response) {

            // voeg de leden toe aan de leden Array;
            $scope.leden.push.apply($scope.leden,response.leden);
            console.log($scope.leden.length);
            $scope.totaalAantalLeden = response.totaal;
            $scope.offset = response.offset;
            $scope.busy = false;
          },
          function (error) {
          }
        );
      }
      else{
        $scope.busy = false;
        $scope.end = true;
      }

    }
  }
})();

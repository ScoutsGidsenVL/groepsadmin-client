(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$scope', 'RestService', '$window'];

  function LedenlijstController($scope, RestService, $window) {
    // check authentication
    console.log(keycloak.authenticated );
    if(!keycloak.authenticated){
      keycloak.login();
    }

    // opgeslagen filters ophalen

    RestService.Filters.get().$promise.then(
      function (response) {
        $scope.opgeslagenFilters = response;
      },
      function (error) {
      }
    );
    // huidige filter ophalen
    RestService.FilterDetails.get({id: 'huidige'}).$promise.then(
      function (response) {
        $scope.currentFilter = response;
      },
      function (error) {
      }
    );

    $scope.isFilterCollapsed = true;

    // controle moet er meer gelanden worden
    $scope.meerLaden = function(last){
      if(last && $(window).height() > $("#leden").height()){
        $scope.nextPage();
      }
    }



    $scope.busy = false;
    $scope.end = false
    $scope.aantalPerPagina = 10
    $scope.leden = [];
    $scope.nextPage = function(){
      if ($scope.busy) return;
      $scope.busy = true;
      // voorkom dat er request gedaanworden wanneer alle resultaaten geladen zijn
      if($scope.leden.length !== $scope.totaalAantalLeden){
        console.log("nieuwe leden ophalen");
        RestService.Leden.get({aantal: $scope.aantalPerPagina, offset: ($scope.leden.length == 0) ? 0 : ($scope.leden.length) }).$promise.then(
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
    // controle on resize
    angular.element($window).bind('resize', function () {
      if($(window).height() > $("#leden").height() && !$scope.busy){
        $scope.nextPage();
      }
    });
  }
})();

(function() {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$scope', 'RestService'];

  function LedenlijstController($scope, RestService) {
      $scope.opgeslagenFilters = [
        {naam: "Export", label:"Persoonlijke filters"},
        {naam: "Wanbetalers", label: "Persoonlijke filters"},
        {naam: "Leden met geblokkeerd adres", label: "Standaard filters"}
      ];
      $scope.currentFilter = $scope.opgeslagenFilters[1];
      $scope.isFilterCollapsed = true;

      //$scope.leden = RestService.query();
      $scope.leden = [
        {id: "d5f75b320db2ee17010db33666f86d46", lidnummer: "1988110903791 ", voornaam: "Wouter", achternaam: "Synhaeve", postcode: "8530", gemeente: "Harelbeke", straat: "Stasegemsesteenweg", nummer: "27"},
        {id: "profiel", lidnummer: "1989080400123", voornaam: "Kawtar", achternaam: "Tel", postcode: "2547", gemeente: "Lint", straat: "Lambrechtstraat", nummer: "28"},
        {id: "profiel", lidnummer: "1994071000685", voornaam: "Georgino", achternaam: "Mijnen", postcode: "3530", gemeente: "Houthalen-Helchteren", straat: "Lambrechtstraat", nummer: "64"},
        {id: "profiel", lidnummer: "1991112000453", voornaam: "Juriën", achternaam: "Erkens", postcode: "2580", gemeente: "Putte", straat: "Oostjachtpark", nummer: "393"}
      ];
    }
})();
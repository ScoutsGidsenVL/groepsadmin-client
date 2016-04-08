(function() {
  'use strict';

  angular
    .module('ga.searchcontroller', [])
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$scope', '$location'];

  function SearchController($scope, $location) {

    // Haal leden op via api
    $scope.zoekLeden = function(zoekterm) {
      // Temporary search
      return [{id: "profiel", voornaam: "Marieke", achternaam: "Vandecasteele", geboortedatum: "05/07/1989"},
              {id: "profiel", voornaam: "Marie-Sophie", achternaam: "Cnockaert", geboortedatum: "03/10/1990"},
              {id: "profiel", voornaam: "Marie-Alix", achternaam: "Maelfait", geboortedatum: "29/11/1998"},
              {id: "profiel", voornaam: "Marie", achternaam: "Asscherickx", geboortedatum: "26/06/1980"},
              {id: "profiel", voornaam: "Marie-Amelie", achternaam: "Cnockaert", geboortedatum: "08/08/1989"},
              {id: "profiel", voornaam: "Marieke", achternaam: "Pattijn", geboortedatum: "23/06/2001"},
              {id: "profiel", voornaam: "Marie", achternaam: "Beel", geboortedatum: "01/03/2004"},
              {id: "profiel", voornaam: "Marie", achternaam: "Leenknecht", geboortedatum: "01/03/2004"}];
    }

    // ganaar het geselecteerde lid
    $scope.gaNaarLid = function(lid) {
      $scope.zoekterm = "";
      $location.path('/lid/' + lid.id);

    };
  }
})();

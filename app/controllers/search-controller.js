(function() {
  'use strict';

  angular
    .module('ga.searchcontroller', [])
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$scope', '$location'];

  function SearchController($scope, $location/*, searchFactory*/) {
    var data = [{id: "profiel", voornaam: "Marieke", achternaam: "Vandecasteele", geboortedatum: "05/07/1989"},
                {id: "profiel", voornaam: "Marie-Sophie", achternaam: "Cnockaert", geboortedatum: "03/10/1990"},
                {id: "profiel", voornaam: "Marie-Alix", achternaam: "Maelfait", geboortedatum: "29/11/1998"},
                {id: "profiel", voornaam: "Marie", achternaam: "Asscherickx", geboortedatum: "26/06/1980"},
                {id: "profiel", voornaam: "Marie-Amelie", achternaam: "Cnockaert", geboortedatum: "08/08/1989"},
                {id: "profiel", voornaam: "Marieke", achternaam: "Pattijn", geboortedatum: "23/06/2001"},
                {id: "profiel", voornaam: "Marie", achternaam: "Beel", geboortedatum: "01/03/2004"},
                {id: "profiel", voornaam: "Marie", achternaam: "Leenknecht", geboortedatum: "01/03/2004"}];
    $scope.results = [];

    $scope.zoekLid = function(input) {
      // Temporary search
      $scope.results = jQuery.grep(data, function( n, i ) {
        return (n.voornaam.toLowerCase().indexOf($scope.input.toLowerCase()) > -1 || n.achternaam.toLowerCase().indexOf($scope.input.toLowerCase()) > -1);
      });
    }

    $scope.gotoLid = function(lid) {
      $location.path('/lid/' + lid.id);
    };
  }


  /*
  .factory('searchFactory', ['$http', function($http) {
    /*return {
      get: function(url) {
        return $http.get(url).then(function(resp) {
          return resp.data; // success callback returns this
        });
      }
    };
  }])*/

})();
(function() {
  'use strict';

  angular
    .module('ga.searchcontroller', [])
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$scope', '$location', 'RestService'];

  function SearchController($scope, $location, RestService) {
    var rencentsteToken = 0;
    // zoek leden via api
    $scope.zoekLid = function(zoekterm){
      rencentsteToken++;
      return RestService.Zoeken.get({zoekterm:zoekterm, token:rencentsteToken}).$promise.then(
          function(result){
            // controle is dit de meest recente request
            if (result.token == rencentsteToken){
              console.log("Meest recent request.");
              console.log(result.zoekLeden);
              return result.zoekLeden;
            }
            return null;
        });
    }

    // ganaar het geselecteerde lid
    $scope.gaNaarLid = function(lid) {
      $scope.zoekterm = "";
      $location.path('/lid/' + lid.id);
    };
  }
})();

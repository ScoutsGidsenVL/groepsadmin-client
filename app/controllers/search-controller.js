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
      RestService.Zoeken.get({zoekterm:zoekterm, token:rencentsteToken}).$promise.then(
          function(result){
            return result.zoekLeden;
        });
    }

    // ganaar het geselecteerde lid
    $scope.gaNaarLid = function(lid) {
      $scope.zoekterm = "";
      $location.path('/lid/' + lid.id);
    };
  }
})();

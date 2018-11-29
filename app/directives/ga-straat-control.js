(function () {
  'use strict';

  angular
    .module('ga.straat.control', [])
    .directive('straatControl', straatControl);

  function straatControl() {
    return {
      restrict: 'E',
      templateUrl: 'partials/straat-control.html',
      replace: true,
      scope: {
        adres: '='
      },
      controller: straatControlController
    };
  }

  straatControlController.$inject = ['$scope', 'RestService'];

  function straatControlController($scope, RestService) {
    $scope.zoekStraat = function (zoekterm, adres) {
      var resultaatStraten = [];
      return RestService.Code.query({zoekterm: zoekterm, postcode: adres.postcode}).$promise.then(
        function (result) {
          angular.forEach(result, function (val) {
            resultaatStraten.push(val);
          });
          return resultaatStraten;
        });
    };

    $scope.bevestigStraat = function (item, adres) {
      adres.straat = item.straat;
      adres.giscode = item.code;
    }
  }

})();

(function () {
  'use strict';

  angular
    .module('ga.gemeente.control', [])
    .directive('gemeenteControl', gemeenteControl);

  function gemeenteControl() {
    return {
      restrict: 'E',
      templateUrl: 'partials/gemeente-control.html',
      replace: true,
      scope: {
        model: '=ngModel',
        adres: '='
      },
      controller: gemeenteControlController
    };
  }

  gemeenteControlController.$inject = ['$scope', 'RestService'];

  function gemeenteControlController($scope, RestService) {
    $scope.$watchCollection('adres', function(newValue) {
      $scope.model = newValue && newValue.postcode && newValue.gemeente ? newValue.postcode + ' ' + newValue.gemeente : '';
    });


    $scope.zoekGemeente= function (zoekterm) {
      var resultaatGemeentes = [];
      return RestService.Gemeente.get({zoekterm: zoekterm, token: 1}).$promise.then(
        function (result) {
          angular.forEach(result, function (val) {
            if (typeof val == 'string') {
              resultaatGemeentes.push(val);
            }
          });
          return resultaatGemeentes;
        });
    };
    $scope.bevestigGemeente = function (item, adres) {
      adres.postcode = item.substring(0, 4);
      adres.gemeente = item.substring(5);
      adres.straat = null;
      adres.bus = null;
      adres.nummer = null;
      adres.giscode = null;
      adres.land = adres.land || 'BE';
    };
  }

})();

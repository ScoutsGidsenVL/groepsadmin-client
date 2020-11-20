(function () {
  'use strict';

  angular
    .module('ga.communicatiecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('CommunicatieController', CommunicatieController);

  CommunicatieController.$inject = ['$location', '$rootScope', '$routeParams', '$scope', '$timeout', '$window', 'AlertService',
    'DialogService', 'LidService', 'RestService'];

  function CommunicatieController($location, $rootScope, $routeParams, $scope, $timeout, $window, AlertService,
                                  DialogService, LS, RestService) {

    angular.extend($scope, LS.publicProperties, LS.publicMethods);

    var init = function () {
      $scope.validationErrors = [];
      $scope.isEigenProfiel = true;

      RestService.CommunicatieProducten.get().$promise.then(
        function (result) {
          $scope.communicatieProducten = result.communicatieProducten;
        });

      RestService.Lid.get({id: 'profiel'}).$promise.then(
        function (result) {
          $scope.lid = result;
        });

      RestService.CommunicatieproductAbonnement.get().$promise.then(
        function (result) {
          $scope.selectedCommunicatieProducten = result;
        });
    };

    $scope.verwerkCommunicatie = function (communicatieproduct, type) {
      var communicatieproductabonnement = {
        communicatieproduct: '',
        type: '',
        lid: ''
      }
      communicatieproductabonnement.communicatieproduct = communicatieproduct.id;
      communicatieproductabonnement.type = type;
      communicatieproductabonnement.lid = $scope.lid.id;

      var index = -1;

      for (var i = 0; i < $scope.selectedCommunicatieProducten.length; i++) {
        if ($scope.selectedCommunicatieProducten[i].type === communicatieproductabonnement.type
          && $scope.selectedCommunicatieProducten[i].communicatieproduct === communicatieproductabonnement.communicatieproduct
          && $scope.selectedCommunicatieProducten[i].lid === communicatieproductabonnement.lid) {
          index = i;
          break;
        }
      }

      // als record niet in array dan mag die toegevoegd worden, anders verwijderd.
      if (index < 0) {
        $scope.selectedCommunicatieProducten.push(communicatieproductabonnement)
      } else {
        $scope.selectedCommunicatieProducten.splice(index, 1)
      }
    }

    // alle aanpassingen opslaan
    $scope.opslaan = function () {
      $scope.saving = true;
      var request = $scope.selectedCommunicatieProducten;
      RestService.CommunicatieproductAbonnement.post(request).$promise.then(
        function (response) {
          AlertService.add('success', 'Voorkeur is aangepast.');
          $scope.saving = false;
        },
        function (error) {
          $scope.saving = false;
        }
      )
    };

    $scope.checkValue = function (communicatieproduct, type) {
      var result = true;
      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (communicatieproduct.id === communicatieproductAbonnement.communicatieproduct && type === communicatieproductAbonnement.type) {
          result = false;
        }
      })
      return result;
    }

    init();
  }
})
();

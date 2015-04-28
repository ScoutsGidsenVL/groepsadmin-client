(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService', '$http'];

  function LidController ($scope, $routeParams, RestService, AlertService, $http) {
    $scope.lid = RestService.get({id:$routeParams.id}, loadSuccess);
                                 
    function loadSuccess(data) {
      $scope.lid.datum = new Date();
    }


    $scope.opslaan = function() {
      $scope.lid = RestService.update({id:$scope.lid.id}, $scope.lid).$promise.then(
        function(response){
          console.log(response);
          $scope.lid = response;
        },
        // Error handling
        function(error){
          AlertService.add('danger', "Error " + error.status + ". " + error.statusText);
        }
      );
    }
    
    $scope.schrap = function() {
    }
    
    $scope.nieuw = function() {
    }
    
    $scope.gezinslid = function() {
    }

    $scope.stopFunctie = function(id) {
      // Een bestaande niet beëindigde functie opladen met einde != null of false.
      // OF: /functie/{functieId} DELETE request
      console.log(id);
    }
  }
})();
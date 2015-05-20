(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService', '$http'];

  function LidController ($scope, $routeParams, RestService, AlertService, $http) {
    $scope.lid = RestService.get({id:$routeParams.id}, loadSuccess);
    
    function loadSuccess(data) {
      $scope.lid.persoonsgegevens.geboortedatum = new Date($scope.lid.persoonsgegevens.geboortedatum);
      
      // Changes object bijhouden: enkel de gewijzigde properties meesturen met PATCH
      $scope.lid.changes = new Array();

      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam'], function(value, key) {
        $scope.$watch(value, setChanges, true);
      });
    }

    function setChanges(newVal, oldVal, scope) {
      if (newVal == oldVal) return;

      var sectie = this.exp.split(".").pop();
      if($scope.lid.changes.indexOf(sectie) < 0) {
        $scope.lid.changes.push(sectie);
      }
    }


    $scope.opslaan = function() {
      $scope.lid.$update(function() {
        //$scope.lid = response;
      });
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
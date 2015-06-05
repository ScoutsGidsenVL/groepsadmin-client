(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService', '$http'];

  function LidController ($scope, $routeParams, RestService, AlertService, $http) {
    var sectie,
        patchObj;
    
    $scope.lid = RestService.get({id:$routeParams.id}, loadSuccess);
    
    function loadSuccess(data) {
      parseModel();

      // Changes object bijhouden: enkel de gewijzigde properties meesturen met PATCH
      $scope.lid.changes = new Array();

      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam'], function(value, key) {
        $scope.$watch(value, setChanges, true);
      });
      
      // Permissies komen uit PATCH link object
      patchObj = $.grep($scope.lid.links, function(e){
        return e.method == "PATCH";
      })[0];
    }
    
    function parseModel() {
      // Datums moeten van type Date Object zijn in Angular
      // Moet geparsed worden vóór Model geüpdatet wordt
      $scope.lid.persoonsgegevens.geboortedatum = new Date($scope.lid.persoonsgegevens.geboortedatum);
    }

    function setChanges(newVal, oldVal, scope) {
      if (newVal == oldVal) return;

      sectie = this.exp.split(".").pop();
      if($scope.lid.changes.indexOf(sectie) < 0) {
        $scope.lid.changes.push(sectie);
      }
    }

    $scope.hasPermission = function(val) {
      if (patchObj) {
        return patchObj.secties.indexOf(val) > -1;
      }
    }

    $scope.opslaan = function() {
      $scope.lid.$update(function(response) {
        parseModel();
        AlertService.add('success ', "Aanpassingen opgeslagen", 5000);
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
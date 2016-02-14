(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', 'RestService', 'AlertService'];

  function LidController ($scope, $routeParams, RestService, AlertService) {
    var sectie,
        patchObj;
    
    $scope.lid = RestService.Lid.get({id:$routeParams.id}, loadSuccess);
    
    function loadSuccess(data) {
      initModel();
      
      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam'], function(value, key) {
        $scope.$watch(value, setChanges, true);
      });
      
      // Permissies komen uit PATCH link object
      patchObj = $.grep($scope.lid.links, function(e){
        return e.method == "PATCH";
      })[0];
    }
    
    function initModel() {
      // Changes object bijhouden: enkel de gewijzigde properties meesturen met PATCH
      $scope.lid.changes = new Array();
      
      // Functiehistoriek weergeven/verbergen
      $scope.isFunctiesCollapsed = true;
      
      // Functies samenvoegen in één Array (Tijdelijk tot API update)
      var f = [];
      angular.forEach($scope.lid.functies, function(value) {
        f = f.concat(value);
      });
      $scope.lid.functies = f;
      
      // Alle actieve functies ophalen
      $scope.functieslijst = [];
      angular.forEach($scope.lid.functies, function(value, key) {
        var fn = RestService.Functie.get({functieId:value.functie});
        $scope.functieslijst[value.functie] = fn;
      });
      
      // Alle actieve groepen ophalen
      $scope.groepenlijst = [];
      angular.forEach($scope.lid.functies, function(value, key) {
        if($scope.groepenlijst[value.groep]) return;
        var gr = RestService.Groep.get({id:value.groep});
        $scope.groepenlijst[value.groep] = gr;
      });
    }

    function setChanges(newVal, oldVal, scope) {
      if (newVal == oldVal) return;

      sectie = this.exp.split(".").pop();
      if($scope.lid.changes.indexOf(sectie) < 0) {
        $scope.lid.changes.push(sectie);
      }
    }

    // Schrijfrechten kunnen per sectie ingesteld zijn. Controlleer als sectienaam voorkomt in PATCH opties.
    // Mogelijke sectienamen van een lid zijn "persoonsgegevens", "adressen", "email", "functies.*", "groepseigen".
    $scope.hasPermission = function(val) {
      if (patchObj) {
        return patchObj.secties.indexOf(val) > -1;
      }
    }

    $scope.opslaan = function() {
      $scope.lid.$update(function(response) {
        AlertService.add('success ', "Aanpassingen opgeslagen", 5000);
        initModel();
        //$scope.lid = response;
      });
    }

    $scope.schrap = function() {
    }

    $scope.nieuw = function() {
    }

    $scope.gezinslid = function() {
    }
    
    $scope.stopFunctie = function(functie) {
      // Opmerking: is momenteel nog niet voorzien in API
      
      var lid = {
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies: {
          functie: functie.functie,
          groep: functie.groep,
          einde: new Date()
        }
      }
      
      RestService.Lid.update({id:lid.id}, lid).$promise.then(
        function(response) {
          AlertService.add('success ', "Functie gestopt????", 5000);
          initModel();
          // TODO: update lid model (hier niet automatisch geüpdatet)
        },
        function(error) {
          AlertService.add('danger', "Error " + error.status + ". " + error.statusText);
        }
      );
    }
  }
})();

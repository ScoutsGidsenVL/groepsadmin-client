(function() {
  'use strict';

  angular
    .module('ga.lidtoevoegencontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidToevoegenController', LidToevoegenController);

  LidToevoegenController.$inject = ['$scope', '$location', 'RestService', 'AlertService', 'DialogService','$rootScope'];

  function LidToevoegenController ($scope, $location, RestService, AlertService, DialogService, $rootScope) {
    var sectie,
        patchObj;
    var lid = {};
    if($rootScope.familielid != undefined && $rootScope.familielid != null){
      lid = $rootScope.familielid;
      delete $rootScope.familielid;
      console.log(lid);
    }
    $scope.lid = lid;

    RestService.Functies.get().$promise.then(
      function(result){
        $scope.functies = result;
        RestService.Groepen.get().$promise.then(
          function(result){
            $scope.groepen = result;
            //herordenen zodat ze eenvoudig gebruikt kunnen worden in de template;
            $scope.groepEnfuncties = [];
            angular.forEach($scope.groepen.groepen, function(value, key){
              var tempGroep = value;
              tempGroep.functies = [];
              angular.forEach($scope.functies.functies, function(value2, key2){
                if(value2.groepen.indexOf(tempGroep.groepsnummer) != -1){
                  tempGroep.functies.push(value2);
                }
              })
              $scope.groepEnfuncties.push(tempGroep);
            });
          }
        );
      }
    );







    function setChanges(newVal, oldVal, scope) {
      if (newVal == oldVal) return;

      sectie = this.exp.split(".").pop();
      if($scope.lid.changes.indexOf(sectie) < 0) {
        $scope.lid.changes.push(sectie);
      }
    }

    $scope.opslaan = function() {
      $scope.lid.$update(function(response) {
        AlertService.add('success ', "Aanpassingen opgeslagen", 5000);

        //redirect to lid profile;
      });
    }

    $scope.nieuw = function() {
      $location.path("/lid/toevoegen");
    }
    $scope.addfunction = function() {

    }
  }
})();

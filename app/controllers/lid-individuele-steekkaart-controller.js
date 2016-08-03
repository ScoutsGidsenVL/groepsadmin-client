(function() {
  'use strict';

  angular
    .module('ga.lidindividuelesteekkaartcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('LidIndividueleSteekkaartController', LidIndividueleSteekkaartController);

  LidIndividueleSteekkaartController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak' ];

  function LidIndividueleSteekkaartController ($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {
    /*
     * Init
     * --------------------------------------
     */

    // steekkaart ophalen.
    RestService.LidIndividueleSteekkaart.get().$promise.then(
        function(result) {
          $scope.individueleSteekkaartWaarden = [];
          //compare functie
          function compare(a,b) {
            if (a.sort < b.sort)
              return -1;
            if (a.sort > b.sort)
              return 1;
            return 0;
          }
          var individueleSteekkaartLayout = result.groepseigenGegevens.schema.sort(compare);

          // bevat de groepering van de layout van input velden.
          // de teruggave van de API beschrijft enkel waar een groepstart en niet waar een groep stopt.
          $scope.individueleSteekkaartLayoutGroups = [];
          var tempGroup = [];
          angular.forEach(individueleSteekkaartLayout, function(value, index){
            if (value.type == "groep") {
              if (tempGroup.length == 0 ) {
                tempGroup.push(value);
              }
              else {
                $scope.individueleSteekkaartLayoutGroups.push(tempGroup);
                tempGroup = [];
                tempGroup.push(value);
              }
            }
            else {
              tempGroup.push(value);
              if (index == individueleSteekkaartLayout.length -1){
                $scope.individueleSteekkaartLayoutGroups.push(tempGroup);
              }
            }
          })
        },
        function(error) {
          console.log(error);
        }
      );

    /*
    * Pagina event listeners
    * ---------------------------------------
    */

    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if($scope.lid.changes.length != 0){
        event.preventDefault();
        var paramObj = {
              trueVal:newUrl
        }
        DialogService.new("Pagina verlaten","U staat op het punt om deze pagina te verlaten, niet opgeslagen aanpassignen zullen verloren gaan. Bent u zeker dat u wilt verdergaan?", $scope.locationChange, paramObj );
      }

    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function(result, url){
      if(result){
        $window.onbeforeunload = null;
        $scope.lid.changes = new Array();
        $window.location.href = url;
      }
    }
    // refresh of navigatie naar een andere pagina.
    var unload = function (e) {
       return "U staat op het punt deze pagina te verlaten, Niet opgeslagen aanpassingen zullen verloren gaan!!";
    };
  }
})();

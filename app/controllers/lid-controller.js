(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope'];

  function LidController ($scope, $routeParams, $location, RestService, AlertService, DialogService, $rootScope) {
    var sectie,
        patchObj;
    
    RestService.Lid.get({id:$routeParams.id}).$promise.then(
        function(result) {

          $scope.lid = result;
          loadSuccess($scope.lid)

          /*
          * check if user is VGA
          * ------------------------------------------------------
          */

          $scope.editable = true;
          /*
          //Static ID
            //TO-DO: User id binnenkrijgen via oAuth.
          var currentUserID = "d5f75b320db2ee17010db32157a201d4";//VGA
          //var currentUserID = "d5f75b320db2ee17010db321582b01f3";//geen VGA d5f75b320db2ee17010db321582b01f3

          if (currentUserID == $routeParams.id){
            $scope.editable = true;
          }
          else{
            RestService.Lid.get({id:currentUserID}).$promise.then(
               function(result) {
                  angular.forEach(result.functies, function(value) {
                    RestService.Functie.get({functieId:value.functie}).$promise.then(
                      function(result){
                        if(result.code == "VGA" && result.einde == undefined){
                          $scope.editable = true;
                        }
                    });
                  });
                }
              );
          }
          */
        },
        function(error) {
          if(error.data.beschrijving =="Geen leesrechten op dit lid"){
            //redirect to lid overzicht.
            $location.path('/');
            AlertService.add('danger', "Je hebt geen lees rechten op dit lid.");
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
          console.log(error.data);

        }
      );

    function loadSuccess(data) {
      initModel();
      
      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam'], function(value, key) {
        $scope.$watch(value, setChanges, true);
      });
      
      // Permissies komen uit PATCH link object
      patchObj = $.grep($scope.lid.links, function(e){
        return e.method == "PATCH";
      })[0];

      //init functies;
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
        RestService.Functie.get({functieId:value.functie}).$promise.then(
          function(result){
            $scope.functieslijst[value.functie] = result;
        });
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
        refreshLid(); //temp
        //initModel();
        //$scope.lid = response;
      });
    }
    $scope.adrestoevoegen = function(newadres){
      if(newadres == undefined){
        AlertService.add('danger ', "Geen adres aangemaakt", 5000);
      }else{
        //static giscode.
        newadres.giscode = 0;
        newadres.postadress = false;
        newadres.omschrijving = "";
        var lid = {};
        lid.id = $scope.lid.id;
        lid.adressen = $scope.lid.adressen;
        lid.adressen.push(newadres);

      }
    }

    $scope.schrap = function() {

    }

    $scope.nieuw = function() {
      $location.path("/lid/toevoegen");
    }

    $scope.gezinslid = function() {
      //bereid lid voor om doorgegeven te worden.
      console.log($scope.lid);
      var familielid = $scope.lid;
      delete familielid.aangepast;
      delete familielid.links;
      delete familielid.email;
      delete familielid.id;
      delete familielid.gebruikersnaam;
      delete familielid.persoonsgegevens.beperking;
      delete familielid.persoonsgegevens.geboortedatum;
      delete familielid.persoonsgegevens.geslacht;
      delete familielid.persoonsgegevens.voornaam;
      delete familielid.verbondsgegevens;
      familielid.functies = [];
      console.log(familielid);
      $rootScope.familielid = familielid;
      $location.path("/lid/toevoegen");
    }

    $scope.stopFunctie = function(functie) {
      var lid = {
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies: [
          {
            functie: functie.functie,
            groep: functie.groep,
            einde: new Date(),
            begin: functie.begin
          }
        ]
      }

      /*
      * bevestiging return functie
      * --------------------------------------
      */
      $scope.confirmstopFunctie = function(result){

        if(result){
          //set lid bevestiging
          lid.bevesteging = true;

          //send new request
          RestService.Lid.update({id:lid.id}, lid).$promise.then(
            function(response) {
              AlertService.add('success ', "Functie is geschrapt.", 5000);
              initModel();
              // TODO: update lid model (hier niet automatisch geüpdatet)

            },
            function(error) {
              AlertService.add('danger', "Error " + error.status + ". " + error.statusText);
            }
          );
        } else{
          AlertService.add('danger ', "Aanpassing niet doorgevoerd", 5000);
        }
      }

      
      RestService.Lid.update({id:lid.id}, lid).$promise.then(
        function(response) {
          //toon confirmvenster
          var currentFunctiName= $scope.functieslijst[functie.functie].beschrijving;
          DialogService.new("Bevestig","Weet u zeker dat u " + $scope.lid.persoonsgegevens.voornaam + " wilt schrappen als " + currentFunctiName + "?", $scope.confirmstopFunctie);
          refreshLid();
        },
        function(error) {
          if(error.data.beschrijving == "Minimum aantal van functie Verantw Groepsadmin bereikt in deze groep"){
            AlertService.add('warning', "De VGA-functie kan niet geschrapt worden. <a href=\"	https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginahulp:_src_4_TContentFunctionsEntry_OUTPUT_KAN_NIET_STOPZETTEN\">Meer info</a> ");
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
          console.log(error.data.beschrijving);
        }
      );


    }

    //temp refresh Lid function.
    function refreshLid() {
       $scope.lid = RestService.Lid.get({id:$routeParams.id}, loadSuccess);
    }

  }
})();

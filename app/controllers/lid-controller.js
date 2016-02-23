(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope'];

  function LidController ($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope) {
    var sectie,
        patchObj;
    var madeChanges = false;
    
    var tempadresId = 1;
    var tempcontactId = 1;

    RestService.Lid.get({id:$routeParams.id}).$promise.then(
        function(result) {

          $scope.lid = result;
          loadSuccess($scope.lid);
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
        var functies = result;
        RestService.Groepen.get().$promise.then(
          function(result){
            var groepen = result;
            //herordenen zodat ze eenvoudig gebruikt kunnen worden in de template;
            $scope.groepEnfuncties = [];
            angular.forEach(groepen.groepen, function(value, key){
              var tempGroep = value;
              tempGroep.functies = [];
              angular.forEach(functies.functies, function(value2, key2){
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

      $scope.postadres;
      angular.forEach($scope.lid.adressen, function(value, key){
        if(value.postadres == true){
          $scope.postadres = value.id;
        }
      });
      $scope.lid.groepseigen =
{
   "waarden" : {
      "c4ca4238a0b923820dcc509a6f75849b" : true,
      "c81e728d9d4c2f636f067f89cc14862c" : "Beetje tekst",
      "eccbc87e4b5ce2fe28308fd9f2a7baf3" : "5bd15ca24cee57242a9b28b79481da6d"
   },
   "schema" : [
     {
         "type" : "vinkje",
         "label" : "Een vinkje",
         "beschrijving" : "Dit is een vinkje dat je <strong>aan</strong> of uit mag klikken",
         "meer-info" : "<i>NOG</i> meer info",
         "id" : "c4ca4238a0b923820dcc509a6f75849b"
      },
            {
          "type" : "keuze",
          "id": "eccbc87e4b5ce2fe28308fd9f2a7baf3",
          "label": "keuze veld",
          "keuzes": [
              {
                  "id": "5bd15ca24cee57242a9b28b79481da6d",
                  "label": "Een keuze"
              },
              {
                  "id": "33d15ca24cee57242a9b28b79481da33",
                  "label": "keuze 2"
              }
          ]
      },

      {
         "type" : "groep",
         "label" : "titel/label van de groep",
         "beschrijving" : "Al deze velden horen bij elkaar",
         "velden" : [
            {
               "type" : "tekst",
               "id" : "c81e728d9d4c2f636f067f89cc14862c",
               "label": "tekst veld"
            },
            {
                "type" : "keuze",
                "id": "eccbc87e4b5ce2fe28308fd9f2a7baf3",
                "label": "keuze veld",
                "keuzes": [
                    {
                        "id": "5bd15ca24cee57242a9b28b79481da6d",
                        "label": "Een keuze"
                    },
                    {
                        "id": "5bd15ca24cee57242a9b28b79481da6d",
                        "label": "keuze 2"
                    }
                ]
            }
         ]
      }
   ]
};
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
      //console.log($scope.lid.$update());
      $scope.lid.$update(function(response) {
        AlertService.add('success ', "Aanpassingen opgeslagen", 5000);
        refreshLid(); //temp
        //initModel();
        //$scope.lid = response;
        madeChanges =false;
      });
    }

    $scope.schrap = function() {
      //alle functies op non actief zetten;
      var lid ={
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies:  []
      }
      angular.forEach($scope.lid.functies, function(value, key){
        //functies toegevoegd tijdens deze sesie worden nog niet doorgegevens
        if(value.begin != "temp"){
          var functie = value;
          functie = new Date().toISOString();
          lid.functies.push(value);
        }
      });
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
              AlertService.add('success ', 'Alle actieve functies werden geschrapt.', 5000);
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
          DialogService.new("Bevestig","Weet u zeker dat u alle actieve functies van " + $scope.lid.persoonsgegevens.voornaam + " wilt stoppen?", $scope.confirmstopFunctie);
          refreshLid();
        },
        function(error) {
          console.log(error);
          if(error.status == 403){
            AlertService.add('warning', "De VGA-functie kan niet geschrapt worden. <a href=\"	https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginahulp:_src_4_TContentFunctionsEntry_OUTPUT_KAN_NIET_STOPZETTEN\">Meer info</a> ");
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
          console.log(error.data.beschrijving);
        }
      );

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
          var currentFunctieName= $scope.functieslijst[functie.functie].beschrijving;
          DialogService.new("Bevestig","Weet u zeker dat u " + $scope.lid.persoonsgegevens.voornaam + " wilt schrappen als " + currentFunctieName + "?", $scope.confirmstopFunctie);
          refreshLid();
        },
        function(error) {
          console.log(error);
          if(error.status == 403){
            AlertService.add('warning', error.data.beschrijving);
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
          console.log(error.data.beschrijving);
        }
      );
    }

    $scope.functieToevoegen = function(groepsnummer, functie, type){
      if(type == 'add'){
        var functieInstantie = {};
        functieInstantie.functie = functie;
        functieInstantie.groep = groepsnummer;
        functieInstantie.begin = "temp";
        $scope.lid.functies.push(functieInstantie);
        madeChanges = true;
        return 'stop';
      }
      else{
        angular.forEach($scope.lid.functies, function(value,key){
          if(value.groep == groepsnummer && value.functie == functie && value.begin == 'temp'){
            $scope.lid.functies.splice(key, 1);
          }
        });
        return 'add'
      }
    }

    //temp refresh Lid function.
    function refreshLid() {
       $scope.lid = RestService.Lid.get({id:$routeParams.id}, loadSuccess);
    }

    $scope.setChangesStatus = function(){
      madeChanges = true;
    }

    $scope.changePostadres = function(adresID){
      console.log(adresID);
      angular.forEach($scope.lid.adressen, function(value,index){
        if(value.id == adresID){
          value.postadres = true;
        }
        else{
          value.postadres = false;
        }
      });
    }

    $scope.deleteContact = function(contactID){
      var contactIndex;
      angular.forEach($scope.lid.contacten, function(value, index){
        if(value.id == contactID){
          contactIndex = index;
        }
      });
      $scope.lid.contacten.splice(contactIndex,1);
    }

    $scope.deleteAdres = function(adresID){
      var adresIndex;
      angular.forEach($scope.lid.adressen, function(value, index){
        if(value.id == adresID){
          adresIndex = index;
        }
      });
      $scope.lid.adressen.splice(adresIndex,1);
    }

    $scope.addAdres= function(){
      var newadres = {
        postadres: false,
        omschrijving: "",
        id: 'tempadres' + tempadresId
      }
      tempadresId++;
      var lid = {};
      lid.id = $scope.lid.id;
      lid.adressen = $scope.lid.adressen;
      lid.adressen.push(newadres);
    }

    $scope.contactTovoegen = function(){
      if($scope.lid.contacten.length < 2){
        var newcontact = {
          id: 'tempcontact' + tempcontactId,
        }
        $scope.lid.contacten.push(newcontact);
        tempcontactId++;
      }

    }

    $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if(madeChanges){
        event.preventDefault();
        var paramObj = {
              trueVal:newUrl
        }
        DialogService.new("Pagina verlaten","U staat op het punt om deze pagina te verlaten, niet opgeslagen aanpassignen zullen verloren gaan. Bent u zeker dat u wil doorgaan?", $scope.locationChange, paramObj );
      }

    });

    /*
    * return functie voor wanneer en persoon van pagina veranderd en er zijn nog openstaande aanpassingen.
    * ----------------------------------------------------------------------------------------------------
    */
    $scope.locationChange = function(result, url){
      console.log(result);
      console.log(url);
      if(result == true){
        madeChanges = false;
        $window.location.href = url;
      }
    }
  }
})();

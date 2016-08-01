(function() {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('LidController', LidController);

  LidController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak' ];

  function LidController ($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {
    console.log('login = ' + keycloak.authenticated);

    $scope.validationErrors = [];
    var sectie
    
    // Nieuwe adressen hebben geen id. Tijdelijk opgelost met tempAdresId.
    // Voorstel: UUID genereren aan client-side. http://stackoverflow.com/a/2117523
    var tempAdresId = 1;
    var tempContactId = 1;
    RestService.LidAdd.options().$promise.then(
      function(result) {
        console.log(result.data);
        console.log(result.data.indexOf('POST') > -1);
        if(result.data.indexOf('POST') > -1){
          $scope.canPost = true;
        }
      }
    )
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
        }
      );



    /*
    * Algemeen
    * ---------------------------------------
    */
    
    // initialisatie
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

    }


    //
    function loadSuccess(data) {
      initModel();

      // init watch, naar welke objecten/delen van het lid object moet er gekeken worden om aanpassingen bij te houden?
      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam', 'lid.contacten', 'lid.adressen', 'lid.functies'], function(value, key) {
        $scope.$watch(value, function(newVal, oldVal, scope) {
            console.log(value);
            if (newVal == oldVal) return;
            sectie = value.split(".").pop();
            if($scope.lid.changes.indexOf(sectie) < 0) {
              $scope.lid.changes.push(sectie);
            }
            $window.onbeforeunload = unload;
          },
          true);
      });

      // Permissies komen uit PATCH link object
      $scope.patchObj = $.grep($scope.lid.links, function(e){
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
              // controle of de functies weergegeven mogen worden
              angular.forEach($scope.groepEnfuncties, function(groepFuncties){
                if($scope.patchObj.secties.indexOf('functies.'+groepFuncties.groepsnummer) > -1){
                  $scope.showFunctieToevoegen =  true
                }
              });
            }
          );
        }
      );

    }


    // Schrijfrechten kunnen per sectie ingesteld zijn. Controlleer als sectienaam voorkomt in PATCH opties.
    // Mogelijke sectienamen van een lid zijn "persoonsgegevens", "adressen", "email", "functies.*", "groepseigen.*".
    $scope.hasPermission = function(val) {
      if ($scope.patchObj) {
        return $scope.patchObj.secties.indexOf(val) > -1;
      }
    }

    // nieuw lid initialiseren na update.
    function initAangepastLid() {
      //changes array aanmaken
      $scope.lid.changes = new Array();
    }

    /*
    * Persoonlijke info
    * ---------------------------------------
    */

    $scope.changePostadres = function(adresID){
      angular.forEach($scope.lid.adressen, function(value,index){
        if(value.id == adresID){
          value.postadres = true;
        }
        else{
          value.postadres = false;
        }
      });
    }



    /*
    * Contacten
    * ---------------------------------------
    */

    // contacten wissen in het model
    $scope.deleteContact = function(contactID){
      var contactIndex;
      angular.forEach($scope.lid.contacten, function(value, index){
        if(value.id == contactID){
          contactIndex = index;
        }
      });
      $scope.lid.contacten.splice(contactIndex,1);
    }

    // nieuw contact toevoegen aan het model
    $scope.contactToevoegen = function(){
      if($scope.lid.contacten.length < 2){
        var newcontact = {};
        $scope.lid.contacten.push(newcontact);
        tempContactId++;
      }

    }


    /*
    * Adressen
    * ---------------------------------------
    */

    // een adres toevoegen aan het lid model
    $scope.addAdres= function(){
      var newadres = {
        postadres: false,
        omschrijving: "",
        id: 'tempadres' + tempAdresId,
        bus: null
      }
      tempAdresId++;
      var lid = {};
      lid.id = $scope.lid.id;
      lid.adressen = $scope.lid.adressen;
      lid.adressen.push(newadres);
    }

    // een aders wissen in het lid model
    $scope.deleteAdres = function(adresID){
      var wisindex;
      //controle wissen postadres
      angular.forEach($scope.lid.adressen, function(value, index){
        if(value.id == adresID){
          if(value.postadres){
            AlertService.add('danger', "Postadres kan niet gewist worden, selecteer éérst een ander adres als postadres.", 5000);
          }
          else{
            //controle wissen van adres gekoppeld aan een contact
            var kanwissen = true;
            angular.forEach($scope.lid.contacten, function(contact, index){
              if(contact.adres == adresID){
                AlertService.add('danger', "Dit adres is nog gekoppeld aan een contact, het kan daarom niet gewist worden.", 5000);
                kanwissen = false;
              }
            });
            if(kanwissen){
              $scope.lid.adressen.splice(index,1);
              wisindex = index;
              kanwissen = true;
            }
          }
        }
      });


    }

    // zoek gemeentes
    $scope.zoekGemeente = function(zoekterm){
      var resultaatGemeentes = [];
      return RestService.Gemeente.get({zoekterm:zoekterm, token:1}).$promise.then(
          function(result){
            angular.forEach(result, function(val){
              if(typeof val == 'string'){
                resultaatGemeentes.push(val);
              }
            });
            return resultaatGemeentes;
        });
    }

    // gemeente opslaan in het adres
    $scope.bevestigGemeente = function(item, adres) {
      adres.postcode = item.substring(0,4);
      adres.gemeente = item.substring(5);
      adres.straat = null;
      adres.bus = null;
      adres.nummer = null;
      adres.giscode = null;
    };

    // zoek straten en giscodes
    $scope.zoekStraat = function(zoekterm, adres){
      var resultaatStraten = [];
      return RestService.Code.query({zoekterm:zoekterm, postcode: adres.postcode}).$promise.then(
          function(result){
            angular.forEach(result, function(val){
                resultaatStraten.push(val);
            });
            return resultaatStraten;
        });
    }

    // straat en giscode opslaan in het adres
    $scope.bevestigStraat = function(item, adres) {
      adres.straat = item.straat;
      adres.giscode = item.code;

    };


    /*
    * Groepseigengegevens
    * ---------------------------------------
    */



    /*
    * Functies
    * ---------------------------------------
    */

    // functie meteen stop zetten.
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
          lid.bevestig = true;

          //send new request
          RestService.Lid.update({id:lid.id, bevestiging: true}, lid).$promise.then(
            function(response) {
              AlertService.add('success ', "Functie is geschrapt.", 5000);
              console.log(response);
              $scope.lid.functies = response.functies;
              initAangepastLid();


            },
            function(error) {
              AlertService.add('danger', "Error " + error.status + ". " + error.statusText);
            }
          );
        } else{
          AlertService.add('danger ', "Aanpassing niet doorgevoerd", 5000);
        }
      }

      RestService.Lid.update({id:lid.id, bevestiging: false}, lid).$promise.then(
        function(response) {
          //toon confirmvenster
          var currentFunctieName= $scope.functieslijst[functie.functie].beschrijving;
          DialogService.new("Bevestig","Weet u zeker dat u " + $scope.lid.persoonsgegevens.voornaam + " wilt schrappen als " + currentFunctieName + "?", $scope.confirmstopFunctie);
          initAangepastLid();
          $window.onbeforeunload = null;

        },
        function(error) {
          if(error.status == 403){
            AlertService.add('warning', error.data.beschrijving);
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
        }
      );
    }

    // nieuwe functie toevoegen aan model
    $scope.functieToevoegen = function(groepsnummer, functie, type){
      if(type == 'add'){
        var functieInstantie = {};
        functieInstantie.functie = functie;
        functieInstantie.groep = groepsnummer;


        functieInstantie.begin = '2016-01-01T00:00:00.000+01:00'; // set static date
        functieInstantie.temp = "tijdelijk";

        $scope.lid.functies.push(functieInstantie);
        return 'stop';
      }
      else{
        angular.forEach($scope.lid.functies, function(value,key){
          if(value.groep == groepsnummer && value.functie == functie && value.temp == "tijdelijk"){
            $scope.lid.functies.splice(key, 1);
          }
        });
        return 'add'
      }
    }


    // controle ofdat het lid reeds deze functie had voordat er aanapssingen gedaan werden.
    // zodat deze niet weergegeven wordt in de keuzelijst.
    // functies die gestart worden tijdens deze sessie worden wel weergegeven in de lijst
    $scope.checkFunctie = function(groep, functie){
      var check = false;
      angular.forEach($scope.lid.functies, function(value, key){
        if(value.groep == groep && value.functie == functie && value.temp != "tijdelijk" && value.einde == undefined ){
          check = true;
        }
      });
      return check
    }


    /*
    * Panel footer functionaliteit
    * ---------------------------------------
    */

    // nieuwlid
    $scope.nieuw = function() {
      $location.path("/lid/toevoegen");
    }

    // nieuw gezindslid aanmaken
    $scope.gezinslid = function() {
      //bereid lid voor om doorgegeven te worden.
      var familielid = {
        persoonsgegevens: {
            achternaam: $scope.lid.persoonsgegevens.achternaam
          },
        adressen: $scope.lid.adressen,
        contacten: $scope.lid.contacten,
        functies: []
      }
      console.log(familielid);
      $rootScope.familielid = familielid;
      console.log($scope.lid);
      $location.path("/lid/toevoegen");
    }

    // schrap het lid
    $scope.schrap = function() {
      //alle functies op non actief zetten;
      var lid ={
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies:  []
      }
      angular.forEach($scope.lid.functies, function(value, key){
        //functies toegevoegd tijdens deze sesie worden nog niet doorgegevens
        if(value.temp != "tijdelijk"){
          var functieInstantie = {
            functie: value.functie,
            groep: value.groep,
            einde: new Date(),
            begin: value.begin
          };
          lid.functies.push(functieInstantie);
        }
      });


      // bevestiging return functie
      // --------------------------------------
      $scope.confirmstopFunctie = function(result){
        if(result){
          //set lid bevestiging
          lid.bevesteging = true;

          //send new request
          RestService.Lid.update({id:lid.id, bevestiging: true}, lid).$promise.then(
            function(response) {
              AlertService.add('success ', 'Alle actieve functies werden geschrapt.', 5000);
              console.log(response);
              $scope.lid=response;
              initAangepastLid();

            },
            function(error) {
              AlertService.add('danger', "Error " + error.status + ". " + error.statusText);
            }
          );
        } else{
          AlertService.add('danger ', "Aanpassing niet doorgevoerd", 5000);
        }
      }
      RestService.Lid.update({id:lid.id, bevestiging: false}, lid).$promise.then(
        function(response) {
          //toon confirmvenster
          DialogService.new("Bevestig","Weet u zeker dat u alle actieve functies van " + $scope.lid.persoonsgegevens.voornaam + " wilt stoppen?", $scope.confirmstopFunctie);

        },
        function(error) {
          if(error.status == 403){
            AlertService.add('warning', "De VGA-functie kan niet geschrapt worden. <a href=\" https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginahulp:_src_4_TContentFunctionsEntry_OUTPUT_KAN_NIET_STOPZETTEN\">Meer info</a> ");
          }
          else{
            AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          }
        }
      );
    }

    // alle aanpassingen opslaan
    $scope.opslaan = function() {
      if($scope.lid.changes.indexOf("adressen") != -1  && $scope.lid.changes.indexOf("contacten") != -1){
        $scope.saving = true;
        //als er aanpassingen gebeurd zijn aan de contacten en tegelijk ook aan de adressen worden eerst de adressen toegevoegd en daarna de contacten.
        var adressen = $scope.lid.adressen;
        var contacten = $scope.lid.contacten;
        //eerst adressen committen
        $scope.lid.changes.splice($scope.lid.changes.indexOf("contacten"),1);
        $scope.lid.$update(function(response) {
          //connect oude adressen met nieuwe
          var adressenIndex = Array();
          angular.forEach(adressen, function(adres, index){
            angular.forEach(response.adressen, function(newadres, index){
              if(adres.giscode == newadres.giscode){
                adressenIndex[adres.id] = newadres.id;
              }
            });
          });
          //vervang oude adresid's in contacten
          angular.forEach(contacten, function(contact, index){
            contact.adres = adressenIndex[contact.adres];
          });
          console.log(contacten);
          $scope.lid.contacten = contacten;
          $scope.lid.changes = Array();
          $scope.lid.changes.push("contacten");
          //aangepaste contacten opsturen naar server.
          $scope.lid.$update(function(response) {
            $scope.saving = false;
            AlertService.add('success ', "Aanpassingen opgeslagen", 5000);
            initAangepastLid();
            $window.onbeforeunload = null;
          });
          initAangepastLid();
        });

      }
      else {
        $scope.saving = true;
        $scope.lid.$update(
          function(response) {
            $scope.saving = false;
            AlertService.add('success ', "Aanpassingen opgeslagen", 5000);
            initAangepastLid();
            $window.onbeforeunload = null;
            $scope.validationErrors = [];
          },
          function(error){
            $scope.saving = false;
            console.log(error);
            if (error.data.titel == "Validatie faalde voor Lid"){
              $scope.validationErrors = error.data.details;
            }
          }
        );
      }
    }



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

(function() {
  'use strict';

  angular
    .module('ga.lidtoevoegencontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidToevoegenController', LidToevoegenController);

  LidToevoegenController.$inject = ['$scope', '$location', '$window', 'RestService', 'AlertService', 'DialogService','$rootScope', '$route', 'access', 'keycloak', 'FormValidationService'];

  function LidToevoegenController ($scope, $location, $window, RestService, AlertService, DialogService, $rootScope, $route, access, keycloak, FVS) {
    console.log('login = ' + keycloak.authenticated);

    if(!access){
      $location.path("/lid/profiel");
    }

    // TODO - controle of de gebruiker wel nieuwe leden kan maken
    //        => anders redirect naar ledenlijst

    // huidige gebruiker opvragen, om de secties te kunnen bekijken die de gebruiker mag mee sturen
    var aangemeldeGebruiker;
    RestService.Lid.get({id:'profiel'}).$promise.then(
      function(result) {
        aangemeldeGebruiker = result;
        $scope.patchObj = $.grep(aangemeldeGebruiker.links, function(e){
          return e.method == "PATCH";
        })[0];
      },
      function(error) {}
    );

    /*
    * Controle ofdat de sectie aangepast mag worden.
    * ---------------------------------------
    */
    $scope.hasPermission = function(val) {
      if ($scope.patchObj) {
        return $scope.patchObj.secties.indexOf(val) > -1;
      }
    }

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
    $scope.popupCal = {
      opened: false
    };
    $scope.popupCal = function() {
      $scope.popupCal.opened = true;
    };
    $scope.formats = ['dd-MM-yyyy', 'dd/MM/yyy', 'dd.MM.yyyy'];
    $scope.format = $scope.formats[0];


    /*
    * Initialisatie van het nieuwe lid model
    * ---------------------------------------
    */
    var lid = {};
    lid.functies = [];
    lid.changes = [];
    lid.persoonsgegevens = {};
    lid.persoonsgegevens.geslacht = "vrouw";
    lid.email = null;
    lid.gebruikersnaam = null;
    lid.vgagegevens = {};
    lid.vgagegevens.verminderdlidgeld = false;
    lid.vgagegevens.beperking = false;


    if($rootScope.familielid == undefined && $rootScope.familielid == null){
      // geen broer of zus
      lid.contacten = Array();
      lid.adressen = Array();
    } else{
      // wel broer of zus
      lid = $rootScope.familielid;
      lid.persoonsgegevens.verminderdlidgeld = false;
      lid.persoonsgegevens.beperking = false;
      delete $rootScope.familielid;
      // controle of er adressen e.d. aanwezig zijn. => temp id's geven.
      angular.forEach(lid.adressen, function(adres, key){
        var randomId = "" + Math.random();
        angular.forEach(lid.contacten, function(contact, key){
            if(adres.id == contact.adres){
              contact.adres = randomId;
            }
            contact.id = key;
        });
        adres.id = randomId;
      });
    }

    $scope.lid = lid;

    function setChanges(newVal, oldVal, scope) {
      $window.onbeforeunload = unload;
    }

    angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam', 'lid.contacten', 'lid.adressen', 'lid.functies'], function(value, key) {
      $scope.$watch(value, setChanges, true);
    });

    /*
    * Initialisatie van andere benodigdheden.
    * ---------------------------------------
    */
    // functies ophalen enkel voor de groepen waarvan de gebruiker vga is
    RestService.Functies.get().$promise.then(
      function(result){
        $scope.functies = result;
        RestService.Groepen.get().$promise.then(
          function(result){
            //herordenen zodat ze eenvoudig gebruikt kunnen worden in de template;
            $scope.groepEnfuncties = [];
            angular.forEach(result.groepen, function(value, key){
              var tempGroep= {};
              tempGroep.functies = [];
              tempGroep.groepsnummer = value.groepsnummer;
              tempGroep.groepseigenGegevens = value.groepseigenGegevens;
              tempGroep.naam = value.naam;
              angular.forEach($scope.functies.functies, function(value2, key2){
                if(value2.groepen.indexOf(value.groepsnummer) != -1){
                  tempGroep.functies.push(value2);
                }
              })
              $scope.groepEnfuncties.push(tempGroep);
            });
          }
        );
      }
    );

    /*
    * Lid
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
        newcontact.rol = "moeder"
        $scope.lid.contacten.push(newcontact);
      }
    }


    /*
    * Adressen
    * ---------------------------------------
    */

    // een adres toevoegen aan het lid model
    $scope.addAdres= function(){
      var postadres = false;
      if($scope.lid.adressen.length == 0){
        postadres = true;
      }
      var newadres = {
        land: "BE",
        postadres: postadres,
        omschrijving: "",
        id: 'tempadres' + Math.random(),
        giscode: Math.floor((Math.random() * 100) + 1).toString(), //temp random giscode
        bus: ''
      }
      var lid = {};
      lid.id = $scope.lid.id;
      lid.adressen = $scope.lid.adressen;
      lid.adressen.push(newadres);
    }

    // een adres wissen in het lid model
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
    * Functies
    * ---------------------------------------
    */

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

    /*
    * Opslaan van het nieuwe lid
    * ---------------------------------------
    */

    $scope.opslaan = function() {
      $scope.saving = true;
      var origineelLid = {};
      angular.copy($scope.lid,origineelLid);
      //lid voorbereiden voor verzenden
      delete origineelLid.contacten;
      if(origineelLid.functies.length > 0){
        origineelLid.functies = [];
        origineelLid.functies.push($scope.lid.functies[0]);
      } else{
        origineelLid.functies = [];
      }
      //zend post met basis informaitie(persoonsgegevesn, adressen, 1 functieinstantie)

      origineelLid.vgagegevens.geboortedatum =  $scope.lid.vgagegevens.geboortedatum.toISOString().slice(0,10);// set static date;

      RestService.LidAdd.save(origineelLid).$promise.then(
        function(response) {
          console.log(response);
          origineelLid.contacten = $scope.lid.contacten;
          //alle extra functies sturen via patch
          var patchDeel = {};
          //controle zijn er contacten?
          if(origineelLid.contacten.length >0){
            patchDeel.contacten = [];
            angular.forEach(origineelLid.adressen, function(origineelAdres, key){
              angular.forEach(response.adressen, function(adres){
                //vervangen door Gis code wanneer gis werkt.
                if( origineelAdres.bus == adres.bus &&
                    origineelAdres.gemeente == adres.gemeente &&
                    origineelAdres.land == adres.land &&
                    origineelAdres.nummer == adres.nummer &&
                    origineelAdres.postcode == adres.postcode &&
                    origineelAdres.straat == adres.straat &&
                    origineelAdres.telefoon == adres.telefoon
                  ){
                  //zend update van de extra infotmatie(functies, contacten, ...)
                  angular.forEach(origineelLid.contacten, function(contact){
                    contact.adres = adres.id
                    patchDeel.contacten.push(contact);
                  });
                }
              });
            });
          }
          if($scope.lid.functies.length > 1){
            patchDeel.functies = $scope.lid.functies.splice(1, $scope.lid.functies.length-1);
          }
          if(patchDeel.functies || patchDeel.contacten){
            //stuur extra info via patch
            RestService.Lid.update({id:response.id}, patchDeel).$promise.then(
              function(response) {
                // redirect to lid page
                console.log(response);
                $location.path("/lid/" + response.id);
                $scope.saving = false;
                AlertService.add('success ', "Lid toegevoegd", 5000);
              },
              function(error) {
                $scope.saving = false;
                AlertService.add('danger', "Error " + error.status + ". " + error.statusText,5000);
              }
            );
          } else {
            // redirect to lid page
            $location.path("/lid/" + response.id);
          }

        },
        function(error) {
          if(error.status == 403){
            AlertService.add('warning', error.data.beschrijving,5000);
          }
          else{
            AlertService.add('danger', "Error " + error.status + ". " + error.statusText,5000);
          }
        }
      );
    }

    /*
    * Footer functionaliteit
    * ---------------------------------------
    */

    $scope.nieuw = function() {
      $route.reload();
    }


    /*
    * page Change functionaliteit
    * ---------------------------------------
    */
    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if($scope.lid.changes.length != 0){
        event.preventDefault();
        var paramObj = {
              trueVal:newUrl
        }
        DialogService.new("Pagina verlaten", "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?", $scope.locationChange, paramObj );
      }

    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function(result, url){
      if(result){
        $scope.lid.changes = new Array();
        $window.location.href = url;
      }
    }

    $scope.checkField = function(formfield) {
      formfield.$setValidity(formfield.$name,FVS.checkField(formfield));
    }


    // TODO: REMOVE CODE DUPLICATION  (lidcontroller)

    $scope.$watch('nieuwLidForm.$valid', function (validity) {
        if(!validity){
          openAndHighlightCollapsedInvalidContacts();
          openAndHighlightCollapsedInvalidAdresses();
        }else{
          unHighlightInvalidContactsGroup();
          unHighlightInvalidAddressesGroup();
        }
    });

    var openAndHighlightCollapsedInvalidContacts = function(){
      var invalidContacten = _.filter($scope.nieuwLidForm.$error.required,function(o){return o.$name.indexOf('contacten') > -1 });
      _.each(invalidContacten, function(contact){
        // get index from fieldname
        var str = contact.$name.match(/\d+/g, "")+'';
        var s = str.split(',').join('');
        // expand corresponding contact
        $scope.lid.contacten[s].showme = true;
        // hilight error
        $scope.lid.contacten[s].hasErrors = true;
      });
    }
    var openAndHighlightCollapsedInvalidAdresses = function(){
      var invalidAddresses = _.filter($scope.nieuwLidForm.$error.required,function(o){return o.$name.indexOf('adressen') > -1 });
      console.log('------', invalidAddresses);
      _.each(invalidAddresses, function(adres){
        // get index from fieldname
        var str = adres.$name.match(/\d+/g, "")+'';
        var s = str.split(',').join('');
        // expand corresponding adres
        $scope.lid.adressen[s].showme = true;
        // hilight error
        $scope.lid.adressen[s].hasErrors = true;
      });
    }
    var unHighlightInvalidContactsGroup = function(){
      if($scope.lid && $scope.lid.contacten){
        _.each($scope.lid.contacten,function(contact){contact.hasErrors = false});
      }
    }
    var unHighlightInvalidAddressesGroup = function(){
      if($scope.lid && $scope.lid.adressen){
        _.each($scope.lid.adressen,function(adres){adres.hasErrors = false});
      }
    }

    // END TO DO REMOVE DUPLICATE

    // refresh of navigatie naar een andere pagina.
    var unload = function (e) {
      var waarschuwing = "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?";
      e.returnValue = waarschuwing;
      return e.returnValue;
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('ga.lidtoevoegencontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidToevoegenController', LidToevoegenController);

  LidToevoegenController.$inject = ['$scope', '$location', 'RestService', 'AlertService', 'DialogService','$rootScope'];

  function LidToevoegenController ($scope, $location, RestService, AlertService, DialogService, $rootScope) {

    // Nieuwe adressen hebben geen id. Tijdelijk opgelost met tempAdresId.
    // Voorstel: UUID genereren aan client-side. http://stackoverflow.com/a/2117523
    var tempAdresId = 1;
    var tempContactId = 1;



    // TODO - controle of de gebruiker wel nieuwe leden kan maken
    //        => anders redirect naar leden lijst


    /*
    * Initialisatie van het nieuwe lid model
    * ---------------------------------------
    */
    var lid = {};
    lid.functies = [];
    lid.persoonsgegevens= {};
    lid.persoonsgegevens.verminderdlidgeld = false;
    lid.persoonsgegevens.beperking = false;
    if($rootScope.familielid == undefined && $rootScope.familielid == null){
      // geen broer of zus
      lid.contacten = Array();
      lid.adressen = Array();
    } else{
      // wel broer of zus
      lid = $rootScope.familielid;
      //delete $rootScope.familielid;
      console.log(lid);
      // controle of er adressen e.d. aanwezig zijn. => temp id's geven.
      angular.forEach(lid.adressen, function(adres, key){
        angular.forEach(lid.contacten, function(contact, key){
            if(adres.id == contact.adres){
              contact.adres = tempAdresId;
            }
        });
        adres.id = tempAdresId;
          tempAdresId++;
      });
    }
    $scope.lid = lid;



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
      var postadres = false;
      if($scope.lid.adressen.length == 0){
        postadres = true;
      }
      var newadres = {
        postadres: postadres,
        omschrijving: "",
        id: tempAdresId,
        giscode: Math.floor((Math.random() * 100) + 1).toString(), //temp random giscode
        bus: ''
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
      var origineelLid = {};
      angular.copy($scope.lid,origineelLid);
      //lid voorbereiden voor verzenden
      delete origineelLid.contacten;
      if(origineelLid.functies.length > 0){
        origineelLid.functies = [];
        origineelLid.functies.push($scope.lid.functies[0]);
      } else{
        //toon error lid heeft geen functie
        origineelLid.functies = [];
      }
      //zend post met basis informaitie(persoonsgegevesn, adressen, 1 functieinstantie, groepseigengegevens)
      origineelLid.persoonsgegevens.geboortedatum =  '2016-01-01T00:00:00.000+01:00'; // set static date
      console.log(RestService);
      console.log($scope.lid);
      console.log(origineelLid);
      RestService.LidAdd.save(origineelLid).$promise.then(
        function(response) {
          console.log(response);

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

      //zend update van de extra infotmatie(functies, contacten, ...)

      /*
      $scope.lid.$update(function(response) {
        AlertService.add('success ', "Aanpassingen opgeslagen", 5000);

        //redirect to lid profile;
      });*/
    }

    /*
    * Footer functionaliteit
    * ---------------------------------------
    */

    $scope.nieuw = function() {
      $location.path("/lid/toevoegen");
    }


    /*
    * page Change functionaliteit
    * ---------------------------------------
    */



  }
})();

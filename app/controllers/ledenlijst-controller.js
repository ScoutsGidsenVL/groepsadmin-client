(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$scope', 'RestService', '$window'];

  function LedenlijstController($scope, RestService, $window) {
    // check authentication
    console.log(keycloak.authenticated );

    if(!keycloak.authenticated){
      keycloak.login();
      return;
    }

    // opgeslagen filters ophalen
    RestService.Filters.get().$promise.then(
      function (response) {
        $scope.opgeslagenFilters = response;
      },
      function (error) {
      }
    );

    // huidige filter ophalen
    RestService.FilterDetails.get({id: 'huidige'}).$promise.then(
      function (response) {
        $scope.currentFilter = response;
      },
      function (error) {
      }
    );

    // controle moet er meer gelanden worden
    $scope.meerLaden = function(last){
      if(last && $(window).height() > $("#leden").height()){
        $scope.nextPage();
      }
    }

    /*
     * dynamische criteria ophalen
     * -----------------------------------------------------------
     */
    $scope.criteria = [];

    // alle functies ophalen
    RestService.Functies.get().$promise.then(
      function(result){
        var functies = result.functies;
        var functieGroepen = [];
        angular.forEach(functies, function(value){
          var functieGroepNaam;
          if (value.type == "groep"){
            functieGroepNaam = "Functies van " + value.groepen[0];
          } else {
            functieGroepNaam = value.type.charAt(0).toUpperCase() + value.type.slice(1);
          }

          var functieGroepBestaat = false;
          var functieGroepKey;
          angular.forEach(functieGroepen, function(functieGroep, key){
            if(functieGroep.title == functieGroepNaam ){
              functieGroepBestaat = true;
              functieGroepKey = key;
              return;
            }
          });

          if(!functieGroepBestaat){
            // nieuwe functie groep aanmaken
            var tempFunctiGroep = {
                                    title : functieGroepNaam,
                                    criteriaKey : "functies",
                                    multiplePossible : true,
                                    items: []
                                  }
            // toeveogen aan functie groep
            functieGroepen.push(tempFunctiGroep);
            // nieuwe key instellen.
            functieGroepKey = (functieGroepen.length - 1);
          }

          // voeg functie toe aan items van dat type
          var item = {
                        value : value.id,
                        label : value.beschrijving
                      };
          functieGroepen[functieGroepKey].items.push(item);
        });

        // functie groepen toevoegen aan de criteria.
        angular.forEach(functieGroepen, function(value){
          $scope.criteria.push(value);
        })
    });

    // alle groepen van de gebruiker ophalen
    RestService.Groepen.get().$promise.then(
      function(result){
        var groepen = result.groepen;
        var groepenCriteria = {
                        title : "Groepen",
                        criteriaKey : "groepen",
                        multiplePossible : true,
                        items: []
                        };
        angular.forEach(groepen, function(value){
          var groep = {
                    value : value.groepsnummer,
                    label : value.naam + " [" + value.groepsnummer + "]"
          }
          groepenCriteria.items.push(groep);
        });
        $scope.criteria.push(groepenCriteria);
    });

    // alle groepseigen velden ophalen


    //statische criteria toevoegen.
    var geslacht = {
                      title : "Geslacht",
                      creteriaKey : "geslacht",
                      multiplePossible : false,
                      items : [
                                {
                                  value: "Mannelijk",
                                  label: "man"
                                },
                                {
                                  value: "Vrouwlijk",
                                  label: "vrouw"
                                }
                              ]
                    }
    var geblokeerdadres = {
                            title : "Geblokeerd adres",
                            creteriaKey : "adresgeblokeerd",
                            multiplePossible : false,
                            items : [
                                      {
                                        value: "Ja",
                                        label: true
                                      },
                                      {
                                        value: "Nee",
                                        label: false
                                      }
                                    ]
                            }
    $scope.criteria.push(geslacht);
    $scope.criteria.push(geblokeerdadres);

    /*
     * Infinity scroll
     * -----------------------------------------------------------
     */

    $scope.busy = false;
    $scope.end = false
    $scope.aantalPerPagina = 10
    $scope.leden = [];
    $scope.nextPage = function(){
      if ($scope.busy) return;
      $scope.busy = true;
      // voorkom dat er request gedaanworden wanneer alle resultaaten geladen zijn
      if($scope.leden.length !== $scope.totaalAantalLeden){
        console.log("nieuwe leden ophalen");
        RestService.Leden.get({aantal: $scope.aantalPerPagina, offset: ($scope.leden.length == 0) ? 0 : ($scope.leden.length) }).$promise.then(
          function (response) {
            // voeg de leden toe aan de leden Array;
            $scope.leden.push.apply($scope.leden,response.leden);
            console.log($scope.leden.length);
            $scope.totaalAantalLeden = response.totaal;
            $scope.offset = response.offset;
            $scope.busy = false;
          },
          function (error) {
          }
        );
      }
      else{
        $scope.busy = false;
        $scope.end = true;
      }
    }

    // controle on resize
    angular.element($window).bind('resize', function () {
      if($(window).height() > $("#leden").height() && !$scope.busy){
        $scope.nextPage();
      }
    });

    /*
     * Sortering
     * ------------------------------------------------------------------
     */

    // controle voor de sortering
    // returnt het nummer volgens de volgorde van de sortering als de kolom in de sortering zit en wanner de volgorde die meegegeven is overeenkomt met de volgorde in de sortering.
    $scope.sortering = function(kolomId, volgorde){
      var returnValue = false;
      angular.forEach($scope.currentFilter.sortering, function(value,key){
        if(value.kolom == kolomId && value.oplopend == volgorde){
          switch(key){
            case 0:
                returnValue = 1;
                break;
              case 1:
                returnValue = 2;
                break;
              case 2:
                returnValue = 3;
                break;
          }
        }
      });
      return returnValue;
    }

    // uitvoeren van van een sortering.
    $scope.addSort = function(kolomId, volgorde){
      var originalSort = $scope.currentFilter.sortering;

      // controle werd er geclicked op een sort die reeds in de sortering zit => delete from sortering
      var deleteFromSort = false;
      angular.forEach(originalSort, function(value){
        if(value.kolom == kolomId && value.oplopend == volgorde){
          deleteFromSort = true;
          return;
        }
      });

      // nieuwe sortering toevoegen aan de set
      if(!deleteFromSort){
        $scope.currentFilter.sortering = []
        $scope.currentFilter.sortering[0] = {
          kolom : kolomId,
          oplopend : volgorde
        };
      } else{
        $scope.currentFilter.sortering = []
      }


      // laatste 2 van de oude sort toevoegen
      // controle zat de nieuwe al in de sortering?
      angular.forEach(originalSort, function(value){
        if($scope.currentFilter.sortering.length == 3){
          return;
        }
        if(value.kolom != kolomId){
          $scope.currentFilter.sortering[$scope.currentFilter.sortering.length] = value;
        }

      });

      // leden herladen of als ze allemaal gelanden zijn lokaal filteren.
        // indien herladen moet worden éérst filter opslaan
          //controle is de huidige filter een opgeslagen filter ?
           // ja nieuwe filter maken van huidige filter.
      if($scope.totaalAantalLeden == $scope.leden.length){
        // lokaal hersorteren.
      }
    }

  }
})();

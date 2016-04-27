(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$scope', 'RestService', '$window'];

  function LedenlijstController($scope, RestService, $window) {
    // check authentication
    /*console.log(keycloak.authenticated );

    if(!keycloak.authenticated){
      keycloak.login();
      return;
    }
    */

    // opgeslagen filters ophalen
    RestService.Filters.get().$promise.then(
      function (response) {
        $scope.opgeslagenFilters = response;
      },
      function (error) {
      }
    );

    // filter samenstellen
    stelFilterSamen();

    // controle moet er meer gelanden worden
    $scope.meerLaden = function(last){
      if(last && $(window).height() > $("#leden").height()){
        $scope.nextPage();
      }
    }


    /*
     * Filter samenstellen
     * -------------------------------------------------------
     */

    function functieGroepNaamMaken(functie){
      if (functie.type == "groep"){
        return "Functies van " + functie.groepen[0];
      } else {
        return functie.type.charAt(0).toUpperCase() + functie.type.slice(1);
      }
    }

    function bestaatFunctieGroep(functie, functieGroepen){
      var functieGroepNaam = functieGroepNaamMaken(functie);
      var functieGroepBestaat = false;
      angular.forEach(functieGroepen, function(functieGroep, key){
        if(functieGroep.title == functieGroepNaam ){
          functieGroepBestaat = true;
        }
      });
      return functieGroepBestaat;
    }

    function functieGroepKey(functie, functieGroepen){
      var tempKey;
      angular.forEach(functieGroepen, function(functieGroep, key){
        if(functieGroep.title == functieGroepNaamMaken(functie)){
          tempKey =  key;
          return;
        }
      });
      return tempKey;
    }

    function voegFunctieGroepToAan(functie, functieGroepen){
      var tempFunctieGroep = {
                               title : functieGroepNaamMaken(functie),
                               criteriaKey : "functies",
                               multiplePossible : true,
                               items: []
                             }
            // toeveogen aan functie groep
      functieGroepen.push(tempFunctieGroep);
      return functieGroepen;
    }

    function voegItemToeAanFunctiGroep(functie, functieGroepen){
      // voeg functie toe aan items van dat type
      var tempItem = {
                    value : functie.id,
                    label : functie.beschrijving
                  };
      functieGroepen[functieGroepKey(functie, functieGroepen)].items.push(tempItem);
      return functieGroepen;
    }

    function stelFilterSamen(){
      $scope.criteria = [];
      // functies ophalen
      RestService.Functies.get().$promise.then(
      function(result){
        var functies = result.functies;
        var functieGroepen = [];
        angular.forEach(functies, function(value){
          if(!bestaatFunctieGroep(value, functieGroepen)){
            //nieuwe functie groep maken
            functieGroepen = voegFunctieGroepToAan(value, functieGroepen);
          }
          // functie toevoegen
          functieGroepen = voegItemToeAanFunctiGroep(value, functieGroepen);
        });

        // functie groepen toevoegen aan de criteria.
        angular.forEach(functieGroepen, function(value){
          $scope.criteria.push(value);
        })
    });

      // groepen ophalen
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

      // groepseigenfuncties ophalen


      // statische criteria toevoegen.
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
      $scope.criteria.push(geslacht);
      var geblokeerdadres = {
                              title : "Adresgeblokeerd",
                              creteriaKey : "adresgeblokeerd",
                              multiplePossible : false,
                              items : [
                                        {
                                          value: true,
                                          label: "Ja"
                                        },
                                        {
                                          value: false,
                                          label: "Nee"
                                        }
                                      ]
                              }
      $scope.criteria.push(geblokeerdadres);

      // huidige filter ophalen en verwerken;
      RestService.FilterDetails.get({id: 'huidige'}).$promise.then(
        function (response) {
          $scope.geslecteerdeCriteria = [];
          $scope.currentFilter = response;
          angular.forEach($scope.currentFilter.criteria, function(value, key){
            if(key === "functies"){
              angular.forEach(value, function(functieID){
                RestService.Functie.get({functieId:functieID}).$promise.then(
                  function(result){
                    var functie  = result;
                    if(!bestaatFunctieGroep(functie, $scope.geslecteerdeCriteria)){
                      $scope.geslecteerdeCriteria = voegFunctieGroepToAan(functie, $scope.geslecteerdeCriteria);
                    }
                    $scope.geslecteerdeCriteria = voegItemToeAanFunctiGroep(functie, $scope.geslecteerdeCriteria);
                  }
                );
              });
            } else if(key === "groepen") {
              var items = [];
              angular.forEach(value, function(groepsnummer){
                RestService.Groep.get({id:groepsnummer}).$promise.then(
                  function(result){
                    var groep  = result;
                   items.push({
                        value : groep.groepsnummer,
                        label :  groep.groepsnummer
                      });
                  }
                );
              });
              var tempselectedCriteria = {
                                            title : key.charAt(0).toUpperCase() + key.slice(1),
                                            criteriaKey : "groepen",
                                            multiplePossible : true,
                                            items: items
                                          }
               $scope.geslecteerdeCriteria.push(tempselectedCriteria);

            } else {
              var tempselectedCriteria = {
                                            title : key.charAt(0).toUpperCase() + key.slice(1),
                                            values : value
                                          }
               $scope.geslecteerdeCriteria.push(tempselectedCriteria);
            }
          });
        }
      );
    }

    $scope.getKeyInCriteriaBytitle = function(title){
      var criteriaKey;
      angular.forEach($scope.criteria, function(value, key){
        if(value.title == title){
          criteriaKey =  key;
          return
        }
      })
      return criteriaKey;
    }

    $scope.inSelectedCriteria = function(title){
      var criteriaKey;
      angular.forEach($scope.geslecteerdeCriteria, function(value, key){
        if(value.title == title){
          criteriaKey =  key;
          return
        }
      })
      if(criteriaKey >= 0 ){
        return true;
      }
      return false;
    }

    $scope.addSelectedCriteria =function(criteriaItem){
      $scope.geslecteerdeCriteria.push({
                                        title : criteriaItem.title,
                                        creteriaKey : criteriaItem.creteriaKey,
                                        multiplePossible : criteriaItem.multiplePossible,
                                        items : []
                                        });
    }

    $scope.closeCriteria = function(selectedCriteria){
      var criteriaKey;
      angular.forEach($scope.geslecteerdeCriteria, function(value, key){
        if(value.title == selectedCriteria.title){
          criteriaKey =  key;
          return;
        }
      })
      $scope.geslecteerdeCriteria.splice(criteriaKey,1);

      //TO-DO: delete from filtermodel
      //TO-DO: leden
      //TO-DO: nieuwe leden ophalen
    }

    /*
     * Infinity scroll
     * -----------------------------------------------------------
     */

    $scope.busy = false;
    $scope.end = false;
    $scope.aantalPerPagina = 10;
    $scope.leden = [];
    $scope.nextPage = function(){
      if ($scope.busy) return;
      $scope.busy = true;
      // voorkom dat er request gedaanworden wanneer alle resultaaten geladen zijn
      if($scope.leden.length !== $scope.totaalAantalLeden){
        RestService.Leden.get({aantal: $scope.aantalPerPagina, offset: ($scope.leden.length == 0) ? 0 : ($scope.leden.length) }).$promise.then(
          function (response) {
            // voeg de leden toe aan de leden Array;
            $scope.leden.push.apply($scope.leden,response.leden);
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

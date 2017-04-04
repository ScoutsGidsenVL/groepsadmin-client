(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$q','$filter','$log', '$scope', 'LedenFilterService', 'RestService', '$window', 'keycloak'];

  function LedenlijstController($q, $filter, $log, $scope, LFS, RestService, $window, keycloak) {
    // Kolommen sortable maken
    var index;

    $scope.isLoadingFilters = true;

    $scope.busy = false;
    $scope.end = false;
    $scope.aantalPerPagina = 10;
    $scope.leden = [];

    // $( ".sortable" ).sortable({
    //   placeholder: "placeholder-kolom-kop",
    //   helper: "clone",
    //   start : function(event, ui){
    //     index =  ui.item.index();
    //   },
    //   stop : function(event, ui){
    //     $(".placeholder-body").remove();
    //     // To-Do filter aanpassen
    //     // To-Do Leden wissen
    //     // TO-Do nieuwe leden ophalen
    //     console.log(ui.item.index());
    //   },
    //   change : function(){
    //     $( "table tbody tr td:nth-child(" + (index + 1) + ")" ).hide();
    //     $(".placeholder-body").remove();
    //     $("table tbody tr td:nth-child(" + $('.placeholder-kolom-kop').index() + ")" ).after('<td class="placeholder-body" style="background-color: #A9C593;"></td>');
    //   }
    // });

    // controle on resize
    angular.element($window).bind('resize', function () {
     if($(window).height() > $("#leden").height() && !$scope.busy){
       $scope.nextPage();
     }
    });

    stelFilterSamen();

    function stelFilterSamen(id){
      // loading spinner van Filters
      $scope.isLoadingFilters = true;

      $scope.criteria = [];
      // huidige filter ophalen en verwerken;
      // als er geen filterId is, neem 'huidige'
      var filterId = id ? id : 'huidige';

      // Alle criteria ophalen waarmee de gebruiker kan filteren
      // functies ophalen om functiegroepen van het 'verbond' en de 'groep' samen te stellen
      // TODO: Resultaten van deze calls opslaan in localstorage

      var promises = [];
      promises[0] = RestService.Functies.get().$promise.then(
        function(result){
          var functies = result.functies;
          var functieGroepen = [];

          // functieGroep maken van functies met type 'verbond'
          var functieGroepVerbond = LFS.maakFunctieGroepVerbond(functies);
          functieGroepVerbond.activated = false;
          // functieGroepen maken van functies met type 'groep'
          var groepSpecifiekeFunctieGroepen = LFS.maakGroepSpecifiekeFunctieGroepen(functies);

          var functieGroepen = [];

          functieGroepen.push(functieGroepVerbond);
          _.each(groepSpecifiekeFunctieGroepen,function(value,key){
            value.activated = false;
            functieGroepen.push(value);
          });

          // aangemaakte functieGroepen toevoegen aan de criteria.
          _.each(functieGroepen, function(value){
            $scope.criteria.push(value);
          });

        });
      promises[1] = RestService.Groepen.get().$promise.then(
          function(result){
            var groepenCriteria = LFS.getCriteriaGroepen(result);
            groepenCriteria.activated = false;
            $scope.criteria.push(groepenCriteria);
          });
      promises[2] = RestService.Geslacht.get().$promise.then(
        function(result){
          var geslacht = result;
          geslacht.activated = false;
          $scope.criteria.push(geslacht);
        });
      promises[3] = RestService.Oudleden.get().$promise.then(
        function(result){
            var oudleden = result;
            oudleden.activated = false;
            $scope.criteria.push(oudleden);
        });
      promises[4] = RestService.GeblokkeerdAdres.get().$promise.then(
        function(result){
          var geblokkeerdAdres = result;
          geblokkeerdAdres.activated = false;
          $scope.criteria.push(geblokkeerdAdres);
        }
      );
      promises[5] = RestService.Kolommen.get().$promise.then(
        function(result){
          $scope.kolommen = result.kolommen;
        }
      );
      promises[6] = RestService.Filters.get().$promise.then(
        function (result){
          $scope.filters = result.filters;
        }
      );
      promises[7] = RestService.FilterDetails.get({id: filterId}).$promise.then(
        function (response) {
          $log.debug('filter: ' + filterId, response);
          $scope.currentFilter = response;
        });

      $q.all(promises).then(function () {
        // hier zijn alle calls (promises) resolved
        // alle criteria werden op de scope geplaatst
        // Roep nu filter op, op basis daarvan kunnen we criteria aan/uit zetten
        $scope.geselecteerdeCriteria = [];
        $log.debug('criteria',$scope.criteria);
        $scope.activeerCriteria();
      });

      // Filter ophalen adhv filterId
      // Adhv deze Filter de geselecteerde criteria bepalen

      RestService.FilterDetails.get({id: filterId}).$promise.then(
        function (response) {
          $scope.geselecteerdeCriteria = [];
          $scope.currentFilter = response;

          angular.forEach($scope.currentFilter.criteria, function(value, key){

            // neem alle functies uit criteria.functie 'functie' criteria
            // activeer alle functies
            if(key === "functies") {
              RestService.Functies.get().$promise.then(
                function (response) {
                  //$log.debug("Functies---", response);
                  angular.forEach(value, function(functieID) {
                    angular.forEach(response.functies, function(apiFunctie) {
                      if (apiFunctie.id == functieID) {
                        if(!LFS.bestaatFunctieGroep(apiFunctie, $scope.geselecteerdeCriteria)){
                          $scope.geselecteerdeCriteria = LFS.voegFunctieGroepToeAan(apiFunctie, $scope.geselecteerdeCriteria);
                        }
                        $scope.geselecteerdeCriteria = LFS.voegItemToeAanFunctieGroep(apiFunctie, $scope.geselecteerdeCriteria);
                      }
                    });
                  });
                }
              );
            }
            else if(key === "groepen") {
                var items = [];
                angular.forEach(value, function(groepsnummer){
                  RestService.Groep.get({id:groepsnummer}).$promise.then(
                    function(result){
                      var groep  = result;
                     items.push({
                          value : groep.groepsnummer,
                          label :  groep.naam + " [" + groep.groepsnummer + "]"
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
                $scope.geselecteerdeCriteria.push(tempselectedCriteria);

            }
            else {
                var tempselectedCriteria = {
                  title : key.charAt(0).toUpperCase() + key.slice(1),
                  items : value
                }
                $scope.geselecteerdeCriteria.push(tempselectedCriteria);
            }
          });
        }
      );
    }

    // Zet adhv de ingestelde filter, iedere criteriaCategorie en elk item in de criteriaCategorie op actief
    // Actieve criteriaGroepen worden getoond, Inactieve kunnen worden toegevoegd/geactiveerd
    // Actieve criteriaItems worden getoond, Inactieve kunnen worden toegevoegd/geactiveerd
    $scope.activeerCriteria = function(){
      // haal alle criteriaGroepen keys uit de geselecteerde filter
      _.each($scope.currentFilter.criteria,function(value, key){
        // indien de key overeenkomt, activeren we de criteriaGroep
        // meerdere criteriaGroepen kunnen een zelfde key hebben
        // (bvb. groepspecifieke functies hebben de criteriaKey 'functies')
        var criteriaGroep = _.filter($scope.criteria, {'criteriaKey': key });
        if(criteriaGroep){
          if(criteriaGroep.length>1){
            _.each(criteriaGroep,function(v, k){
              LFS.activeerGroepEnItems(v,value);
            })
          }else if(criteriaGroep.length == 1){
            LFS.activeerGroepEnItems(criteriaGroep[0],value);
          }
        }

      });
      $scope.isLoadingFilters = false;

    }

    $scope.isAllCriteriaActive = function(){
      return $scope.criteria.length == $filter('filter')($scope.criteria, {activated: true}).length;
    }
    $scope.addLastCriteriumIfThereIsOnlyOneLeft = function(){
      var deactivatedCriteria = $filter('filter')($scope.criteria, {activated: false});
      if(deactivatedCriteria.length == 1){
        deactivatedCriteria[0].activated = true;
      }
    }

    $scope.toggleCriteriumItem = function(criteriumItem, type, criteriumItems){
      if(type == 'checkbox'){
        if(criteriumItem && !criteriumItem.activated){
          criteriumItem.activated = true;
        }else{
          criteriumItem.activated = false;
        }
      }else if(type == 'radio'){
        _.each(criteriumItems,function(value, key){
          //console.log('radio------ criteriumItems' , value, key)
          value.activated = false;
        })
        criteriumItem.activated = true;
      }
    }

    $scope.getCriteriumSubtitleSuffix = function(criterium){
      var actCritLength = _.filter(criterium.items, {'activated' : true}).length;
      var str = '';
      if( actCritLength > 3){
        str = ', ...';
      }
      if(actCritLength == 0){
        str = '\u00A0';
      }
      return str;
    }

    // controle is de criteria geselecteerd a.d.h.v. de titel
    $scope.inSelectedCriteria = function(title){
      var criteriaKey;
      angular.forEach($scope.geselecteerdeCriteria, function(value, key){
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

    $scope.applyFilter = function(){
      // $scope.patchFilter();
      // $scope.getPatchedFilter();
      // get leden mbh gepatchete filter
      console.log('apply Filter criteria : ', $scope.criteria);
      //console.log('activated', _.filter($scope.criteria, {"activated":true}));
      var actFilterCrit  = _.filter($scope.criteria, {"activated":true});
      var oudLeden = _.find(actFilterCrit, {"criteriaKey":"oudleden"});
      var oudLedenActivatedItems = _.filter(oudLeden.items, {"activated": true } );


      console.log('oudeLeden actief criterium', oudLedenActivatedItems);

      var filterObj = {};
      filterObj.criteria = {};
      filterObj.criteria.oudleden = false;

      RestService.UpdateFilter.update({id: 'huidige'}, filterObj).$promise.then(
        function(response){
          console.log("response of patch", response);
          RestService.FilterDetails.get({id: 'huidige'}).$promise.then(
            function (response) {
              $log.debug('nieuwe filter huidige: ', response);
            });
        }

      );




    }

    $scope.kolomInFilter = function(kolom){
      var returnVal = false;
      angular.forEach($scope.currentFilter.kolommen, function(val){
        if(val.id == kolom.id){
          returnVal = true;
        }
      })
      return returnVal;
    }

    $scope.changeKolomInFilter = function(kolom){
      // controle zit kolom reeds in filter => wis
      var kolomInFilterIndex;
      angular.forEach($scope.currentFilter.kolommen, function(value, key){
        if(value.id == kolom.id){
          kolomInFilterIndex = key;
        }
      });
      if(kolomInFilterIndex){
        //wis de kolom
        $scope.currentFilter.kolommen.splice(kolomInFilterIndex, 1);
        // huidige filter aanpasen via API
      }
      else {
        // voeg de kolom toe
        $scope.currentFilter.kolommen.push(kolom);
        // huidige filter aanpasen via API
      }

      // kolom nog niet in de filer => voeg toe

    }

    /*
     * Filter samenstellen
     * -------------------------------------------------------
     */

    $scope.setFilter = function(filter){

      stelFilterSamen(filter.id)
      // resultaat wissen,

    }

    /*
     * Filter aanpassen
     * -------------------------------------------------------
     */
    // item toevoegen aan een criteria waar er meerdere items geselecteerd mogen worden.
    $scope.filterCriteriaToevoegen = function(criteriaItem, selectedCriteria){
      selectedCriteria.items.push(criteriaItem);

      //TO-DO: toevoegenen aan filtermodel
      //TO-DO: nieuwe leden ophalen
    }

    // item verwijderen uit een criteria waar er meerdere items geselecteerd mogen worden.
    $scope.filterCriteriaVerwijderen = function(criteriaItem, selectedCriteria){
      // verwijderen uit geselecteerdeCriteria
      var itemsLength = selectedCriteria.items.length
      for(var i = 0; i < itemsLength; i++){
        if(selectedCriteria.items[i].value == criteriaItem.value){
           selectedCriteria.items.splice(i, 1);
           break;
        }
      }

      //TO-DO: toevoegenen aan filtermodel
      //TO-DO: nieuwe leden ophalen
    }

    // nieuwe waarde voor een criteria waarvan maar één item geselecteerd magworden aanpassen
    $scope.filterCriteriaAanpassen = function(criteriaItem, selectedCriteria){
      selectedCriteria.items = criteriaItem.value;
    }

    /*
     * Infinity scroll
     * -----------------------------------------------------------
     */

    // controle moet er meer leden ingeladen worden
    $scope.meerLaden = function(last){
      if(last && $(window).height() > $("#leden").height()){
        $scope.nextPage();
      }
    }


    // functie die aangeroepen word om (meer) leden op te halen via de api
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



    /*
     * Sortering
     * ------------------------------------------------------------------
     */

    // controle voor de sortering
    // returnt het nummer volgens de volgorde van de sortering als de kolom in de sortering zit en
    // wanner de volgorde die meegegeven is overeenkomt met de volgorde in de sortering.

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
      //$log.debug("originalSort --- ",originalSort);

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

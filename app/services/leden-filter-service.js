(function() {
  'use strict';

  angular
    .module('ga.services.ledenfilter', [])
    .factory('LedenFilterService', LedenFilterService);

  LedenFilterService.$inject = ['$log'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het samenstellen van filters en criteria

  function LedenFilterService($log) {
    var ledenFilterService = {};

    ledenFilterService.functieGroepNaamMaken = function(functie){
      if (functie.type == "groep"){
        return "Functies van " + functie.groepen[0];
      } else {
        return functie.type.charAt(0).toUpperCase() + functie.type.slice(1);
      }
    }

    ledenFilterService.bestaatFunctieGroep = function(functie, functieGroepen){
      var functieGroepNaam = ledenFilterService.functieGroepNaamMaken(functie);
      var functieGroepBestaat = false;
      angular.forEach(functieGroepen, function(functieGroep, key){
        if(functieGroep.title == functieGroepNaam ){
          functieGroepBestaat = true;
        }
      });
      return functieGroepBestaat;
    }

    ledenFilterService.voegFunctieGroepToeAan = function(functie, functieGroepen){
      var tempFunctieGroep = {
                               title : ledenFilterService.functieGroepNaamMaken(functie),
                               criteriaKey : "functies",
                               multiplePossible : true,
                               items: []
                             }
            // toeveogen aan functie groep
      functieGroepen.push(tempFunctieGroep);
      return functieGroepen;
    }

    ledenFilterService.voegItemToeAanFunctieGroep = function(functie, functieGroepen){
      // voeg functie toe aan items van dat type
      var tempItem = {
                    value : functie.id,
                    label : functie.beschrijving
                  };
      functieGroepen[ledenFilterService.functieGroepKey(functie, functieGroepen)].items.push(tempItem);
      return functieGroepen;
    }

    ledenFilterService.functieGroepKey = function(functie, functieGroepen){
      var tempKey;
      angular.forEach(functieGroepen, function(functieGroep, key){
        if(functieGroep.title == ledenFilterService.functieGroepNaamMaken(functie)){
          tempKey =  key;
          return;
        }
      });
      return tempKey;
    }


    return ledenFilterService;
  };
})();

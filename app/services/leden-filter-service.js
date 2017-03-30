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

    ledenFilterService.maakFunctieGroep = function(arrFuncties, titel){
      var functieGroep = {
                               title : titel.charAt(0).toUpperCase() + titel.slice(1),
                               criteriaKey : "functies",
                               multiplePossible : true,
                               items: arrFuncties
                             }
      return functieGroep;
    }

    // maak functiegroep van het type verbond
    ledenFilterService.maakFunctieGroepVerbond = function(arrFuncties){
      var titel = 'verbond';
      // met lodash zoeken we alle functie objecten met als property type:'verbond'
      var verbondFuncties = _.filter(arrFuncties, function(o) { return o.type == titel; });

      // Voor ieder object in de array passen we de mapping toe
      var resVerbondFuncties = [];
      _.each(verbondFuncties, function(v, k){
        var resVerbondFunctie = {};
        resVerbondFunctie = ledenFilterService.mapObj(verbondFuncties[k]);
        resVerbondFuncties.push(resVerbondFunctie);
      });

      var functieGroep = ledenFilterService.maakFunctieGroep(resVerbondFuncties, titel);
      return functieGroep;
    };

    // maak de groepspecifieke functiegroepen
    ledenFilterService.maakGroepSpecifiekeFunctieGroepen = function(arrFuncties){
      var titel = 'groep';
      var groepSpecifiekeFunctieGroepen = [];

      // met lodash zoeken we alle functie objecten met als property type:'groep'
      var groepFuncties = _.filter(arrFuncties, function(o) { return o.type == titel; });

      // neem eerst alle groepnummers van de functies die behoren tot het type 'groep'
      var arrGroepFunctieGroepen = [];
      _.each(groepFuncties, function(value,key){
        arrGroepFunctieGroepen.push(value.groepen[0]);
      });
      // hou enkel de unieke waarden over
      arrGroepFunctieGroepen = _.uniqWith(arrGroepFunctieGroepen, _.isEqual);

      // per unieke waarde een functiegroep maken
      _.each(arrGroepFunctieGroepen,function(v, k){
        var arrUnmappedObjs = _.filter(groepFuncties, function(o) { return o.groepen[0] == v});
        var arrMappedObjs = [];
        var mappedObj = {};

        _.each(arrUnmappedObjs, function(value,key){
          mappedObj = ledenFilterService.mapObj(value);
          arrMappedObjs.push(mappedObj);
        });

        var functieGroep = ledenFilterService.maakFunctieGroep(arrMappedObjs, 'Functies van '+v);
        groepSpecifiekeFunctieGroepen.push(functieGroep);

      });

      return groepSpecifiekeFunctieGroepen;

    }

    ledenFilterService.mapObj = function(unmappedObj){
      // Map de properties van ieder object (bvb. 'beschrijving' wordt 'label', 'id' wordt 'value')
      var map = {
          beschrijving : "label",
          id : "value"
      };
      var mappedObj = {};
      _.each(unmappedObj, function(value, key) {
          key = map[key] || key;
          mappedObj[key] = value;
      });
      return mappedObj;
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

    // criteria ophalen
    ledenFilterService.getCriteriaGroepen = function(data){

      var groepen = data.groepen;
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
      return groepenCriteria;
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

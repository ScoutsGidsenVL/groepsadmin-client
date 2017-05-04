(function() {
  'use strict';

  angular
    .module('ga.services.ledenfilter', [])
    .factory('LedenFilterService', LedenFilterService);

  LedenFilterService.$inject = ['$q','$log','RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het samenstellen van filters en criteria

  function LedenFilterService($q, $log, RestService) {
    var ledenFilterService = {};

    ledenFilterService.getCriteria = function(){
      var returnObj = {};
      returnObj.arrCriteria = [];

      returnObj.promises = [];
      returnObj.promises[0] = RestService.Functies.get().$promise.then(
        function(result){
          // console.log("ledenFilterService getCriteria, Functies:" , result);
          var arrTakken = [];
          _.each(result.functies,function(val){
            arrTakken.push(val.leeftijdsTak);
          });

          var functies = result.functies;
          var functieGroepen = [];

          // functieGroep maken van functies met type 'verbond'
          var functieGroepVerbond = ledenFilterService.maakFunctieGroepVerbond(functies);
          functieGroepVerbond.activated = false;
          // functieGroepen maken van functies met type 'groep'
          var groepSpecifiekeFunctieGroepen = ledenFilterService.maakGroepSpecifiekeFunctieGroepen(functies);

          var functieGroepen = [];

          functieGroepen.push(functieGroepVerbond);
          _.each(groepSpecifiekeFunctieGroepen,function(value,key){
            value.activated = false;
            functieGroepen.push(value);
          });

          // aangemaakte functieGroepen toevoegen aan de criteria.
          _.each(functieGroepen, function(value){
            returnObj.arrCriteria.push(value);
          });

        });
      returnObj.promises[1] = RestService.Groepen.get().$promise.then(
          function(result){
            var groepenCriteria = ledenFilterService.getCriteriaGroepen(result);
            groepenCriteria.activated = false;
            returnObj.arrCriteria.push(groepenCriteria);
          });
      returnObj.promises[2] = RestService.Geslacht.get().$promise.then(
        function(result){
          var geslacht = result;
          geslacht.activated = false;
          returnObj.arrCriteria.push(geslacht);
        });
      returnObj.promises[3] = RestService.Oudleden.get().$promise.then(
        function(result){
            var oudleden = result;
            oudleden.activated = false;
            returnObj.arrCriteria.push(oudleden);
        });
      returnObj.promises[4] = RestService.GeblokkeerdAdres.get().$promise.then(
        function(result){
          var geblokkeerdAdres = result;
          geblokkeerdAdres.activated = false;
          returnObj.arrCriteria.push(geblokkeerdAdres);
        }
      );

      return returnObj;
    }

    ledenFilterService.getFilters = function(){
      var returnObj = {};
      returnObj.filters = [];
      returnObj.promises = [];
      returnObj.promises[0] = RestService.Filters.get().$promise.then(
        function (result){
          returnObj.filters = result.filters;
        }
      );
      return returnObj;
    }

    ledenFilterService.getKolommen = function(){
      var returnObj = {};
      returnObj.kolommen = [];
      returnObj.promises = [];
      returnObj.promises[0] = RestService.Kolommen.get().$promise.then(
        function(result){
          returnObj.kolommen = result.kolommen;
        }
      );
      return returnObj;
    }

    ledenFilterService.getFilter = function(filterId){
      var returnObj = {};
      returnObj.currentFilter = {};
      returnObj.promises = [];
      returnObj.promises[0] = RestService.FilterDetails.get({id: filterId}).$promise.then(
      function (res) {
        $log.debug('LFS -- getFilter by id: ' + filterId, res);
        returnObj.currentFilter = res;
      });
      return returnObj;
    }

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

    ledenFilterService.activeerGroepEnItems = function(criteriaGroep,value,bGrouped){

      var hasActiveItems = false;
      // zoek binnen de criteriaGroep naar values uit de opgehaalde filter
      // indien item wordt gevonden, zet het actief

      if(!criteriaGroep.multiplePossible){
        var foundElem = _.find(criteriaGroep.items, {'value' : value});
        foundElem.activated = true;
        if(foundElem){hasActiveItems = true;}
      } else {

        if(!bGrouped){
          _.each(value, function(v,k){
            var item = _.find(criteriaGroep.items, {'value' : v});
            if(item){
              item.activated = true;
              hasActiveItems = true;
            }
          });
        }else{
          // bvb. bij verbondsfuncties, zijn alle functies gegroepeerd
          _.each(value, function(v,k){
            _.each(criteriaGroep.itemgroups, function(vv,kk){
              var item = _.find(vv.items, {'value' : v});
              if(item){
                item.activated = true;
                hasActiveItems = true;
              }
            })
          });
        }

      }

      criteriaGroep.activated = hasActiveItems ? true : false;

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
      var titel = 'Functies';
      // met lodash zoeken we alle functie objecten met als property type:'verbond'
      var verbondFuncties = _.filter(arrFuncties, function(o) { return o.type == titel; });


      // Voor ieder object in de array passen we de mapping toe
      var resVerbondFuncties = [];
      _.each(verbondFuncties, function(v, k){
        var resVerbondFunctie = {};
        resVerbondFunctie = ledenFilterService.mapObj(verbondFuncties[k]);
        resVerbondFuncties.push(resVerbondFunctie);
      });

      // Sorteren op basis van array van waarden
      // OPGELET: bij een nieuwe tak, moet deze array worden aangevuld, anders zal ie niet verschijnen in de filter
      // TODO: volgorde komt van backend
      var arrTakSort = [];
      arrTakSort[0] = "Kapoenen";
      arrTakSort[1] = "Welpen/Kabouters";
      arrTakSort[2] = "Jong Gidsen/Jong Verkenners";
      arrTakSort[3] = "Gidsen/Verkenners";
      arrTakSort[4] = "Jin";
      arrTakSort[5] = "Leiding";
      arrTakSort[6] = "Akabe-Leden";
      arrTakSort[7] = "Andere";

      var arrTypeSort = [];
      arrTypeSort[0] = "leden";
      arrTypeSort[1] = "leiding";
      arrTypeSort[2] = "andere";

      var verbondsFunctiesOrderedPerLeeftijdsTak = ledenFilterService.groupBy(resVerbondFuncties, 'leeftijdsTak', 'leeftijdsTak', 'functies');
      var verbondsFunctiesOrderedPerVerbondsType = ledenFilterService.groupBy(resVerbondFuncties, 'verbondstype', 'verbondstype', 'functies');


      //var functieGroep = ledenFilterService.maakFunctieGroep(resVerbondFuncties, titel);
      var functieGroep = {};
      functieGroep.criteriaSubKey = "verbonds";
      functieGroep.title = titel.charAt(0).toUpperCase() + titel.slice(1);
      functieGroep.criteriaKey = "functies";
      functieGroep.multiplePossible = true;

      //maak array's met als key de leeftijdsTak
      var itemGroupObjs = [];

      _.each(verbondsFunctiesOrderedPerLeeftijdsTak, function(val,key){
        if(val.leeftijdsTak){
          var itemGroupObj = {};
          itemGroupObj.category = 'takken';
          itemGroupObj.label = val.leeftijdsTak;
          itemGroupObj.items = [];
          itemGroupObj.collapsed = true;

          _.each(val.functies,function(v,k){
            itemGroupObj.items.push(v);
          });
          itemGroupObjs.push(itemGroupObj);
        }
      });

      // de itemgroep objecten sorteren volgens arrTakSort
      functieGroep.itemgroups = [];
      _.each(arrTakSort,function(val,key){
        var foundItem = _.find(itemGroupObjs,{"label":val});
        if(foundItem){
          functieGroep.itemgroups.push(foundItem);
        };

      });

      _.each(verbondsFunctiesOrderedPerVerbondsType, function(val,key){
        //console.log("000000, ",val);
        if(val.verbondstype){
          var itemGroupObj = {};
          itemGroupObj.category = 'type';
          itemGroupObj.label = val.verbondstype;
          itemGroupObj.items = [];
          itemGroupObj.collapsed = true;

          _.each(val.functies,function(v,k){
            itemGroupObj.items.push(v);
          });
          itemGroupObjs.push(itemGroupObj);
        }

      });

      // de itemgroep objecten sorteren volgens arrTakSort
      _.each(arrTypeSort,function(val,key){
        var foundItem = _.find(itemGroupObjs,{"label":val});
        if(foundItem){
          functieGroep.itemgroups.push(foundItem);
        };
      });

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

    ledenFilterService.saveFilter = function(filterId, fObj){
      console.log('LFS.saveFilter filterId:',filterId, ' -- filterObject:  ', fObj);
      var deferred = $q.defer();
      if(filterId){
        RestService.UpdateFilter.update({id: filterId}, fObj).$promise.then(
          function(res){
            deferred.resolve(res);
          }
        );
      }
      return deferred.promise;
    }

    // this code was kindly taken from http://bit.ly/2oTyeqZ
    ledenFilterService.groupBy = function(dataToGroupOn, fieldNameToGroupOn, fieldNameForGroupName, fieldNameForChildren) {
            var result = _.chain(dataToGroupOn)
             .groupBy(fieldNameToGroupOn)
             .toPairs()
             .map(function (currentItem) {
                 return _.zipObject([fieldNameForGroupName, fieldNameForChildren], currentItem);
             })
             .value();
            return result;
        }


    ledenFilterService.getReconstructedFilterObject = function(activeCriteria, activeKolommen, currentFilter){
      // reconstrueer het Filter object:
      // TODO: rewrite to be more generic, using multiplePossible property, for 'functies' some extra logic will be needed

      var patchedFilterObj = currentFilter;
      patchedFilterObj.criteria = {};

      var reconstructedFilterObj = {};
      reconstructedFilterObj.criteria = {};
      // maak het criteria object adhv geactiveerde criteria en criteriaItems
      // groepen
      reconstructedFilterObj.criteria.groepen = [];
      var actieveGroepen = _.find(activeCriteria, {"criteriaKey":"groepen"});
      if(actieveGroepen){
        var temp = _.filter(actieveGroepen.items, {'activated': true});
        if(temp && temp.length > 0){
          var arrTemp = [];
          _.each(temp, function(val){
            arrTemp.push(val.value);
          });
          reconstructedFilterObj.criteria.groepen = arrTemp;
        }
      }


      // functies
      reconstructedFilterObj.criteria.functies = [];
      _.each(_.filter(activeCriteria, {"criteriaKey":"functies"}), function(value, key){
        //console.log("Value!!!!", value);
        if(value.criteriaSubKey == "verbonds"){
          _.each(value.itemgroups,function(v,k){
            var temp = _.filter(v.items, {'activated': true});
            if(temp && temp.length > 0){
              _.each(temp, function(val){
                reconstructedFilterObj.criteria.functies.push(val.value);
              });
            }
          });

        }else{
          var temp = _.filter(value.items, {'activated': true});
          if(temp && temp.length > 0){
            _.each(temp, function(val){
              reconstructedFilterObj.criteria.functies.push(val.value);
            });
          }
        }



      });

      // adresgeblokeerd
      var actieveGeblokkeerdeAdressen = _.find(activeCriteria, {"criteriaKey":"adresgeblokeerd"});
      if(actieveGeblokkeerdeAdressen){
          reconstructedFilterObj.criteria.adresgeblokeerd = _.find(actieveGeblokkeerdeAdressen.items, {'activated': true}).value;
      }


      // oudleden (idem groepen)
      reconstructedFilterObj.criteria.oudleden = false;
      // temp = _.filter(_.find(activeCriteria, {"criteriaKey":"oudleden"}).items, {'activated': true});
      // if(temp && temp.length > 0){
      //   var arrTemp = [];
      //   _.each(temp, function(val){
      //     arrTemp.push(val.value);
      //   });
      //   reconstructedFilterObj.criteria.oudleden = arrTemp;
      // }

      //reconstructedFilterObj.kolommen = patchedFilterObj.kolommen;
      reconstructedFilterObj.kolommen = activeKolommen;
      reconstructedFilterObj.groepen = patchedFilterObj.groepen;
      reconstructedFilterObj.sortering = patchedFilterObj.sortering;
      reconstructedFilterObj.sortering = [];
      reconstructedFilterObj.type = patchedFilterObj.type;
      reconstructedFilterObj.links = patchedFilterObj.links;

      return reconstructedFilterObj;
    }


    return ledenFilterService;
  };
})();

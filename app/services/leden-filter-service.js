(function() {
  'use strict';

  angular
    .module('ga.services.ledenfilter', [])
    .factory('LedenFilterService', LedenFilterService);

  LedenFilterService.$inject = ['$q','$rootScope', 'CacheService', 'RestService'];

  // Deze service bevat een aantal helper functies die voornamelijk worden gebruikt door de LedenlijstController
  // bvb. voor het samenstellen van filters en criteria

  function LedenFilterService($q, $rootScope, CS, RestService) {
    var ledenFilterService = {};
    var cachedHuidigeFilter = {}
    console.log(RestService)
    ledenFilterService.getCriteria = function(functies){
      var returnObj = {};
      returnObj.arrCriteria = [];

      returnObj.promises = [];
      returnObj.promises[0] = CS.Functies().then(
        function(result){
          var functies = result.functies;
          $rootScope.functies = functies;
          var functieGroepen = [];

          // functieGroep maken van functies met type 'verbond'
          var functieGroepVerbond = ledenFilterService.maakFunctieGroepVerbond(functies);
          functieGroepVerbond.activated = false;
          functieGroepen.push(functieGroepVerbond);

          // functieGroepen maken van functies met type 'groep'
          var groepSpecifiekeFunctieGroepen = ledenFilterService.maakGroepSpecifiekeFunctieGroepen(functies);
          if(groepSpecifiekeFunctieGroepen.length>=1){
            var functieGroepGroepspecifiek = ledenFilterService.maakFunctieGroepGroepspecifiek(groepSpecifiekeFunctieGroepen);
            functieGroepen.push(functieGroepGroepspecifiek);
          }

          // aangemaakte functieGroepen toevoegen aan de criteria.
          _.each(functieGroepen, function(value){
            returnObj.arrCriteria.push(value);
          });


        });
      returnObj.promises[1] = CS.Groepen().then(
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

    ledenFilterService.getFilter = function(filterId, initialLoad){
      var returnObj = {};
      returnObj.currentFilter = {};
      returnObj.promises = [];
      // check if filter is already available on initial load of ledenlijst-page
      if(initialLoad && !_.isEmpty(cachedHuidigeFilter)){
        var deferred = $q.defer();
        returnObj.currentFilter = cachedHuidigeFilter
        deferred.resolve(returnObj.currentFilter);
        returnObj.promises[0] = deferred.promise

      }else{
        returnObj.promises[0] = RestService.FilterDetails.get({id: filterId}).$promise.then(
        function (res) {
          //$log.debug('LFS -- getFilter by id: ' + filterId, res);
          returnObj.currentFilter = res;
          cachedHuidigeFilter = res;
        });
      }

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


      // Leeftijd is een 'speciaal geval' en heeft bevat specifieke logica
      // andere criteria zijn generiek
      if(criteriaGroep.criteriaKey == "leeftijd"){
        //console.log('LEEFTIJD  criterium --- -', criteriaGroep,value,bGrouped);
        $rootScope.$emit('leeftijdCriterium', value);
        hasActiveItems = true;
      }else if(!criteriaGroep.multiplePossible){
        var foundElem = _.find(criteriaGroep.items, {'value' : value});

        if(foundElem){
          if(criteriaGroep.criteriaKey == "oudleden" && foundElem.value == false){
            return;
          }
          else{
            foundElem.activated = true;
            hasActiveItems = true;
          }
        }
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
      return {
        title : titel.charAt(0).toUpperCase() + titel.slice(1),
        criteriaKey : "functies",
        multiplePossible : true,
        items: arrFuncties
      };
    }

    ledenFilterService.maakFunctieGroepGroepspecifiek = function(arrGroupedFuncties){

      var functieGroep = {};
      functieGroep.criteriaSubKey = "groepspecifiek";
      functieGroep.title = 'Groepseigen functies';
      functieGroep.criteriaKey = "functies";
      functieGroep.multiplePossible = true;
      functieGroep.itemgroups = [];

      _.each(arrGroupedFuncties,function(value,key){
        var obj = {};
        obj.collapsed = true;
        obj.items = value.items;
        obj.label = value.title;
        functieGroep.itemgroups.push(obj);

      });

      return functieGroep;
    }

    // maak functiegroep van het type verbond
    ledenFilterService.maakFunctieGroepVerbond = function(arrFuncties){

      // met lodash zoeken we alle functie objecten met als property type:'verbond'
      var verbondFuncties = _.filter(arrFuncties, function(o) { return o.type == 'verbond'; });

      var functieGroep = {};
      functieGroep.criteriaSubKey = "verbonds";
      functieGroep.title = 'Functies';
      functieGroep.criteriaKey = "functies";
      functieGroep.multiplePossible = true;
      functieGroep.itemgroups = [];

      _.forEach(verbondFuncties, function(verbondFunctie) {
        var functieMapObj = ledenFilterService.mapObj(verbondFunctie);

        _.forEach(verbondFunctie.groeperingen, function(groepering) {

          var itemGroupObj = _.find(functieGroep.itemgroups, {'label': groepering.naam});

          if (!itemGroupObj) {
            itemGroupObj = {};
            itemGroupObj.label = groepering.naam;
            itemGroupObj.items = [];
            itemGroupObj.collapsed = true;
            itemGroupObj.volgorde = groepering.volgorde;

            functieGroep.itemgroups.push(itemGroupObj);
          }

          itemGroupObj.items.push(functieMapObj);
        });
      });

      functieGroep.itemgroups = _.sortBy(functieGroep.itemgroups, ['volgorde']);

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
          value: value.groepsnummer,
          label: value.naam + " - " + value.groepsnummer
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
      console.log('LFS.saveFilter filterId:', filterId, ' -- filterObject:  ', fObj);
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

    ledenFilterService.getReconstructedFilterObject = function(activeCriteria, activeKolommen, currentFilter){
      // reconstrueer het Filter object:
      // TODO: rewrite to be more generic, using multiplePossible property, for 'functies' some extra logic will be needed
      var patchedFilterObj = currentFilter;

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
        if(value.criteriaSubKey == "verbonds" || value.criteriaSubKey == "groepspecifiek"){
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

      // leeftijd
      var tmpObj = _.find(activeCriteria, {'criteriaKey':'leeftijd'});
      if(tmpObj){
        reconstructedFilterObj.criteria.leeftijd = currentFilter.criteria.leeftijd;
      }

      // geslacht
      // indien enkel 'jongen' of 'meisje' aangeduid werd, geven we een lege waarde mee
      var activatedGeslacht = _.find(activeCriteria, {"criteriaKey":"geslacht"});
      if(activatedGeslacht){
        var ag = _.filter(activatedGeslacht.items, {'activated':true});
        if(_.size(ag) == 1){
          reconstructedFilterObj.criteria.geslacht = ag[0].value;
        }
      }

      // oudleden (idem geslacht)
      var activatedOudleden = _.find(activeCriteria, {'criteriaKey':'oudleden'});
      console.log( activatedOudleden);
      if(activatedOudleden){
        var ao = _.filter(activatedOudleden.items, {'activated':true});
        console.log(ao);
        if(_.size(ao) == 1){
          reconstructedFilterObj.criteria.oudleden = ao[0].value;
        }
      }
      else{

      }

      // adresgeblokkeerd
      var actieveGeblokkeerdeAdressen = _.find(activeCriteria, {"criteriaKey":"adresgeblokkeerd"});
      if(actieveGeblokkeerdeAdressen){
          reconstructedFilterObj.criteria.adresgeblokkeerd = _.find(actieveGeblokkeerdeAdressen.items, {'activated': true}).value;
      }


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
      reconstructedFilterObj.type = patchedFilterObj.type;
      reconstructedFilterObj.links = patchedFilterObj.links;

      return reconstructedFilterObj;
    }

    ledenFilterService.getSelectionSummary = function(crit,amount){
      var str= "";
      var items = new Array();
      if(crit.criteriaKey !== 'functies' ){
        // geen gegroepeerde items
        items = crit.items;
      }else{
        // gegroepeerde items
        _.each(crit.itemgroups,function(group){
          _.each(group.items,function(item){
            items.push(item);
          })
        })
      }

      var activated = _.filter(items, {'activated':true});
      activated = _.uniq(activated, function(x){
          return x.label;
      });
      activated = _.orderBy(activated,'label','asc');

      var filtered = activated.slice(0,amount);
      _.each(filtered, function(v,k){
        str += v.label;
        str += k < filtered.length-1 ? ', ' : '' ;
      });
      if(activated.length > amount){
        str += '...';
      }
      return str;

    }

    ledenFilterService.getLeeftijdCriterium = function(){
      return {
          'title' : 'Leeftijd',
          'criteriaKey' : 'leeftijd',
          'multiplePossible' : false,
          'activated':false,
          'multiValues':true,
          'leeftijdOpDatum':
            {
              'label': '',
              'key': 'op31december',
              'values': [
                ['was op 31 december', true],
                ['Is nu', false]
              ]
            }
          ,
          'jongerDan':
            {
              'label': 'en jonger dan',
              'key': 'jongerdan',
              'values': [
                ["-",-1],
                ["5 jaar",5],
                ["6 jaar",6],
                ["7 jaar",7],
                ["8 jaar",8],
                ["9 jaar",9],
                ["10 jaar",10],
                ["11 jaar",11],
                ["12 jaar",12],
                ["13 jaar",13],
                ["14 jaar",14],
                ["15 jaar",15],
                ["16 jaar",16],
                ["17 jaar",17],
                ["18 jaar",18],
                ["19 jaar",19],
                ["20 jaar",20],
                ["21 jaar",21],
                ["22 jaar",22],
                ["23 jaar",23],
                ["24 jaar",24],
                ["25 jaar",25],
                ["26 jaar",26],
                ["27 jaar",27],
                ["28 jaar",28],
                ["29 jaar",29],
                ["30 jaar",30],
                ["31 jaar",31],
                ["32 jaar",32],
                ["33 jaar",33],
                ["34 jaar",34],
                ["35 jaar",35],
                ["36 jaar",36],
                ["37 jaar",37],
                ["38 jaar",38],
                ["39 jaar",39],
                ["40 jaar",40],
                ["41 jaar",41],
                ["42 jaar",42],
                ["43 jaar",43],
                ["44 jaar",44],
                ["45 jaar",45],
                ["46 jaar",46],
                ["47 jaar",47],
                ["48 jaar",48],
                ["49 jaar",49]
              ]
            }
          ,
          'ouderDan':
            {
              'label': 'ouder dan',
              'key': 'ouderdan',
              'values': [
                ["-",-1],
                ["5 jaar",5],
                ["6 jaar",6],
                ["7 jaar",7],
                ["8 jaar",8],
                ["9 jaar",9],
                ["10 jaar",10],
                ["11 jaar",11],
                ["12 jaar",12],
                ["13 jaar",13],
                ["14 jaar",14],
                ["15 jaar",15],
                ["16 jaar",16],
                ["17 jaar",17],
                ["18 jaar",18],
                ["19 jaar",19],
                ["20 jaar",20],
                ["21 jaar",21],
                ["22 jaar",22],
                ["23 jaar",23],
                ["24 jaar",24],
                ["25 jaar",25],
                ["26 jaar",26],
                ["27 jaar",27],
                ["28 jaar",28],
                ["29 jaar",29],
                ["30 jaar",30],
                ["31 jaar",31],
                ["32 jaar",32],
                ["33 jaar",33],
                ["34 jaar",34],
                ["35 jaar",35],
                ["36 jaar",36],
                ["37 jaar",37],
                ["38 jaar",38],
                ["39 jaar",39],
                ["40 jaar",40],
                ["41 jaar",41],
                ["42 jaar",42],
                ["43 jaar",43],
                ["44 jaar",44],
                ["45 jaar",45],
                ["46 jaar",46],
                ["47 jaar",47],
                ["48 jaar",48],
                ["49 jaar",49]
              ]
            }

      };
    }


    return ledenFilterService;
  };
})();

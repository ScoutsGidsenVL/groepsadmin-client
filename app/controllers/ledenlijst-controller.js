(function () {
  'use strict';

  angular
    .module('ga.ledenlijstcontroller', [])
    .controller('LedenlijstController', LedenlijstController);

  LedenlijstController.$inject = ['$q', '$filter', '$log', '$location', '$rootScope', '$scope', '$timeout', 'LedenFilterService', 'LedenLijstService', 'RestService', '$window', 'access', 'UserAccess', 'CacheService'];

  function LedenlijstController($q, $filter, $log, $location, $rootScope, $scope, $timeout, LFS, LLS, RestService, $window, access, UserAccess, CS) {
    // Kolommen sortable maken
    $scope.isLoadingFilters = true;
    $scope.hasLoadedFilters = false;
    $scope.dataLoaded = false;

    $scope.busy = false;
    $scope.end = false;

    $scope.aantalLedenGeladen = 0;
    $scope.aantalPerPagina = 10;
    $scope.leden = [];

    $scope.isLoadingMore = false;

    $scope.isFilterCollapsed = false;

    $scope.canPost = false;

    if (!access) {
      $location.path("/lid/profiel");
    }

    UserAccess.hasAccessTo("nieuw lid").then(function (res) {
      $scope.canPost = res;
    });

    $(function () {
      angular.element("#mySortableList").sortable({
        items: "> .filterDragKolom",
        placeholder: "my-sortable-placeholder",
        stop: function (event, ui) {
          // zoek element mbv data-kolom-id en geef het de nieuwe index
          var kolId = $(ui.item[0]).attr('data-kolom-id');
          var foundKolom = _.find($scope.kolommen, {'id': kolId});
          var oldKolomIndex = foundKolom.kolomIndex;
          var newKolomIndex = ui.item.index();

          // alle kolomIndexen van de kolommen die achter het zonet gesleepte element komen, moeten met 1 worden verhoogd
          // (tot de kolommen die reeds achter het gesleepte element kwamen, want die behouden hun index)
          if (oldKolomIndex > newKolomIndex) {
            var cols = _.filter($scope.kolommen, function (o) {
              return o.kolomIndex >= newKolomIndex && o.kolomIndex < oldKolomIndex
            });
            _.each(cols, function (value) {
              value.kolomIndex++;
            });
          }
          // alle kolomIndexen van de kolommen die voor het zonet gesleepte element komen, moeten met 1 worden verlaagd
          // (tot de kolommen die reeds voor het gesleepte element kwamen, want deze behouden hun index)
          if (oldKolomIndex < newKolomIndex) {
            var cols = _.filter($scope.kolommen, function (o) {
              return o.kolomIndex <= newKolomIndex && o.kolomIndex > oldKolomIndex
            });
            _.each(cols, function (value) {
              value.kolomIndex--;
            });
          }

          // zet de nieuwe index op de gesleepte kolom
          foundKolom.kolomIndex = newKolomIndex;

          $scope.$apply();
        }
      });
    });

    // controle on resize
    angular.element($window).bind('resize', function () {
      if ($(window).height() > $("#leden").height() && !$scope.isLoadingMore && !$scope.isLoadingLeden) {
        $scope.ledenLaden();
      }
    });

    function initCriteriaKolommenFilters() {
      $scope.isLoadingFilters = true;

      var deferred = $q.defer();

      var filterCriteria = LFS.getCriteria();
      var filterKolommen = LFS.getKolommen();
      var filters = LFS.getFilters();

      // Alle criteria, kolommen, filters ophalen waarmee de gebruiker kan filteren
      // functies ophalen om functiegroepen van het 'verbond' en de 'groep' samen te stellen
      $q.all([
        $q.all(filterCriteria.promises).then(function () {
          $scope.criteria = filterCriteria.arrCriteria;

          // TODO: add to criteria: leeftijd
          $scope.criteria.push(LFS.getLeeftijdCriterium());

          // TODO: add to criteria: groepseigen veld
          // TODO: add to criteria: individuele steekkaart aangepast
        }),
        $q.all(filterKolommen.promises).then(function () {
          $scope.kolommen = filterKolommen.kolommen;
        }),
        $q.all(filters.promises).then(function () {
          $scope.filters = filters.filters;
        })
      ]).then(function () {
        deferred.resolve();
      });

      return deferred.promise;
    }

    // In deze functie wordt een filter uit de backend gehaald
    // Ook worden alle mogelijke functies/ groepen waartoe de gebruiker toegang heeft opgehaald
    //

    function stelFilterSamen(filterId, initialLoad) {

      var deferred = $q.defer();

      var currFilter = LFS.getFilter(filterId, initialLoad);
      // Filter ophalen adhv filterId
      $q.all(currFilter.promises).then(function () {
        var arrPromises = [];
        $scope.currentFilter = currFilter.currentFilter;
        var geselecteerdeCriteria = [];

        angular.forEach($scope.currentFilter.criteria, function (value, key) {
          // neem alle functies uit criteria met key 'functies'
          if (key === "functies") {

            // voor iedere waarde van huidige criterium 'functies'
            angular.forEach(value, function (functieID) {
              angular.forEach($rootScope.functies, function (apiFunctie) {
                if (apiFunctie.id == functieID) {
                  // check of er al een functiegroep bestaat, indien niet maak die aan
                  if (!LFS.bestaatFunctieGroep(apiFunctie, geselecteerdeCriteria)) {
                    geselecteerdeCriteria = LFS.voegFunctieGroepToeAan(apiFunctie, geselecteerdeCriteria);
                  }
                  // voeg de functie toe aan de functiegroep
                  geselecteerdeCriteria = LFS.voegItemToeAanFunctieGroep(apiFunctie, geselecteerdeCriteria);
                }
              });
            });


          }
          else if (key === "groepen") {
            var items = [];
            // voor iedere waarde van huidige criterium 'groepen'
            angular.forEach(value, function (groepsnummer) {
              var promiseGroep = CS.Groep(groepsnummer).then(
                function (result) {
                  var groep = result;
                  items.push({
                    value: groep.groepsnummer,
                    label: groep.naam + " [" + groep.groepsnummer + "]"
                  });
                }
              );
              arrPromises.push(promiseGroep);

            });
            var tempselectedCriteria = {
              title: key.charAt(0).toUpperCase() + key.slice(1),
              criteriaKey: "groepen",
              multiplePossible: true,
              items: items
            };
            geselecteerdeCriteria.push(tempselectedCriteria);

          }
          else {
            var tempselectedCriteria = {
              title: key.charAt(0).toUpperCase() + key.slice(1),
              items: value
            };
            geselecteerdeCriteria.push(tempselectedCriteria);
          }
        });


        $q.all(arrPromises).then(function () {
          $log.debug('all groepen en functies resolved');
          deferred.resolve();
        });

      });

      return deferred.promise;
    }

    // Zet adhv de ingestelde filter, iedere criteriaCategorie en elk item in de criteriaCategorie op actief
    // Actieve criteriaGroepen worden getoond, Inactieve kunnen worden toegevoegd/geactiveerd
    // Actieve criteriaItems worden getoond, Inactieve kunnen worden toegevoegd/geactiveerd
    var activeerCriteria = function () {
      // haal alle criteriaGroepen keys uit de geselecteerde filter
      _.each($scope.currentFilter.criteria, function (value, key) {
        // indien de key overeenkomt, activeren we de criteriaGroep
        // meerdere criteriaGroepen kunnen een zelfde key hebben
        // (bvb. groepspecifieke functies hebben de criteriaKey 'functies')
        var criteriaGroep = _.filter($scope.criteria, {'criteriaKey': key});
        if (criteriaGroep) {
          if (criteriaGroep.length > 0) {
            _.each(criteriaGroep, function (v) {
              var bIsGroupedCriterium = false;
              if (v.criteriaSubKey == 'verbonds' || v.criteriaSubKey == 'groepspecifiek') {
                bIsGroupedCriterium = true;
              }

              LFS.activeerGroepEnItems(v, value, bIsGroupedCriterium);
            })
          }
        }

      });
    };

    var deactiveerCriteriaAndItems = function () {
      _.each($scope.criteria, function (value) {
        value.activated = false;
        if (value.items) {
          _.each(value.items, function (v) {
            v.activated = false;
          });
        }
        if (value.itemgroups && value.itemgroups.length > 0) {
          _.each(value.itemgroups, function (v) {
            _.each(v.items, function (vv) {
              vv.activated = false;
            })
          })
        }


      })
    };

    var setCurrentFilterLabel = function (str) {
      $scope.currentFilter.naam = str;
    };

    $scope.deactivateCriterium = function (criterium) {
      criterium.activated = false;
      setCurrentFilterLabel('Huidige');
    };

    $scope.isAllCriteriaActive = function () {
      return $scope.criteria.length == $filter('filter')($scope.criteria, {activated: true}).length;
    };
    $scope.addLastCriteriumIfThereIsOnlyOneLeft = function () {
      var deactivatedCriteria = $filter('filter')($scope.criteria, {activated: false});
      if (deactivatedCriteria.length == 1) {
        $scope.activateCriterium(deactivatedCriteria[0]);
      }
    };

    $scope.toggleCriteriumItem = function (criteriumItem, type, criteriumItems) {
      setCurrentFilterLabel('Huidige');
      if (type == 'checkbox') {
        criteriumItem.activated = !!(criteriumItem && !criteriumItem.activated);
      } else if (type == 'radio') {
        _.each(criteriumItems, function (value) {
          value.activated = false;
        });
        criteriumItem.activated = true;
      }
    };

    $scope.getButtonSubtitleSuffix = function (obj) {
      if (obj) {
        if (obj.items !== undefined) {
          obj = obj.items;
        }
        var actCritLength = _.filter(obj, {'activated': true}).length;
        var str = '';
        if (actCritLength > 3) {
          str = ', ...';
        }
        if (actCritLength == 0) {
          str = '\u00A0';
        }
        return str;
      }
    };

    $scope.isAllCriteriumItemsSelected = function (criterium) {
      if (_.filter(criterium.items, {'activated': true}).length == criterium.items.length) {
        return 'all';
      } else {
        if (_.filter(criterium.items, {'activated': true}).length >= 1) {
          return 'some';
        } else {
          return 'none';
        }
      }
    };

    $scope.isAllCriteriumItemGroupsSelected = function (criterium) {
      // wat is het totale aantal items
      var countItems = 0, countActItems = 0;
      _.each(criterium.itemgroups, function (itemgroup) {
        countItems += _.size(itemgroup.items);
      });

      _.each(criterium.itemgroups, function (itemgroup) {
        countActItems += _.size(_.filter(itemgroup.items, {'activated': true}));
      });

      // is dat aantal gelijk aan het aantal geactiveerde?
      if (countItems == countActItems) {
        return 'all';
      } else {
        if (countActItems >= 1) {
          return 'some';
        } else {
          return 'none';
        }
      }
    };
    var setItemsActivated = function (arr, b) {
      _.each(arr, function (value) {
        value.activated = b;
      })
    };

    $scope.toggleAllCriteriumItems = function (criterium) {
      setCurrentFilterLabel("Huidige");
      if ($scope.isAllCriteriumItemsSelected(criterium) == 'all') {
        setItemsActivated(criterium.items, false);
      } else {
        setItemsActivated(criterium.items, true);
      }
    };

    $scope.toggleAllCriteriumItemGroups = function (criterium) {
      setCurrentFilterLabel("Huidige");
      if ($scope.isAllCriteriumItemGroupsSelected(criterium) == 'all') {
        _.each(criterium.itemgroups, function (itemgroup) {
          setItemsActivated(itemgroup.items, false);
        });
      } else {
        _.each(criterium.itemgroups, function (itemgroup) {
          setItemsActivated(itemgroup.items, true);
        });
      }
    };


    $scope.activateCriterium = function (crit) {
      crit.activated = true;
      setCurrentFilterLabel('Huidige');

      if (!crit.multiValues && !(crit.criteriaSubKey == "verbonds" || crit.criteriaSubKey == "groepspecifiek")) {
        if (crit.multiplePossible) {
          _.each(crit.items, function (value) {
            value.activated = true;
          });
        } else {
          if (crit.criteriaKey == 'geslacht') {
            // ladies first!
            _.find(crit.items, {'value': 'vrouw'}).activated = true;
          } else {
            var bAlreadyActive = false;
            _.each(crit.items, function (value) {
              if (value.activated) {
                bAlreadyActive = true;
              }
            });
            if (!bAlreadyActive) {
              crit.items[0].activated = true;
            }
          }

        }
      } else {
        _.each(crit.itemgroups, function (value) {
          _.each(value.items, function (v) {
            v.activated = true;
          })
        })
      }

      // leeftijd criterium
      if (crit.criteriaKey == "leeftijd") {
        $scope.jongerDan = $scope.jongerDan ? $scope.jongerDan : ['49 jaar', 49];
        $scope.ouderDan = $scope.ouderDan ? $scope.ouderDan : ['5 jaar', 5];
        $scope.leeftijdOpDatum = $scope.leeftijdOpDatum ? $scope.leeftijdOpDatum : ['Is nu', true];
      }

    };

    // controle is de criteria geselecteerd a.d.h.v. de titel
    var activeerKolommen = function () {

      var counter = 1000; // meer dan het aantal kolommen
      var counter2 = 0;
      _.each($scope.kolommen, function (kolom) {
        kolom.activated = false;
        kolom.isLoaded = false;
        kolom.kolomIndexOrig = counter;
        counter++;
      });

      _.each($scope.currentFilter.kolommen, function (value) {
        var kolom = _.find($scope.kolommen, {'id': value});

        if (kolom) {
          kolom.isLoaded = true;
          kolom.activated = true;
          kolom.kolomIndex = counter2++;
        }
      });

      $scope.indexeerEnGroepeerKolommen();
    };

    $scope.indexeerEnGroepeerKolommen = function () {

      var counter = 0;
      var actieveKolommen = _.filter($scope.kolommen, function (o) {
        return o.activated
      });
      actieveKolommen = _.sortBy(actieveKolommen, ['kolomIndex']);
      _.forEach(actieveKolommen, function (kolom) {
        kolom.kolomIndex = counter;
        counter++;
      });

      var nonActieveKolommen = _.filter($scope.kolommen, function (o) {
        return !o.activated
      });
      _.forEach(nonActieveKolommen, function (kolom) {
        kolom.kolomIndex = kolom.kolomIndexOrig;
      });

      // groepering
      _.forEach($scope.kolommen, function (kolom) {
        kolom.groepering = kolom.groeperingOrig || kolom.groepering; // reset
        if (kolom.activated) {
          kolom.groeperingOrig = kolom.groepering; // backup
          kolom.groepering = undefined; // override
        }
      });
    };

    $scope.toggleKolom = function (kol) {
      setCurrentFilterLabel("Huidige");
      kol.activated = !!(kol.activated == undefined || kol.activated == false);
      $timeout(function () {
        $scope.indexeerEnGroepeerKolommen();
        $scope.$apply();
      }, 10);
    };

    var createFilterObject = function () {
      var actFilterCriteria = _.filter($scope.criteria, {"activated": true});

      // seleecteer alle actieve kolommen, gesorteerd op kolomIndex
      var tmpactKolommen = _.orderBy(_.filter($scope.kolommen, {"activated": true}), 'kolomIndex', 'asc');
      var actKolommen = [];

      // voor de patch van de filter hebben we enkel de kolom id's nodig
      _.each(tmpactKolommen, function (value) {
        actKolommen.push(value.id);
      });

      // leeftijd criteria
      // voor we het object gaan reconstrueren zetten we de juiste properties op het currentFilter object.
      // Zo kunnen de geselecteerde waarden uit het leefdtijd criterium worden doorgegeven
      var currentFilter = {};
      angular.copy($scope.currentFilter, currentFilter);
      var actLeeftijdCriterium = _.find(actFilterCriteria, {'criteriaKey': 'leeftijd'});
      if (actLeeftijdCriterium) {
        currentFilter.criteria.leeftijd = {};
      }
      if (currentFilter.criteria.leeftijd || actLeeftijdCriterium) {
        currentFilter.criteria.leeftijd.jongerdan = $scope.jongerDan[1];
        currentFilter.criteria.leeftijd.ouderdan = $scope.ouderDan[1];
        currentFilter.criteria.leeftijd.op31december = $scope.leeftijdOpDatum[1];
      }

      currentFilter.sortering = actKolommen.slice(0, 3);

      return LFS.getReconstructedFilterObject(actFilterCriteria, actKolommen, currentFilter);
    };

    var overwriteFilter = function (filter, obj) {
      var deferred = $q.defer();
      obj.naam = filter.naam;

      LFS.saveFilter(filter.id, obj).then(
        function (result) {
          deferred.resolve(result);
        });

      return deferred.promise;
    };

    var createNewFilter = function (filterNaam) {
      $scope.dataLoaded = false;
      var reconstructedFilterObj = createFilterObject();
      reconstructedFilterObj.naam = filterNaam;

      return $q(function (resolve) {
        RestService.createNewFilter.post(reconstructedFilterObj).$promise.then(
          function (response) {
            initCriteriaKolommenFilters().then(function () {
              stelFilterSamen(response.id).then(function () {
                $scope.isLoadingFilters = false;
                // variable om te voorkomen dat content flikkert
                $scope.hasLoadedFilters = true;
                activeerCriteria();
                activeerKolommen();
                $scope.dataLoaded = true;
              });
              resolve(response);
            });
          }
        );
      });
    };

    $scope.verwijderFilter = function (filter) {
      $scope.deletingFilter = true;
      if (filter.naam && filter.id) {
        LFS.deleteFilter(filter.id)
          .then(
            function () {
              _.remove($scope.filters, function (f) {
                return (f.id == filter.id);
              });
              $scope.changeFilter($scope.filters[0]);
            })
          .finally(function () {
            $scope.deletingFilter = false;
          });
      }
    };

    $scope.saveOrOverwriteFilter = function (selectedFilter) {
      $scope.isSavingFilters = true;
      var reconstructedFilterObj = createFilterObject();

      if (selectedFilter.id) {
        var tmpObj = JSON.parse(JSON.stringify(reconstructedFilterObj));
        // bestaande filter overschrijven
        overwriteFilter(selectedFilter, tmpObj).then(function (response) {
          $scope.isSavingFilters = false;
          $scope.showSaveOptions = false;
          _.find($scope.filters, function (f) {
            if (f.id == selectedFilter.id) {
              // De filter id kan veranderd zijn door de API.
              f.id = response.id;
            }
          });
          $scope.currentFilter = response;
        });
      } else {
        // voor de zekerheid leading en trailing whitespaces trimmen
        selectedFilter = selectedFilter.trim();
        var filters = LFS.getFilters();
        $q.all(filters.promises).then(function () {
          // eerst checken of de naam niet overeenkomt met bestaande filter
          // TODO: check op lowercased
          var foundElem = _.find(filters.filters, {'naam': selectedFilter});
          if (foundElem !== undefined) {
            var filterObj = {};
            filterObj.naam = foundElem.naam;
            filterObj.id = foundElem.id;
            // indien overeenkomt, eigen functie opnieuw aanroepen met filter naam en id
            $scope.saveOrOverwriteFilter(filterObj);
          } else {
            // indien de naam niet bestaat, maak nieuwe filterObj
            createNewFilter(selectedFilter).then(function (res) {
              $scope.isSavingFilters = false;
              $scope.showSaveOptions = false;
              $scope.currentFilter = res;
            });
          }
        });

      }

    };

    $scope.changeFilter = function (filter) {
      $scope.dataLoaded = false;
      $scope.isLoadingFilters = true;
      stelFilterSamen(filter.id).then(function () {
        $scope.isLoadingFilters = false;
        deactiveerCriteriaAndItems();
        activeerCriteria();
        activeerKolommen();
        $scope.applyFilter();

      });
    };

    $scope.applyFilter = function (updateDropdownVal) {

      var reconstructedFilterObj = createFilterObject();
      $scope.isSavingFilters = true;

      LFS.saveFilter('huidige', reconstructedFilterObj).then(
        function (response) {
          $scope.isSavingFilters = false;
          _.each($scope.kolommen, function (val) {
            val.isLoaded = !!val.activated;
          });
          // ledenlijst leegmaken
          $scope.leden = [];
          $scope.totaalAantalLeden = -1;
          $scope.ledenLaden();
          if (updateDropdownVal) {
            $scope.currentFilter = response;
          }

        });
    };

    angular.element($window).bind("scroll", function () {
      $scope.setStickyTableHeader();
    });
    angular.element($window).bind("resize", function () {
      $scope.setStickyTableHeader();
    });

    $scope.setStickyTableHeader = function () {
      var $panelheading = angular.element('.panel-heading');
      var $panelfilter = angular.element('.panel-filter');
      var $navbarInnerHeight = angular.element('.navbar-default').innerHeight();
      var $globalMenuOuterHeight = angular.element('#global-menu').outerHeight();
      var $tableHead = angular.element('.panel-default > table#leden');
      var panelFilterHeight;
      $tableHead.css({'width': $panelheading.outerWidth()});

      if ($scope.isFilterCollapsed) {
        panelFilterHeight = 0;
      } else {
        panelFilterHeight = $panelfilter.outerHeight();
      }

      if (window.scrollY >= $panelheading.outerHeight() + panelFilterHeight) {

        $tableHead.css({'top': $navbarInnerHeight + $globalMenuOuterHeight});
        if (!$scope.tableheaderIsSticky) {
          $scope.tableheaderIsSticky = true;
          $scope.$apply();
        } else {
          $scope.tableheaderIsSticky = true;
        }

      } else {
        $scope.tableheaderIsSticky = false;
        $scope.$apply();
      }
    };

    /*
     * Infinity scroll
     * -----------------------------------------------------------
     */

    // controle moet er meer leden ingeladen worden
    $scope.ledenLaden = function () {
      if ($scope.isLoadingLeden || $scope.isLoadingMore) {
        return;
      }

      var offset = $scope.leden.length ? $scope.leden.length : 0;
      if (offset == 0) {
        $scope.isLoadingLeden = true;
      } else {
        $scope.isLoadingMore = true;
      }

      if ($scope.leden.length !== $scope.totaalAantalLeden) {

        LLS.getLeden(offset).then(
          function (res) {
            $scope.aantalLedenGeladen = $scope.aantalPerPagina;
            _.each(res.leden, function (val) {
              $scope.leden.push(val);
            });
            $scope.totaalAantalLeden = res.totaal;
            $scope.offset = res.offset;
            $scope.isLoadingLeden = false;
            $scope.isLoadingMore = false;
            // for use in lidcontroller (next-prev)
            $rootScope.leden = $scope.leden;
            $scope.dataLoaded = true;
            _.defer(function () {
              $scope.$apply();
            });
          }
        );
      } else {
        $scope.isLoadingLeden = false;
        $scope.isLoadingMore = false;
        $scope.dataLoaded = true;
      }
    };


    /*
     * Sortering
     * ------------------------------------------------------------------
     */

    // controle voor de sortering
    // returnt het nummer volgens de volgorde van de sortering als de kolom in de sortering zit en
    // wanner de volgorde die meegegeven is overeenkomt met de volgorde in de sortering.

    $scope.sortering = function (kolomId, volgorde) {
      var returnValue = false;
      angular.forEach($scope.currentFilter.sortering, function (value, key) {
        if (value.kolom == kolomId && value.oplopend == volgorde) {
          switch (key) {
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
    };

    // uitvoeren van van een sortering.
    $scope.addSort = function (sortKolom) {
      var kolomVerplaatst = false;
      _.each($scope.kolommen, function(kolom, index) {
        if (kolom.id === sortKolom.id) {
          kolom.kolomIndex = 0;
          kolomVerplaatst = true;
        }
        else if(!kolomVerplaatst) {
          kolom.kolomIndex = kolom.kolomIndex + 1;
        }
      });
      $scope.applyFilter();
    };

    $scope.toggleCriteriumSection = function (obj) {
      obj.collapsed = !obj.collapsed;
    };

    $scope.getButtonSubtitle = function (crit, b) {
      return LFS.getSelectionSummary(crit, b);
    };

    $scope.toggleFilter = function () {
      $scope.isFilterCollapsed = !$scope.isFilterCollapsed;
    };

    $scope.export = function (type, extension) {
      $scope.exportButtons[type + extension].isLoading = true;
      LLS.export(type, extension).then(function (res) {
        $scope.exportButtons[type + extension].isLoading = false;
        var a = document.createElement('a');
        a.href = res.fileUrl;
        a.download = res.title;
        document.body.appendChild(a);
        a.click();
      }, function () {
        AlertService.add('danger', "De ledenlijst kon niet worden geëxporteerd");
        $scope.exportButtons[type + extension].isLoading = false;
      })
    };

    $scope.nieuwlid = function () {
      $location.path("/lid/toevoegen");
    };
    $scope.redirectToEmailPage = function () {
      $location.path("/email/ledenlijst");
    };
    $scope.redirectToEtikettenPage = function () {
      $location.path("/etiketten");
    };

    function init() {

      $scope.isFilterCollapsed = true;

      $scope.exportButtons = {
        'lijstpdf': {isLoading: false},
        'lijstcsv': {isLoading: false},
        'steekkaartenpdf': {isLoading: false}
      };

      initCriteriaKolommenFilters().then(function () {
        var isInitialLoad = true;
        stelFilterSamen('huidige', isInitialLoad).then(function () {
          $scope.ledenLaden();
          $scope.isLoadingFilters = false;
          // variable om te voorkomen dat content flikkert
          $scope.hasLoadedFilters = true;
          activeerCriteria();
          activeerKolommen();
          $scope.dataLoaded = true;
        });
      });


    }

    $rootScope.$on('leeftijdCriterium', function (event, data) {
      var label = data.op31december ? 'was op 31 december' : 'Is nu';
      $scope.leeftijdOpDatum = [label, data.op31december];
      label = data.ouderdan == -1 ? '-' : data.ouderdan + ' jaar';
      $scope.ouderDan = [label, data.ouderdan];
      label = data.jongerdan == -1 ? '-' : data.jongerdan + ' jaar';
      $scope.jongerDan = [label, data.jongerdan];
    });

    $scope.updateLeeftijdOpDatum = function (opdatum) {
      $scope.leeftijdOpDatum = opdatum;
    };
    $scope.updateOuderDan = function (ouderdan) {
      $scope.ouderDan = ouderdan;
    };
    $scope.updateJongerDan = function (jongerdan) {
      $scope.jongerDan = jongerdan;
    };

    init();
  }
})();

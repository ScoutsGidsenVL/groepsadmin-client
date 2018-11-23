(function () {
  'use strict';

  angular
    .module('ga.lidcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('LidController', LidController);

  LidController.$inject = ['$location', '$rootScope', '$routeParams', '$scope', '$timeout', '$window', 'AlertService',
    'DialogService', 'LedenLijstService', 'LidService', 'RestService', 'UserAccess', 'FormValidationService', 'CacheService'];

  function LidController($location, $rootScope, $routeParams, $scope, $timeout, $window, AlertService,
                         DialogService, LLS, LS, RestService, UserAccess, FVS, CS) {

    var reloadGroepen;
    $scope.lidPropertiesWatchable = false;
    $scope.heeftGroepseigenvelden = false;
    $scope.functiesEnGroepenGeladen = false;
    angular.extend($scope, LS.publicProperties, LS.publicMethods);

    var init = function () {
      $scope.validationErrors = [];

      if ($routeParams.id == 'profiel') {
        $scope.isEigenProfiel = true;
      }

      $scope.canPost = false;

      UserAccess.hasAccessTo("nieuw lid").then(function (res) {
        $scope.canPost = res;
      });

      if ($routeParams.id !== 'profiel') {
        $scope.prevLid = LLS.getNextPrevLid($routeParams.id, $rootScope.leden)[0];
        $scope.nextLid = LLS.getNextPrevLid($routeParams.id, $rootScope.leden)[1];
      }

      RestService.Lid.get({id: $routeParams.id}).$promise.then(
        function (result) {
          $scope.lid = result;
          loadSuccess($scope.lid);
          initModel();

          $timeout(function () {
            // pas wanneer de lid gegevens geladen zijn mag $watch (in de loadSuccess() functie) controle toepassen op changes
            $scope.lidPropertiesWatchable = true;
          }, 2000);

        },
        function (error) {
          if (error.data && error.data.beschrijving == "Geen leesrechten op dit lid") {
            //redirect to lid overzicht.
            $location.path('/');
            AlertService.add('danger', "Je hebt geen leesrechten op dit lid.");
          }
          else {
            AlertService.add('danger', error);
          }
        }
      );
    };

    /*
     * Algemeen
     * ---------------------------------------
     */

    // initialisatie

    $scope.$watch('lidPropertiesWatchable', function(watchable) {
      if (watchable && !lidForm.$valid) {
        $scope.openAndHighlightCollapsedInvalidBlocks();
      }
    });

    function loadSuccess() {
      var sectie;

      // init watch, naar welke secties/objecten/delen van het lid object moet er gekeken worden om aanpassingen bij te houden?
      angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam', 'lid.contacten', 'lid.adressen', 'lid.functies', 'lid.groepseigenVelden', 'lid.vgagegevens'], function (value) {
        $scope.$watch(value, function (newVal, oldVal, scope) {
            if ($scope.lidPropertiesWatchable) {
              if (newVal == oldVal) return;
              // sectie is bvb. vgagegevens of functies of persoonsgegevens
              sectie = value.split(".").pop();
              // de gewijzigde sectie toevoegen aan de changes, indien deze sectie nog niet werd toegevoegd
              if ($scope.lid.changes) {
                if ($scope.lid.changes.indexOf(sectie) < 0) {
                  $scope.lid.changes.push(sectie);
                }
              }

              if ($scope.lidForm.$dirty) {
                $window.onbeforeunload = unload;
              }


            }
            if (value == 'lid.functies') {
              $scope.orderedFuncties = _(scope.lid.functies)
                .sortBy(function(x) {return x.groep})
                .groupBy(function(x) {return x.groep})
                .map(function(value, key) { return {
                  groep: key,
                  functies: value,
                  toonGroepInActueleLijst: !_.every(value, function(el) {return el.einde})
                }})
                .value();
            }
          },
          true);
      });

      // $scope.patchObj bevat hierna alle secties die kunnen worden gepatched
      $scope.patchObj = $.grep($scope.lid.links, function (e) {
        return e.method == "PATCH";
      })[0];

      // kan de gebruiker functies stoppen van het lid?
      if ($scope.patchObj) {
        var someSect = _.some($scope.patchObj.secties, function (value) {
          return value.indexOf('functies.') != -1;
        });

        // kan de gebruiker functie stoppen van het lid?
        $scope.canSave = _.has($scope, 'patchObj.secties');

        if ($scope.canSave && someSect) {
          $scope.kanSchrappen = true;
        }
      }


      //init functies;
      CS.Functies().then(function (functiesres) {
        var functies = functiesres;
        CS.Groepen().then(function (groepenres) {
          functiesEnGroepen(functies, groepenres);
        })
      });

    }

    function functiesEnGroepen(functies, groepen) {
      $scope.groepEnfuncties = [];
      angular.forEach(groepen.groepen, function (value) {
        var tempGroep = value;
        tempGroep.functies = [];
        angular.forEach(functies.functies, function (value2) {
          if (value2.groepen.indexOf(tempGroep.groepsnummer) != -1) {
            tempGroep.functies.push(value2);
          }
        });
        $scope.groepEnfuncties.push(tempGroep);
      });

      $scope.functiesEnGroepenGeladen = true;
      $scope.showFunctieToevoegen = false;
      // controle of de functies weergegeven mogen worden
      angular.forEach($scope.groepEnfuncties, function (groepFuncties) {
        $scope.showFunctieToevoegen |= $scope.hasPermission('functies.' + groepFuncties.groepsnummer);
      });
    }

    function initModel() {
      // Changes object bijhouden: enkel de gewijzigde properties meesturen met PATCH
      $scope.lid.changes = [];

      $scope.lid.vgagegevens.geboortedatum = moment($scope.lid.vgagegevens.geboortedatum, 'YYYY-MM-DD').toDate();

      // Functiehistoriek weergeven/verbergen
      $scope.toonActueleFuncties = true;

      // Functies samenvoegen in één Array (Tijdelijk tot API update)
      var f = [];
      angular.forEach($scope.lid.functies, function (value) {
        f = f.concat(value);
      });
      $scope.lid.functies = f;

      // Alle actieve functies ophalen
      $scope.functieslijst = [];
      angular.forEach($scope.lid.functies, function (value) {
        if ($scope.functieslijst[value.functie] === undefined) {
          $scope.functieslijst[value.functie] = {};
          CS.Functie(value.functie)
            .then(
              function (result) {
                $scope.functieslijst[value.functie] = result;
              });
        }
      });

      // Alle actieve groepen ophalen
      $scope.groepenlijst = [];

      angular.forEach($scope.lid.functies, function (value) {
        if ($scope.groepenlijst[value.groep]) return;

        CS.Groep(value.groep)
          .then(function (result) {
            $scope.groepenlijst[value.groep] = result;
          });
      });

      angular.forEach($scope.lid.adressen, function (value) {
        if (value.postadres == true) {
          $scope.postadres = value.id;
        }
      });

      angular.forEach($scope.lid.groepseigenVelden, function (groep) {
        if (groep.schema.length > 0) {
          $scope.heeftGroepseigenvelden = true;
        }
      });
    }

    // nieuw lid initialiseren na update.
    function initAangepastLid() {
      //changes array aanmaken
      $timeout(function () {
        $scope.lid.changes = [];
      }, 20);
    }

    // Schrijfrechten kunnen per sectie ingesteld zijn. Controlleer als sectienaam voorkomt in PATCH opties.
    // Mogelijke sectienamen van een lid zijn "persoonsgegevens", "adressen", "email", "functies.*", "groepseigen.*".
    $scope.hasPermission = function (val) {
      return _.has($scope, 'patchObj.secties') && $scope.patchObj.secties.indexOf(val) > -1;
    };

    $scope.disableVoorNieuwLid = function(){
      return false;
    };

    // functie meteen stop zetten.
    $scope.stopFunctie = function (functie) {
      var lid = {
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies: [
          {
            functie: functie.functie,
            groep: functie.groep,
            einde: new Date(),
            begin: functie.begin
          }
        ]
      };

      RestService.Lid.update({id: lid.id, bevestiging: false}, lid).$promise.then(
        function (response) {
          AlertService.add('success', 'Functie is geschrapt.');
          $scope.lid.functies = response.functies;
          initAangepastLid();
        },
        function (error) {
          if (error.data && error.data.vraag) {
            initAangepastLid();
            $window.onbeforeunload = null;
          } else if (error.status == 403) {
            AlertService.add('warning', error);
          } else {
            AlertService.add('danger', error);
          }
        }
      );
    };

    // controle ofdat het lid reeds deze functie had voordat er aanapssingen gedaan werden.
    // zodat deze niet weergegeven wordt in de keuzelijst.
    // functies die gestart worden tijdens deze sessie worden wel weergegeven in de lijst
    $scope.checkFunctie = function (groep, functie) {
      var check = false;
      angular.forEach($scope.lid.functies, function (value) {
        if (value.groep == groep && value.functie == functie && value.temp != "tijdelijk" && value.einde == undefined) {
          check = true;

        }
      });
      return check
    };


    /*
     * Panel header functionaliteit
     * ---------------------------------------
     */

    $scope.nieuwlid = function () {
      $location.path("/lid/toevoegen");
    };

    // nieuw gezindslid aanmaken
    $scope.gezinslid = function () {
      //bereid lid voor om doorgegeven te worden.
      $rootScope.defaultLid = {
        vgagegevens: {
          achternaam: $scope.lid.vgagegevens.achternaam
        },
        persoonsgegevens: {
          verminderdlidgeld: false,
          beperking: false,
          geslacht: 'vrouw'
        },
        adressen: $scope.lid.adressen,
        contacten: $scope.lid.contacten,
        functies: []
      };
      $location.path("/lid/toevoegen");
    };

    // schrap het lid
    $scope.schrap = function () {
      //alle functies op non actief zetten;
      var lid = {
        id: $scope.lid.id,  // Overbodig? id zit al in PATCH url
        functies: []
      };
      angular.forEach($scope.lid.functies, function (value) {
        //functies toegevoegd tijdens deze sesie worden nog niet doorgegevens
        if (value.temp != "tijdelijk") {
          var functieInstantie = {
            functie: value.functie,
            groep: value.groep,
            einde: new Date(),
            begin: value.begin
          };
          lid.functies.push(functieInstantie);
        }
      });


      RestService.Lid.update({id: lid.id, bevestiging: false}, lid).$promise.then(
        function (response) {
          AlertService.add('success ', 'Alle actieve functies werden geschrapt.');
          $scope.lid = response;
          initAangepastLid();
        },
        function (error) {
          if (error.status == 403) {
            AlertService.add('warning', 'De VGA-functie kan niet geschrapt worden. <a href=" https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginahulp:_src_4_TContentFunctionsEntry_OUTPUT_KAN_NIET_STOPZETTEN">Meer info</a>');
          }
          else {
            AlertService.add('danger', error);
          }
        }
      );
    };

    // alle aanpassingen opslaan
    $scope.opslaan = function () {

      var origineleGroepseigenVelden = $scope.lid.groepseigenVelden;
      // backend accepteert geen lege string voor rekeningnummer

      if ($scope.lid.persoonsgegevens.rekeningnummer == "") {
        $scope.lid.persoonsgegevens.rekeningnummer = null;
      }

      if ($scope.lid.changes.indexOf("groepseigenVelden") != -1) {

        // Deep copy - https://stackoverflow.com/a/5344074
        $scope.lid.groepseigenVelden = JSON.parse(JSON.stringify($scope.lid.groepseigenVelden));

        _.forOwn($scope.lid.groepseigenVelden, function (groepseigenVelden) {
          _.forEach(groepseigenVelden.schema, function (veld) {
            if (!veld.kanGebruikerWijzigen) {
              delete groepseigenVelden.waarden[veld.id];
            }
          });
        });
      }

      reloadGroepen = $scope.lid.changes.indexOf('functies') !== -1;

      //indien er zowel een adres als een contact werd aangepast
      if ($scope.lid.changes.indexOf("adressen") != -1 && $scope.lid.changes.indexOf("contacten") != -1) {
        $scope.saving = true;
        //als er aanpassingen gebeurd zijn aan de contacten en tegelijk ook aan de adressen worden eerst de adressen toegevoegd en daarna de contacten.
        var adressen = $scope.lid.adressen;
        var contacten = $scope.lid.contacten;
        //eerst adressen committen
        $scope.lid.changes.splice($scope.lid.changes.indexOf("contacten"), 1);
        $scope.lid.$update(function (response) {
          //connect oude adressen met nieuwe
          if (reloadGroepen) {
            CS.Groepen(true);
          }
          var adressenIndex = [];
          angular.forEach(adressen, function (adres) {
            angular.forEach(response.adressen, function (newadres) {
              if (adres.giscode == newadres.giscode) {
                adressenIndex[adres.id] = newadres.id;
              }
            });
          });
          //vervang oude adresid's in contacten
          angular.forEach(contacten, function (contact) {
            contact.adres = adressenIndex[contact.adres];
          });
          //console.log(contacten);
          $scope.lid.contacten = contacten;
          $scope.lid.changes = [];

          //aangepaste contacten opsturen naar server.
          $scope.lid.$update(function () {
            $scope.saving = false;
            AlertService.add('success ', "Aanpassingen opgeslagen");
            $scope.lid.groepseigenVelden = origineleGroepseigenVelden;
            initAangepastLid();
            $window.onbeforeunload = null;
          });
          initAangepastLid();
        });
      } else {
        $scope.saving = true;
        $scope.lid.$update(
          function () {
            $scope.saving = false;
            if (reloadGroepen) {
              CS.Groepen(true);
            }
            AlertService.add('success ', "Aanpassingen opgeslagen");
            $scope.lid.groepseigenVelden = origineleGroepseigenVelden;
            initAangepastLid();
            $window.onbeforeunload = null;
            $scope.validationErrors = [];
            $scope.lidForm.$setPristine();
          },
          function (error) {
            $scope.saving = false;
            console.log('error bij update van lid', error);

            if (error.data.fouten && error.data.fouten.length >= 1) {
              _.each(error.data.fouten, function (fout) {

                // de backend geeft om een nog onduidelijke reden soms 'veld is verplicht' terug op contactnamen terwijl ze niet verplicht zijn
                // tijdelijk vangen we dit op met een isRequired property
                // TODO: onderstaande lijn verwijderen en in de template 'ng-required' niet meer checken op isRequired zodra backend deze fout niet meer geeft

                if (fout.veld.indexOf('contacten') > -1) {
                  var formElemNameCont = FVS.getFormElemByErrData('contacten', fout);
                  $scope.lidForm[formElemNameCont].isRequired = true;
                }

                if (fout.veld.indexOf('adressen') > -1) {
                  var formElemNameAdr = FVS.getFormElemByErrData('adressen', fout);
                  $scope.lidForm[formElemNameAdr].isRequired = true;
                }

              })
            }

            if (error.data.titel == "Validatie faalde voor Lid") {
              $scope.validationErrors = error.data.details;
            }
          }
        );
      }
    };

    /*
     * Pagina event listeners
     * ---------------------------------------
     */

    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl) {
      if ($scope.lidForm.$dirty) {
        event.preventDefault();
        DialogService.paginaVerlaten($scope.locationChange, newUrl);
      }
    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function (result, url) {
      if (result) {
        $scope.lidForm.$setPristine();
        $window.onbeforeunload = null;
        $scope.lid.changes = [];
        $window.location.href = url;
      }
    };

    $scope.submitForm = function () {
      $scope.opslaan();
    };

    $scope.redirectToEmailPage = function (id) {
      $location.path('/email/' + id);
    };

    $scope.$watch('lidForm.$valid', function (validity) {
      if (!validity) {
        $scope.openAndHighlightCollapsedInvalidBlocks();
      } else {
        $scope.unHighlightInvalidBlocks();
      }
    });

    $scope.gotoLid = function (direction) {
      if (direction == "next") {
        $location.path("/lid/" + $scope.nextLid.id);
      }
      if (direction == "prev") {
        $location.path("/lid/" + $scope.prevLid.id);
      }
    };

    // refresh of navigatie naar een andere pagina.
    var unload = function (e) {
      e.returnValue = "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?";
      return e.returnValue;
    };


    init();
  }
})();

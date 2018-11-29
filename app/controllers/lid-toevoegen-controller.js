(function () {
  'use strict';

  angular
    .module('ga.lidtoevoegencontroller', ['ga.services.alert', 'ga.services.dialog'])
    .controller('LidToevoegenController', LidToevoegenController);

  LidToevoegenController.$inject = ['$scope', '$location', '$timeout', '$window', '$http', 'CacheService', 'LidService',
    'RestService', 'AlertService', 'DialogService', '$rootScope', '$route', 'access', 'AdresService'];

  function LidToevoegenController($scope, $location, $timeout, $window, $http, CS, LS, RestService, AlertService,
                                  DialogService, $rootScope, $route, access, AdresService) {

    var aangemeldeGebruiker = {};

    $scope.formInitiated = false;
    $scope.functiesEnGroepenGeladen = false;
    $scope.isNieuwLidForm = true;
    $scope.showFunctieToevoegen = true;

    angular.extend($scope, LS.publicProperties, LS.publicMethods, AdresService.publicMethods);

    if (!access) {
      $location.path("/lid/profiel");
    }

    var init = function () {
      // TODO - controle of de gebruiker wel nieuwe leden kan maken
      //        => anders redirect naar ledenlijst

      // huidige gebruiker opvragen, om de secties te kunnen bekijken die de gebruiker mag mee sturen

      RestService.Lid.get({id: 'profiel'}).$promise.then(
        function (result) {
          aangemeldeGebruiker = result;
          $scope.patchObj = $.grep(aangemeldeGebruiker.links, function (e) {
            return e.method == "PATCH";
          })[0];
        },
        function (error) {
        }
      );

      $scope.suggesties = [];

      // used by errorbutton
      $scope.lidPropertiesWatchable = true;

      /*
       * Initialisatie van het nieuwe lid model
       * ---------------------------------------
       */
      var lid = {};
      lid.functies = [];
      lid.changes = [];
      lid.persoonsgegevens = {};
      lid.persoonsgegevens.geslacht = "vrouw";
      lid.email = null;
      lid.gebruikersnaam = null;
      lid.vgagegevens = {};
      lid.contacten = [];
      lid.adressen = [];
      lid.adressen[0] = {
        land: "BE",
        postadres: true,
        omschrijving: "",
        id: 'tempadres' + Date.now(),
        bus: null
      };

      if ($rootScope.defaultLid) {
        $scope.lidaanvraag = $rootScope.defaultLid.lidaanvraag;
        delete $rootScope.defaultLid.lidaanvraag;

        angular.extend(lid, $rootScope.defaultLid);

        angular.forEach(lid.adressen, function (adres) {
          var randomId = "" + Date.now();
          angular.forEach(lid.contacten, function (contact, key) {
            if (adres.id == contact.adres) {
              contact.adres = randomId;
            }
            contact.id = key;
          });
          adres.id = randomId;
        });

        delete $rootScope.defaultLid;
      }

      lid.vgagegevens.verminderdlidgeld = lid.vgagegevens.verminderdlidgeld || false;
      lid.vgagegevens.beperking = lid.vgagegevens.beperking || false;

      $scope.lid = lid;
      $scope.lid.adressen[0].showme = true;

      if ($scope.lidaanvraag) {
        $scope.updateSuggesties();
      }

      /*
       * Initialisatie van andere benodigdheden.
       * ---------------------------------------
       */
      // functies ophalen enkel voor de groepen waarvan de gebruiker vga is
      CS.Functies().then(
        function (result) {
          $scope.functies = result;
          CS.Groepen().then(
            function (result) {
              //herordenen zodat ze eenvoudig gebruikt kunnen worden in de template;
              $scope.groepEnfuncties = [];
              angular.forEach(result.groepen, function (value) {
                var tempGroep = {};
                tempGroep.functies = [];
                tempGroep.groepsnummer = value.groepsnummer;
                tempGroep.groepseigenGegevens = value.groepseigenGegevens;
                tempGroep.naam = value.naam;
                angular.forEach($scope.functies.functies, function (value2) {
                  if (value2.groepen.indexOf(value.groepsnummer) != -1) {
                    tempGroep.functies.push(value2);
                  }
                });
                $scope.groepEnfuncties.push(tempGroep);
              });
              $scope.functiesEnGroepenGeladen = true;
            }
          );
        }
      );

      $timeout(function () {
        $scope.formInitiated = true;
      }, 4000);
    };

    /*
     * Controle ofdat de sectie aangepast mag worden.
     * ---------------------------------------
     */
    $scope.hasPermission = function () {
      return true;
    };

    $scope.disableVoorNieuwLid = function(val){
      var check = false;
      if (val === "FV" || val === "VGA") {
        check = true
      }
      return check;
    };

    function setChanges() {
      if ($scope.lidForm.$dirty) {
        $window.onbeforeunload = unload;
      }
    }

    angular.forEach(['lid.persoonsgegevens', 'lid.email', 'lid.gebruikersnaam', 'lid.contacten', 'lid.adressen', 'lid.functies'], function (value) {
      $scope.$watch(value, setChanges, true);
    });

    /*
     * Opslaan van het nieuwe lid
     * ---------------------------------------
     */

    $scope.opslaan = function () {
      $scope.saving = true;
      var origineelLid = {};
      angular.copy($scope.lid, origineelLid);
      //lid voorbereiden voor verzenden
      if (origineelLid.functies.length > 0) {
        origineelLid.functies = [];
        origineelLid.functies.push($scope.lid.functies[0]);
      } else {
        origineelLid.functies = [];
      }

      RestService.LidAdd.save(origineelLid).$promise.then(
        function (response) {
          if ($scope.lidaanvraag) {
            $http({
              url: $scope.lidaanvraag.href,
              method: $scope.lidaanvraag.method
            })
          }

          if ($scope.lid.functies.length > 1) {
            var patchDeel = {};
            patchDeel.functies = $scope.lid.functies.splice(1, $scope.lid.functies.length - 1);

            RestService.Lid.update({id: response.id}, patchDeel).$promise.then(
              function (response) {
                $scope.lidForm.$setPristine();
                $location.path("/lid/" + response.id);
                $scope.saving = false;
                AlertService.add('success ', "Lid toegevoegd");
              },
              function (error) {
                $scope.saving = false;
                AlertService.add('danger', error);
              }
            );
          } else {
            $scope.lidForm.$setPristine();
            $location.path("/lid/" + response.id);
            $scope.saving = false;
            AlertService.add('success ', "Lid toegevoegd");
          }
        },
        function (error) {
          $scope.saving = false;
          if (error.status == 403) {
            AlertService.add('warning', error);
          }
          else if (error.data.fouten && error.data.fouten.length >= 1) {
            _.each(error.data.fouten, function (fout) {
              console.log("FOUT", fout);
              $scope[fout.veld + 'Error'] = true;
            });
          }
          else {
            AlertService.add('danger', error);
          }
        }
      );
    };

    /*
     * Header functionaliteit
     * ---------------------------------------
     */
    $scope.nieuw = function () {
      $route.reload();
    };

    /*
     * page Change functionaliteit
     * ---------------------------------------
     */
    // listener voor wanneer een gebruiker van pagina veranderd en er zijn nog openstaande aanpassingen.
    $scope.$on('$locationChangeStart', function (event, newUrl) {
      if ($scope.lidForm.$dirty) {
        if (newUrl.indexOf('?suggestie=1')) {
          //suggestie geklikt, dus vraag hoeft niet gesteld te worden
        }
        else {
          event.preventDefault();
          DialogService.paginaVerlaten($scope.locationChange, newUrl);
        }
      }
    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function (result, url) {
      if (result) {
        $scope.lidForm.$setPristine();
        $scope.lid.changes = [];
        $window.location.href = url;
      }
    };

    $scope.$watch('lidForm.$valid', function (validity) {
      if ($scope.formInitiated == true) {
        if (!validity) {
          $scope.openAndHighlightCollapsedInvalidBlocks();
        } else {
          $scope.unHighlightInvalidBlocks();
        }
      }
    });

    $scope.updateSuggesties = function () {
      return RestService.GelijkaardigZoeken.get({
        voornaam: $scope.lid.vgagegevens.voornaam,
        achternaam: $scope.lid.vgagegevens.achternaam
      }).$promise.then(function (result) {
        console.log(result.leden);

        if (0 < result.leden.length) {
          AlertService.add('warning', "Er zijn leden gevonden met een gelijkaardige naam. Ga naar het juiste lid of negeer dit bericht: ", result.leden);
        }
      });
    };

    // refresh of navigatie naar een andere pagina.
    var unload = function (e) {
      e.returnValue = "Er zijn nog niet opgeslagen wijzigingen. Ben je zeker dat je wil verdergaan?";
      return e.returnValue;
    };

    init();
  }
})();

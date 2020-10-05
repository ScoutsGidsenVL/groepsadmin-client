(function () {
  'use strict';

  angular
    .module('ga.groepcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('GroepController', GroepController);

  GroepController.$inject = ['$q', '$scope', '$location', '$timeout', '$window', 'RestService', 'CacheService', 'access',
    'DialogService'];

  function GroepController($q, $scope, $location, $timeout, $window, RestService, CS, access, DialogService) {
    if (!access) {
      $location.path("/lid/profiel");
    }
    $scope.baseUrl = $location.absUrl().split('#' + $location.path())[0] + 'formulier.html#/lidworden?groep=';
    $scope.markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var contacten = {}, deregisterListener;
    var specialeFuncties = {
      vga: 'd5f75b320b812440010b812555970393',
      fv: 'd5f75b320b812440010b812553d5032e'
    };

    $scope.data = {};
    $scope.data.groepenlijst = [];
    $scope.contactenGeladen = false;


    function groepenGeladen(result) {
      $scope.data.groepenlijst.splice(0);
      //tijdelijk extra velden toevoegen aan het resultaat
      angular.forEach(result.groepen, function (groep) {
        groep.vga = [];
        groep.fv = [];
        groep.groepsleiding = [];

        if (groep.facturatieLeden) {
          groep.facturatieLedenSaved = true;
          groep.facturatieLedenCheck = true;
        }

        if (groep.facturatieLeiding) {
          groep.facturatieLeidingSaved = true;
          groep.facturatieLeidingCheck = true;
        }

        _.forEach(groep.contacten, function (contact) {
          var groepering;
          if (contact.oidFunctie == specialeFuncties.vga) {
            groepering = groep.vga;
          } else if (contact.oidFunctie == specialeFuncties.fv) {
            groepering = groep.fv;
          } else {
            groepering = groep.groepsleiding
          }

          if (contacten[contact.oidLid] === undefined) {
            contacten[contact.oidLid] = [];
          }

          contacten[contact.oidLid].push(groepering);
        });

        groep.adres = [
          groep.adres
        ];

        groep.groepseigenGegevens = _.sortBy(groep.groepseigenGegevens, 'sort');

        angular.forEach(groep.groepseigenGegevens, function (gegeven, index) {
          gegeven.sort = index;
          if (gegeven.type === 'lijst') {
            gegeven.keuzes = gegeven.keuzes || [];
            gegeven.keuzes.push('');
          }
        });

        groep.kanWijzigen = (_.find(groep.links, {method: 'PATCH'}) !== undefined);
        $scope.data.groepenlijst.push(groep);
      });


      angular.forEach(contacten, function (groeplijst, id) {
        RestService.Lid.get({id: id}).$promise.then(function (res) {
          angular.forEach(groeplijst, function (groepering) {
            groepering.push({
              naam: res.vgagegevens.voornaam + ' ' + res.vgagegevens.achternaam,
              email: res.email
            });

          });

          delete contacten[id];
          if ($.isEmptyObject(contacten)) {
            $scope.contactenGeladen = true;
          }
        });
      });

      // by default is de eerste groep actief

      if (!$scope.data.activegroup) {
        $scope.data.activegroup = $scope.data.groepenlijst[0];
        $scope.previousgroupId = $scope.data.activegroup.id;
        $scope.formulierUrl = $scope.baseUrl + $scope.data.activegroup.id;
        $timeout(maakSorteerbaar, 0);
        loadGoogleMap();
      }
      else {
        angular.forEach($scope.data.groepenlijst, function (groep) {
          if (groep.id == $scope.data.activegroup.id) {
            $scope.data.activegroup = groep;
            $scope.previousgroupId = $scope.data.activegroup.id;
          }
        })
      }

      $scope.data.publiekInschrijven = $scope.data.activegroup['publiek-inschrijven'];

      if (deregisterListener) {
        deregisterListener();
      }
      deregisterListener = $scope.$on("ga-groepen-geladen", function (event, result) {
        groepenGeladen(result);
      });
    }


    // groepen ophalen
    CS.Groepen().then(
      groepenGeladen,
      function (Error) {
      }
    );

    /*
     * Google Maps Functies
     * ----------------------------------
     */

    var loadGoogleMapsScript = function (callback) {
      var googleMapsKey = '';
      switch (window.location.origin) {
        case 'http://localhost:8000':
          googleMapsKey = 'AIzaSyBQRUONtrmAcJ96_NILKeRvj5F5nXRh2MM';
          break;
        case 'https://ga-dev-tvl.scoutsengidsenvlaanderen.be':
          googleMapsKey = 'AIzaSyBiKzCCqMUyu4mW0rKk777CU3pW86FZiJ8';
          break;
        case 'https://ga-staging.scoutsengidsenvlaanderen.be':
          googleMapsKey = 'AIzaSyBZU1SgLDbOfAlROSnR_cb_wWQGlQRqMqc';
          break;
        case 'https://groepsadmin.scoutsengidsenvlaanderen.be':
          googleMapsKey = 'AIzaSyAbMpNtZ1YdLg8qjlDqLjGXisPAFp88QA8';
          break;

      }

      window.googleMapsCallback = callback;

      var script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + googleMapsKey + '&callback=googleMapsCallback';
      document.head.appendChild(script);
    };

    // initialize Google Map
    var loadGoogleMap = function () {
      if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        loadGoogleMapsScript(loadGoogleMap);
        return;
      }

      var center = berekenCenter($scope.data.activegroup.adressen);
      if (!$scope.googleMap) {
        var mapOptions = {
          zoom: 15,
          center: center
        };
        $scope.googleMap = new google.maps.Map(document.getElementById("lokalen-kaart"), mapOptions);
      } else {
        $scope.googleMap.setCenter(center);
      }

      markersTekenen($scope.googleMap, $scope.data.activegroup.adressen, $scope.data.activegroup.kanWijzigen);
    };

    var berekenCenter = function (adressen) {
      // Gebaseerd op de grenzen van Vlaanderen
      var minLat = 52; // bovengrens
      var maxLat = 50; // ondergrens
      var minLng = 7; // bovengrens
      var maxLng = 2; // ondergrens
      angular.forEach(adressen, function (adres) {
        if (typeof adres.positie !== 'undefined') {
          minLat = Math.min(minLat, adres.positie.latitude);
          maxLat = Math.max(maxLat, adres.positie.latitude);
          minLng = Math.min(minLng, adres.positie.longitude);
          maxLng = Math.max(maxLng, adres.positie.longitude);
        }
      });

      var centerLat = (maxLat - minLat) / 2 + minLat;
      var centerLng = (maxLng - minLng) / 2 + minLng;
      return new google.maps.LatLng(centerLat, centerLng);
    };

    // Place Markers on Map
    var markersTekenen = function (map, adressen, isDraggable) {
      if ($scope.markers == undefined) {
        $scope.markers = [];
      }
      clearMarkers();

      angular.forEach(adressen, function (adres, key) {
        if (typeof adres.positie !== 'undefined') {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(adres.positie.latitude, adres.positie.longitude),
            map: map,
            draggable: isDraggable,
            label: $scope.markerLabels[key],
            infoProp: adres.straat + " " + adres.nummer + (adres.bus ? (" bus " + adres.bus) : "") + "<br>" + adres.postcode + " " + adres.gemeente,
            adresId: adres.id
          });
          marker = markerAddEvents(marker, map);
          $scope.markers.push(marker);
        }
      });
    };

    // Remove allmarkers on Map
    var clearMarkers = function () {
      angular.forEach($scope.markers, function (value, key) {
        $scope.markers[key].setMap(null)
      });
      $scope.markers = [];
    };

    // openMarkerInfo
    var openInfoWindow = function (map, marker) {
      var infoWindow = new google.maps.InfoWindow({
        content: marker.infoProp,
        maxWidth: 200
      });
      google.maps.event.addListener(infoWindow, 'closeclick', function () {
        angular.forEach($scope.markers, function (value, key) {
          if (value.adresId == marker.adresId) {
            $scope.markers[key].infoIsOpen = false;
          }
        });
      });
      angular.forEach($scope.markers, function (value, key) {
        if (value.adresId == marker.adresId && !marker.infoIsOpen) {
          $scope.markers[key].infoIsOpen = true;
          infoWindow.open(map, marker);
        }
      })
    };

    /*
     * event functies Lokalen
     * ----------------------------------
     */

    $scope.changePostadres = function (val) {
      angular.forEach($scope.data.activegroup.adressen, function (value) {
        value.postadres = value.id == val;
      });
    };

    //dropdown verander van groep
    $scope.changeGroep = function () {
      if ($scope.groepForm.$dirty) {
        DialogService.paginaVerlaten(function (result) {
          if (result) {
            $scope.groepForm.$setPristine();
            $scope.previousgroupId = $scope.data.activegroup.id;
            CS.Groepen().then(groepenGeladen);
            $scope.formulierUrl = $scope.baseUrl + $scope.data.activegroup.id;
            loadGoogleMap();
            maakSorteerbaar();
          }
          else {
            angular.forEach($scope.data.groepenlijst, function (groep) {
              if (groep.id == $scope.previousgroupId) {
                $scope.data.activegroup = groep;
                $scope.previousgroupId = $scope.data.activegroup.id;
              }
            })
          }
        });
      }
      else {
        $scope.previousgroupId = $scope.data.activegroup.id;
        $scope.formulierUrl = $scope.baseUrl + $scope.data.activegroup.id;
        $scope.data.publiekInschrijven = $scope.data.activegroup['publiek-inschrijven'];
        loadGoogleMap();
        maakSorteerbaar();
      }
    };

    // marker-icon click
    $scope.centerMap = function (lat, lng, id) {
      if (lat == undefined || lng == undefined || id == undefined) {
        return;
      }

      $scope.googleMap.setCenter(new google.maps.LatLng(lat, lng));
      angular.forEach($scope.markers, function (value) {
        if (value.adresId == id) {
          google.maps.event.trigger(value, 'click');
        }
      })
    };

    // nieuw adres toeveogen
    $scope.addAdres = function () {
      var newAdres = {
        id: 'tempadres' + Math.random(),
        bus: null
      };
      $scope.data.activegroup.adressen.push(newAdres);
      addMarkerFromNewAdres($scope.googleMap, newAdres);
      $scope.groepForm.$setDirty();
    };

    // marker van een nieuw adres op de kaart plaatsen.
    var addMarkerFromNewAdres = function (map, adres) {
      var marker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        draggable: true,
        label: $scope.markerLabels[$scope.data.activegroup.adressen.length - 1],
        infoProp: "<b>Nieuw adres toegevoegd!</b></br> Plaats deze marker op het lokaal",
        adresId: adres.id,
        animation: google.maps.Animation.DROP
      });
      marker = markerAddEvents(marker, map);
      $scope.markers.push(marker);
      openInfoWindow(map, marker);
    };

    /*
     * event groepseigen functies
     * ----------------------------------
     */

    $scope.addGroepseigenFunctie = function () {
      var newFunction = {
        id: 'tempFunctie' + Math.random(),
        beschrijving: null,
        groepen: [$scope.data.activegroup.groepsnummer]
      };
      $scope.data.activegroup.groepseigenFuncties.push(newFunction);
      $scope.groepForm.$setDirty();
    };

    $scope.wisGroepseigenFunctie = function (id) {
      // controle wis ik een nieuwe groepseigen functie => wissen uit array.
      // anders deletedTimestaps op vandaag zetten;
      angular.forEach($scope.data.activegroup.groepseigenFuncties, function (value, key) {
        if (value.id == id) {
          // controle wordt er een nieuwe groepseigen functie gewist?
          if (value.id.indexOf('tempFunctie') != -1) {
            $scope.data.activegroup.groepseigenFuncties.splice(key, 1);
          }
          else {
            $scope.data.activegroup.groepseigenFuncties[key].deletedTimestamps = new Date();
          }
        }
      });
      $scope.groepForm.$setDirty();
    };

    /*
     * event groepseigen gegevens
     * ----------------------------------
     */
    var maakSorteerbaar = function () {
      if ($scope.data.activegroup.kanWijzigen) {
        $(".sortable").sortable({
          cursor: 'move'
        });
      }
      else {
        $(".sortable").sortable({
          disabled: true
        });
      }

    };

    $scope.addGroepseigenGegeven = function () {
      var newGegeven = {
        beschrijving: null,
        kanLeidingWijzigen: false,
        kanLidWijzigen: false,
        sort: $scope.data.activegroup.groepseigenGegevens.length,
        type: 'tekst',
        status: "nieuw",
        label: "",
        keuzes: ['']
      };
      $scope.data.activegroup.groepseigenGegevens.push(newGegeven);
      $scope.groepForm.$setDirty();
    };

    $scope.verwijderGroepseigenGegeven = function (id) {
      var groepseigenGegevens = [];

      angular.forEach($scope.data.activegroup.groepseigenGegevens, function (gegeven) {
        if (gegeven.id !== id) {
          groepseigenGegevens.push(gegeven);
        }
      });

      $scope.data.activegroup.groepseigenGegevens = groepseigenGegevens;
      $scope.groepForm.$setDirty();
    };

    $scope.addKeuze = function (index) {
      $scope.data.activegroup.groepseigenGegevens[index].keuzes = $scope.data.activegroup.groepseigenGegevens[index].keuzes || [];
      $scope.data.activegroup.groepseigenGegevens[index].keuzes.push("");
      $scope.groepForm.$setDirty();
    };

    $scope.wisKeuze = function (index, keuzeIndex) {
      $scope.data.activegroup.groepseigenGegevens[index].keuzes.splice(keuzeIndex, 1);
      $scope.groepForm.$setDirty();
    };

    $scope.changeKeuze = function (index, keuzeIndex) {
      var currentItem = $scope.data.activegroup.groepseigenGegevens[index].keuzes[keuzeIndex];
      var lastItem = $scope.data.activegroup.groepseigenGegevens[index].keuzes.slice(-1);
      if (lastItem.toString() !== '') {
        $scope.data.activegroup.groepseigenGegevens[index].keuzes.push('');
        lastItem = $scope.data.activegroup.groepseigenGegevens[index].keuzes.slice(-1)
      }

      if (currentItem === '' && (keuzeIndex === ($scope.data.activegroup.groepseigenGegevens[index].keuzes.length - 2))
        && lastItem.toString() === '') {
        $scope.data.activegroup.groepseigenGegevens[index].keuzes.splice(-1, 1)
      }

    };

    $scope.deleteLokaal = function (id) {
      var adressen = [];

      angular.forEach($scope.data.activegroup.adressen, function (adres) {
        if (adres.id !== id) {
          adressen.push(adres);
        }
      });

      $scope.data.activegroup.adressen = adressen;
      $scope.groepForm.$setDirty();
    };

    /*
     * Marker events
     * ----------------------------------------------------
     */

    // voegt alle nodige events toe aan een bepaalde marker
    var markerAddEvents = function (marker, map) {
      marker.addListener('click', function () {
        var infoWindow = new google.maps.InfoWindow({
          content: marker.infoProp,
          maxWidth: 200
        });

        google.maps.event.addListener(infoWindow, 'closeclick', function () {
          angular.forEach($scope.markers, function (value, key) {
            if (value.adresId == marker.adresId) {
              $scope.markers[key].infoIsOpen = false;
            }
          });
        });
        angular.forEach($scope.markers, function (value, key) {
          if (value.adresId == marker.adresId && !marker.infoIsOpen) {
            $scope.markers[key].infoIsOpen = true;
            infoWindow.open(map, marker);
          }
        });
      });

      marker.addListener('dragend', function (evt) {
        angular.forEach($scope.data.activegroup.adressen, function (value) {
          if (value.id == marker.adresId) {
            if (value.positie == undefined) {
              value.positie = {};
            }
            value.positie.latitude = evt.latLng.lat();
            value.positie.longitude = evt.latLng.lng();
          }
        });
      });

      return marker;
    };

    // add watcher for checkbox - date translation
    $scope.$watch('data.activegroup.facturatieLeden', function () {
      //als er een datum bestaat
      if ($scope.data.activegroup.facturatieLeden && $scope.data.activegroup.facturatieLedenSaved == null) {
        $scope.data.activegroup.facturatieLedenSaved = true;
        $scope.data.activegroup.facturatieLedenCheck = true;
      }
    });
    $scope.$watch('data.activegroup.facturatieLeiding', function () {
      if ($scope.data.activegroup.facturatieLeiding && $scope.data.activegroup.facturatieLeidingSaved == null) {
        $scope.data.activegroup.facturatieLeidingSaved = true;
        $scope.data.activegroup.facturatieLeidingCheck = true;
      }
    });

    $scope.$on('$locationChangeStart', function (event, newUrl) {
      if ($scope.groepForm.$dirty) {
        event.preventDefault();
        DialogService.paginaVerlaten($scope.locationChange, newUrl);
      }
    });

    // return functie voor de bevestiging na het veranderen van pagina
    $scope.locationChange = function (result, url) {
      if (result) {
        $scope.groepForm.$setPristine();
        if (url) {
          $window.location.href = url;
        }
      }
    };

    $scope.opslaan = function () {
      var sortedIds = [];
      var idFieldSets = $( ".idArray" );
      for(var i=0;i<idFieldSets.length;i++){
        sortedIds.push(idFieldSets[i].id);
      }

      angular.forEach($scope.data.activegroup.groepseigenGegevens, function (gegeven) {
        gegeven.sort = sortedIds.indexOf(gegeven.id);
        if (gegeven.type !== 'lijst') {
          delete gegeven.keuzes;
        }
        else {
          gegeven.keuzes = _.filter(gegeven.keuzes, function(keuze) {
            return keuze !== ''
          });
        }
      });
      $scope.saving = true;
      if ($scope.data.activegroup.facturatieLeidingCheck) {
        $scope.data.activegroup.facturatieLeiding = new Date()
      }
      if ($scope.data.activegroup.facturatieLedenCheck) {
        $scope.data.activegroup.facturatieLeden = new Date()
      }

      var promises = [
        RestService.Groep
          .update({id: $scope.data.activegroup.id, bevestiging: true}, $scope.data.activegroup)
          .$promise.then(function (response) {
          $scope.data.activegroup.groepseigenGegevens = response.groepseigenGegevens;
          angular.forEach($scope.data.activegroup.groepseigenGegevens, function (gegeven) {
            if (gegeven.type === 'lijst') {
              gegeven.keuzes = gegeven.keuzes || [];
              gegeven.keuzes.push('')
            }
          });
          if ($scope.data.activegroup.facturatieLedenCheck) {
            $scope.data.activegroup.facturatieLedenSaved = true;
          }
          if ($scope.data.activegroup.facturatieLeidingCheck) {
            $scope.data.activegroup.facturatieLeidingSaved = true;
          }
          var foundObj = _.find($scope.data.groepenlijst, {'id': $scope.data.activegroup.id});
          foundObj.facturatieLeidingSaved = true;
          if ($scope.data.activegroup.facturatieLeidingCheck) {
            foundObj.facturatieLeidingCheck = true;
          }
          delete response.$promise;
          CS.UpdateGroep(response.id, response);
          return response;
        })
      ];
      _.forEach($scope.data.activegroup.groepseigenFuncties, function (functie) {
        var promise;

        if (typeof functie.deletedTimestamps !== 'undefined') {
          promise = RestService.Functie.delete({functieId: functie.id}).$promise
            .then(function () {
              _.pull($scope.data.activegroup.groepseigenFuncties, functie);
            }).catch(function () {
              delete functie.deletedTimestamps; // Het verwijderen ongedaan maken
            });
        } else if (functie.id.indexOf('tempFunctie') != -1) {
          promise = RestService.Functies.post({}, functie).$promise.then(
            function (nieuweFunctie) {
              functie.id = nieuweFunctie.id;
              return nieuweFunctie;
            }
          );
        } else {
          promise = RestService.Functie.update({functieId: functie.id}, functie).$promise;
        }

        promises.push(promise);
      });

      $q.all(promises)
        .then(function () {
          $scope.groepForm.$setPristine();
          $scope.data.publiekInschrijven = $scope.data.activegroup['publiek-inschrijven']
        })
        .finally(function () {
          $scope.saving = false;
        });
    }
  }
})();

(function () {
  'use strict';

  angular
    .module('ga.groepcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('GroepController', GroepController);

  GroepController.$inject = ['$scope', '$routeParams', '$window', '$location', '$log' , 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak'];

  function GroepController($scope, $routeParams, $window, $location, $log, RestService, AlertService, DialogService, $rootScope, keycloak) {
    $scope.markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var tempId = 1;
    // groepen ophalen
    RestService.Groepen.get().$promise.then(
      function (result) {
        $scope.data = {};
        $scope.data.groepenlijst = [];
        //tijdelijk extra velden toevoegen aan het resultaat
        angular.forEach(result.groepen, function(value){
          value.vga = {
            "naam": "Luke Skywalker",
            "email": "luke@walkingin.sky"
          };
          value.groepsleiding = [
            {
              "naam": "Foo bar",
              "email": "foo@bar.com"
            },
            {
              "naam": "John doe",
              "email": "john@doe.com"
            }];

          value.adres = [
            value.adres
          ];
          $scope.data.groepenlijst.push(value);
        })

        // by default is de eerste groep actief
        $scope.data.activegroup = $scope.data.groepenlijst[0];
        maakSorteerbaar();
        loadGoogleMap();
      },
      function (Error){
      }
    );

    /*
     * Google Maps Functies
     * ----------------------------------
     */
    // initialize Google Map
    var loadGoogleMap = function(){
      if(!$scope.googleMap){
        var mapOptions = {
          zoom: 15,
          center: berekenCenter($scope.data.activegroup.adressen)
        }
        $scope.googleMap = new google.maps.Map(document.getElementById("lokalen-kaart"), mapOptions);
        markersTekenen($scope.googleMap, $scope.data.activegroup.adressen);
      } else {

        $scope.googleMap.setCenter(berekenCenter($scope.data.activegroup.adressen));
        markersTekenen($scope.googleMap, $scope.data.activegroup.adressen);
      }

    }

    // Calculate center
    var berekenCenter = function(adressen){
        // maar 1 adres
        if (adressen.length == 1){
          return new google.maps.LatLng(adressen[0].positie.latitude, adressen[0].positie.longitude);
        }
        // meerder adressen
        else {
          var maxLat = 0;
          var minLat = 0;
          var maxLng = 0;
          var minLng = 0;
          angular.forEach(adressen, function(adres){
            var tempLat = aders.positie.latitude;
            var tempLng = adres.positie.longitude;
            // latithude controle

            if (tempLat > maxLat ){
              maxLat = tempLat;
            }
            else if (tempLat < minLat )  {
              minLat = tempLat
            }
            // Longithude controle
            if (tempLng > maxLng){
              maxLat = tempLat;
            }
            else if (tempLng < minLng )  {
              minLat = tempLat
            }
          });

          // calculate center
          var centerLat = ((maxLat-minLat) /2 ) + minLat;
          var centerLng = ( (maxLng-minLng) /2) + minLng;
          return new google.maps.LatLng(centerLat, centerLng);
        }
      }

    // Place Markers on Map
    var markersTekenen = function(map, adressen){
      if($scope.markers == undefined){
        $scope.markers = [];
      }
      clearMarkers();

      angular.forEach(adressen, function(value, key){
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(value.positie.latitude, value.positie.longitude),
          map: map,
          draggable: true,
          label: $scope.markerLabels[key],
          infoProp: value.straat + " " +value.nummer + ( value.bus ? (" " + value.bus) : "") + "," + "<br>" + value.postcode + " " + value.gemeente,
          adresId: value.id
        });
        marker = markerAddEvents(marker, map);
        $scope.markers.push(marker);
      });


    }

    // Remove allmarkers on Map
    var clearMarkers = function(){
      angular.forEach($scope.markers, function(value, key){
        $scope.markers[key].setMap(null)
      });
      $scope.markers = [];
    }

    // openMarkerInfo
    var openInfoWindow = function(map, marker){
      var infoWindow = new google.maps.InfoWindow({
        content: marker.infoProp,
        maxWidth: 200
      });
      google.maps.event.addListener(infoWindow,'closeclick',function(){
          angular.forEach($scope.markers, function(value, key){
            if(value.adresId == marker.adresId){
              $scope.markers[key].infoIsOpen = false;
            }
          });
        });
      angular.forEach($scope.markers, function(value, key){
        console.log(marker.infoIsOpen);
        if(value.adresId == marker.adresId && !marker.infoIsOpen){
          $scope.markers[key].infoIsOpen = true;
          infoWindow.open(map, marker);
        }
      })
    }

    /*
     * event functies Lokalen
     * ----------------------------------
     */
    //dropdown verander van groep
    $scope.changeGroep = function () {
      loadGoogleMap();
      maakSorteerbaar();
    }

    // marker-icon click
    $scope.centerMap = function(lat, lng, id){
      if(lat == undefined || lng == undefined || id == undefined){
        return;
      }

      $scope.googleMap.setCenter(new google.maps.LatLng(lat, lng));
      angular.forEach($scope.markers, function(value, key){
        if(value.adresId == id){
          google.maps.event.trigger(value, 'click');
        }
      })

    }

    // nieuw adres toeveogen
    $scope.addAdres = function () {
      var newAdres = {
        id: 'tempadres' + tempId,
        bus: null,

      }
      tempId++;
      $scope.activegroup.adres.push(newAdres);
      addMarkerFromNewAdres($scope.googleMap, newAdres)
    }

    // zoek gemeentes
    $scope.zoekGemeente = function(zoekterm){
      var resultaatGemeentes = [];
      return RestService.Gemeente.get({zoekterm:zoekterm, token:1}).$promise.then(
          function(result){
            angular.forEach(result, function(val){
              if(typeof val == 'string'){
                resultaatGemeentes.push(val);
              }
            });
            return resultaatGemeentes;
        });
    }

    // gemeente opslaan in het adres
    $scope.bevestigGemeente = function(item, adres) {
      adres.postcode = item.substring(0,4);
      adres.gemeente = item.substring(5);
      adres.straat = null;
      adres.bus = null;
      adres.nummer = null;
      adres.giscode = null;
      adres.land = "BE"
      // google geocode gemeente naar coordinaten
      // => teken marker + Info plaats deze marker op de juiste plaats.

    };

    // zoek straten en giscodes
    $scope.zoekStraat = function(zoekterm, adres){
      var resultaatStraten = [];
      return RestService.Code.query({zoekterm:zoekterm, postcode: adres.postcode}).$promise.then(
          function(result){
            angular.forEach(result, function(val){
                resultaatStraten.push(val);
            });
            return resultaatStraten;
        });
    }

    // straat en giscode opslaan in het adres
    $scope.bevestigStraat = function(item, adres) {
      adres.straat = item.straat;
      adres.giscode = item.code;

    };

    // marker van een nieuw adres op de kaart plaatsen.
    var addMarkerFromNewAdres = function (map, adres) {
      var marker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        draggable: true,
        label: $scope.markerLabels[$scope.activegroup.adres.length - 1],
        infoProp: "<b>Nieuw adres toegevoegd!</b></br> Plaats deze marker op het lokaal",
        adresId: adres.id,
        animation: google.maps.Animation.DROP,
      });
      marker = markerAddEvents(marker, map);
      $scope.markers.push(marker);
      openInfoWindow (map, marker);
    }

    /*
     * event groepseigen functies
     * ----------------------------------
     */

    $scope.addGroepseigenFunctie = function () {
      var newFunction = {
        id: 'tempFunctie' + tempId,
        beschrijving: null
      }
      tempId++;
      $scope.activegroup.groepseigenFuncties.push(newFunction);
    }

    $scope.wisGroepseigenFunctie = function (id) {
      // controle wis ik een nieuwe groepseigen functie => wissen uit array.
      // anders deletedTimestaps op vandaag zetten;
      angular.forEach($scope.activegroup.groepseigenFuncties, function(value, key){
        if(value.id == id ) {
          // controle wordt er een nieuwe groepseigen functie gewist?
          if(value.id.indexOf('tempFunctie') != -1){
            $scope.activegroup.groepseigenFuncties.splice(key, 1);
          }
          else {
            $scope.activegroup.groepseigenFuncties[key].deletedTimestamps = new Date();
          }
        }
        console.log($scope.activegroup.groepseigenFuncties[key]);
      });
    }

    /*
     * event groepseigen gegevens
     * ----------------------------------
     */
    var maakSorteerbaar = function (){
      $( ".sortable" ).sortable({
        stop : function(event, ui){
          var gegevenId = ui.item.attr('data-groepseigengegevenid');
          var gegevenIndex = ui.item.index();
          angular.forEach($scope.activegroup.groepseigenGegevens.schema.velden, function(value, key){
            if(value.id == gegevenId ){
              value.sort = gegevenIndex;
            }
          })
        }
      });
    }

    $scope.addGroepseigenGegeven = function () {
      var newGegeven = {
        id: 'tempGegeven' + tempId,
        beschrijving: null,
        kanLeidingWijzigen: false,
        kanLidWijzigen: false,
        sort: $scope.activegroup.groepseigenGegevens.schema.velden.length,
        type: '',
        status: "nieuw",
        label: ""
      }
      tempId++;
      $scope.activegroup.groepseigenGegevens.schema.velden.push(newGegeven);
    }

    $scope.addKeuze = function (index) {
      $scope.activegroup.groepseigenGegevens.schema.velden[index].keuzes.push("");
    }

    $scope.wisKeuze = function (index, keuzeIndex) {
      $scope.activegroup.groepseigenGegevens.schema.velden[index].keuzes.splice(keuzeIndex, 1);
    }

    $scope.setType = function (index, type) {
      $scope.activegroup.groepseigenGegevens.schema.velden[index].type = type;
      if (type == "lijst") {
        $scope.activegroup.groepseigenGegevens.schema.velden[index].keuzes = [];
        $scope.activegroup.groepseigenGegevens.schema.velden[index].keuzes.push("");
      }
      else{
        delete $scope.activegroup.groepseigenGegevens.schema.velden[index].keuzes;
      }
    }

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


        google.maps.event.addListener(infoWindow,'closeclick',function(){
          angular.forEach($scope.markers, function(value, key){
            if(value.adresId == marker.adresId){
              $scope.markers[key].infoIsOpen = false;
            }
          });
        });
        angular.forEach($scope.markers, function(value, key){
          if(value.adresId == marker.adresId && !marker.infoIsOpen){
            $scope.markers[key].infoIsOpen = true;
            infoWindow.open(map, marker);
          }
        });
      });

      marker.addListener('dragend', function (evt) {
        angular.forEach($scope.activegroup.adres, function(value, key){
          if (value.id == marker.adresId) {
            if ($scope.activegroup.adres[key].positie == undefined) {
              $scope.activegroup.adres[key].positie = {};
            }
            $scope.activegroup.adres[key].positie.latitude = evt.latLng.lat();
            $scope.activegroup.adres[key].positie.longitude = evt.latLng.lng();

          }
        });
      });

      return marker;
    }
  }
})();

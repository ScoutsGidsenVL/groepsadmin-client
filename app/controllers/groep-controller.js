(function () {
  'use strict';

  angular
    .module('ga.groepcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('GroepController', GroepController);

  GroepController.$inject = ['$scope', '$routeParams', '$window', '$location', '$log' , 'RestService', 'AlertService', 'CacheService', 'DialogService', '$rootScope', 'access', 'keycloak'];

  function GroepController($scope, $routeParams, $window, $location, $log, RestService, AlertService, CS, DialogService, $rootScope, access, keycloak) {
    if(!access){
      $location.path("/lid/profiel");
    }

    $scope.markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // groepen ophalen
    CS.Groepen().then(
      function (result) {
        $scope.data = {};
        $scope.data.groepenlijst = [];
        //tijdelijk extra velden toevoegen aan het resultaat
        angular.forEach(result.groepen, function(groep){
          groep.vga = [];
          groep.fv = [];
          groep.groepsleiding = [];

          _.forEach(groep.contacten, function(contact) {
            var groepering;
            if (contact.functie == 'd5f75b320b812440010b812555970393') {
              groepering = groep.vga;
            } else if (contact.functie == 'd5f75b320b812440010b812553d5032e') {
              groepering = groep.fv;
            } else {
              groepering = groep.groepsleiding
            }

            RestService.Lid.get({id: contact.lid}).$promise.then(function(res) {
              groepering.push({
                naam: res.vgagegevens.voornaam + ' ' + res.vgagegevens.achternaam,
                email: res.email
              });
            });
          });

          groep.adres = [
            groep.adres
          ];
          $scope.data.groepenlijst.push(groep);
        })

        // by default is de eerste groep actief
        $scope.data.activegroup = $scope.data.groepenlijst[0];
        maakSorteerbaar();
        loadGoogleMap();
      },
      function (Error){
      }
    );


    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1,
      datepickerMode: 'year'
    };
    $scope.popupCal = {
      opened: false
    };
    $scope.popupCal = function() {
      $scope.popupCal.opened = true;
    };
    $scope.formats = ['dd/MM/yyyy'];
    $scope.format = $scope.formats[0];

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
            var tempLat = adres.positie.latitude;
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
        id: 'tempadres' + Math.random(),
        bus: null,

      }
      $scope.data.activegroup.adressen.push(newAdres);
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
        label: $scope.markerLabels[$scope.data.activegroup.adressen.length - 1],
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
        id: 'tempFunctie' + Math.random(),
        beschrijving: null
      }
      $scope.data.activegroup.groepseigenFuncties.push(newFunction);
    }

    $scope.wisGroepseigenFunctie = function (id) {
      // controle wis ik een nieuwe groepseigen functie => wissen uit array.
      // anders deletedTimestaps op vandaag zetten;
      angular.forEach($scope.data.activegroup.groepseigenFuncties, function(value, key){
        if(value.id == id ) {
          // controle wordt er een nieuwe groepseigen functie gewist?
          if(value.id.indexOf('tempFunctie') != -1){
            $scope.data.activegroup.groepseigenFuncties.splice(key, 1);
          }
          else {
            $scope.data.activegroup.groepseigenFuncties[key].deletedTimestamps = new Date();
          }
        }
        console.log($scope.data.activegroup.groepseigenFuncties[key]);
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
          angular.forEach($scope.data.activegroup.groepseigenGegevens.schema.velden, function(value, key){
            if(value.id == gegevenId ){
              value.sort = gegevenIndex;
            }
          })
        }
      });
    }

    $scope.addGroepseigenGegeven = function () {
      var newGegeven = {
        id: 'tempGegeven' + Math.random(),
        beschrijving: null,
        kanLeidingWijzigen: false,
        kanLidWijzigen: false,
        sort: $scope.data.activegroup.groepseigenGegevens.schema.velden.length,
        type: '',
        status: "nieuw",
        label: ""
      }
      $scope.data.activegroup.groepseigenGegevens.schema.velden.push(newGegeven);
    }

    $scope.addKeuze = function (index) {
      $scope.data.activegroup.groepseigenGegevens.schema.velden[index].keuzes.push("");
    }

    $scope.wisKeuze = function (index, keuzeIndex) {
      $scope.data.activegroup.groepseigenGegevens.schema.velden[index].keuzes.splice(keuzeIndex, 1);
    }

    $scope.setType = function (index, type) {
      $scope.data.activegroup.groepseigenGegevens.schema.velden[index].type = type;
      if (type == "lijst") {
        $scope.data.activegroup.groepseigenGegevens.schema.velden[index].keuzes = [];
        $scope.data.activegroup.groepseigenGegevens.schema.velden[index].keuzes.push("");
      }
      else{
        delete $scope.data.activegroup.groepseigenGegevens.schema.velden[index].keuzes;
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
        angular.forEach($scope.data.activegroup.adres, function(value, key){
          if (value.id == marker.adresId) {
            if ($scope.data.activegroup.adres[key].positie == undefined) {
              $scope.data.activegroup.adres[key].positie = {};
            }
            $scope.data.activegroup.adres[key].positie.latitude = evt.latLng.lat();
            $scope.data.activegroup.adres[key].positie.longitude = evt.latLng.lng();

          }
        });
      });

      return marker;
    }


    // add watcher for checkbox - date translation
    $scope.$watch('data.activegroup.facturatieLeden', function (newVal, oldVal) {
      console.log("Leden  newVal--", $scope.data.activegroup.facturatieLeden, " --OldVal", oldVal );
      //als er een datum bestaat
      if(newVal){
        $scope.data.activegroup.facturatieLedenSaved = true;
        $scope.data.activegroup.facturatieLedenCheck = true;
      }
    });
    $scope.$watch('data.activegroup.facturatieLeiding', function (newVal, oldVal) {
      if(newVal){
        $scope.data.activegroup.facturatieLeidingSaved = true;
        $scope.data.activegroup.facturatieLeidingCheck = true;
      }
    });


    $scope.opslaan = function(){

      /*********/
      // move this logic in success() callback of group patch!
      /*********/
      console.log("***",$scope.data.activegroup);
      $scope.saving = true;

          // ADD SOME CODE WHICH adds the date (now, format : 2017-09-18T12:09:06.825+02:00 )
          //var d = new Date();
          //var n = d.toISOString(); //example 2017-11-22T08:41:05.475Z

          if($scope.data.activegroup.facturatieLedenCheck == true){
            //console.log('* leden  found item', _.find($scope.data.groepenlijst, {'id': $scope.data.activegroup.id}));
            $scope.data.activegroup.facturatieLedenSaved = true;
            var foundObj = _.find($scope.data.groepenlijst, {'id': $scope.data.activegroup.id});
            foundObj.facturatieLedenSaved = true;
            foundObj.facturatieLedenCheck = true;
          }
          if($scope.data.activegroup.facturatieLeidingCheck == true){
            //console.log('* leiding found item', _.find($scope.data.groepenlijst, {'id': $scope.data.activegroup.id}));
            $scope.data.activegroup.facturatieLeidingSaved = true;
            var foundObj = _.find($scope.data.groepenlijst, {'id': $scope.data.activegroup.id});
            foundObj.facturatieLeidingSaved = true;
            foundObj.facturatieLeidingCheck = true;
          }


          //send new request
          RestService.Groep.update({id:$scope.data.activegroup.id, bevestiging: true}, $scope.data.activegroup).$promise.then(function(res){
            console.log(res)
            $scope.saving = false;
          },function(err){
            console.log(err);
            $scope.saving = false;
          });


    }
  }
})();

(function () {
  'use strict';

  angular
    .module('ga.groepcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('GroepController', GroepController);

  GroepController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak'];

  function GroepController($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {
    $scope.markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // profiel op halen
    RestService.Lid.get({id: 'profiel'}).$promise.then(
      function (result) {
        $scope.lid = result;
        loadGroups();
      },
      function (error) {
        AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
      }
    );

    $scope.activegroup = null;

    var loadGroups = function () {
        $scope.groepenlijst = [];
        angular.forEach($scope.lid.functies, function (value, key) {
          var gr = RestService.Groep.get({id: value.groep}).$promise.then(
            function (result) {
              result.vga = {
                "naam": "Nathan Wuyts",
                "email": "vga@scoutslatem.be"
              };
              result.groepsleiding = [
                {
                  "naam": "Joke Scheerder",
                  "email": "joke@scheerder.be"
                             },
                {
                  "naam": "Bram Scheerder",
                  "email": "bram@scheerder.be"
                             }
                           ];
              result.adres = [
                result.adres
              ]
              if ($scope.activegroup == null) {
                $scope.activegroup = result;
                loadGoogleMap();
              }
              $scope.groepenlijst.push(result);
            });
        });
      }



    var loadGoogleMap = function(){
      if(!$scope.googleMap){
        var mapOptions = {
          zoom: 15,
          center: berekenCenter($scope.activegroup.adres)
        }
        $scope.googleMap = new google.maps.Map(document.getElementById("lokalen-kaart"), mapOptions);
        markersTekenen($scope.googleMap, $scope.activegroup.adres);
      } else {
        $scope.googleMap.setCenter(berekenCenter($scope.activegroup.adres));
        markersTekenen($scope.googleMap, $scope.activegroup.adres);
      }

    }



    // Calculate center
    var berekenCenter = function(adressen){
        // maar adres
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
      if($scope.markers == null){
        $scope.markers = [];
      }
      clearMarkers();

      angular.forEach(adressen, function(value, key){
        console.log(key);
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(value.positie.latitude, value.positie.longitude),
          map: map,
          draggable: false,
          label: $scope.markerLabels[key],
          infoProp: value.straat + " " +value.nummer + ( value.bus ? (" " + value.bus) : "") + "," + "<br>" + value.postcode + " " + value.gemeente
        });
        $scope.markers.push(marker);
        marker.addListener('click', function() {
          var infoWindow = new google.maps.InfoWindow({
            content: this.infoProp,
            maxWidth: 200
          });
          infoWindow.open(map, this);
        });
      });


    }
    var clearMarkers = function(){
      var markersCount = $scope.markers.length;
      for(var i=0; i < markersCount; i++){
        $scope.markers[i].setMap(null);
      }
    }

    // event functies
    $scope.ChangeGroep = function () {
      loadGoogleMap();
    }

  }
})();

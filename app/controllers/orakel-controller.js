(function () {
  'use strict';

  angular
    .module('ga.orakelcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('OrakelController', OrakelController);

  OrakelController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak'];

  function OrakelController($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {
    // Scope variabele
    $scope.showLedenAantallen = false;
    $scope.showEigenschappen = false;
    $scope.showGrafiek = false;
    $scope.currentView = "";
    $scope.activegroup = null;

    // Globale grafiek opties
    var globalOptions = {
          maintainAspectRatio: false,
          responsive: false,
          title: {
            display: true,
            fontSize: 20,
            padding: 20
          },
          legend: {
            display: true,
            position: "bottom",
            padding: 20
          }
        }

    /*
     * Teken functies
     * ------------------------------------
     */

    $scope.tekenLedenaantallen = function () {
      wisGrafiek();

      var temp = {
        aantalVrouwen: null,
        aantalLeden: [],
        aantalLeiding: []
      };

      angular.forEach($scope.orakelData.ledenaantallen.datasets, function(value){
        temp.aantalVrouwen = temp.aantalVrouwen ? ((value.leden[value.leden.length-1] * value.percentageVrouwen) + temp.aantalVrouwen) : (value.leden[value.leden.length-1] * value.percentageVrouwen);
        angular.forEach(value.leden, function(ledenAantal, index){
          temp.aantalLeden[index] = temp.aantalLeden[index] ? (temp.aantalLeden[index] + ledenAantal) : ledenAantal;
        });
        angular.forEach(value.leiding, function(leidingAantal, index){
          temp.aantalLeiding[index] = temp.aantalLeiding[index] ? (temp.aantalLeiding[index] + leidingAantal) : leidingAantal;
        });
      });
      $scope.totaalLedenAantallen = {
        percentageVrouwen: temp.aantalVrouwen / temp.aantalLeden[temp.aantalLeden.length-1],
        aantalVrouwen: temp.aantalVrouwen,
        leden: temp.aantalLeden,
        leiding: temp.aantalLeiding,
        labels: $scope.orakelData.ledenaantallen.datasets[0].labels,
        tak: "Totaal"
      }
      $scope.showLedenAantallen = true;
      $scope.currentView = "LedenAantallen";

    }

    $scope.tekenEigenschappen = function (){
      wisGrafiek();
      $scope.showEigenschappen = true;
      $scope.currentView = "Eigenschappen";
    }

    $scope.tekenGroepsevolutie = function () {
      wisGrafiek();
      $scope.showGrafiek = true;

      var chartColors = [
                {
                  border: "rgba(232, 232, 96, 1)",
                  background: "rgba(232, 232, 96, 0.62)"
                },
                {
                  border: "rgba(141, 221, 119, 1)",
                  background: "rgba(141, 221, 119, 0.62)"
                },
                {
                  border: "rgba(236, 148, 76, 1)",
                  background: "rgba(236, 148, 76, 0.59)"
                },
                {
                  border: "rgba(76, 83, 236, 1)",
                  background: "rgba(76, 83, 236, 0.59)"
                },
                {
                  border: "rgba(212, 94, 94, 1)",
                  background: "rgba(212, 94, 94, 0.59)"
                },
                {
                  border: "rgba(120, 97, 218, 1)",
                  background: "rgba(120, 97, 218, 0.59)"
                }
        ];
      var ctx = $("#grafiek");

      var type = "line";
      var data = {
        labels: $scope.orakelData.groepsevolutie.labels,
        datasets : []
      };

      angular.forEach($scope.orakelData.groepsevolutie.datasets, function(value, key){
        var dataset = {
          label: value.name,
          fill: false,
          //lineTension: 0.1,
          backgroundColor: chartColors[key].background,
          borderColor: chartColors[key].border,
          //borderCapStyle: 'butt',
          //borderDash: [],
          //borderDashOffset: 0.0,
          //borderJoinStyle: 'miter',
          pointBackgroundColor: chartColors[key].border,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: chartColors[key].border,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          pointHitRadius: 10,
          //spanGaps: false,
          data: value.data,
        }
        data.datasets.push(dataset);
      });

      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Groepsevolutie";

      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: grafiekOpties
      });
      $scope.currentView = "Groepsevolutie";
    }

    $scope.tekenLedenaantalPerLeeftijd = function () {
      wisGrafiek();
      $scope.showGrafiek = true;


      var ctx = $("#grafiek");

      // kleuren bepalen
      var chartColors = [
                {
                  background: "rgba(232, 232, 96, 1)",
                  border: "rgba(232, 232, 96, 0.62)"
                },
                {
                  background: "rgba(141, 221, 119, 1)",
                  border: "rgba(141, 221, 119, 0.62)"
                },
                {
                  background: "rgba(236, 148, 76, 1)",
                  border: "rgba(236, 148, 76, 0.59)"
                },
                {
                  background: "rgba(76, 83, 236, 1)",
                  border: "rgba(76, 83, 236, 0.59)"
                },
                {
                  background: "rgba(212, 94, 94, 1)",
                  border: "rgba(212, 94, 94, 0.59)"
                },
                {
                  background: "rgba(120, 97, 218, 1)",
                  border: "rgba(120, 97, 218, 0.59)"
                }
        ];

      //type grafiek bepalen
      var type = "bar";

      //datavoorbereiden
      var data = {
        labels: $scope.orakelData.ledenaantalPerLeeftijd.labels,
        datasets : []
      }
      angular.forEach($scope.orakelData.ledenaantalPerLeeftijd.datasets, function(value, key){
        var dataset = {
          label: value.name,
          backgroundColor: chartColors[key].background,
          borderColor: chartColors[key].border,
          data: value.data
        }
        data.datasets.push(dataset);
      });

      //grafiek opties aanpassen naar de eigenschappen van dit type
      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Leden aantal per leeftijd";
      grafiekOpties.scales = {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          };

      // Grafiek aanmaken
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: grafiekOpties
      });
      $scope.currentView = "LedenaantalPerLeeftijd";
    }

    $scope.tekenHuidigeLeidingsErvaring = function() {
      wisGrafiek();
      $scope.showGrafiek = true;

      var chartHoverColors = ["rgba(232, 232, 96, 0.62)", "rgba(141, 221, 119, 0.62)", "rgba(236, 148, 76, 0.59)", "rgba(76, 83, 236, 0.59)", "rgba(212, 94, 94, 0.59)", "rgba(120, 97, 218, 0.59)"];
      var chartColors = ["rgba(232, 232, 96, 1)", "rgba(141, 221, 119, 1)", "rgba(236, 148, 76, 1)", "rgba(76, 83, 236, 1)", "rgba(212, 94, 94, 1)", "rgba(120, 97, 218, 1)"];

      var ctx = $("#grafiek");

      var type = "doughnut";
      var data = {
        labels: $scope.orakelData.huidigeLeidingsErvaring.labels,
        datasets : [{
          data: $scope.orakelData.huidigeLeidingsErvaring.datasets[0].data,
          backgroundColor: chartColors,
         hoverBackgroundColor: chartHoverColors
        }]
      };

      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Huidige leidingservaring";

      var animation = { animateScale:true };
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        animation: animation,
        options: grafiekOpties
      });
      $scope.currentView = "HuidigeLeidingsErvaring";
    }

    $scope.tekenInEnUitstroom = function() {
      wisGrafiek();
      $scope.showGrafiek = true;
      var ctx = $("#grafiek");
      // kleuren bepalen
      var chartColors = [
                {
                  background: "rgba(232, 232, 96, 1)",
                  border: "rgba(232, 232, 96, 0.62)"
                },
                {
                  background: "rgba(141, 221, 119, 1)",
                  border: "rgba(141, 221, 119, 0.62)"
                },
                {
                  background: "rgba(236, 148, 76, 1)",
                  border: "rgba(236, 148, 76, 0.59)"
                },
                {
                  background: "rgba(76, 83, 236, 1)",
                  border: "rgba(76, 83, 236, 0.59)"
                },
                {
                  background: "rgba(212, 94, 94, 1)",
                  border: "rgba(212, 94, 94, 0.59)"
                },
                {
                  background: "rgba(120, 97, 218, 1)",
                  border: "rgba(120, 97, 218, 0.59)"
                }
        ];

      //type grafiek bepalen
      var type = "bar";

      //datavoorbereiden
      var data = {
        labels: $scope.orakelData.inEnUitstroom.labels,
        datasets : []
      }
      angular.forEach($scope.orakelData.inEnUitstroom.datasets, function(value, key){
        var dataset = {
          label: value.name,
          backgroundColor: chartColors[( (key % 2) > 0 ) ? (key-1) : (key)].background,
          borderColor: chartColors[((key % 2) > 0 ) ? (key-1) : (key)].border,
          data: value.data
        }
        data.datasets.push(dataset);
      });

      //grafiek opties aanpassen naar de eigenschappen van dit type
      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "In- en uitstroom per leeftijd";
      grafiekOpties.scales = {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          };

      // Grafiek aanmaken
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: grafiekOpties
      });
      $scope.currentView = "InEnUitstroom";
    }

    var wisGrafiek = function(){
      $scope.grafiek ? $scope.grafiek.destroy() : "";
      $scope.showLedenAantallen = false;
      $scope.showEigenschappen = false;
      $scope.showGrafiek = false;
    }

    // groepen ophalen
    RestService.Groepen.get().$promise.then(
      function (result) {
        $scope.groepen = result.groepen;
        $scope.activegroup = result.groepen[0];
        grafiekDataOphalen();
      },
      function (Error){

      }

    );



    var grafiekDataOphalen = function(){
      // grafiek data ophalen
      RestService.Orakel.get({groepsnummer: $scope.activegroup.groepsnummer}).$promise.then(
        function (result) {
          $scope.orakelData = result;
          switch ($scope.currentView){
            case "" :
              $scope.tekenLedenaantallen();
            break;

            case "Ledenaantallen" :
              $scope.tekenLedenaantallen();
            break;

            case "Eigenschappen" :
              $scope.tekenEigenschappen();
            break;

            case "Groepsevolutie" :
              $scope.tekenGroepsevolutie();
            break;

            case "LedenaantalPerLeeftijd" :
              $scope.tekenLedenaantalPerLeeftijd();
            break;

            case "HuidigeLeidingsErvaring" :
              $scope.tekenHuidigeLeidingsErvaring();
            break;

            case "InEnUitstroom" :
              $scope.tekenInEnUitstroom();
            break;
          }


        },
        function (error) {
          AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
        }
      );
    }


    /*
     * event functies
     * ----------------------------------
     */
    $scope.ChangeGroep = function () {
      alert("groepaangepast naar:" + $scope.activegroup.groepsnummer);

      // nieuwe grafiekdata ophalen
      grafiekDataOphalen();
    }



}

})();

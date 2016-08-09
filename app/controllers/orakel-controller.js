(function () {
  'use strict';

  angular
    .module('ga.orakelcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('OrakelController', OrakelController);

  OrakelController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'keycloak'];

  function OrakelController($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, keycloak) {

    // grafiek data ophalen
    RestService.Orakel.get().$promise.then(
      function (result) {
        $scope.orakelData = result;
      },
      function (error) {
        AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
      }
    );

    $scope.activegroup = null;
    /*
     * event functies
     * ----------------------------------
     */
    $scope.ChangeGroep = function () {

    }


    /*
     * Teken functies
     * ------------------------------------
     */

    $scope.tekenLedenaantallen = function () {
      wisGrafiek();
    }

    $scope.tekenEigenschappen = function (){
      wisGrafiek();
      var ctx = $("#grafiek");
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
      var type = "bar";
      console.log($scope.orakelData.eigenschappen.datasets[0].data)
      var data = {
        labels: $scope.orakelData.eigenschappen.datasets[0].labels,
        datasets : [{
          label: $scope.orakelData.eigenschappen.datasets[0].name,
          backgroundColor: chartColors[0].background,
          borderColor: chartColors[0].border,
          data: $scope.orakelData.eigenschappen.datasets[0].data
        }]
      }
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
          }
        }
      });

    }

    $scope.tekenGroepsevolutie = function () {
      wisGrafiek();
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

     $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          title: {
            display: true,
            text: "Groepsevolutie",
            fontSize: 20,
            padding: 20
          },
          legend:{
            display: true,
            position: "bottom",
            padding: 20
          }
        }
      });
    }

    $scope.tekenLedenaantalPerLeeftijd = function () {
      wisGrafiek();
      var ctx = $("#grafiek");
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
      var type = "bar";
      var data = {
        labels: $scope.orakelData.ledenaantalPetLeeftijd.labels,
        datasets : []
      }
      angular.forEach($scope.orakelData.ledenaantalPetLeeftijd.datasets, function(value, key){
        var dataset = {
          label: value.name,
          backgroundColor: chartColors[key].background,
          borderColor: chartColors[key].border,
          data: value.data
        }
        data.datasets.push(dataset);
      });
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          title: {
            display: true,
            text: "Leden aantal per leeftijd",
            fontSize: 20,
            padding: 20
          },
          legend: {
            display: true,
            position: "bottom",
            padding: 20
          },
          scales: {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
      });
    }

    $scope.tekenHuidigeLeidingsErvaring = function() {
      wisGrafiek();
      $("#grafiek").empty();
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
      var animation = { animateScale:true };
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        animation: animation,
        options: {
          title: {
            display: true,
            text: "Huidige leidingservaring",
            fontSize: 20,
            padding: 20
          },
          legend:{
            display: true,
            position: "bottom"
          }
        }
      });

    }

    $scope.tekenInEnUitstroom = function() {
      wisGrafiek();
      var ctx = $("#grafiek");
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
      var type = "bar";
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
      $scope.grafiek = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          title: {
            display: true,
            text: "In- en uitstroom per leeftijd",
            fontSize: 20,
            padding: 20
          },
          legend: {
            display: true,
            position: "bottom",
            padding: 20
          },
          scales: {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
      });
    }

    var wisGrafiek = function(){
       $scope.grafiek ? $scope.grafiek.destroy() : "";
    }
}

})();

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
        console.log(result);
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

    }

    $scope.tekenEigenschappen = function (){

    }

    $scope.tekenGroepsevolutie = function () {
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

      var options = {scales: {yAxes: [{ ticks: { beginAtZero: true } }]}};

      var myChart = new Chart(ctx, {
        options: options,
        type: type,
        data: data
      });
    }

    $scope.tekenLedenaantalPerLeeftijd = function () {

    }

    $scope.tekenHuidigeLeidingsErvaring = function() {
      var chartColors = ["rgba(232, 232, 96, 0.62)", "rgba(141, 221, 119, 0.62)", "rgba(236, 148, 76, 0.59)", "rgba(76, 83, 236, 0.59)", "rgba(212, 94, 94, 0.59)", "rgba(120, 97, 218, 0.59)"];
      var chartHoverColors = ["rgba(232, 232, 96, 1)", "rgba(141, 221, 119, 1)", "rgba(236, 148, 76, 1)", "rgba(76, 83, 236, 1)", "rgba(212, 94, 94, 1)", "rgba(120, 97, 218, 1)"];

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
      var myChart = new Chart(ctx, {
        type: type,
        data: data,
        animation: animation
      });

    }
    $scope.tekenInEnUitstroom = function() {

    }
}

})();

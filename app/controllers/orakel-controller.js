(function () {
  'use strict';

  angular
    .module('ga.orakelcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('OrakelController', OrakelController);

  OrakelController.$inject = ['$scope', '$routeParams', '$window', '$location', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'access', 'keycloak'];

  function OrakelController($scope, $routeParams, $window, $location, RestService, AlertService, DialogService, $rootScope, access, keycloak) {

    if(!access) {
      $location.path("/lid/profiel");
    }

    $(function() {
      window.app.setWidthStickyPanel();
    });

    // Scope variabele
    $scope.showLedenAantallen = false;
    $scope.showEigenschappen = false;
    $scope.showGrafiek = false;
    $scope.currentView = "";
    $scope.activegroup = null;

    // Globale grafiek opties
    var globalOptions = {
      maintainAspectRatio: true,
      responsive: true,
      title: {
        display: true,
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
          display: true
        }],
        yAxes: [{
          display: true
        }]
      }
    };

    $scope.sortedKeys = function (obj) {
      return _.sortBy(Object.keys(obj), [function(key) {
        if (/^[0-9]+$/.test(key)) {
          return Number(key);
        } else {
          return key.replace('Nu', '9999');
        }
      }]);
    }

    $scope.sortedValues = function (obj) {
      return _.map($scope.sortedKeys(obj), function(key) {
        return obj[key];
      });
    }

    /*
     * Teken functies
     * ------------------------------------
     */

    $scope.tekenLedenaantallen = function () {
      wisGrafiek();

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

      //console.log("groepsevolutie")
      //console.log($scope.orakelData.groepsevolutie)

      var type = "line";
      var data = {
        labels: $scope.sortedKeys($scope.orakelData.groepsevolutie[0].aantalPersonen),
        datasets: []
      };

      angular.forEach($scope.orakelData.groepsevolutie, function(value, index){
        data.datasets.push({
          label: value.naam,
          fill: false,
          lineTension: 0,
          backgroundColor: chartColors[index].background,
          borderColor: chartColors[index].border,
          pointBackgroundColor: chartColors[index].border,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: chartColors[index].border,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          pointHitRadius: 10,
          data: $scope.sortedValues(value.aantalPersonen),
        });
      });

      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Groepsevolutie";
      grafiekOpties.scales.xAxes[0].display = true;
      grafiekOpties.scales.yAxes[0].display = true;

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

      //console.log("ledenPerLeeftijd")
      //console.log($scope.orakelData.ledenPerLeeftijd)

      var alleJaren = [];
      _.forEach($scope.orakelData.ledenPerLeeftijd, function(value, key) {
        alleJaren = _.concat(alleJaren, Object.keys(value));
      });
      var alleJaren = _.uniq(alleJaren);
      alleJaren.sort();
      alleJaren.reverse(); // Jongste leden (met hoogste geboortejaar) eerst

      var data = {
        labels: alleJaren,
        datasets: []
      }
      _.forEach($scope.sortedKeys($scope.orakelData.ledenPerLeeftijd), function(keySoort, index) {
        var values = _.fill(new Array(alleJaren.length), 0);
        _.forEach($scope.orakelData.ledenPerLeeftijd[keySoort], function(valueAantal, keyJaar) {
          values[alleJaren.indexOf(keyJaar)] = valueAantal;
        });

        data.datasets.push({
          label: ({
            '10': 'Leiding',
            '20': 'Jins',
            '30': 'Gidsen/Verkenners',
            '40': 'Jongidsen/Jongverkenners',
            '50': 'Kabouters/Welpen',
            '60': 'Kapoenen',
            '70': 'Akabe'
          })[keySoort],
          backgroundColor: chartColors[index].background,
          borderColor: chartColors[index].border,
          data: values
        });
      });

      data.datasets.reverse(); // Jonste leden eerst

      //grafiek opties aanpassen naar de eigenschappen van dit type
      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Ledenaantal per leeftijd";
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
        type: "bar",
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

      //console.log("leidingservaring")
      //console.log($scope.orakelData.leidingservaring)

      var type = "doughnut";
      var data = {
        labels: $scope.sortedKeys($scope.orakelData.leidingservaring).map(function(jaar) {
          return jaar + ' jaar';
        }),
        datasets : [{
          data: $scope.sortedValues($scope.orakelData.leidingservaring),
          backgroundColor: chartColors,
         hoverBackgroundColor: chartHoverColors
        }]
      };

      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Leidingservaring";
      grafiekOpties.scales.xAxes[0].display = false;
      grafiekOpties.scales.yAxes[0].display = false;

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

      //console.log("instroom")
      //console.log($scope.orakelData.instroom)

      //console.log("uitstroom")
      //console.log($scope.orakelData.uitstroom)

      var data = {
        labels: $scope.sortedKeys($scope.orakelData.uitstroom[0].aantalPerLeeftijd),
        datasets : []
      }
      _.forEach($scope.orakelData.uitstroom, function(value, index) {
        data.datasets.push({
          label: value.werkjaar,
          backgroundColor: chartColors[index % 6].background,
          borderColor: chartColors[(index + 2 * Math.round(index / 6)) % 6].border,
          data: $scope.sortedValues(value.aantalPerLeeftijd)
        });
      });

      data.datasets = _.sortBy(data.datasets, 'label');

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
        type: "bar",
        data: data,
        options: grafiekOpties
      });
      $scope.currentView = "InEnUitstroom";
    }

    $scope.tekenSparkline = function (obj){
      console.log('Sparkline TODO', obj);
    }

    $scope.round = function(value, digits) {
      if (value) {
        var factor = Math.pow(10, digits);
        return Math.round(factor * value) / factor;
      } else {
        return value;
      }
    }

    $scope.format = function(value, formaat) {
      var value = $scope.round(value, parseInt(formaat.substring(2)));
      return formaat.replace(/[^f]+f/, value).replace('%%', '%');
    }

    $scope.sparklineData = function(obj) {
      var result = '';
      _.forEach($scope.sortedKeys(obj), function(key, index) {
        if (key == 'Nu') {
          result += '0:' + obj[key];
        } else {
          result += obj[key] + ':0,';
        }
      });
      return result;
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
      $scope.isLoadingData = true;
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
          $scope.isLoadingData = false;
        },
        function (error) {
          AlertService.add('danger', "Error" + error.status + ". " + error.statusText);
          $scope.isLoadingData = false;
        }

      );
    }



    /*
     * event functies
     * ----------------------------------
     */
    $scope.ChangeGroep = function () {
      // nieuwe grafiekdata ophalen

      grafiekDataOphalen();
    }



}

})();

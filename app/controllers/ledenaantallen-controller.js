(function () {
  'use strict';

  angular
    .module('ga.ledenaantallencontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('ledenaantallenController', ledenaantallenController);

  ledenaantallenController.$inject = ['$compile', '$http', '$scope', '$routeParams', '$window', '$location', 'CacheService', 'RestService', 'AlertService', 'DialogService', '$rootScope', 'access', 'keycloak'];

  function ledenaantallenController($compile, $http, $scope, $routeParams, $window, $location, CS, RestService, AlertService, DialogService, $rootScope, access, keycloak) {

    if(!access) {
      $location.path("/lid/profiel");
    }

    $scope.changeGroep = function (groepsnummer) {
      console.log("groepsnummer -----", groepsnummer);
      $scope.isLoadingData = true;
      // grafiek data ophalen
      //$http.get("data/ledenaantallen.json").then(
      RestService.ledenaantallen.get({groepsnummer: groepsnummer}).$promise.then(
        function (res) {
          //var res = res.data;
          $scope.ledenaantallenData = res;
          $scope.tekenGroepsevolutie(res);
          $scope.tekenLedenaantalPerLeeftijd(res);
          $scope.tekenHuidigeLeidingsErvaring(res);
          $scope.tekenInEnUitstroom(res);
          $scope.isLoadingData = false;
        },
        function (error) {
          AlertService.add('danger', error, 5000);
          $scope.isLoadingData = false;
        }
      );
    }

    var init = function(){
      $scope.tabs = initTabs();
      // activeer eerste tab
      $scope.activateTab("ledenaantallen");

      //$scope.changeGroep('O1504G');
      // groepen ophalen
      CS.Groepen().then(
        function (result) {
          $scope.groepen = result.groepen;
          $scope.activegroup = result.groepen[0];
          $scope.changeGroep($scope.activegroup.groepsnummer);
        },
        function (error){

        }
      );
    }

    var initTabs = function(){
      var tabs = {
        ledenaantallen : {
          'label': 'Ledenaantallen',
          'activated' : false
        },
        eigenschappen : {
          'label': 'Eigenschappen',
          'activated' : false
        },
        groepsevolutie : {
          'label': 'Groepsevolutie',
          'activated' : false
        },
        ledenaantalperleeftijd : {
          'label': 'Ledenaantal per leeftijd',
          'activated' : false
        },
        huidigeleidingservaring : {
          'label': 'Huidige leidingservaring',
          'activated' : false
        },
        inuitstroomperleeftijd : {
          'label': 'Instroom en uitstroom per leeftijd',
          'activated' : false
        }
      };
      return tabs;
    }

    var redrawGraph = function(graphParentId){
      angular.element('#'+graphParentId+'Grafiek').remove();
      var canvas_html = '<canvas id="'+graphParentId+'Grafiek"></canvas>';

      var element = angular.element(canvas_html);
      $compile(element)($scope);
      angular.element('#'+graphParentId).append(element);
      return $('#'+graphParentId+'Grafiek');

    }

    $scope.deactivateAllTabs = function(){
      _.each($scope.tabs,function(val,k){
        val.activated = false;
      });
    }
    $scope.activateTab = function(tabKey){
      $scope.deactivateAllTabs();
      $scope.tabs[tabKey].activated = true;
    }

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

    $scope.tekenGroepsevolutie = function(ledenaantallenData) {


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

      var ctx = redrawGraph('groepsevolutie');

      var type = "line";
      var data = {
        labels: $scope.sortedKeys(ledenaantallenData.groepsevolutie[0].aantalPersonen),
        datasets: []
      };

      angular.forEach(ledenaantallenData.groepsevolutie, function(value, index){
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

      var chart = new Chart(ctx, {
        type: type,
        data: data,
        options: grafiekOpties
      });
    }

    $scope.tekenLedenaantalPerLeeftijd = function(ledenaantallenData) {


      var ctx = redrawGraph('ledenaantalperleeftijd');

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

      var alleJaren = [];
      _.forEach(ledenaantallenData.ledenPerLeeftijd, function(value, key) {
        alleJaren = _.concat(alleJaren, Object.keys(value));
      });
      var alleJaren = _.uniq(alleJaren);
      alleJaren.sort();
      alleJaren.reverse(); // Jongste leden (met hoogste geboortejaar) eerst

      var data = {
        labels: alleJaren,
        datasets: []
      }
      _.forEach($scope.sortedKeys(ledenaantallenData.ledenPerLeeftijd), function(keySoort, index) {
        var values = _.fill(new Array(alleJaren.length), 0);
        _.forEach(ledenaantallenData.ledenPerLeeftijd[keySoort], function(valueAantal, keyJaar) {
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
      var chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: grafiekOpties
      });
    }

    $scope.tekenHuidigeLeidingsErvaring = function(ledenaantallenData) {


      var chartHoverColors = ["rgba(232, 232, 96, 0.62)", "rgba(141, 221, 119, 0.62)", "rgba(236, 148, 76, 0.59)", "rgba(76, 83, 236, 0.59)", "rgba(212, 94, 94, 0.59)", "rgba(120, 97, 218, 0.59)"];
      var chartColors = [
        "rgba(232, 232, 96, 1)",
        "rgba(141, 221, 119, 1)",
        "rgba(236, 148, 76, 1)",
        "rgba(76, 83, 236, 1)",
        "rgba(212, 94, 94, 1)",
        "rgba(120, 97, 218, 1)",
        "rgba(232, 232, 96, 1)",
        "rgba(141, 221, 119, 1)",
        "rgba(236, 148, 76, 1)",
        "rgba(76, 83, 236, 1)",
        "rgba(212, 94, 94, 1)",
        "rgba(120, 97, 218, 1)"
      ];

      var ctx = redrawGraph('huidigeleidingservaring');

      var type = "doughnut";
      var data = {
        labels: $scope.sortedKeys(ledenaantallenData.leidingservaring).map(function(jaar) {
          return jaar + ' jaar';
        }),
        datasets : [{
          data: $scope.sortedValues(ledenaantallenData.leidingservaring),
          backgroundColor: chartColors,
         hoverBackgroundColor: chartHoverColors
        }]
      };

      var grafiekOpties = globalOptions;
      grafiekOpties.title.text = "Leidingservaring";
      grafiekOpties.scales.xAxes[0].display = false;
      grafiekOpties.scales.yAxes[0].display = false;

      var animation = { animateScale:true };
      var chart = new Chart(ctx, {
        type: type,
        data: data,
        animation: animation,
        options: grafiekOpties
      });
    }

    $scope.tekenInEnUitstroom = function(ledenaantallenData) {



      var ctx = redrawGraph('inuitstroomperleeftijd');
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

      var data = {
        labels: $scope.sortedKeys(ledenaantallenData.uitstroom[0].aantalPerLeeftijd),
        datasets : []
      }
      _.forEach(ledenaantallenData.uitstroom, function(value, index) {
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
      var chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: grafiekOpties
      });
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


    init();

}

})();

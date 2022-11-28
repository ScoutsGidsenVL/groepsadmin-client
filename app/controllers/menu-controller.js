(function () {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$timeout', 'UserAccess', '$q'];

  function MenuController($scope, $timeout, UserAccess, $q) {

    function updateMenu(ledenlijst, groep, aanvragen) {
      $scope.menuItems = [
        {
          label: 'Ledenlijst',
          condition: ledenlijst,
          iconclasses: 'fa fa-users',
          href: '#/ledenlijst'
        },
        {
          label: 'Ledenaantallen',
          condition: groep,
          iconclasses: 'fa fa-area-chart',
          href: '#/ledenaantallen'
        },
        {
          label: 'Groepsinstellingen',
          condition: groep,
          iconclasses: 'fa fa-cogs',
          href: '#/groepsinstellingen'
        },
        {
          label: 'Profiel',
          condition: true,
          iconclasses: 'fa fa-user',
          href: '#/lid/profiel'
        },
        {
          label: 'Lidaanvragen',
          condition: aanvragen,
          iconclasses: 'fa fa-address-book-o',
          href: '#/aanvragen'
        },
        {
          label: 'Nieuwe Groepsadministratie',
          condition: true,
          iconclasses: 'fa fa-external-link',
          href:
            window.origin = 'localhost:8000' ?  'http://localhost:3000/groepsadmin/frontend/dashboard'
            : window.origin = 'https://ga-staging.scoutsengidsenvlaanderen.be/' ? 'https://ga-staging.scoutsengidsenvlaanderen.be/groepsadmin/frontend/dashboard'
            : 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/frontend/dashboard'
        }
      ];

      $timeout(function () {
        window.app.positionBody();
      }, 10);
    }

    var ledenlijst = false;
    var groep = false;

    updateMenu(ledenlijst, groep);

    /*UserAccess.hasAccessToGroepen().then(function(conditionGroep){
      ledenlijst |= conditionGroep; // in parktijk komen deze rechten overeen
      groep |= conditionGroep;
      updateMenu(ledenlijst, groep);
    });

    UserAccess.hasAccessTo("ledenlijst").then(function(conditionLedenLijst){
      ledenlijst |= conditionLedenLijst;
      groep |= conditionLedenLijst; // in parktijk komen deze rechten overeen
      updateMenu(ledenlijst, groep);
    });*/

    $q.all([UserAccess.hasAccessToGroepen(), UserAccess.hasAccessTo("ledenlijst"), UserAccess.hasAccessTo("aanvragen")])
      .then(function (result) {
        var conditionGroep = result[0];
        var conditionLedenLijst = result[1];
        var conditionAanvragen = result[2];

        updateMenu(conditionLedenLijst, conditionGroep, conditionAanvragen);
      })
  }
})();

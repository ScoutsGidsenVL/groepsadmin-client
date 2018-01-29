(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$timeout', '$window', 'UserAccess'];

  function MenuController ($scope, $timeout, $window, UserAccess) {

    function updateMenu(ledenlijst, groep) {
      $scope.menuItems = [
        {
          label: 'Ledenlijst',
          condition: ledenlijst,
          iconclasses : 'fa fa-users',
          href: '#/ledenlijst'
        },
        {
          label: 'Ledenaantallen',
          condition: groep,
          iconclasses : 'fa fa-area-chart',
          href: '#/ledenaantallen'
        },
        {
          label: 'Groepsinstellingen',
          condition: groep,
          iconclasses : 'fa fa-cogs',
          href: '#/groepsinstellingen'
        },
        {
          label: 'Profiel',
          condition: true,
          iconclasses : 'fa fa-user',
          href: '#/lid/profiel'
        },
        {
          label: 'Feedback',
          condition: true,
          iconclasses : 'fa fa-comments-o',
          href: 'https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:betaversie_testen'
        },
        {
          label: 'Oude Groepsadmin',
          condition: true,
          iconclasses : 'fa fa-institution',
          href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/'
        }
      ];

      $timeout(function() {
        window.app.positionBody();
      }, 10);
    }

    var ledenlijst = false;
    var groep = false;

    updateMenu(ledenlijst, groep);

    UserAccess.hasAccessToGroepen().then(function(conditionGroep){
      ledenlijst |= conditionGroep; // in parktijk komen deze rechten overeen
      groep |= conditionGroep;
      updateMenu(ledenlijst, groep);
    });

    UserAccess.hasAccessTo("ledenlijst").then(function(conditionLedenLijst){
      ledenlijst |= conditionLedenLijst;
      groep |= conditionLedenLijst; // in parktijk komen deze rechten overeen
      updateMenu(ledenlijst, groep);
    });
  }
})();

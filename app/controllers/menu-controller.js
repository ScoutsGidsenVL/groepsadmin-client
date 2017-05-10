(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', 'UserAccess'  ];

  function MenuController ($scope, UserAccess) {

    $scope.menuItems = [
      {
        label: 'Leden',
        condition: UserAccess.hasAccessTo("ledenlijst"),
        iconclasses : 'fa fa-users',
        href: '#/ledenlijst'
      },
      {
        label: 'Groepsinstellingen',
        condition: UserAccess.hasAccessToGroepen(),
        iconclasses : 'fa fa-cogs',
        href: '#/groepsinstellingen'
      },
      {
        label: 'Ledenaantallen',
        condition: UserAccess.hasAccessToGroepen(),
        iconclasses : 'fa fa-area-chart',
        href: '#/orakel'
      },
      {
        label: 'Oude Groepsadmin',
        condition: UserAccess.hasAccessTo("profiel"),
        iconclasses : 'fa fa-institution',
        href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/'
      }
    ];

    _.forEach($scope.menuItems, function(menuItem) {
      menuItem.condition.then(function (reponse) {
        menuItem.condition = reponse;
      });
    });
  }
})();

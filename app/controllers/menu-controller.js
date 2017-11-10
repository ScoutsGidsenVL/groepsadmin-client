(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$window', 'UserAccess'  ];

  function MenuController ($scope, $window, UserAccess) {
    UserAccess.hasAccessToGroepen().then(function(condition){
      $scope.menuItems = [
        {
          label: 'Ledenlijst',
          condition: UserAccess.hasAccessTo("ledenlijst"),
          iconclasses : 'fa fa-users',
          href: '#/ledenlijst'
        },
        {
          label: 'Ledenaantallen',
          condition: condition,
          iconclasses : 'fa fa-area-chart',
          href: '#/orakel'
        },
        {
          label: 'Groepsinstellingen',
          condition: condition,
          iconclasses : 'fa fa-cogs',
          href: '#/groepsinstellingen'
        },
        {
          label: 'Profiel',
          condition: UserAccess.hasAccessTo("profiel"),
          iconclasses : 'fa fa-user',
          href: '#/lid/profiel'
        },
        {
          label: 'Feedback',
          condition: UserAccess.hasAccessTo("profiel"),
          iconclasses : 'fa fa-comments-o',
          href: 'https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:betaversie_testen'
        },
        {
          label: 'Oude Groepsadmin',
          condition: UserAccess.hasAccessTo("profiel"),
          iconclasses : 'fa fa-institution',
          href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/'
        }
      ];

    });


    _.forEach($scope.menuItems, function(menuItem,k) {
        window.app.positionBody();
    });
  }
})();

(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$window', 'UserAccess'  ];

  function MenuController ($scope, $window, UserAccess) {

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
        label: 'Profiel',
        iconclasses : 'fa fa-user',
        condition: UserAccess.hasAccessTo("profiel"),
        href: '#/lid/profiel'
      },
      {
        label: 'Oude Groepsadmin',
        condition: UserAccess.hasAccessTo("profiel"),
        iconclasses : 'fa fa-institution',
        href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/'
      }
    ];


    _.forEach($scope.menuItems, function(menuItem,k) {
      menuItem.condition.then(function (reponse) {
        menuItem.condition = reponse;
        // when last menu item is resolved (and thus rendered), we will add padding to the body
        // so the content can't become hidden by the fixed positioned menu
        if(k == $scope.menuItems.length-1){
            window.app.positionBody();
        }
      });

    });
  }
})();

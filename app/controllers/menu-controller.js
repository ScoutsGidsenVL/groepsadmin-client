(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$timeout', '$window', 'UserAccess'  ];

  function MenuController ($scope, $timeout, $window, UserAccess) {
    UserAccess.hasAccessToGroepen().then(function(conditionGroep){
      UserAccess.hasAccessTo("ledenlijst").then(function(conditionLedenLijst){
        UserAccess.hasAccessTo("profiel").then(function(conditionProfiel){

          $scope.menuItems = [
            {
              label: 'Ledenlijst',
              condition: conditionLedenLijst,
              iconclasses : 'fa fa-users',
              href: '#/ledenlijst'
            },
            {
              label: 'Ledenaantallen',
              condition: conditionGroep,
              iconclasses : 'fa fa-area-chart',
              href: '#/orakel'
            },
            {
              label: 'Groepsinstellingen',
              condition: conditionGroep,
              iconclasses : 'fa fa-cogs',
              href: '#/groepsinstellingen'
            },
            {
              label: 'Profiel',
              condition: conditionProfiel,
              iconclasses : 'fa fa-user',
              href: '#/lid/profiel'
            },
            {
              label: 'Feedback',
              condition: conditionProfiel,
              iconclasses : 'fa fa-comments-o',
              href: 'https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:betaversie_testen'
            },
            {
              label: 'Oude Groepsadmin',
              condition: conditionProfiel,
              iconclasses : 'fa fa-institution',
              href: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/'
            }
          ];

          $timeout(function() {
            window.app.positionBody();
          }, 10);

        })
      });
    });
  }
})();

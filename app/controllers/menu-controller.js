(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', 'UserAccess'  ];

  function MenuController ($scope, UserAccess) {

    var createMenuItems = function(){

      // Create menu items here
      var MenuObjs = [
        {
          label: 'Leden',
          condition: UserAccess.hasAccessTo("ledenlijst"),
          iconclasses : 'fa fa-users',
          href: '#/',
          desktop: true
        },
        {
          label: 'Groepsinstellingen',
          condition: UserAccess.hasAccessTo("groepen"),
          iconclasses : 'fa fa-cogs',
          href: '#/groepsinstellingen',
          desktop: true
        },
        {
          label: 'Groepsstatistieken',
          condition: UserAccess.hasAccessTo("groepen"),
          iconclasses : 'fa fa-area-chart',
          href: '#/orakel',
          desktop: true
        },
        {
          label: 'Oude Groepsadmin',
          condition: true,
          iconclasses : 'fa fa-institution',
          href: '#/orakel',
          desktop: false
        }
      ];

      return MenuObjs;

    }


    $scope.menuItems = createMenuItems();

  }



})();

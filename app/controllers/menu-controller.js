(function() {
  'use strict';

  angular
    .module('ga.menucontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', 'UserAccess'  ];

  function MenuController ($scope, UserAccess) {
    $scope.accessLeden = UserAccess.hasAccessTo("ledenlijst");
    $scope.accessGroepen = UserAccess.hasAccessTo("groepen");
  }

})();

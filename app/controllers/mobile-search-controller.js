(function() {
  'use strict';

  angular
    .module('ga.mobsearchcontroller', [])
    .controller('MobileSearchController', MobileSearchController);

  MobileSearchController.$inject = ['$scope' ];

  function MobileSearchController ($scope) {
    $scope.isMobileSearchVisible = false;

    $scope.toggleMobileSearch = function(){
      $scope.isMobileSearchVisible = !$scope.isMobileSearchVisible;
    }
  }



})();

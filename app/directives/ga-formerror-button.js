(function() {
  'use strict';

  angular
    .module('ga.formerrorbutton', [])
    .directive('formerrorbutton', formerrorbutton);

  function formerrorbutton() {
    return {
      restrict: 'E',
      template: '<button ng-hide="!formulier.$invalid" class="btn btn-primary" type="button" ng-click="setFocusFirstInvalid();">Fouten <span class="badge">{{ formulier.$error.required.length }}</span></button>',
      replace: false,
      scope: {
        formulier: '='
      },
      controller: ErrorButtonController
    };
  }
  function ErrorButtonController($scope, $attrs) {
    $scope.setFocusFirstInvalid = function(){
      var firstInvalid = angular.element('.ng-invalid').focus();
      firstInvalid.focus();
    }
  }

})();

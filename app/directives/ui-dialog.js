// Based on AngularJS directive for Bootstrap's alert.

(function() {
  'use strict';

  angular
    .module('ga.ui.dialog', [])
    .directive('dialog', dialog)

  function dialog() {
    return {
      restrict: 'EA',
      controller: DialogController,
      templateUrl: 'dialog.html',
      transclude: true,
      replace: true,
      scope: {
        confirm: '&',
        dismiss: '&',
        close: '&',
        title: '@'
      }
    };
  }


  function DialogController($scope, $attrs) {

    $scope.closeable = 'close' in $attrs;
    this.close = $scope.close;

    $scope.confirmable = 'confirm' in $attrs;
    this.confirm = $scope.confirm;

    $scope.dismissable = 'dismiss' in $attrs;
    this.dissmis = $scope.dismiss;
  }
})();

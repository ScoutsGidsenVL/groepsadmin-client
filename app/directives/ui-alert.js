// AngularJS directive for Bootstrap's alert.
//
// Fork of "AngularUI"
// Code licensed under MIT License.
// http://angular-ui.github.io/bootstrap/

(function() {
  'use strict';

  angular
    .module('ga.ui.alert', [])
    .directive('alert', alert)
  //.directive('dismissOnTimeout', dismissOnTimeout);


  function alert() {
    return {
      restrict: 'EA',
      controller: AlertController,
      templateUrl: 'alert.html',
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        close: '&'
      },
      /*controller: ['$scope', '$attrs', function($scope, $attrs) {
        $scope.closeable = 'close' in $attrs;
        this.close = $scope.close;
      }]*/
    };
  }

  AlertController.$inject = ['$scope', '$attrs'];

  function AlertController($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
    this.close = $scope.close;

  }

  /*
  .directive('dismissOnTimeout', ['$timeout', function($timeout) {
    return {
      require: 'alert',
      link: function(scope, element, attrs, alertCtrl) {
        $timeout(function(){
          alertCtrl.close();
        }, parseInt(attrs.dismissOnTimeout, 10));
      }
    };
  }]);
  */
})();

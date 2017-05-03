(function() {
  'use strict';

  angular.module('ga')
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('httpInterceptor');
    }]);
})();
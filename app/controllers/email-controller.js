(function() {
  'use strict';

  angular
    .module('ga.emailcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('EmailController', EmailController);

  EmailController.$inject = ['$scope', 'RestService'];

  function EmailController ($scope, RestService) {


  }

})();

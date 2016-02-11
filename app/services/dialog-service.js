(function() {
  'use strict';

  angular
    .module('ga.services.dialog', [])
    .factory('DialogService', DialogService);

  DialogService.$inject = ['$rootScope'];

  function DialogService($rootScope) {
    var dialogService = {};
    $rootScope.dialog;

    return dialogService = {
      new: function(title, msg, returnfunctie) {
        var dialog = {
          title: title,
          msg: msg,
          close: function() {
            returnfunctie(false);
            $rootScope.dialog = null;
          },
          confirm: function() {
            returnfunctie(true);
            $rootScope.dialog = null;
          }
        };
        $rootScope.dialog = dialog;
        return dialog;
      }
    };
  };
})();

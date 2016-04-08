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
      new: function(title, msg, returnfunctie, extraparamObj) {
        var dialog = {
          title: title,
          msg: msg,
          close: function() {
            if(extraparamObj != undefined){
              if( extraparamObj.falseVal != undefined){
                $rootScope.dialog = null;
                returnfunctie(false, extraparamObj.falseVal);
              }
              else{
                $rootScope.dialog = null;
                returnfunctie(false);
              }
            }
            else{
              $rootScope.dialog = null;
              returnfunctie(false);
            }

          },
          confirm: function() {
            if(extraparamObj != undefined){
              if(extraparamObj.trueVal != undefined){
                $rootScope.dialog = null;
                returnfunctie(true, extraparamObj.trueVal);
              }
              else{
                $rootScope.dialog = null;
                returnfunctie(true);
              }
            }
            else{
              $rootScope.dialog = null;
              returnfunctie(true);
            }
          }
        };
        $rootScope.dialog = dialog;
        return dialog;
      }
    };
  };
})();

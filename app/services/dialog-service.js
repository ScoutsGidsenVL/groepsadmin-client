(function() {
  'use strict';

  angular
    .module('ga.services.dialog', [])
    .factory('DialogService', DialogService);

  DialogService.$inject = ['$rootScope'];

  function DialogService($rootScope) {
    $rootScope.dialogs = [];

    return {
      new: function(title, melding, vraag, returnFunctie, extraParamObj) {
        var dialog = {
          title: title,
          melding: melding,
          vraag: vraag,
          // Aangeroepen vanuit de view
          close: function() {
            this._exit(false);
          },
          // Aangeroepen vanuit de view
          confirm: function() {
            this._exit(true);
          },
          // Aangeroepen vanuit de view
          dismiss: function() {
            this._exit(false);
          },
          _exit: function(result) {
            returnFunctie(result, extraParamObj && extraParamObj.trueVal);

            var index = $rootScope.dialogs.indexOf(dialog);
            if (0 <= index) {
              $rootScope.dialogs.splice(index, 1);
            }
          }
        };

        console.log(dialog);

        $rootScope.dialogs.push(dialog);
        return dialog;
      },

      bevestig: function(data, returnFunctie) {
        console.log(data);
        this.new('Bevestig', data.boodschap, data.vraag, returnFunctie);
      },

      paginaVerlaten: function(locationChange, newUrl) {
        console.log(newUrl);
        var paramObj = {
          trueVal: newUrl
        };
        this.new('Pagina verlaten', 'Er zijn nog niet opgeslagen wijzigingen.', 'Ben je zeker dat je wil verdergaan?', locationChange, paramObj);
      }
    };
  };
})();

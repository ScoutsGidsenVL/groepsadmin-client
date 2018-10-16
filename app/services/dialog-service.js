(function() {
  'use strict';

  angular
    .module('ga.services.dialog', [])
    .factory('DialogService', DialogService);

  DialogService.$inject = ['$q', '$rootScope'];

  function DialogService($q, $rootScope) {
    $rootScope.dialogs = [];

    return {
      new: function(title, melding, vraag, returnFunctie, extraParamObj) {

        var deferred = $q.defer();

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
            if(typeof(returnFunctie) === 'function') {
              $q.when(returnFunctie(result, extraParamObj && extraParamObj.trueVal))
                .then(function(result) {
                  console.log(result);
                  deferred.resolve(result);
                }).catch(function(failure) {
                console.log(failure);
                deferred.reject(failure);
              });
            }
            else {
              deferred.resolve(result);
            }


            var index = $rootScope.dialogs.indexOf(dialog);
            if (0 <= index) {
              $rootScope.dialogs.splice(index, 1);
            }
          }
        };

        console.log(dialog);
        $rootScope.dialogs.push(dialog);

        return deferred.promise;
      },

      bevestig: function(data, returnFunctie) {
        console.log(data);
        return this.new('Bevestig', data.boodschap, data.vraag, returnFunctie);
      },

      paginaVerlaten: function(locationChange, newUrl) {
        console.log(newUrl);
        var paramObj = {
          trueVal: newUrl
        };
        return this.new('Pagina verlaten', 'Er zijn nog niet opgeslagen wijzigingen.', 'Ben je zeker dat je wil verdergaan?', locationChange, paramObj);
      }
    };
  }
})();

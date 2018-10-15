(function () {
  'use strict';

  angular
    .module('ga.aanvragencontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('aanvragenController', aanvragenController);

  aanvragenController.$inject = ['$rootScope', '$scope', '$http', '$location', 'access', 'RestService', 'AlertService', 'DialogService'];

  function aanvragenController($rootScope, $scope, $http, $location, access, RestService, AlertService, DialogService) {
    if(!access){
      $location.path("/lid/profiel");
    }

    function init() {
      RestService.LidAanvraag.lijst().$promise.then(function (result) {
        $scope.aanvragen = result.aanvragen;
      });
    }

    init();

    $scope.goedkeuren = function (aanvraag) {
      var link = _.find(aanvraag.links, {rel: 'afkeuren'});
      aanvraag.adres.postadres = true;

      $rootScope.defaultLid = {
        vgagegevens: {
          voornaam: aanvraag.voornaam,
          achternaam: aanvraag.achternaam,
          verminderdlidgeld: aanvraag.verminderdlidgeld,
          geboortedatum: aanvraag.geboortedatum
        },
        persoonsgegevens: aanvraag.persoonsgegevens,
        email: aanvraag.email,
        id: aanvraag.id,
        adressen: [
          aanvraag.adres
        ],
        lidaanvraag: link
      };
      $location.path("/lid/toevoegen");
    };

    $scope.afkeuren = function (aanvraag) {
      var link = _.find(aanvraag.links, {rel: 'afkeuren'});

      if (link) {
        var dialogData = {
          boodschap: "Lidaanvraag verwijderen",
          vraag: "Ben je zeker dat je deze aanvraag wil afkeuren"
        };

        DialogService.bevestig(dialogData)
          .then(function (result) {
            if (result) {
              aanvraag.saving = true;

              $http({
                url: link.href,
                method: link.method
              })
                .then(function () {
                  AlertService.add('success ', "Lidaanvraag is verwijderd");
                  init();
                })
                .catch(function (error) {
                  AlertService.add('danger', error);
                })
                .finally(function () {
                  delete aanvraag.saving;
                });
            }
          });
      }
    };


  }

})();

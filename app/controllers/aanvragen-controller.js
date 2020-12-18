(function () {
  'use strict';

  angular
    .module('ga.aanvragencontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('aanvragenController', aanvragenController);

  aanvragenController.$inject = ['$rootScope', '$scope', '$http', '$location', 'access', 'RestService', 'AlertService', 'DialogService'];

  function aanvragenController($rootScope, $scope, $http, $location, access, RestService, AlertService, DialogService) {
    if (!access) {
      $location.path("/lid/profiel");
    }

    function init() {
      $scope.isLoadingData = true;
      $scope.ExportCsvIsLoading = false;
      RestService.LidAanvraag.lijst().$promise.then(function (result) {
        $scope.aanvragen = result.aanvragen;
        $scope.isLoadingData = false;
      });
    }

    init();

    $scope.goedkeuren = function ($event, aanvraag) {
      console.log("test");
      $event.stopPropagation();
      var link = _.find(aanvraag.links, {rel: 'goedkeuren'});
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

    $scope.exportCsv = function () {
      var blob, obj = {};

      $scope.ExportCsvIsLoading = true;

      RestService.AanvragenCsv.get().$promise.then(function (res) {
        blob = new Blob([res.response], {type: 'text/csv'});
        obj.fileUrl = window.URL.createObjectURL(blob);
        obj.title = 'aanvragen.csv';
        var a = document.createElement('a');
        a.href = obj.fileUrl;
        a.download = obj.title;
        document.body.appendChild(a);
        a.click();
        $scope.ExportCsvIsLoading = false;
      });
    }

    $scope.afkeuren = function ($event, aanvraag) {
      function deleteAanvraag(rel) {
        aanvraag.saving = true;
        var link = _.find(aanvraag.links, {rel: rel});

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

      $event.stopPropagation();
      var dialogData = {
        boodschap: "Lidaanvraag verwijderen.",
        vraag: "Ben je zeker dat je deze aanvraag wil afkeuren?"
      };

      DialogService.bevestig(dialogData)
        .then(function (result) {
          if (result) {
            var bevestigMailDialogData = {
              boodschap: "Lidaanvraag verwijderen",
              vraag: "Wil je deze persoon mailen via <strong>" + aanvraag.email + "</strong>?"
            }
            DialogService.bevestig(bevestigMailDialogData)
              .then(function (bevestigResult) {
                if (bevestigResult) {
                  deleteAanvraag('afkeurenMetMail');
                } else if (bevestigResult != null) {
                  deleteAanvraag('afkeurenZonderMail');
                }
              })
          }
        });
    };
  }
})
();

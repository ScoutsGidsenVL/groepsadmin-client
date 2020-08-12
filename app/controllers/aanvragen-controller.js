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
      RestService.LidAanvraag.lijst().$promise.then(function (result) {
        $scope.aanvragen = result.aanvragen;
        $scope.isLoadingData = false;
      });
    }

    init();

    $scope.goedkeuren = function ($event, aanvraag) {
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

    $scope.afkeuren = function ($event, aanvraag) {
      console.log(aanvraag);
      console.log($event);
      $event.stopPropagation();
        var dialogData = {
          boodschap: "Lidaanvraag verwijderen.",
          vraag: "Ben je zeker dat je deze aanvraag wil afkeuren?"
        };        

        DialogService.bevestig(dialogData)
          .then(function (result) {           
            console.log(result); 
            if (result){
              function deleteAanvraag (rel){
                console.log(rel);
                aanvraag.saving = true;
                    link = _.find(aanvraag.links, {rel: rel});
  
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
              
              var bevestigMailDialogData = {
                boodschap: "Lidaanvraag verwijderen",
                vraag: "Wil je deze persoon mailen via <strong>" + aanvraag.email + "</strong>?"                
              } 
              DialogService.bevestig(bevestigMailDialogData)
              .then(function(bevestigResult){
                console.log(bevestigResult);
                if (bevestigResult){
                  deleteAanvraag('afkeurenMetMail');
                }
                else if (bevestigResult != null){
                  deleteAanvraag('afkeurenZonderMail');
                }
              })
            }
          });
    };


  }

})();

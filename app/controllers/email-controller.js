(function () {
  'use strict';

  angular
    .module('ga.emailcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EmailController', EmailController);

  EmailController.$inject = ['$log', '$q', '$routeParams', '$scope', '$uibModal', 'access', 'AlertService',
    'CacheService', 'EmailService', 'LedenLijstService', 'RestService', '$location'];

  function EmailController($log, $q, $routeParams, $scope, $uibModal, access, AlertService, CS, ES, LLS, RestService, $location) {

    // documentation tinyMCE plugin https://www.tinymce.com/docs/integrations/angularjs/
    var attachments = [];
    $scope.ledenLaden = false;
    $scope.ledenVisible = false;
    $scope.tinymceModel = 'Initial content';
    $scope.emailPropertiesWatchable = true;
    $scope.uniekeNamen = {};
    $scope.aantalLedenGeladen = 0;

    $scope.configEditor = function (velden) {
      $scope.velden = velden;
      // first make all the menu items
      $scope.menuItems = [];
      var item = {};
      $scope.velden.forEach(function (customer) {
        item = {
          'text': customer
        };
        $scope.menuItems.push(item);
      });
    };

    $scope.changeSjabloon = function (sjabloon) {
      $scope.sjabloon = sjabloon;
    };

    $scope.fileNameChanged = function (ele) {
      attachments = [];
      if (ele.files.length !== 0) {

        // Eerste totale grootte berekenen van de volledige bijlage
        var fileSize = 0;
        _.each(ele.files, function (file) {
          fileSize += file.size;
        })

        // Indien de grootte wordt overschreven gaan we melding geven
        if (fileSize > 4999999) {
          alert('De totale grootte van de bijlage overschrijdt de toegelaten 5MB.' + '\r\n' +
            'Probeer de bijlage te verkleinen door ze te converteren of te zippen');
          ele.files = null;
          angular.element("input[type='file']").val(null);
        } else {
          attachments = Array.from(ele.files)
        }
      }
    };

    $scope.verzenden = function () {
      var sjabloonObj = {
        "bcc": $scope.sjabloon.bcc,
        "vanGroep": $scope.selectedgroup.groepsnummer,
        "replyTo": $scope.sjabloon.replyTo,
        "inhoud": $scope.sjabloon.inhoud,
        "onderwerp": $scope.sjabloon.onderwerp,
        "van": $scope.sjabloon.van,
        "bestemming": {
          "lid": $scope.sjabloon.bestemming.lid,
          "contacten": $scope.sjabloon.bestemming.contacten,
          "groepseigenGegevens": []
        }
      };


      var formData = new FormData();
      // bijlages toevoegen aan multipart/form-data
      attachments.forEach(function (file) {
        formData.append("attachments", file)
      });

      var sjabloon = new Blob([JSON.stringify(sjabloonObj)], {type: "application/json"});

      // sjabloon toevoegen aan multipart/form-data
      formData.append("sjabloon", sjabloon);


      // als er meerdere leden zijn moeten we een andere endpoint gebruiken dan wanneer we 1 lid willen mailen
      if ($routeParams.id !== "ledenlijst") {
        $scope.mailIsPending = true;
        ES.sendMail(formData, $routeParams.id)
          .then(function (res) {

            console.log("mail was sent TO " + $routeParams.id, res);
            feedback(res);
          })
          .catch(function (error) {
            $scope.mailIsPending = false;
            console.log(error);
          });
      } else {
        $scope.mailIsPending = true;
        ES.sendMail(formData)
          .then(function (res) {
            console.log("mail was sent TO list", res);
            feedback(res);
          })
          .catch(function (error) {
            $scope.mailIsPending = false;
            console.log(error);
          });
      }
    };

    // bevestiging return functie
    // --------------------------------------
    $scope.confirmEmailReport = function (result) {

    };

    $scope.getLid = function () {
      RestService.Lid.get({id: $routeParams.id}).$promise.then(function (res) {
        $scope.leden.push({'voornaam': res.vgagegevens.voornaam, 'achternaam': res.vgagegevens.achternaam});
      });
    };

    $scope.getLeden = function (offset) {
      $scope.ledenLaden = true;

      LLS.getLeden(offset).then(function (res) {
        $scope.aantalLedenGeladen += res.leden.length;

        _.each(res.leden, function (val) {
          var lid = {
            'voornaam': val.waarden['be.vvksm.groepsadmin.model.column.VoornaamColumn'],
            'achternaam': val.waarden['be.vvksm.groepsadmin.model.column.AchternaamColumn'],
            'volledigenaam': val.waarden['be.vvksm.groepsadmin.model.column.VolledigeNaamColumn']
          };

          var volledigeNaam = lid.voornaam && lid.achternaam ? lid.voornaam + ' ' + lid.achternaam : lid.volledigenaam;

          if (volledigeNaam === undefined) {
            volledigeNaam = val.id;
          }

          if ($scope.uniekeNamen[volledigeNaam] === undefined) {
            $scope.leden.push(lid);
            $scope.uniekeNamen[volledigeNaam] = lid;
          }

        });
        if (res.totaal > $scope.aantalLedenGeladen) {
          offset += 50;
          $scope.getLeden(offset);
        } else {
          $scope.ledenLaden = false;
        }
      })
    };

    $scope.deleteSjabloon = function (sjObj) {
      $scope.isDeleting = true;
      RestService.Emailsjabloon.delete({id: sjObj.id, bevestiging: false}).$promise.then(
        function () {
          AlertService.add('success ', "Sjabloon '" + sjObj.naam + "' succesvol verwijderd");
          $scope.isDeleting = false;
          init();
        }, function () {
          $scope.isDeleting = false;
        }
      );
    };

    $scope.saveOrOverwriteSjabloon = function (selectedSjabloon) {
      $scope.isSavingSjablonen = true;
      console.log('selectedSjabloon', selectedSjabloon);
      var newSjabloon;
      if (selectedSjabloon.id) {
        newSjabloon = selectedSjabloon;
      } else {
        newSjabloon = {};
      }

      newSjabloon.replyTo = $scope.sjabloon.replyTo;
      newSjabloon.bcc = $scope.sjabloon.bcc;
      newSjabloon.van = $scope.sjabloon.van;
      newSjabloon.onderwerp = $scope.sjabloon.onderwerp;
      newSjabloon.inhoud = $scope.sjabloon.inhoud;
      newSjabloon.vanGroep = $scope.selectedgroup.groepsnummer;

      if (selectedSjabloon.id) {

        var tmpObj = JSON.parse(JSON.stringify(newSjabloon));
        overwriteSjabloon(selectedSjabloon, tmpObj).then(function (response) {
          $scope.isSavingSjablonen = false;
          $scope.showSaveOptions = false;
          _.find($scope.sjablonen, function (f) {
            if (f.id == selectedSjabloon.id) {
              // het sjabloon id kan veranderd zijn door de API.
              f.id = response.id;
            }
          });
          $scope.sjabloon = response;
          // tekstveld leegmaken
          $scope.selectedSjabloon = '';
        });

      } else {
        // voor de zekerheid leading en trailing whitespaces trimmen
        selectedSjabloon = selectedSjabloon.trim();
        // eerst checken of de naam niet overeenkomt met bestaande sjabloon
        // TODO: check op lowercased
        var foundElem = _.find($scope.sjablonen, {'naam': selectedSjabloon});
        if (foundElem !== undefined) {
          var sjObj = {};
          sjObj.naam = foundElem.naam;
          sjObj.id = foundElem.id;
          // indien overeenkomt, eigen functie opnieuw aanroepen met sjObj
          $scope.saveOrOverwriteSjabloon(sjObj);
        } else {
          // indien de naam niet bestaat, maak nieuwe sjObj
          delete $scope.sjabloon.id;
          $scope.sjabloon.naam = selectedSjabloon;
          $scope.sjabloon.vanGroep = $scope.selectedgroup.groepsnummer;

          createNewSjabloon($scope.sjabloon).then(function () {
            $scope.isSavingSjablonen = false;
            $scope.showSaveOptions = false;
            $scope.lastSavedSjabloon = $scope.sjabloon;
            // tekstveld leegmaken
            $scope.selectedSjabloon = '';
            init();
          });
        }
      }
    };


    var overwriteSjabloon = function (sjabloon, obj) {
      var deferred = $q.defer();
      obj.naam = sjabloon.naam;

      ES.saveSjabloon(sjabloon.id, obj).then(
        function (result) {
          AlertService.add('success', "Template '" + sjabloon.naam + "' werd succesvol opgeslagen");
          deferred.resolve(result);
        });

      return deferred.promise;

    };

    var createNewSjabloon = function (sjabloon) {
      return $q(function (resolve) {
        RestService.Emailsjabloon.post(sjabloon).$promise.then(
          function (response) {
            resolve(response);
          }
        );
      });
    };

    function feedback(obj) {
      var feedback = ES.getMailReportMessage(obj);
      $scope.mailIsPending = false;
      $scope.openDialog(feedback);
      $location.path('/ledenlijst');
      // TODO: unset the flag to use in template to hide pending message
    }

    function init() {
      $scope.isLoadingSjablonen = true;
      $scope.leden = [];

      // als er een id in de url staat halen we 1 lid op
      if ($routeParams.id !== 'ledenlijst') {
        $scope.getLid();
      } else {
        $scope.getLeden(0);
      }


      $scope.isLoadingGroepen = true;

      ES.getSjablonen().then(function (res) {
        $scope.isLoadingSjablonen = false;
        if (res.sjablonen) {
          $scope.sjablonen = res.sjablonen;
          $scope.changeSjabloon($scope.sjablonen[0]);


        }
      }, function () {
        $scope.isLoadingSjablonen = false;
        AlertService.add('danger', "Er konden geen sjablonen worden opgehaald");
      });

      CS.Groepen().then(
        function (result) {
          $scope.groepen = result.groepen;
          $scope.selectedgroup = result.groepen[0];
          $scope.isLoadingGroepen = false;
        },
        function (err) {
        }
      );

      // velden ophalen die worden gebruikt in de tinyMCE editor
      // pas wanneer de Kolommen-call resolved is, zal de tinyMCE editor worden geïnitieerd
      RestService.Kolommen.get().$promise.then(
        function (result) {
          var arrValues = [];
          _.each(result.kolommen, function (val) {
            if (!val.verouderd) {
              arrValues.push(val.label);
            }
          });
          $scope.configEditor(arrValues);
        }
      );

    }

    /*** MODAL LOGIC ***/

    $scope.animationsEnabled = true;

    // template van deze dialog staat in email.html (#emailConfirmationModal)
    $scope.openDialog = function (feedbackObj) {

      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'emailConfirmationModal.html',
        controller: 'ModalInstanceController',
        size: '',
        resolve: {
          feedback: function () {
            return feedbackObj;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


    /*******/
    if (!access) {
      $location.path("/lid/profiel");
    } else {
      init();
    }

  }

})();

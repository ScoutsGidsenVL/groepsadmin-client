(function () {
  'use strict';

  angular
    .module('ga.etikettencontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EtikettenController', EtikettenController);

  EtikettenController.$inject = ['$location', '$q', '$scope', '$uibModal', 'access', 'AlertService', 'EtikettenService', 'LedenLijstService', 'RestService'];

  function EtikettenController($location, $q, $scope, $uibModal, access, AlertService, ETS, LLS, RestService) {



    // documentation tinyMCE plugin https://www.tinymce.com/docs/integrations/angularjs/

    $scope.ledenLaden = false;
    $scope.ledenVisible = false;
    $scope.tinymceModel = 'Initial content';

    $scope.configEditor = function (velden) {
      $scope.velden = velden;
      // first make all the menu items of tinymce the editor
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
      console.log("changeSjabloon --- ", sjabloon);
      //$scope.sjabloon = sjabloon;
      $scope.sjabloon = sjabloon;
    };

    $scope.aanmaken = function () {

      var payload = {
        "grootte": {
          "horizontaal": parseInt($scope.sjabloon.grootte.horizontaal),
          "verticaal": parseInt($scope.sjabloon.grootte.verticaal)
        },
        "tussenruimte": {
          "horizontaal": parseInt($scope.sjabloon.tussenruimte.horizontaal),
          "verticaal": parseInt($scope.sjabloon.tussenruimte.verticaal)
        },
        "marge": {
          "horizontaal": parseInt($scope.sjabloon.marge.horizontaal),
          "verticaal": parseInt($scope.sjabloon.marge.verticaal)
        },
        "inhoud": $scope.sjabloon.inhoud,
        "blanco": $scope.sjabloon.blanco,
        "familie": $scope.sjabloon.familie,
        "alleAdressen": $scope.sjabloon.alleAdressen
      };

      $scope.etikettenIsPending = true;
      $scope.etiketPropertiesWatchable = false;
      ETS.createLabels(payload).then(
        function (res) {
          if (res.title && res.title == 'error') {
            AlertService.add('danger', "Er konden geen etiketten worden aangemaakt");
            $scope.etikettenIsPending = false;
            $scope.etiketPropertiesWatchable = true;
          } else {
            var a = document.createElement('a');
            a.href = res.fileUrl;
            a.target = '_blank';
            a.download = res.title;

            document.body.appendChild(a);
            a.click();
            $scope.etikettenIsPending = false;
            $scope.etiketPropertiesWatchable = true;
          }


        });

    };

    $scope.getLeden = function (offset) {
      $scope.ledenLaden = true;
      LLS.getLeden(offset).then(function (res) {
        _.each(res.leden, function (val) {
          $scope.leden.push({
            'voornaam': val.waarden['be.vvksm.groepsadmin.model.column.VoornaamColumn'],
            'achternaam': val.waarden['be.vvksm.groepsadmin.model.column.AchternaamColumn'],
            'volledigenaam': val.waarden['be.vvksm.groepsadmin.model.column.VolledigeNaamColumn']
          });
        });
        if (res.totaal > $scope.leden.length) {
          offset += 50;
          $scope.getLeden(offset);
        } else {
          $scope.ledenLaden = false;
        }
      })
    };

    $scope.deleteSjabloon = function (sjObj) {
      $scope.isDeleting = true;
      RestService.Etiketsjabloon.delete({id: sjObj.id, bevestiging: false}).$promise.then(
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
      var newSjabloon = {};
      if (selectedSjabloon.id) {

        newSjabloon = {
          "id": selectedSjabloon.id,
          "grootte": {
            "horizontaal": $scope.sjabloon.grootte.horizontaal,
            "verticaal": $scope.sjabloon.grootte.verticaal
          },
          "tussenruimte": {
            "horizontaal": $scope.sjabloon.tussenruimte.horizontaal,
            "verticaal": $scope.sjabloon.tussenruimte.verticaal
          },
          "marge": {
            "horizontaal": $scope.sjabloon.marge.horizontaal,
            "verticaal": $scope.sjabloon.marge.verticaal
          },
          "naam": $scope.sjabloon.naam,
          "inhoud": $scope.sjabloon.inhoud,
          "blanco": $scope.sjabloon.blanco,
          "familie": $scope.sjabloon.familie,
          "alleAdressen": $scope.sjabloon.alleAdressen,
          "aantalEtikettenPerRij": $scope.sjabloon.aantalEtikettenPerRij,
          "aantalRijenPerPagina": $scope.sjabloon.aantalRijenPerPagina
        }

      } else {
        newSjabloon = ETS.getNewSjabloon($scope.sjabloon);
      }

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

    var makeDummySjabloon = function () {
      var deferred = $q.defer();
      // dit sjabloon zal worden gebruikt als er nog geen sjabloon bestaat voor de gebruiker
      $scope.sjabloon.naam = 'blanco sjabloon';
      var sjabloon = ETS.getNewSjabloon($scope.sjabloon);
      deferred.resolve(sjabloon);

      return deferred.promise;
    };

    var overwriteSjabloon = function (sjabloon, obj) {
      var deferred = $q.defer();
      obj.naam = sjabloon.naam;

      ETS.saveSjabloon(sjabloon.id, obj).then(
        function (result) {
          AlertService.add('success', "Template '" + sjabloon.naam + "' werd succesvol opgeslagen");
          deferred.resolve(result);
        });

      return deferred.promise;

    };

    var createNewSjabloon = function (sjabloon) {
      return $q(function (resolve) {
        RestService.EtiketPostsjabloon.post(sjabloon).$promise.then(
          function (response) {
            resolve(response);
          }
        );
      });
    };

    function init() {

      $scope.isLoadingSjablonen = true;
      $scope.leden = [];
      $scope.getLeden(0);
      $scope.sjabloon = {};


      ETS.getSjablonen().then(function (res) {

        $scope.isLoadingSjablonen = false;
        if (res.sjablonen) {
          $scope.sjablonen = res.sjablonen;
          if (!res.sjablonen.length > 0) {
            makeDummySjabloon().then(function (res) {
              $scope.sjablonen.push(res);
              $scope.changeSjabloon($scope.sjablonen[0]);
              $scope.etiketPropertiesWatchable = true;
            })
          }
          if ($scope.lastSavedSjabloon && $scope.lastSavedSjabloon.id) {
            console.log("last saved", _.find($scope.sjablonen, {'id': $scope.lastSavedSjabloon.id}));
            $scope.changeSjabloon(_.find($scope.sjablonen, {'id': $scope.lastSavedSjabloon.id}));
            $scope.etiketPropertiesWatchable = true;
          } else {
            $scope.changeSjabloon($scope.sjablonen[0]);
            $scope.etiketPropertiesWatchable = true;
          }
        }
      }, function () {
        $scope.isLoadingSjablonen = false;
        AlertService.add('danger', "Er konden geen sjablonen worden opgehaald");
      });

      // velden ophalen die worden gebruikt in de tinyMCE editor
      // pas wanneer de Kolommen-call resolved is, zal de tinyMCE editor worden geïnitieerd
      RestService.Kolommen.get().$promise.then(
        function (result) {
          var arrValues = [];
          _.each(result.kolommen, function (val) {
            arrValues.push(val.label);
          });
          $scope.configEditor(arrValues);
        }
      );

    }

    /*** MODAL LOGIC ***/
    $scope.openInfoDialog = function (infoObj) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'etikettenInfoModal.html',
        controller: 'ModalInstanceController',
        size: '',
        resolve: {
          feedback: function () {
            return infoObj;
          }
        }
      });
    };

    $scope.animationsEnabled = true;

    /*******/
    if (!access) {
      $location.path("/lid/profiel");
    } else {
      init();
    }

  }

})();

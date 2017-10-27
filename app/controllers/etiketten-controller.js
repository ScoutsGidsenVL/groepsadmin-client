(function() {
  'use strict';

  angular
    .module('ga.etikettencontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EtikettenController', EtikettenController);

  EtikettenController.$inject = ['$compile', '$location', '$log', '$q', '$routeParams', '$scope', '$uibModal', 'access', 'AlertService', 'DialogService', 'EtikettenService', 'LedenLijstService', 'RestService'];

  function EtikettenController ($compile, $location, $log, $q, $routeParams, $scope, $uibModal, access, AlertService, DialogService, ETS, LLS, RestService) {



    // documentation tinyMCE plugin https://www.tinymce.com/docs/integrations/angularjs/
    var leden = new Array();

    $scope.ledenLaden = false;
    $scope.ledenVisible = false;
    $scope.tinymceModel = 'Initial content';

    $scope.configEditor = function(velden){
      $scope.velden = velden;
      // first make all the menu items of tinymce the editor
      var menuItems = [];
      var item = {};
      $scope.velden.forEach(function(customer, index){
          item = {
              'text': customer
          };
          menuItems.push(item);
      });

      $scope.tinymceOptions = {
        plugins: [
          'advlist autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code fullscreen',
          'insertdatetime media nonbreaking save table contextmenu',
          'template paste textcolor colorpicker textpattern imagetools codesample'
        ],
        fontsize_formats: 'small medium large',
        height: 400,
        menubar: false,
        toolbar: 'undo redo | bold italic underline strikethrough | fontsizeselect forecolor backcolor | bullist numlist | alignleft aligncenter alignright | table | code | customDrpdwn | media | preview',
        setup: function(editor){
            editor.addButton( 'customDrpdwn', {
                text : 'Veld invoegen',
                type: 'menubutton',
                icon : false,
                menu: menuItems,
                onselect: function (e) {
                  editor.insertContent('[' + e.target.state.data.text + ']');
                }
            });
        }
      };

      var editorContainer = angular.element(document.querySelector('#editorContainer'));
      var html = $compile('<textarea ui-tinymce="tinymceOptions" ng-model="sjabloon.inhoud"></textarea>')($scope);
      editorContainer.children().remove();
      editorContainer.append(html);

    }

    $scope.changeSjabloon = function(sjabloon){
      console.log("changeSjabloon --- ",sjabloon);
      //$scope.sjabloon = sjabloon;
      $scope.sjabloon = sjabloon;
    }

    $scope.aanmaken = function(){

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
      }

      $scope.etikettenIsPending = true;
      ETS.createLabels(payload).then(function(res){

        console.log("etiketten list", res);
        var a = document.createElement('a');
        a.href = res.fileUrl;
        a.target = '_blank';
        a.download = res.title;

        document.body.appendChild(a);
        a.click();
        $scope.etikettenIsPending = false;

      });

    }

    $scope.getLeden = function(offset){
      $scope.ledenLaden = true;
      LLS.getLeden(offset).then(function(res){
        _.each(res.leden, function(val,key){
          $scope.leden.push({
            'voornaam': val.waarden['be.vvksm.groepsadmin.model.column.VoornaamColumn'],
            'achternaam': val.waarden['be.vvksm.groepsadmin.model.column.AchternaamColumn']
          });
        });
        if(res.totaal > $scope.leden.length){
          offset += 50;
          $scope.getLeden(offset);
        }else{
          $scope.ledenLaden = false;
        }
      })
    }

    $scope.deleteSjabloon = function(sjObj){
      $scope.isDeleting = true;
      RestService.Emailsjabloon.delete({id: sjObj.id}).$promise.then(
        function(response){
          AlertService.add('success ', "Sjabloon '"+ sjObj.naam + "' succesvol verwijderd", 5000);
          $scope.isDeleting = false;
          init();
        },function(err){
          $scope.isDeleting = false;
        }
      );
    }

    $scope.saveOrOverwriteSjabloon = function(selectedSjabloon){
      $scope.isSavingSjablonen = true;
      console.log('selectedSjabloon', selectedSjabloon);
      var newSjabloon;
      if(selectedSjabloon.id){
        newSjabloon = selectedSjabloon;
        newSjabloon.grootte = {};
        newSjabloon.grootte.horizontaal = $scope.sjabloon.grootte.horizontaal;
        newSjabloon.grootte.verticaal = $scope.sjabloon.grootte.verticaal;
        newSjabloon.tussenruimte = {};
        newSjabloon.tussenruimte.horizontaal = $scope.sjabloon.tussenruimte.horizontaal;
        newSjabloon.tussenruimte.verticaal = $scope.sjabloon.tussenruimte.verticaal;
        newSjabloon.marge = {};
        newSjabloon.marge.horizontaal = $scope.sjabloon.marge.horizontaal;
        newSjabloon.marge.verticaal = $scope.sjabloon.marge.verticaal;
        newSjabloon.inhoud = $scope.sjabloon.inhoud;
        newSjabloon.blanco = $scope.sjabloon.blanco;
        newSjabloon.alleAdressen = $scope.sjabloon.alleAdressen;
        newSjabloon.aantalEtikettenPerRij = $scope.sjabloon.aantalEtikettenPerRij;
        newSjabloon.aantalRijenPerPagina = $scope.sjabloon.aantalRijenPerPagina;

      }else{
        newSjabloon = getNewSjabloon();
      }

      if(selectedSjabloon.id){

        var tmpObj = JSON.parse(JSON.stringify(newSjabloon));
        overwriteSjabloon(selectedSjabloon, tmpObj).then(function(response){
          $scope.isSavingSjablonen = false;
          $scope.showSaveOptions = false;
          _.find($scope.sjablonen, function(f) {
            if (f.id == selectedSjabloon.id) {
              // het sjabloon id kan veranderd zijn door de API.
              f.id = response.id;
            }
          });
          $scope.sjabloon = response;
          // tekstveld leegmaken
          $scope.selectedSjabloon ='';
        });

      }else{
        // voor de zekerheid leading en trailing whitespaces trimmen
        selectedSjabloon = selectedSjabloon.trim();
        // eerst checken of de naam niet overeenkomt met bestaande sjabloon
        // TODO: check op lowercased
        var foundElem = _.find($scope.sjablonen, {'naam' : selectedSjabloon});
        if(foundElem !== undefined){
          var sjObj = {};
          sjObj.naam = foundElem.naam;
          sjObj.id = foundElem.id;
          // indien overeenkomt, eigen functie opnieuw aanroepen met sjObj
          $scope.saveOrOverwriteSjabloon(sjObj);
        }else{
          // indien de naam niet bestaat, maak nieuwe sjObj
          delete $scope.sjabloon.id;
          $scope.sjabloon.naam = selectedSjabloon;

          createNewSjabloon($scope.sjabloon).then(function(res){
            $scope.isSavingSjablonen = false;
            $scope.showSaveOptions = false;
            $scope.lastSavedSjabloon = $scope.sjabloon;
            // tekstveld leegmaken
            $scope.selectedSjabloon ='';
            init();
          });
        }
      }
    }

    var makeDummySjabloon = function(){
      var deferred = $q.defer();
      RestService.Lid.get({id:'profiel'}).$promise.then(function(result) {

            // dit sjabloon zal worden gebruikt als er nog geen sjabloon bestaat voor de gebruiker
            var sjabloon = getNewSjabloon();
            sjabloon.naam = 'blanco sjabloon';

            deferred.resolve(sjabloon);
      });
      return deferred.promise;
    }

    var getNewSjabloon = function(){
      var newSjabloon = {
        "naam": $scope.naam,
        "grootte": {
          "horizontaal": $scope.sjabloon.grootte.verticaal,
          "verticaal": $scope.sjabloon.grootte.horizontaal
        },
        "tussenruimte": {
          "horizontaal": $scope.sjabloon.tussenruimte.horizontaal,
          "verticaal": $scope.sjabloon.tussenruimte.verticaal
        },
        "marge": {
          "horizontaal": $scope.sjabloon.marge.horizontaal,
          "verticaal": $scope.sjabloon.marge.verticaal
        },
        "inhoud": $scope.sjabloon.inhoud,
        "blanco": $scope.sjabloon.blanco,
        "familie": $scope.sjabloon.familie,
        "alleAdressen": $scope.sjabloon.alleAdressen,
        "aantalEtikettenPerRij": $scope.sjabloon.aantalPerRij,
        "aantalRijenPerPagina": $scope.sjabloon.aantalPerPagina
      }
      return newSjabloon;
    }

    var overwriteSjabloon = function(sjabloon, obj){
      var deferred = $q.defer();
      obj.naam = sjabloon.naam;

      ETS.saveSjabloon(sjabloon.id, obj).then(
      function(result){
        AlertService.add('success', "Template '"+ sjabloon.naam + "' werd succesvol opgeslagen", 5000);
        deferred.resolve(result);
      });

      return deferred.promise;

    }

    var createNewSjabloon = function(sjabloon){
      return $q(function(resolve,reject){
        RestService.Etiketsjabloon.post(sjabloon).$promise.then(
          function(response){
            resolve(response);
          }
        );
      });
    }

    function init(){
      $scope.isLoadingSjablonen = true;
      $scope.leden = new Array();
      $scope.getLeden(0);

      ETS.getSjablonen().then(function(res){
        $scope.isLoadingSjablonen = false;
        if(res.sjablonen){
          $scope.sjablonen = res.sjablonen;
          if(!res.sjablonen.length > 0){
            makeDummySjabloon().then(function(res){
              $scope.sjablonen.push(res);
              $scope.changeSjabloon($scope.sjablonen[0]);
            })
          }
          if($scope.lastSavedSjabloon && $scope.lastSavedSjabloon.id){
            console.log("last saved", _.find($scope.sjablonen, {'id': $scope.lastSavedSjabloon.id }));
            $scope.changeSjabloon(_.find($scope.sjablonen, {'id': $scope.lastSavedSjabloon.id }));
          }else{
            $scope.changeSjabloon($scope.sjablonen[0]);
          }
        }
      },function(err){
        $scope.isLoadingSjablonen = false;
        AlertService.add('danger', "Er konden geen sjablonen worden opgehaald", 5000);
      });

      // velden ophalen die worden gebruikt in de tinyMCE editor
      // pas wanneer de Kolommen-call resolved is, zal de tinyMCE editor worden geïnitieerd
      RestService.Kolommen.get().$promise.then(
        function(result){
          var arrValues = new Array();
          _.each(result.kolommen, function(val,key){
            arrValues.push(val.label);
          })
          $scope.configEditor(arrValues);
        }
      );

    }

    /*** MODAL LOGIC ***/

    $scope.animationsEnabled = true;

    /*******/
    if(!access){
      $location.path("/lid/profiel");
    }else{
      init();
    }

  }

})();

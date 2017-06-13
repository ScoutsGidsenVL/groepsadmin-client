(function() {
  'use strict';

  angular
    .module('ga.emailcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EmailController', EmailController);

  EmailController.$inject = ['$scope', 'AlertService', 'DialogService', 'EmailService', 'LedenLijstService', 'RestService'];

  function EmailController ($scope, AlertService, DialogService, ES, LLS, RestService) {

    // documentation tinyMCE plugin https://www.tinymce.com/docs/integrations/angularjs/

    var leden = new Array();


    $scope.ledenLaden = false;
    $scope.ledenVisible = false;
    $scope.tinymceModel = 'Initial content';

    $scope.tinymceOptions = {
      plugins: 'link image code',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
      menubar: false
    };

    $scope.changeSjabloon = function(sjabloon){
      $scope.sjabloon = sjabloon;
    }


    $scope.getLeden = function(offset){
      $scope.ledenLaden = true;
      LLS.getLeden(offset).then(function(res){
        _.each(res.leden, function(val,key){
          $scope.sjabloon.leden.push(val);
        });
        if(res.totaal > $scope.sjabloon.leden.length){
          offset += 50;
          $scope.getLeden(offset);
        }else{
          $scope.ledenLaden = false;
          console.log(res.totaal, $scope.sjabloon.leden.length);
        }
      })
    }


    $scope.saveOrOverwriteSjabloon = function(selectedSjabloon){
      $scope.isSavingSjablonen = true;
      var reconstructedSjabloonObj = createSjabloonObject();

      if(selectedSjabloon.id){
        var tmpObj = JSON.parse(JSON.stringify(reconstructedSjabloonObj));
        // bestaande filter overschrijven
        overwriteFilter(selectedSjabloon, tmpObj).then(function(response){
          $scope.isSavingSjablonen = false;
          $scope.showSaveOptions = false;
          _.find($scope.filters, function(f) {
            if (f.id == selectedSjabloon.id) {
              // De filter id kan veranderd zijn door de API.
              f.id = response.id;
            }
          });
          $scope.currentFilter = response;
        });
      }/*else{
        // voor de zekerheid leading en trailing whitespaces trimmen
        selectedFilter = selectedFilter.trim();
        var filters = LFS.getFilters();
        var tmpObj = JSON.parse(JSON.stringify(reconstructedSjabloonObj));
        $q.all(filters.promises).then(function(){
          // eerst checken of de naam niet overeenkomt met bestaande filter
          // TODO: check op lowercased
          var foundElem = _.find(filters.filters, {'naam' : selectedFilter});
          if(foundElem !== undefined){
            var filterObj = {};
            filterObj.naam = foundElem.naam;
            filterObj.id = foundElem.id;
            // indien overeenkomt, eigen functie opnieuw aanroepen met filter naam en id
            $scope.saveOrOverwriteFilter(filterObj);
          }else{
          // indien de naam niet bestaat, maak nieuwe filterObj
            createNewFilter(selectedFilter).then(function(res){
              $scope.isSavingSjablonen = false;
              $scope.showSaveOptions = false;
              $scope.currentFilter = res;
            });
          }
        });

      }*/

    }

    var makeDummySjabloon = function(){
      // dit sjabloon zal worden gebruikt als er nog geen sjabloon bestaat voor de gebruiker
      var sjabloon = {};
      sjabloon.from = 'mij';
      sjabloon.replyTo = 'replytome';
      sjabloon.van = 'ikke';
      sjabloon.onderwerp = 'yoo mannekes';
      sjabloon.inhoud = "dit is een test tekstje";

      return sjabloon;
    }


    function init(){
      $scope.isLoadingSjablonen = true;
      ES.getTemplates().then(function(res){
        console.log("------",res);
        $scope.isLoadingSjablonen = false;
        if(res.sjablonen){
          $scope.sjablonen = res.sjablonen;
          if(!res.sjablonen.length > 0){
            $scope.sjablonen.push(makeDummySjabloon());
          }
          $scope.changeSjabloon($scope.sjablonen[0]);
          $scope.sjabloon.leden = new Array();
          $scope.getLeden(0);
        }
      },function(err){
        $scope.isLoadingSjablonen = false;
        AlertService.add('danger', "Er konden geen sjablonen worden opgehaald", 5000);
      })



    }

    init();


  }

})();

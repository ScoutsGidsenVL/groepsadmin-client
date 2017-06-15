(function() {
  'use strict';

  angular
    .module('ga.emailcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EmailController', EmailController);

  EmailController.$inject = ['$q', '$scope', 'AlertService', 'DialogService', 'EmailService', 'LedenLijstService', 'RestService'];

  function EmailController ($q, $scope, AlertService, DialogService, ES, LLS, RestService) {

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

    $scope.verzenden = function(){
      var sjabloonObj = {
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
      }
      var payload = "--AaB03x\n";
      payload+= 'Content-Disposition: form-data; name="sjabloon"\nContent-Type: application/json\n\n';
      payload += JSON.stringify(sjabloonObj);
      payload+= "\n\n--AaB03x--";

      ES.sendMail(payload).then(function(res){
        console.log("emailcontroller - YAY---- mail was sent", res);
      });

    }

    $scope.getLeden = function(offset){
      $scope.ledenLaden = true;
      LLS.getLeden(offset).then(function(res){
        _.each(res.leden, function(val,key){
          $scope.leden.push(val);
        });
        if(res.totaal > $scope.leden.length){
          offset += 50;
          $scope.getLeden(offset);
        }else{
          $scope.ledenLaden = false;
          console.log(res, res.totaal, $scope.leden.length);
        }
      })
    }

    $scope.saveOrOverwriteSjabloon = function(selectedSjabloon){
      $scope.isSavingSjablonen = true;
      console.log('selectedSjabloon', selectedSjabloon);
      var newSjabloon;
      if(selectedSjabloon.id){
        newSjabloon = selectedSjabloon;
      }else{
        newSjabloon = {};
      }

      newSjabloon.from = $scope.sjabloon.from;

      newSjabloon.replyTo = $scope.sjabloon.replyTo;
      newSjabloon.van = $scope.sjabloon.van;
      newSjabloon.onderwerp = $scope.sjabloon.onderwerp;
      newSjabloon.inhoud = $scope.sjabloon.inhoud;
      newSjabloon.vanGroep = $scope.selectedgroup.groepsnummer;


      if(selectedSjabloon.id){

        console.log("newSjabloon",newSjabloon);
        //delete newSjabloon.id;
        //console.log("deleted ID of newSjabloon",newSjabloon);

        var tmpObj = JSON.parse(JSON.stringify(newSjabloon));
        console.log('selectedSjabloon patched by this obj:', tmpObj);
        // bestaande filter overschrijven

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
          $scope.sjabloon.vanGroep = $scope.selectedgroup.groepsnummer;

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
      // dit sjabloon zal worden gebruikt als er nog geen sjabloon bestaat voor de gebruiker
      var sjabloon = {};
      sjabloon.naam = "blanco sjabloon";
      sjabloon.from = 'mij';
      sjabloon.replyTo = 'reply@to.me';
      sjabloon.van = 'ikke';
      sjabloon.onderwerp = 'yoo mannekes';
      sjabloon.inhoud = "dit is een test tekstje";
      sjabloon.bestemming = {};
      sjabloon.bestemming.lid = true;
      sjabloon.bestemming.contacten = false;

      return sjabloon;
    }

    var overwriteSjabloon = function(sjabloon, obj){
      var deferred = $q.defer();
      obj.naam = sjabloon.naam;

      ES.saveSjabloon(sjabloon.id, obj).then(
      function(result){
        deferred.resolve(result);
      });

      return deferred.promise;

    }

    var createNewSjabloon = function(sjabloon){

      return $q(function(resolve,reject){
        RestService.Emailsjabloon.post(sjabloon).$promise.then(
          function(response){
            // 'huidige' filter opslaan
            resolve(response);
          }
        );
      });

    }

    function init(){
      $scope.isLoadingSjablonen = true;
      $scope.leden = new Array();
      $scope.getLeden(0);

      ES.getSjablonen().then(function(res){
        $scope.isLoadingSjablonen = false;
        if(res.sjablonen){
          $scope.sjablonen = res.sjablonen;
          if(!res.sjablonen.length > 0){
            $scope.sjablonen.push(makeDummySjabloon());
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
      })

      RestService.Groepen.get().$promise.then(
        function (result) {
          $scope.groepen = result.groepen;
          $scope.selectedgroup = result.groepen[0];
        },
        function (Error){

        }
      );
    }

    init();


  }

})();

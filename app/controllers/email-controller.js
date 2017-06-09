(function() {
  'use strict';

  angular
    .module('ga.emailcontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap', 'ui.tinymce'])
    .controller('EmailController', EmailController);

  EmailController.$inject = ['$scope', 'AlertService', 'DialogService', 'EmailService', 'RestService'];

  function EmailController ($scope, AlertService, DialogService, ES, RestService) {

    // documentation tinyMCE plugin https://www.tinymce.com/docs/integrations/angularjs/

    $scope.tinymceModel = 'Initial content';

    $scope.tinymceOptions = {
      plugins: 'link image code',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
      menubar: false
    };


    $scope.setEmailValues = function(sjabloon){
      console.log('setEmailValues --- ', sjabloon);
      $scope.email.fromName = sjabloon.from;
      $scope.email.replyAddress = sjabloon.replyTo;
      $scope.email.fromAddress = sjabloon.van;
      $scope.email.subject = sjabloon.onderwerp;

    }
    $scope.changeSjabloon = function(sjabloon){
      _.each($scope.sjablonen,function(val,key){
        if(val.id == sjabloon.id){
          val.activated = true;
          $scope.setEmailValues(sjabloon);
        }else{
          val.activated = false;
        }
      });


    }

    $scope.activatedSjabloon = function(){
      return _.find($scope.sjablonen, {'activated' : true });
    }

    function init(){
      $scope.isLoadingSjablonen = true;
      ES.getTemplates().then(function(res){
        console.log("------",res);
        $scope.isLoadingSjablonen = false;
        if(res.sjablonen){
          $scope.sjablonen = res.sjablonen;
          if(res.sjablonen.length > 0){
            $scope.sjablonen[0].activated = true;
          }
        }
      },function(err){
        $scope.isLoadingSjablonen = false;
        AlertService.add('danger', "Er konden geen sjablonen worden opgehaald", 5000);
      })

    }

    init();


  }

})();

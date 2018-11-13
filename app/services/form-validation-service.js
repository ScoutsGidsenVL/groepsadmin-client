(function() {
  'use strict';

  angular
    .module('ga.services.formvalidation', [])
    .factory('FormValidationService', FormValidationService);

  FormValidationService.$inject = ['$log','$q'];

  // Deze service wordt gebruikt door lid-controller

  function FormValidationService() {
    var formValidationService = {};

    formValidationService.getFormElemByErrData = function(prefix, data){
      // TODO: dit moet ook werken met adressen
      console.log("FOUT element ------", data, data.veld.replace(prefix+'.',''));
      return data.veld.replace(prefix+'.','');
    };

    formValidationService.getErrType = function(data){
      console.log("FOUT description------", data, data.beschrijving);
      if(!data.beschrijving){
        return 'required';
      }

      var errType = "";
      switch (data.beschrijving) {
        case 'is verplicht':
          errType = "required";
          break;
        default:
          errType = "required";
          break;
      }
      return errType;
    };

    return formValidationService;
  }
})();

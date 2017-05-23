(function() {
  'use strict';

  angular
    .module('ga.services.formvalidation', [])
    .factory('FormValidationService', FormValidationService);

  FormValidationService.$inject = ['$log','$q'];

  // Deze service wordt gebruikt door lid-controller

  function FormValidationService($log,$q,RestService) {
    var formValidationService = {};

    formValidationService.checkField = function(formfield){
      var isValidField = false;
      switch (formfield.$name) {

      case 'rekeningnummer':
        isValidField = formValidationService.validateIBAN(formfield);
        break;

      default:
        isValidField = true;
        break;
      }
      return isValidField;
    }

    formValidationService.validateIBAN = function(field){
      return IBAN.isValid(field.$modelValue);
    }

    formValidationService.getFormElemByErrData = function(prefix, data){
      // TODO: dit moet ook werken met adressen
      console.log("FOUT element ------", data, data.veld.replace(prefix+'.',''));
      return data.veld.replace(prefix+'.','');
    }

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
    }

    return formValidationService;
  };
})();

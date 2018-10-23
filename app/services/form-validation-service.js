(function() {
  'use strict';

  angular
    .module('ga.services.formvalidation', [])
    .factory('FormValidationService', FormValidationService);

  FormValidationService.$inject = ['$log','$q'];

  // Deze service wordt gebruikt door lid-controller

  function FormValidationService() {
    var formValidationService = {};

    formValidationService.checkField = function (formfield) {
      var isValidField = false, parts = formfield.$name.split('.'), veldNaam = parts[parts.length-1];

      switch (veldNaam) {

        case 'rekeningnummer':
          isValidField = !formfield.$modelValue || formfield.$modelValue == "" ? true : formValidationService.validateIBAN(formfield);
          break;

        case 'telefoon':
          isValidField = !formfield.$modelValue || formfield.$modelValue == "" ? true : formValidationService.validatePhoneNumber(formfield);
          break;

        case 'gsm':
          isValidField = !formfield.$modelValue || formfield.$modelValue == "" ? true : formValidationService.validateMobileNumber(formfield);
          break;


        default:
          isValidField = true;
          break;
      }
      return isValidField;
    };

    formValidationService.validateIBAN = function(field){
      return IBAN.isValid(field.$modelValue);
    };

    formValidationService.validatePhoneNumber = function(field){
      return /^((\+|00)\d{2}\s?|0)(\d{8})$/.test(field.$modelValue);
    };

    formValidationService.validateMobileNumber = function(field){
      return /^((\+|00)\d{2}\s?|0)(\d{9})$/.test(field.$modelValue);
    };

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

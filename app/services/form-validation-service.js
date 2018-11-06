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
      var regularExpressions = [
        /^((\+|00)32\s?|0)(\d\s?\d{3}|\d{2}\s?\d{2})(\s?\d{2}){2}$/, //BE
        /^((\+|00)31\s?)(\d{2})(\s?\d{3})(\s?\d{2}){2}$/, //NL
        /^((\+|00)33\s?)[1-5](\s?\d{2}){4}$/, //FR
        /^((\+|00\s?)352)?(\s?\d{2}){3,4}$/, //LUX
        /^((\+|00)49\s?)(\d{3})(\s?\d{2}){4}$/ //GER
      ];

      var validated = false, i=0;

      while (i < regularExpressions.length && validated === false) {
        validated = regularExpressions[i].test(field.$modelValue);
        i++;
      }

      return validated;
    };

    formValidationService.validateMobileNumber = function(field){
      var regularExpressions = [
        /^((\+|00)32\s?|0)4(60|[789]\d)(\s?\d{2}){3}$/, //BE
        /^((\+|00)31\s?)(6)(\s?\d{2}){4}$/, //NL
        /^((\+|00)33\s?)[679](\s?\d{2}){4}$/, //FR
        /^((\+|00\s?)352)?\s?6[269]1(\s?\d{3}){2}$/, //LUX
        /^((\+|00)49\s?)(\d{3})(\s?\d{2}){4}$/ //GER
      ];

      var validated = false, i=0;

      while (i < regularExpressions.length && validated === false) {
        validated = regularExpressions[i].test(field.$modelValue);
        i++;
      }

      return validated;
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

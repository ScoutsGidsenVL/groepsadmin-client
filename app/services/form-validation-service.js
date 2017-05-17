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

      case 'gebruikersnaam':
        isValidField = formValidationService.validateGebruikersnaam(formfield);
        break;

      case 'rekeningnummer':
        isValidField = formValidationService.validateIBAN(formfield);
        break;

      default:
        isValidField = true;
        break;
      }
      return isValidField;
    }

    formValidationService.validateGebruikersnaam = function(field){
      return field.$modelValue == "Johan" ? false : true;
    }

    formValidationService.validateIBAN = function(field){
      return IBAN.isValid(field.$modelValue);
    }

    return formValidationService;
  };
})();

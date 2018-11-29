(function() {
  'use strict';

  angular.module('ga-public', [
    'ga-public.route',
    'ga.alert-controller',
    'ga.lidwordencontroller',
    'ga.parseDate',
    'ga.services.apiinfo',
    'ga.services.adres',
    'ga.services.alert',
    'ga.services.datum',
    'ga.services.rest',
    'ga.services.lid',
    'ga.services.cache',
    'ga.services.formvalidation',
    'ga.ui.selectpicker',
    'ga.ui.dialog',
    'ga.utils',
    'ga.validatie.rekeningnummer',
    'ga.validatie.telefoonnummer',
    'ga.validatie.gsmnummer',
    'ui.bootstrap',
    'ngMessages'])

  // lodash for use in controllers, unit tests
  .constant('_', window._);

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['ga-public']);
  });
})();

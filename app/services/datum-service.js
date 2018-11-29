(function () {
  'use strict';

  angular
    .module('ga.services.datum', [])
    .factory('DatumService', DatumService);

  DatumService.$inject = [];

  function DatumService() {
    var DatumService = {};

    DatumService.publicProperties = {
      dateOptions: {
        formatYear: 'yyyy',
        startingDay: 1,
        datepickerMode: 'year'
      },
      popupCal: {
        opened: false
      },
      format: 'dd/MM/yyyy'
    };

    DatumService.publicMethods = {
      openPopupCal: function () {
        var scope = this;
        scope.popupCal.opened = true;
      }
    };

    return DatumService;
  }
})();

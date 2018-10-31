(function() {
  'use strict';

  angular
  .module('ga.loadingSection', [])
  .directive('gaLoadingSection', ['$compile', function($compile) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            attrs.sectieGeladen = attrs.sectieGeladen || true;
            attrs.sectieHoogte = attrs.sectieHoogte?parseInt(attrs.sectieHoogte):100;

            var spinner = $compile(
              '<div class="loading-spinner pull-right">' +
              '   <i class="fa fa-spinner fa-pulse"></i>' +
              '</div>'
            )(scope);

            var container = $(element).children('fieldset');
            container = container.length === 0?element:container;
            var legend = $(container).children('legend');
            var fieldset = $(container).children('fieldset').addClass('hidden');

            legend.append(spinner);

            element.css({
              minHeight: attrs.sectieHoogte
            });

            scope.$watch(attrs.sectieGeladen, function(result) {
              if (result) {
                spinner.remove();
                fieldset.removeClass('hidden');
                element.css({
                  minHeight: 0
                });
              } else {
                fieldset.addClass('hidden');
                legend.append(spinner);
              }
            });
          }



      };

  }]);

})();

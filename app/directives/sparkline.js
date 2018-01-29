(function() {
  'use strict';

  angular
  .module('ga.sparkline', [])
  .directive('sparkline', [function() {
      console.log('spark!');
      return {
          link: function(scope, element, attrs) {
              var values = attrs['waarden'].split(',').map(function(x) {
                return x.split(':').map(parseFloat);
              });
              var formaat = attrs['formaat'];

              $(element.context).sparkline(values, {
                  type: 'bar',
                  barWidth: 8,
                  height: 20,
                  chartRangeMin: 0,
                  tooltipFormatter: function(sp, options, fields) {
                      console.log('sp, options, fields', sp, options, fields);
                      var format = function(x) {
                          console.log('x', x);
                          var precision = formaat.match(/\.([0-9]*)f/);
                          if (precision[1]) {
                              precision = precision[1];
                          } else {
                              precision = 0;
                          }
                          var suffix = formaat.match(/[^ ]*[df](.*)/)[1].replace('%%', '%');
                          return x.toFixed(precision).toString().replace('.', ',') + suffix;
                      }

                      var werkjaren = scope.$parent.sortedKeys(scope.$parent.ledenaantallenData.takStatistieken[0].aantalLeden);
                      if (werkjaren[fields[0].offset] == 'Nu') {
                          return 'Nu: ' + format(fields[0].value);
                      } else {
                          return werkjaren[fields[0].offset] + ': ' + format(fields[1].value);
                      }
                  }
              });
          }
      };
  }]);
})();

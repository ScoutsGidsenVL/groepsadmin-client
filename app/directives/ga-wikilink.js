(function() {
  'use strict';

  angular
    .module('ga.wikilink', [])
    .directive('gaWikilink', ['$location', function (location) {
      return {
        restrict: 'A',
        link: function (scope, elem, attr) {
          var baseUrl = 'https://wiki.scoutsengidsenvlaanderen.be/handleidingen:groepsadmin:paginas:';

          scope.location = location;
          scope.$watch('location.path()', function(newPath) {

            var path = newPath.substr(1);
            var splitpath = path.split('/');

            //when a number occurs in the last element, it's an id, so we remove it
            if( /\d/.test(splitpath.slice(-1)) ){
              splitpath.pop();
            }

            var res="";
            _.each(splitpath,function(val,key){
              if(key > 0){
                res += '_' + val ;
              }else{
                res += val;
              }
            });

            scope.wikilink = baseUrl + res;
          });

        },
        templateUrl: 'partials/wikilink.html'
      }
    }])
})();

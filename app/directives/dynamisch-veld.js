(function() {
  'use strict';

  angular
    .module('ga.dynamischveld', [])
    .directive('dynamischveld', dynamischveld);

  function dynamischveld($compile) {
    return {
      restrict: 'E',
      templateUrl: 'partials/dynamisch-veld.html',
      replace: true,
      scope: {
        waarden : '=',
        veld: '='
      },
      link: function (scope, element, attrs) {
			if (angular.isArray(scope.veld.velden)) {
				element.append('<div><dynamischveldcolectie waarden="waarden" velden="veld.velden"></dynamischveldcolectie></div>');
              $compile(element.contents())(scope)
			}
		}
    };
  }


})();

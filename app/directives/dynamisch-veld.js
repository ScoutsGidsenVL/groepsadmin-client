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
				element.append('<legend>{{veld.label}}</legend><fieldset class="ga-form-group"><p ng-if="veld.beschrijving">{{veld.beschrijving}}</p><dynamischveldcolectie waarden="waarden" velden="veld.velden"></dynamischveldcolectie><fieldset>');
              $compile(element.contents())(scope)
			}
		}
    };
  }


})();

(function() {
  'use strict';

  angular
    .module('ga.typeahead', [])
    .directive('typeahead', typeahead)
    .directive('typeaheadItem', typeaheadItem);


  function typeahead() {
    return {
      restrict: 'EAC',
      scope: {
        query: '&',
        term: '=',
        items: '=',
        action: '&'
      },
      controller: TypeaheadController,
      link: function(scope, elem, attrs, controller) {
        var $input = elem.find('.input-group > input');

        $input.bind('focus', function() {
          scope.$apply(function() { scope.focused = true; });
        });

        $input.bind('blur', function() {
          scope.$apply(function() { scope.focused = false; });
        });

        elem.bind('mouseover', function() {
          scope.$apply(function() { scope.mousedOver = true; });
        });

        elem.bind('mouseleave', function() {
          scope.$apply(function() { scope.mousedOver = false; });
        });

        $input.bind('keydown', function(e) {
          switch(e.keyCode) {
            case 9: // Tab || Enter key
            case 13:
              e.preventDefault();
              break;
            case 27: // Escape key
              e.preventDefault();
              break;
            case 40: // Down arrow
              e.preventDefault();
              scope.$apply(function() { controller.activateNextItem(); });
              break;
            case 38: // Up arrow
              e.preventDefault();
              scope.$apply(function() { controller.activatePreviousItem(); });
              break;
          }
        });

        $input.bind('keyup', function(e) {
          switch(e.keyCode) {
            case 9: // Tab || Enter key
            case 13:
              if (!scope.hide) {
                scope.$apply(function() { controller.selectActive(); });
              }
              break;
            case 27: // Escape key
              scope.$apply(function() { scope.hide = true; });
              break;
          }
        });

        scope.$watch('term', function(newVal, oldVal){
          scope.hide = newVal ? false : true;
          if(newVal) {
            scope.query({term:newVal});
          }
        });

        scope.$watch('isVisible()', function(visible) {
          if (visible) {
            elem.addClass('open');
          } else {
            elem.removeClass('open');
          }
        });
      },
    };
  }

  function typeaheadItem() {
    return {
      require: '^typeahead',
      link: function(scope, elem, attrs, controller) {
        var item = scope.$eval(attrs.typeaheadItem);

        scope.$watch(function() { return controller.isActive(item); }, function(active) {
          if (active) {
            elem.addClass('active');
          } else {
            elem.removeClass('active');
          }
        });

        elem.bind('mouseenter', function(e) {
          scope.$apply(function() { controller.activate(item); });
        });

        elem.bind('click', function(e) {
          scope.$apply(function() { controller.select(item); });
        });
      }
    };
  }


  TypeaheadController.$inject = ['$scope'];

  function TypeaheadController($scope) {
    $scope.items = [];
    $scope.hide = true;

    this.activate = function(item) {
      $scope.active = item;
    };

    this.activateNextItem = function() {
      var index = $scope.items.indexOf($scope.active);
      this.activate($scope.items[(index + 1) % $scope.items.length]);
    }

    this.activatePreviousItem = function() {
      var index = $scope.items.indexOf($scope.active);
      this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
    }

    this.isActive = function(item) {
      return $scope.active === item;
    };

    this.selectActive = function() {
      this.select($scope.active);
    };

    this.select = function(item) {
      $scope.hide = true;
      //$scope.focused = true;

      if(item) {
        $scope.action({item:item});
      }
    };

    $scope.isVisible = function() {
      return !$scope.hide && ($scope.focused || $scope.mousedOver);
    };
  }
})();
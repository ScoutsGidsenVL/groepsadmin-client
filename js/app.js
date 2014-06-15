var gaApp = angular
  .module('gaApp', ['ngRoute', 'ngResource'])

  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // Configure the routes
    $routeProvider
      // Leden tabel
      .when('/', {
        templateUrl: 'partials/leden.html',
        controller: 'ListController'
      })
      // Lid detailpagina
      .when('/lid/:id', {
        templateUrl: 'partials/lid.html',
        controller: 'DetailsController'
      })
      .otherwise({
        redirectTo: '/'
      });
    
    //$locationProvider.html5Mode(true).hashPrefix('!');
  }])

  .factory('RestService', ['$resource', function($resource) {
    return $resource('http://localhost:8080/restga/lid/:id', { id: '@lid.id' });
  }])

  .controller('ListController', ['$scope', 'RestService', function ($scope, RestService) {
    //$scope.leden = RestService.query();
    
    $scope.leden = [
      {id: "profiel", lidnummer: "1989080400123", voornaam: "Kawtar", achternaam: "Tel", postcode: "2547", gemeente: "Lint", straat: "Lambrechtstraat", nummer: "28"},
      {id: "profiel", lidnummer: "1994071000685", voornaam: "Georgino", achternaam: "Mijnen", postcode: "3530", gemeente: "Houthalen-Helchteren", straat: "Lambrechtstraat", nummer: "64"},
      {id: "profiel", lidnummer: "1991112000453", voornaam: "Juriën", achternaam: "Erkens", postcode: "2580", gemeente: "Putte", straat: "Oostjachtpark", nummer: "393"}
    ];
  }])

  .controller('DetailsController', ['$scope', '$routeParams', 'RestService', function ($scope, $routeParams, RestService) {
    $scope.lid = RestService.get({ id:$routeParams.id });
    $scope.datum = new Date();
    
    $scope.opslaan = function() {
      $scope.lid.$save(function(response) {
        $scope.lid = response;
      });
    }
    $scope.schrap = function() {}
    $scope.nieuw = function() {}
    $scope.gezinslid = function() {}
    
    $scope.$on('$viewContentLoaded', function() {
      $('.selectpicker').selectpicker();
      $('.responsivefooter').responsivefooter();
    });
  }])

  .directive('gaLid', ['$location', function ($location) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.click(function () {
          //$location.path('lid/' + lidnummer);
          $location.url('lid/' + attr.gaLid);
          scope.$apply();
        });
      }
    }
  }]);
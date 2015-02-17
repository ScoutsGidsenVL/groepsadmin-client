var gaApp = angular
  .module('gaApp', ['ngRoute', 'ngResource', 'ui.bootstrap'])

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
    return $resource(
      'http://localhost:8080/restga/lid/:id',
      {id: '@lid.id'},
      {'update': {method:'PATCH'}}
    );
  }])

  .controller('ListController', ['$scope', 'RestService', function ($scope, RestService) {
    $scope.isFilterCollapsed = true;
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
    
    $scope.opslaan = function(obj) {
      console.log("UPDATE");
      //e.preventDefault();
      $scope.lid.$update(function(response) {
        console.log("SUCCESS");
        $scope.lid = response;
      });
    }
    $scope.schrap = function() {}
    $scope.nieuw = function() {}
    $scope.gezinslid = function() {}
    
    $scope.stopFunctie = function(id) {
      // Een bestaande niet beëindigde functie opladen met einde != null of false.
      // OF: /functie/{functieId} DELETE request
      console.log(id);
    }
  }])

  .controller('SearchController', ["$scope", "$location", function($scope, $location/*, searchFactory*/) {
    $scope.results = [{id: "profiel", voornaam: "Marieke", achternaam: "Vandecasteele", geboortedatum: "05/07/1989"},
                    {id: "profiel", voornaam: "Marie-Sophie", achternaam: "Cnockaert", geboortedatum: "03/10/1990"},
                    {id: "profiel", voornaam: "Marie-Alix", achternaam: "Maelfait", geboortedatum: "29/11/1998"},
                    {id: "profiel", voornaam: "Marie", achternaam: "Asscherickx", geboortedatum: "26/06/1980"},
                    {id: "profiel", voornaam: "Marie-Amelie", achternaam: "Cnockaert", geboortedatum: "08/08/1989"},
                    {id: "profiel", voornaam: "Marieke", achternaam: "Pattijn", geboortedatum: "23/06/2001"},
                    {id: "profiel", voornaam: "Marie", achternaam: "Beel", geboortedatum: "01/03/2004"},
                    {id: "profiel", voornaam: "Marie", achternaam: "Leenknecht", geboortedatum: "01/03/2004"}];
    
    $scope.gotoLid = function(lid) {
      $location.path('/lid/' + lid.id);
      //$scope.$apply();
    };
  }])

  .directive('gaLid', ['$location', function ($location) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.click(function () {
          $location.path('/lid/' + attr.gaLid);
          scope.$apply();
        });
      }
    }
  }]);

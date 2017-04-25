(function() {
  'use strict';

  var APIURL = 'https://groepsadmin-develop.scoutsengidsenvlaanderen.net';

  angular.module('ga', [
    'ga.route',
    'ga.services.rest',
    'ga.services.useraccess',
    'ga.services.userprofile',
    'ga.services.http',
    'ga.services.alert',
    'ga.services.ledenfilter',
    'ga.services.ledenlijst',
    'ga.ledenlijstcontroller',
    'ga.lidcontroller',
    'ga.usercontroller',
    'ga.lidtoevoegencontroller',
    'ga.lidindividuelesteekkaartcontroller',
    'ga.groepcontroller',
    'ga.orakelcontroller',
    'ga.lid.velden',
    'ga.dynamischveld',
    'ga.dynamischevelden',
    'ga.dynamischformulier',
    'ga.actievelink',
    'ga.searchcontroller',
    'ga.ui.selectpicker',
    'ga.ui.alert',
    'ga.ui.dialog',
    'ga.filters',
    'ui.bootstrap',
    'ga.utils',
    'infinite-scroll',
    'ngSanitize'
  ])
  // lodash for use in controllers, unit tests
  .constant('_', window._)

  .run(["$rootScope", "UserAccess", "$location", "$log", function ($rootScope, UserAccess, $location, $log) {
    // for use in views, f.e. ng-repeat="x in _.range(3)"
    $rootScope._ = window._;

    $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
      switch (rejection) {

      case UserAccess.FORBIDDEN:
        $log.warn("$stateChangeError event catched", UserAccess.FORBIDDEN);
        break;

      default:
        $log.warn("$stateChangeError event catched");
        break;

      }
  });

}]);


  angular.module('ga')
    .directive('gaLid', ['$location', function ($location) {
      return {
        restrict: 'A',
        link: function (scope, elem, attr) {
          elem.click(function () {
            $location.path('/lid/' + attr.gaLid);
            scope.$apply();
          });
        }
      }
    }])
  angular.module('ga').factory('keycloak', function($window) {
    return $window._keycloak;
  });





  var googleMapsKey = '';
  switch (window.location.origin){
    case 'http://localhost:8000':
      googleMapsKey = 'AIzaSyBQRUONtrmAcJ96_NILKeRvj5F5nXRh2MM';
      break;
    case 'https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be':
      googleMapsKey = 'AIzaSyBiKzCCqMUyu4mW0rKk777CU3pW86FZiJ8';
      break;
    case 'https://groepsadmin-develop.scoutsengidsenvlaanderen.net':
      googleMapsKey = 'AIzaSyBZU1SgLDbOfAlROSnR_cb_wWQGlQRqMqc';
      break;
  }
  var script = document.createElement('script');
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + googleMapsKey;
  document.body.appendChild(script);


  angular.element(document).ready(function() {
    window._keycloak = Keycloak(getClient());

    window._keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false
      })
      .success(function() {


        angular.module('ga').constant('ApiUrl', APIURL);



        // see if there's already some data stored in localstorage
        // if not, we'll first need to fetch and store data
        // but first, check if localstorage is supported

        if (typeof(Storage) !== "undefined") {
            // if localhostorage has data
            // defineconstant using localstorage data


            //-- else getUserData() AND defineconstant AND save in localstorage
            getUserData().then(function(res){
              console.log('wijoo', res);
              bootstrapApp();
            });



        } else {
            // Sorry! No Web Storage support..
            // -- getUserData() and defineconstant


        }



    });
  });

  var getUserData = function(){
    return new Promise(function(resolve, reject){
      var initInjector = angular.injector(['ng']);
      var $http = initInjector.get('$http');
      $http.get(APIURL + '/groepsadmin/rest-ga/').then(function(success) {
        resolve(success.data);
      },function(err){
        console.log("FAIL--", err);
        reject(err);
      });
    });

  }

  var defineConstants = function(data){
    console.log('defineConstants : ', data);
    angular.module('ga').constant('userInfo', 'USERINFOOOOOOOO');
  }

  var bootstrapApp = function(){
    angular.bootstrap(document, ['ga']); // manually bootstrap Angular
  }

})();

(function() {
  'use strict';

  angular
    .module('ga.websitecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('WebsiteController', WebsiteController);

  WebsiteController.$inject = ['$scope', 'RestService'];

  function WebsiteController ($scope, RestService) {

    $scope.websites = [
      {
        naam: 'Scouts en Gidsen Vlaanderen',
        url: 'https://www.scoutsengidsenvlaanderen.be'
      },
      {
        naam: 'Hopper',
        url: 'http://www.hopper.be'
      },
      {
        naam: 'Groepsadministratie',
        url: 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin'
      },
      {
        naam: 'Facebook',
        url: 'https://www.facebook.com/scoutsengidsenvlaanderen',
        afbeelding: 'https://www.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_fb.png'
      },
      {
        naam: 'Twitter',
        url: 'https://twitter.com/ScoutsGidsenVL',
        afbeelding: 'https://www.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_twitter.png'
      },
      {
        naam: 'Instagram',
        url: '"https://instagram.com/scoutsgidsenvl',
        afbeelding: 'https://www.scoutsengidsenvlaanderen.be/files/algemeen/menubalk/balk_sprite_instagram.png'
      }
    ];

    RestService.Websites.get().$promise.then(
      function(result){
        $scope.websites = result.websites;
    });
  }
})();

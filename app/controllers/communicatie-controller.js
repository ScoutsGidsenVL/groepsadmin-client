(function () {
  'use strict';

  angular
    .module('ga.communicatiecontroller', ['ga.services.alert', 'ga.services.dialog', 'ui.bootstrap'])
    .controller('CommunicatieController', CommunicatieController);

  CommunicatieController.$inject = ['$location', '$rootScope', '$routeParams', '$scope', '$timeout', '$window', 'AlertService',
    'DialogService', 'LidService', 'RestService'];

  function CommunicatieController($location, $rootScope, $routeParams, $scope, $timeout, $window, AlertService,
                                  DialogService, LS, RestService) {

    angular.extend($scope, LS.publicProperties, LS.publicMethods);
    $scope.selectedCommunicatieProducten = [];

    var post = 'post';
    var nieuwsbrief = 'nieuwsbrief';
    var goScoutIt = 'Go Scout It';

    var communicatieproductabonnement = {
      communicatieproduct: '',
      type: '',
      lid: ''
    }

    var defaultCommunicatieproductabonnement = {
      communicatieproduct: '',
      type: '',
      lid: ''
    }

    var init = function () {
      $scope.validationErrors = [];
      $scope.isEigenProfiel = true;

      RestService.CommunicatieProducten.get().$promise.then(
        function (result) {
          $scope.communicatieProducten = result.communicatieProducten;
          $scope.leiding = $scope.communicatieProducten.length >= 4;
        });

      RestService.Lid.get({id: 'profiel'}).$promise.then(
        function (result) {
          $scope.lid = result;
        });

      RestService.CommunicatieproductAbonnement.get().$promise.then(
        function (result) {
          $scope.selectedCommunicatieProducten = result;
        });



    };

    $scope.verwerkCommunicatie = function (communicatieproduct, type) {
      communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
      communicatieproductabonnement.communicatieproduct = communicatieproduct.id;
      communicatieproductabonnement.type = type;
      communicatieproductabonnement.lid = $scope.lid.id;

      var index = getIndexVanCommunicatieproduct(communicatieproductabonnement);

      // als record niet in array bestaat dan mag die toegevoegd worden, anders verwijderd.
      if (index < 0) {
        $scope.selectedCommunicatieProducten.push(communicatieproductabonnement);
        if (!$scope.leiding) {
          checkBijlages();
        } else {
          voegAlleBijlageVoorLeidingToe(communicatieproductabonnement.type);
        }
      } else {
        $scope.selectedCommunicatieProducten.splice(index, 1)
        if (communicatieproduct.type === post) {
          voegNieuwsbriefAanLijst(communicatieproduct);
        }
        if (!$scope.leiding) {
          checkBijlages();
        }
      }
    }

    // alle aanpassingen opslaan
    $scope.opslaan = function () {
      $scope.saving = true;
      var request = $scope.selectedCommunicatieProducten;
      RestService.CommunicatieproductAbonnement.post(request).$promise.then(
        function (response) {
          AlertService.add('success', 'Voorkeur is aangepast.');
          $scope.saving = false;
        },
        function (error) {
          $scope.saving = false;
        }
      )
    };

    $scope.checkValue = function (communicatieproduct, type) {
      var result = true;

      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (communicatieproduct.id === communicatieproductAbonnement.communicatieproduct && type === communicatieproductAbonnement.type) {
          result = false;
        }
      })

      return result;
    }

    $scope.verwerkCommunicatieBijlages = function () {
      if ($scope.checkAantalBijlages(post)) {
        verwijderAlleBijlageVoorLeiding(post);
      } else {
        voegAlleBijlageVoorLeidingToe(post);
      }
    }

    $scope.verwerkCommunicatieBijlagesDigitaal = function () {
      if ($scope.checkAantalBijlages(nieuwsbrief)) {
        verwijderAlleBijlageVoorLeiding(nieuwsbrief);
      } else {
        voegAlleBijlageVoorLeidingToe(nieuwsbrief);
      }
    }

    $scope.checkAantalBijlages = function (type) {
      var counter = 0;
      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (communicatieproductAbonnement.type === type) {
          _.each($scope.communicatieProducten, function (communicatieProduct) {
            if (communicatieProduct.id === communicatieproductAbonnement.communicatieproduct) {
              counter++;
            }
          })
        }
      })
      return (counter >= 3);
    }

    $scope.checkValueDigital = function (communicatieproduct, type) {
      var result = false;
      var productExists = false;
      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (communicatieproduct.id === communicatieproductAbonnement.communicatieproduct && type === communicatieproductAbonnement.type) {
          result = false;
          productExists = true;
        }
      })
      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (!productExists && (communicatieproduct.id === communicatieproductAbonnement.communicatieproduct && communicatieproductAbonnement.type === post)) {
          result = true;
        }
      })
      return result;
    }

    function voegNieuwsbriefAanLijst(communicatieproduct) {
      communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
      communicatieproductabonnement.communicatieproduct = communicatieproduct.id;
      communicatieproductabonnement.type = nieuwsbrief;
      communicatieproductabonnement.lid = $scope.lid.id;

      var index = getIndexVanCommunicatieproduct(communicatieproductabonnement);

      if (index < 0) {
        $scope.selectedCommunicatieProducten.push(communicatieproductabonnement)
      }
    }

    function getIndexVanCommunicatieproduct(communicatieproductabonnement) {
      var index = -1;
      for (var i = 0; i < $scope.selectedCommunicatieProducten.length; i++) {
        if ($scope.selectedCommunicatieProducten[i].type === communicatieproductabonnement.type
          && $scope.selectedCommunicatieProducten[i].communicatieproduct === communicatieproductabonnement.communicatieproduct
          && $scope.selectedCommunicatieProducten[i].lid === communicatieproductabonnement.lid) {
          index = i;
          break;
        }
      }
      return index;
    }

    // Automatisch toevoegen of verwijderen van Go Scout it in geval van een lid en in geval dat zowel krak als boem zijn afgevinkt
    function checkBijlages() {
      var communicatieproductBijlage = {};
      var aantalPostRecords = 0;
      var aantalNieuwsbriefRecords = 0;

      _.each($scope.communicatieProducten, function (communicatieProduct) {
        if (communicatieProduct.naam === goScoutIt) {
          communicatieproductBijlage = communicatieProduct;
        }
      })

      _.each($scope.selectedCommunicatieProducten, function (communicatieproductAbonnement) {
        if (communicatieproductAbonnement.communicatieproduct !== communicatieproductBijlage.id) {
          if (communicatieproductAbonnement.type === post) {
            aantalPostRecords++;
          } else {
            aantalNieuwsbriefRecords++;
          }
        }
      })

      communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
      communicatieproductabonnement.communicatieproduct = communicatieproductBijlage.id;
      communicatieproductabonnement.type = post;
      communicatieproductabonnement.lid = $scope.lid.id;
      var index = getIndexVanCommunicatieproduct(communicatieproductabonnement);

      if (aantalPostRecords >= 2) {
        if (index < 0) {
          $scope.selectedCommunicatieProducten.push(communicatieproductabonnement);
        }
      } else {
        if (index > 0) {
          $scope.selectedCommunicatieProducten.splice(index, 1)
        }
      }

      communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
      communicatieproductabonnement.communicatieproduct = communicatieproductBijlage.id;
      communicatieproductabonnement.type = nieuwsbrief;
      communicatieproductabonnement.lid = $scope.lid.id;
      index = getIndexVanCommunicatieproduct(communicatieproductabonnement);

      if (aantalNieuwsbriefRecords >= 2) {
        if (index < 0) {
          $scope.selectedCommunicatieProducten.push(communicatieproductabonnement);
        }
      } else {
        if (index > 0) {
          $scope.selectedCommunicatieProducten.splice(index, 1)
        }
      }

    }

    function verwijderAlleBijlageVoorLeiding(type) {
      _.each($scope.communicatieProducten, function (communicatieproduct) {
        if (communicatieproduct.bijlage) {
          communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
          communicatieproductabonnement.communicatieproduct = communicatieproduct.id;
          communicatieproductabonnement.type = type;
          communicatieproductabonnement.lid = $scope.lid.id;
        }
        if (communicatieproductabonnement) {
          do {
            var index = getIndexVanCommunicatieproduct(communicatieproductabonnement);
            $scope.selectedCommunicatieProducten.splice(index, 1);
          } while (index > -1)
        }
      })
    }

    function voegAlleBijlageVoorLeidingToe(type) {
      _.each($scope.communicatieProducten, function (communicatieproduct) {
        if (communicatieproduct.bijlage) {
          communicatieproductabonnement = Object.assign({}, defaultCommunicatieproductabonnement);
          communicatieproductabonnement.communicatieproduct = communicatieproduct.id;
          communicatieproductabonnement.type = type;
          communicatieproductabonnement.lid = $scope.lid.id;
          if (getIndexVanCommunicatieproduct(communicatieproductabonnement) < 0) {
            $scope.selectedCommunicatieProducten.push(communicatieproductabonnement);
          }
        }
      })
    }

    init();
  }
})
();

angular.module('ga.filters', [])
  .filter('formValidator', [function () {
    return function (field, validationErrors) {
      var returnValue = "";
      angular.forEach(validationErrors, function (value) {
        if (value.veld == field) {
          returnValue = "has-validation-error";
        }
      });
      return returnValue;

    }
  }])
  .filter('verbondFuncties', [function () {
    return function (items, lid, geenActieve, groepsnummer) {
      return _.filter(items, function (item) {
        var showActief = true;

        if (geenActieve) {
          angular.forEach(lid.functies, function (value) {
            if (value.groep == groepsnummer && value.functie == item.id && value.temp != "tijdelijk" && value.einde == undefined) {
              showActief = false;
            }
          });
        }

        if (showActief) {
          var leeftijdCheck = true;
          if (item.uiterstegeboortedatum) {
            leeftijdCheck = lid.vgagegevens && lid.vgagegevens.geboortedatum && moment(lid.vgagegevens.geboortedatum).isValid()
            ? moment(lid.vgagegevens.geboortedatum).isBefore(moment(item.uiterstegeboortedatum)) : false;
          }

          return item.type === 'verbond' && leeftijdCheck;
        }
        else {
          return false;
        }

      });
    }
  }])
  .filter('groepEigenFuncties', [function () {
    return function (items, lid, geenActieve, groepsnummer) {
      return _.filter(items, function (item) {
        var showActief = true;

        if (geenActieve) {
          angular.forEach(lid.functies, function (value) {
            if (value.groep == groepsnummer && value.functie == item.id && value.temp != "tijdelijk" && value.einde == undefined) {
              showActief = false;
            }
          });
        }

        var leeftijdCheck = true;
        if (item.uiterstegeboortedatum) {
          leeftijdCheck = lid.vgagegevens && lid.vgagegevens.geboortedatum && moment(lid.vgagegevens.geboortedatum).isValid()
            ? moment(lid.vgagegevens.geboortedatum).isBefore(moment(item.uiterstegeboortedatum)) : false;
        }

        return showActief && item.type === 'groep' && leeftijdCheck;
      });
    }
  }])
  .filter('formValidatorError', [
    function () {
      return function (field, validationErrors) {
        var returnValue = "";
        angular.forEach(validationErrors, function (value) {
          if (value.veld == field) {
            returnValue = value.titel.charAt(0).toUpperCase() + value.titel.slice(1);
          }
        });
        return returnValue;
      }
    }
  ])
  // zet java tijd om naar human readable
  .filter('javaDateFormatter', [function () {
    return function (date) {

      console.warn("datefilter");
      if (date == undefined || date == null) {
        return date;
      }
      var day = date.substr(8, 2);
      var month = date.substr(5, 2);
      var year = date.substr(0, 4);
      console.warn(day + '/' + month + '/' + year);
      return year + '-' + month + '-' + day;
    }
  }])

  .filter('rekeningnummerFormatter', [function () {
    // BEXX XXXX XXXX XXXX
    return function (field) {
      console.log(field);
      return field.substr(0, 4) + ' ' + field.substr(4, 4) + ' ' + field.substr(8, 4) + ' ' + field.substr(12, 4);
    }
  }])
  .filter('roundToOne', [function () {
    return function (value) {
      return Math.round(value * 10) / 10;
    };
  }])
  .filter('round', [function () {
    return function (value) {
      return Math.round(value);
    };
  }])

  .filter('fieldTypeFormatter', [function () {
    return function (value) {
      if (value == undefined || value == null) {
        return value;
      }
      value = value.toLowerCase();
      var regex = new RegExp('_', 'g');
      value = value.replace(regex, ' ');
      return value;
    };
  }]);

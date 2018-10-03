angular.module('ga.filters', [])
  .filter('formValidator', function () {
    return function (field, validationErrors) {
      var returnValue = "";
      angular.forEach(validationErrors, function (value) {
        if (value.veld == field) {
          returnValue = "has-validation-error";
        }
      });
      return returnValue;

    }
  })
  .filter('verbondFuncties', function () {
    return function (items, lid) {
      var leeftijd;

      if(lid && lid.vgagegevens) {
        leeftijd = moment().diff(lid.vgagegevens.geboortedatum, 'years')
      }

      return _.filter(items, function(item) {
        if (leeftijd !== undefined && leeftijd < 16) {
          var isLeidingsFunctie = (_.find(item.groeperingen, {naam: 'Leiding'}) !== undefined);

          return item.type === 'verbond' && !isLeidingsFunctie;
        }
        else {
          return item.type === 'verbond';
        }
      });
    }
  })
  .filter('formValidatorError', function () {
    return function (field, validationErrors) {
      var returnValue = "";
      angular.forEach(validationErrors, function (value) {
        if (value.veld == field) {
          returnValue = value.titel.charAt(0).toUpperCase() + value.titel.slice(1);
        }
      });
      return returnValue;
    }
  })
  // zet java tijd om naar human readable
  .filter('javaDateFormatter', function () {
    return function (date) {

      console.warn("datefilter");
      if (date == undefined || date == null){
        return date;
      }
      var day = date.substr(8,2);
      var month = date.substr(5,2);
      var year = date.substr(0,4);
      console.warn(day + '/' + month + '/' + year);
      return year + '-' + month + '-' + day;
    }
  })

  .filter('rekeningnummerFormatter', function () {
    // BEXX XXXX XXXX XXXX
    return function (field) {
      console.log(field);
      return field.substr(0,4) + ' ' + field.substr(4,4) + ' ' + field.substr(8,4) + ' ' + field.substr(12,4);
    }
  })
  .filter('roundToOne', function () {
        return function (value) {
            return Math.round(value * 10) / 10;
        };
    })
  .filter('round', function () {
        return function (value) {
            return Math.round(value);
        };
    })

  .filter('fieldTypeFormatter', function () {
    return function (value) {
      if(value == undefined || value == null){
        return value;
      }
      value = value.toLowerCase();
      var regex = new RegExp('_', 'g');
      value = value.replace(regex, ' ');
      return value;
    };
  });

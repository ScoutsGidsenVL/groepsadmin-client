var getClient = function(){
  /*
  Example result:
      {
          url: 'http://localhost:8888/auth',
          realm: 'scouts',
          clientId: 'groepsadmin-localhost-8000',
          redirectUri: 'http://localhost:8000/'
      }
  */

  var returnClient = {
    url: 'https://login-dev.scoutsengidsenvlaanderen.be/auth',
    realm: 'scouts',
    clientId: null,
    redirectUri: window.location.href
  }

  switch(window.location.origin){
    case 'http://localhost:8000':
      returnClient.clientId = 'groepsadmin-localhost-8000-client';
      break;
    case 'https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be':
      returnClient.clientId = 'groepsadmin-dev-tvl-client';
      break;
    case 'https://ga-dev-tvl.scoutsengidsenvlaanderen.be':
      returnClient.clientId = 'ga-dev-tvl-client';
      break;
    case 'https://groepsadmin-develop.scoutsengidsenvlaanderen.net':
      returnClient.clientId = 'groepsadmin-staging-client';
      break;
    case 'https://ga-staging.scoutsengidsenvlaanderen.be':
      returnClient.clientId = 'ga-staging-client';
      break;
    case 'https://groepsadmin.scoutsengidsenvlaanderen.be':
      returnClient.clientId = 'groepsadmin-production-client';
      break;
    case 'https://ga-production.scoutsengidsenvlaanderen.be':
      returnClient.clientId = 'ga-production-client';
      break;
    default:
      returnClient.clientId = null;
      break;
  }
  return returnClient;
}

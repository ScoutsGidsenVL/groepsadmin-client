var getClient = function(){
  /*
  Example result:
      {
          url: 'https://login.scoutsengidsenvlaanderen.be/auth',
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
    case 'https://groepsadmin-develop.scoutsengidsenvlaanderen.net':
      returnClient.clientId = 'groepsadmin-staging-client';
      break;
    default:
      returnClient.clientId = null;
      break;
  }
  return returnClient;
}

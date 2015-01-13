# REST API Documentatie
## Endpoints

De API heeft de volgende eindpunten:

|   |   |
|---|---|
| *[/lid](#lid)*                                | `POST`                      |
| *[/lid/{lidid}](#lidlidid)*                   | `GET` `PATCH`               |
| *[/lid/profiel](#lidprofiel)*                 | `GET` `PATCH`               |
| *[/groep](#groep)*                            | `GET`                       |
| *[/groep/{groepsnummer}](#groepgroepsnummer)* | `GET` `PUT`                 |
| */functie*                                    | `GET`                       |
| */functie?{query-string}*                     | `GET`                       |
| *[/functie/{functieid}](#functiefunctieid)*   | `GET` `POST` `PUT` `DELETE` |



## Algemeen

### ETag

De implementatie zal [ETag's](http://en.wikipedia.org/wiki/HTTP_ETag) voorzien. Een gebruiker kan hiermee kijken of een resource gewijzigd is.
Voor de `GET` betekent dit dat als de resource niet gewijzigd is de gebruiker een *304* terug zal krijgen. (Browsers zullen dit transparant voor de gebruiker doen.)
Nuttiger is dat bij een `PATCH` of `DELETE` de gebruiker op deze manier een vorm van optimistic locking kan implementeren. (Wijzig deze resource enkel als hij door niemand anders gewijzigd is.

### Headers

De volgende headers moeten opgestuurd worden naar de server:

|   |   |
|---|---|
| *Accept* 			| `application/json`                              |
| *Authentication* 	| oauth-2.0 access token: `Bearer {accessToken}`  |



## Eindpunten

### */lid*

#### `GET`

##### Response
```javascript
{
  links: [{
    "href": "https://ga.sgv.be/rest/lid",
    "method": "POST",
    "rel": "create"
  },{
    "href": "https://ga.sgv.be/rest/lid/profiel",
    "rel": "profiel"
  }]
}
```

#### `POST`
Maak een nieuw lid aan.

##### Request
In te vullen secties: `persoonsgegevens`, `adressen`, `email` en `functies`

##### Response
Het lid zoals in `GET` lid


### */lid/{lidid}*

Een specifiek lid

#### `GET`

##### Request

##### Response
```javascript
{
  "id": "d5f75b320b812440010b8127f95f4db4",
  "aangepast": "2014-04-30T13:16:34+00:00",
  "persoonsgegevens" : {
    "voornaam": "Baden",
    "achternaam": "Powell",
    "geslacht": "m",
    "GSM": "0123/456.789",
    "geboortedatum": "1857-02-22",
    "beperking": false,
    "verminderdlidgeld": false,
    "rekeningnummer": "BE68 5390 0754 7034",
  },
  "verbond": {
    "lidnummer": "1857012301234",
    "klantnummer": "I127872",
    "lidgeldbetaald": true,
    "lidkaartafgedrukt": true
  },
  "adressen": [
    {
      "id": "d5f75e23385c5e6e0139493b84fe0352",
      "land": "BE",
      "postcode": "9000",
      "gemeente": "Gent",
      "straat": "Zondernaamstraat",
      /* "giscode": "0160", */
      "nummer": "1",
      "bus": "",
      "telefoon": "012345678",
      "postadres": true,
      "omschrijving" : "adres papa",
      "status": "NORMAAL",
    }
  ],
  "email": "b.powell@example.com",
  "functies": {
    "A3143G": [
      {
        "groep": "A3143G",
        "functie": "d5f75e23385c5e6e0139493b8546035e",
        "begin": "2014-01-01",
        "einde": "2014-03-02" 
        "links": [{
          "href": "http://ga.sgv.be/rest/groep/A3143G",
          "rel": "groep",
          "method": "GET"
        },{
          "href": "http://ga.sgv.be/rest/functie/d5f75e23385c5e6e0139493b8546035e",
          "rel": "functie",
          "method": "GET"
        }]
      }
    ]
  },
  "groepseigen": [
    {
      "groep": "A3143G",
      "gegevens": [
        {
          "id": "d5f75e233f7d1ccc013f9e3c6a0909f7",
          "naam": "Gaat mee op Weekend",
          "type": "vinkje",
          "waarde": true,
          "schrijfbaar": true,
        },
        {
          "id": "dd5f75e233f7d1ccc013f9e3c6a0909f7",
          "naam": "E-mail ouder",
          "type": "email",
          "waarde": "",
          "schrijfbaar": true,
        },
        {
          "id": "d5f75e233f7d1ccc013f9e3c6a0909f7",
          "naam": "lievelingskleur",
          "type": "lijst",
          "keuze": ["groen", "rood", "blauw"],
          "schrijfbaar": false,
        },
      ],      
      "links": [{
        "href": "http://ga.sgv.be/rest/groep/A3143G",
        "rel": "groep",
        "method": "GET"
      }]
    }
  ],
  "links": [
    {
      "rel": "self",
      "href": "https://ga.sgv.be/rest/lid/d5f75b320b812440010b8127f95f4db4",
      "method": "GET"
    },{
      "rel": "update",
      "href": "https://ga.sgv.be/rest/lid/d5f75b320b812440010b8127f95f4db4",
      "method": "PATCH",
      "secties": ["persoonsgegevens", "adressen", "email", "functies.A3143G", "groepseigen"]
    }
  ]
}
```

* Bij samengevoegde leden zullen beide lid-id's blijven werken, en naar dezelfde resource leiden (waarschijnlijk redirect).
* Een andere mogelijkheid is om elke sectie van deze resource te splitsen in kleinere secties.  (*lid/{lidid}/persoonsgegevens*).  Dit is makkelijker op de server kant, maar heb het gevoel dat op de client zijde dit dingen vermoeilijkt (of niet?).

#### PATCH
Updaten van een lid

##### Request
* In het request kan de gebruiker alle secties opladen waar hij toegang voor heeft.  Deze zijn opgesomd onderaan in de links sectie.
* Weggelaten secties worden als niet aangepast beschouwd.
* Het opladen van een niet voor deze gebruiker niet schrijfbare sectie resulteert in een foutmelding van de server.

Een beschrijving per sectie wat kan en mag:

###### persoonsgegevens
* Alle velden zijn verplicht datum enkel in ISO8601 formaat.

###### adressen
* Adressen worden gecorreleerd aan de hand van de id.
* Een id niet opladen is een adres verwijderen.
* Een adres zonder id toevoegen is een nieuw adres.
* Belgische adressen moeten een gis code hebben. (Hoe giscode ophalen???)
* De status kan niet ingesteld worden.

###### email
* Is soms wijzigbaar en soms niet, goed kijken naar de secties in de links topic.

###### functies
* Functie toevoegen == een functie toevoegen met `begin` != `null` of `false`.  Je mag dus datum invullen, maar de server zal hier geen rekening mee houden.
* Functie verwijderen == een bestaande niet beeindigde functie opladen met `einde` != `null` of `false`.
* Voor het groeps en het functie veld wordt er enkel naar de waarde van `id` gekeken.  Alle andere velden worden genegeerd.

###### groepseigen
* Groepseigen velden worden gecorreleerd aan de hand van een id.
* Er wordt enkel gekeken naar het `id` veld en het `waarde` veld.  Alle andere velden worden genegeerd.
* Een niet schrijfbaar dat toch opgeladen wordt, wordt genegeerd.
* Als een gegeven niet opgeladen wordt wordt het als onveranderd beschouwd.

##### Response
Het lid zoals in `GET` lid


### */lid/profiel*

#### `GET`

Verwijst naar *lid/{lidid van ingelogd lid}*


### */groep*

#### `GET`

##### Response
Alle groepen waar je toegang toe hebt:
```javascript
{
  "groepen": [{
    "nummer": "A3143G",
    "naam": "Sint-benedictus",
    "link":[{
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "self"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "update",
      "method": "PUT",
    }]
  }],
  "links":[{
    "href": "https://ga.sgv.be/rest/groep",
    "rel": "self"
  }]
}
```

### */groep/{groepsnummer}*

#### `GET`

##### Response
```javascript
{
  "nummer":"A3143G",
  "naam": "Sint Benedictus",
  "adres": {
    "land": "BE",
    "postcode": "2640",
    "gemeente": "Mortsel",
    "straat": "Jacob van Arteveldestraat",
    "giscode": "0160",
    "nummer": "27",
    "bus": "",
    "positie": {
      "lat" : 51.166969,
      "lng" : 4.462271
    }
  },
  "website":"http://www.sgv.be",
  "publieke-info":"Info die we op onze website mogen zetten",
  "email":"info@sgv.be",
  "opgericht":"1900/01/01",
  "beeindigd":"2014/09/01",//optioneel - enkel voor gestopte groepen
  "publiek-inschrijven": true,
  "rekeningnummer":"BE68 5390 0754 7034",
  "link":[
    {
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "self"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "update",
      "method": "PUT",
    },{
      "href": "https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/lidworden?groep=A3143G",
      "rel": "inschrijven",
      "method": "GET"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G/inschrijvingen",
      "rel": "inschrijvingen",
      "method": "GET"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G/groepseigen-gegevens",
      "rel": "groepseigen-gegevens",
      "method": "GET"
    },{
      "href": "https://ga.sgv.be/rest/functie?groep=A3143G",
      "rel": "groepseigen-functies",
      "method": "GET"
    },{
      "href": "https://ga.sgv.be/rest/functie",
      "rel": "groepseigen-functies-aanmaken",
      "method": "POST"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G/statistieken",
      "rel": "statistieken",
      "method": "GET"
    }
  ]
}
```

#### `PUT`

##### Request
Zelfde als `GET` response, maar `links`, `naam` en `nummer` worden genegeerd.

##### Response
`GET` response.


### */functie/{functieId}*

#### `GET`

##### Response
Een verbondsfunctie:
```javascript
{
  "id": "d5f75e23385c5e6e0139493b8546035e",
  "code": "KWL",
  "beschrijving": "Kabouter welpen leider",
  "type":"verbond",
  "voor":["A3143G", "A3160M"],
  "adjunct":"e0139493b8546035ed5f75e23385c5e6"
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/functie/d5f75e23385c5e6e0139493b8546035e",
      "rel": "self",
      "method": "GET"
    }, {    
      "href": "https://ga.sgv.be/rest/functie/e0139493b8546035ed5f75e23385c5e6", //link naar AKWL
      "rel": "adjunct",
      "method": "GET"
    }
  ]
}
```

Groepseigen functie:
```javascript
{
  "id": "d5f75e23385c5e6e0139493b8546035e",
  "beschrijving": "Barploeg",
  "type":"groep",
  "voor":["A3143G"],
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "self",
      "method": "GET"
    }, {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "update",
      "method": "PUT"
    }, {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "delete",
      "method": "DELETE"
    },
  ]
}
```

#### `POST`

##### Request
Je maak een nieuwe groepseigen functie aan. Enkel de velden `beschrijving` en `voor` zijn verplicht. We laten (op dit moment) geen meerdere groepen in het `voor` veld door.

##### Response
Een redirect naar de nieuwe functie of een error.

#### `PUT`
Update van het `beschrijving` veld. Alle andere velden worden genegeerd.

##### Request
De upgedate functie of een error.

##### Response

#### `DELETE`

##### Request
Geen body nodig.

##### Response
Een error met een bevestigingslink.



## Errors

### Status codes
Zoals het hoort gebruiken we de volgende HTTP status codes:

|   |   |
|---|---|
| 200 | Request OK              |
| 201 | Resource created        |
| 304 | Not modified            |
| 400 | Bad request             |
| 401 | Unauthorized request    |
| 404 | Resource was not found  |
| 50x | Inernal server error    |

### Formaat
```javascript
{
  "id": "unieke_id_voor_deze_foutmelding",
  "titel": "{titel van het fout bericht}",
  "beschrijving": "{Gebruiksvriendelijke beschrijving van de fout}",
  "details": [ //Optioneel
    {
      "titel": "{titel van het fout bericht}",
      "beschrijving": "{Gebruiksvriendelijke beschrijving van de fout}",
      "veld": "sectie.veldnaam", //optioneel referentie naar het veld dat met de fout te maken heeft
    }, ...
  ],
  "links": [
    {
      "rel": "help",
      "href": "http://wiki.svg.be/..",
      "method": "GET",
    },
    {
      "rel": "force",
      "method": "POST",
      "href": "https://ga.svg.be/rest/lid/gaid/forceer?geboortedatum=2009-01-21"
    }
  ]
}
```


## Meer lezen

* [PayPal REST API](https://developer.paypal.com/webapps/developer/docs/api/) veel gespiekt hier
* [HATEOAS](http://timelessrepo.com/haters-gonna-hateoas)
* [HAL](http://blog.stateless.co/post/13296666138/json-linking-with-hal) (formele spec van een hateos manier)
* [json schema](http://json-schema.org/examples.html) (Beschrijving voor ongekende velden)
* [Jersey, jax-rs en etag caching](https://devcenter.heroku.com/articles/jax-rs-http-caching)

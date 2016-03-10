# REST API Documentatie
## Endpoints

De API heeft de volgende eindpunten:

| Endpoint                                                    | `GET` | `POST` | `PATCH` | `DELETE` | `PUT` |
|-------------------------------------------------------------|-------|--------|---------|----------|-------|   
| */*                                                         | OK    | -      | -       | -        | -     |
| *[/lid](#lid)*                                              | -     | OK     | -       | -        | -     |
| *[/lid/{lidid}](#lidlidid)*                                 | OK    | -      | OK      | -        | -     |
| *[/lid/profiel](#lidprofiel)*                               | OK    | -      | OK      | -        | -     |
| *[/groep](#groep)*                                          | OK    | -      | -       | -        | -     |
| *[/groep/{groepsnummer}](#groepgroepsnummer)*               | OK    | -      | OK      | -        | -     |
| *[/functie](#functie)*                                      | OK*   | OK     | -       | -        | -     |
| *[/functie?{query-string}](#functiequerystring)*            | OK    | -      | -       | -        | -     |
| *[/functie/{functieid}](#functiefunctieid)*                 | OK    | -      | OK      | OK       | -     |
| *[/ledenlijst](#ledenlijst)*                                | NOK   | -      | -       | -        | -     |
| *[/ledenlijst/filter](#ledenlijstfilter)*                   | NOK   | NOK    | -       | -        | -     |
| *[/ledenlijst/filter/{filterid}](#ledenlijstfilterfilterid)*| NOK   | -      | NOK     | NOK      | NOK   |
| *[/ledenlijst/kolom-type](#ledenlijstkolom-type)*           | NOK   | -      | -       | -        | -     |

 * Imperformante request

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
Optioneel: `groepseigen` en `contacten`

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
    "rekeningnummer": "BE68 5390 0754 7034"
  },
  "verbondsgegevens": {
    "lidnummer": "1857012301234",
    "klantnummer": "I127872",
    "lidgeldbetaald": true,
    "lidkaartafgedrukt": true
  },
  "gebruikersnaam": "lukasvo",
  "adressen": [
    {
      "id": "d5f75e23385c5e6e0139493b84fe0352",
      "land": "BE",
      "postcode": "9000",
      "gemeente": "Gent",
      "straat": "Zondernaamstraat",
      "giscode": "0160",
      "nummer": "1",
      "bus": "",
      "telefoon": "012345678",
      "postadres": true,
      "omschrijving" : "adres papa",
      "status": "NORMAAL",
    }
  ],
  "contacten": [
    {
      "id": "d5f75e23385c5e6e0139493b84fe0abc",
      "voornaam": "Henrietta",
      "achternaam": "Smyth",
      "rol": "Moeder",
      "adresId": "d5f75e23385c5e6e0139493b84fe0352",
      "gsm" : "0499 12 34 56",
      "email": null
    }
  ],
  "email": "b.powell@example.com",
  "functies": [
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
  ],
  "groepseigenVelden": {
        "A1301G": {
            "schema": [],
            "waarden": {}
        },
        "O1504G": {
            "schema": [
                {
                    "links": [],
                    "id": "d5f75b320dc7de39010dca243a830129",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "tekst",
                    "label": "Opmerkingen",
                    "beschrijving": "",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                },
                {
                    "links": [],
                    "id": "d5f75e2340fc9dac014102187b4e2a68",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "vinkje",
                    "label": "helpen op evenementen",
                    "beschrijving": "",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                },
                {
                    "links": [],
                    "id": "40288144535b694a01535b6adb2c0003",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "lijst",
                    "label": "Dit is een lijst",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "keuzes": [
                        "Lijstwaarde1",
                        "Lijstwaarde2"
                    ],
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                }
            ],
            "waarden": {
                "d5f75b320dc7de39010dca243a830129": "",
                "d5f75e2340fc9dac014102187b4e2a68": "true",
                "40288144535b694a01535b6adb2c0003": "Lijswaarde1"
            }
        }
    }
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
    }, { //Indien lid vanuit filter opgeroepen werd en er dus een vorig en volgend lid mogelijk is
      "rel": "prev",
      "href": "https://ga.sgv.be/rest/lid/d5f75b320b812440010b8127f95f4db4?positie=acme",
      "method": "GET"
    }, {//Indien lid vanuit filter opgeroepen werd en er dus een vorig en volgend lid mogelijk is
      "rel": "next",
      "href": "https://ga.sgv.be/rest/lid/d5f75b320b812440010b8127f95f4db4?positie=bar",
      "method": "GET"
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

###### functie-instanties
Een functie-instantie heeft geen `id` veld.  Het wordt uniek gekenmerkt door de combinatie van de velden `functie`, `groep` en `begin`.

* Functie-instantie toevoegen == een functie-instatie toevoegen met `begin` != `null`.  Deze zal door de server worden ingevuld op de huidige timestamp maar je geeft best een datetime mee.
* Functie-instantie stopzetten == een bestaande niet beeindigde functie-instantie opladen met `einde` != `null`.  Je mag dus datum invullen, maar de server zal hier geen rekening mee houden.
* Om te bevestigen dat de Functie-instantie stopgezet wordt moeten we een parameter `bevestig` met daarin een boolean toevoegen aan de request URL.
* Er word dus enkel naar de combinatie van `functie`, `groep` en `begin` gekeken.  Alle andere velden worden genegeerd.  Je bent dus niet verplicht om telkens alle functies terug te sturen naar de server als je er een enkele wil aanpassen.

###### groepseigen
* Groepseigen velden worden gecorreleerd aan de hand van een id.
* Er wordt enkel gekeken naar het `id` veld en het `waarde` veld.  Alle andere velden worden genegeerd.
* Een niet schrijfbaar dat toch opgeladen wordt, wordt genegeerd.
* Als een gegeven niet opgeladen wordt wordt het als onveranderd beschouwd.
* Meer info over de eigen schappen van groepseigen velden kan gevonden worden in de dynamischevelden documentatie

##### Response
Een redirect naar het nieuwe lid of error


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
    "groepsnummer": "A3143G",
    "naam": "Sint-benedictus",
    "links":[{
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "self"
    },{
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "update",
      "method": "PATCH",
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
    "links":[
      {
        "href": "https://ga.sgv.be/rest/groep/A3143G",
        "rel": "self"
      },{
        "href": "https://ga.sgv.be/rest/groep/A3143G",
        "rel": "update",
        "method": "PATCH",
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
    ],
    "id": "d5f75b320b812440010b812550aa028e",
    "aangepast": "2015-06-24T13:33:48.654Z",
    "groepsnummer": "O2301G",
    "naam": "Sint-Kristoffel",
    "adres": {
        "id": "d5f75b320b812440010b812550aa028e",
        "land": "BE",
        "postcode": "9300",
        "gemeente": "Aalst",
        "straat": "Graanmarkt",
        "nummer": "3",
        "bus": "",
        "postadres": false,
        "status": "normaal",
        "giscode": "0096",
        "positie": {
          "lat" : 51.166969,
          "lng" : 4.462271
        }
    },
    "rekeningnummer": "BE07293005850266",
    "email": "info@kroffel.be",
    "website": "www.kroffel.be",
    "vrijeInfo": "Oudste scouts van Aalst",
    "groepseigenFuncties": [
        {
            "links": [
                {
                    "rel": "self",
                    "href": "http://localhost:8080/groepsadmin/rest-ga/functie/402881254de206eb014de2077da50002"
                }
            ],
            "id": "402881254de206eb014de2077da50002",
            "aangepast": "2015-06-24T13:33:48.654Z",
            "beschrijving": "Een groepseigen functie",
            "type": "groep",
            "groepen": [
                "O2301G"
            ]
        }
    ],
    "groepseigenGegevens": {
        "schema": [
                {
                    "links": [],
                    "id": "d5f75b320dc7de39010dca243a830129",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "tekst",
                    "label": "Opmerkingen",
                    "beschrijving": "",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                },
                {
                    "links": [],
                    "id": "d5f75e2340fc9dac014102187b4e2a68",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "vinkje",
                    "label": "helpen op evenementen",
                    "beschrijving": "",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                },
                {
                    "links": [],
                    "id": "40288144535b694a01535b6adb2c0003",
                    "aangepast": "2016-03-10T12:36:45.132+01:00",
                    "type": "lijst",
                    "label": "Dit is een lijst",
                    "kanLeidingWijzigen": false,
                    "verplicht": false,
                    "kanLidWijzigen": false,
                    "sort": 0,
                    "keuzes": [
                        "Lijstwaarde1",
                        "Lijstwaarde2"
                    ],
                    "deletedTimestamp": "2016-03-10T12:36:45.132+01:00"
                }
            ],
            "waarden": {}
    },
    "opgericht": "1932-05-30T23:00:00.000Z",
    "beeindigd":"2014/09/01", //optioneel - enkel voor gestopte groepen
    "publiek-inschrijven": false
}
```

#### `PATCH`

##### Request
Zelfde als `GET` response, maar `links`, `naam`, `nummer` en `groepseigenFuncties` worden genegeerd.

###### Groepseigen gegevens

Geen groepseigenGegevens property meegeven -> er verandert niets

Lege groepseigenGegevens property meegeven -> alle gegevens worden verwijderd


[Lees meer over dynamische velden](dynamische_velden.md)

##### Response
`GET` response.

### */functie*

#### `GET`

Opgelet: imperformante request!

##### Response
Alle functies waar je recht op hebt:
- functies die vasthangen aan groepsoorten waar je recht op hebt
- groepseigen functies van groepen waar je recht op hebt

#### `POST`

##### Request
Je maak een nieuwe groepseigen functie aan. Enkel de velden `beschrijving` en `voor` zijn verplicht. We laten (op dit moment) geen meerdere groepen in het `voor` veld door.

##### Response
Een redirect naar de nieuwe functie of een error.

### */functie?{query-string}*

#### `GET`

Returns alle functies waar de gebruiker recht op heeft die in deze groep kunnen voorkomen.

### */functie/{functieId}*

#### `GET`

"type": "verbond" of "groep"

##### Response
Een verbondsfunctie. Specifieke properties: "code" en "adjunct"

"groepen": lijst van groepen a) waarbij deze functie kan voorkomen en b) waar de ingelogde gebruiker toegang toe heeft

```javascript
{
  "id": "d5f75e23385c5e6e0139493b8546035e",
  "code": "KWL",
  "beschrijving": "Kabouter welpen leider",
  "type":"verbond",
  "groepen":["A3143G", "A3160M"],
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
  ],
  "aangepast": "2015-06-04T08:34:41.823Z"
}
```

Groepseigen functie:

"groepen": groep waartoe deze functie behoort

```javascript
{
  "id": "d5f75e23385c5e6e0139493b8546035e",
  "beschrijving": "Barploeg",
  "type":"groep",
  "groepen":["A3143G"],
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "self",
      "method": "GET"
    }, {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "update",
      "method": "PATCH"
    }, {    
      "href": "https://ga.sgv.be/rest/groep/A3143G",
      "rel": "delete",
      "method": "DELETE"
    },
  ],
  "aangepast": "2015-06-04T08:34:41.823Z"
}
```

#### `PATCH`
##### Request
Update van het `beschrijving` veld. Alle andere velden worden genegeerd.

##### Response
De upgedate functie of een error.

#### `DELETE`

##### Request
Geen body nodig.

##### Response
Een error met een bevestigingslink.

### `/ledenlijst`
#### `GET`
##### Request
2 optionele uri parameters toegelaten:
* `offset`: bij het hoeveelste lid de ledenlijst moet starten (Inclusief startend van 0)
* `aantal`: maximum aantal leden server mag teruggeven.  (de server mag minder teruggeven)

##### Response
Redirect naar nieuwe filter.
```javascript
{
  "aantal": 20, // Aantal leden in huidige response
  "totaal": 1231, //Aantal leden in ledenlijst
  "offset": 0,
  "leden": [
    {
      "id": "d5f75b320b812440010b8127f95f4db4",
      "waarden": ["Baden", true], //voor volgorde zie filter kolommen
      "links":[
        {    
          "href": "https://ga.sgv.be/lid/d5f75b320b812440010b8127f95f4db4?positie=foo", //Merk op extra paramter, de server kan ervoor kiezen om hier een extra parameter mee te geven, om zo prev en next correct te berekenen als lid meerdere keren in de lijst zit.
          "rel": "self",
          "method": "GET"
        },
      ]
    }
  ]
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/ledenlijst?offset=0",
      "rel": "self",
      "method": "GET"
    }, {
      "rel": "next",
      "method": "GET",
      "href": "https://ga.sgv.be/rest/ledenlijst?offset=20",
    }, {    
      "href": "https://ga.sgv.be/rest/filter/huidige",
      "rel": "filter",
      "method": "GET"
    }, 
  ]
}
```


### `/ledenlijst/filter/{filterid}`
#### `GET`

##### Request
Vraag een specifieke filter op met een id.

De speciale `filterid` `huidige` wordt gebruikt om de filter gebruikt door de ledenlijst aan te duiden.

De `huidige` filter moet niet perse een opgeslagen filter zijn.

##### Response
```javascript
{
  "id": "d5f75e23385c5e6e0139493b8546035e",  //Niet aanwezig voor `huidige` filter als niet opgeslagen
  "naam": "Mijn filter", //Niet aanwezig voor `huidige` filter als niet opgeslagen
  "type":"verbond",  // Niet aanwezig voor `huidige` als niet opgeslagen.  Mogelijkheden ['verbond', 'groep', 'lid']
  "groep": "A3143G", // Enkel aanwezig indien type groep
  "kolommen": [
    {
       "type" : "vinkje", // Zie dynamische velden
       "id" : "c81e728d9d4c2f636f067f89cc14862c", // leesbare id voor verbondsvelden
       "label": "tekst veld",
       "beschrijving": "voor hover",
       "van": "groep"
    }, {
       "type" : "tekst", // Zie dynamische velden
       "id" : "persoonsgegevens.voornaam", //pad naar veld in lid json structuur (zie foutmeldingen)
       "label": "Voornaam",
       "beschrijving": "voor hover",
       "van": "verbond"
    }
  ],
  "filter": { // per filtertype een attribuut, mag afwezig zijn als niet belangrijk
    "functies": ["d5f75e23385c5e6e0139493b8546035e"], // Lijst van functieid's
    "leeftijd": {
      "ouderdan": 16, //optioneel
      "jongerdan": 13, //optioneel
      "op31december": true //optioneel false by default
    },
    "geslacht": "jongen", //<> meisje
    "groepen": ["A3143G"],
    "groepseigen": [
      {
        "veld": "c81e728d9d4c2f636f067f89cc14862c", //veld-id
        "waarde": "ok",
        "patroon": true // LIKE pattern optioneel false by default % en _ voor matching
      }
    ]
  },
  "sortering": [  // Moet in aanwezig zijn in de kolommen
    {
      "kolom": "c81e728d9d4c2f636f067f89cc14862c",
      "oplopend": true
    }
  ],
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/ledenlijst/filter/d5f75e23385c5e6e0139493b8546035e",  //Niet aanwezig voor `huidige` filter als niet opgeslagen
      "rel": "self",
      "method": "GET"
    }, {
      "rel": "update", //Enkel aanwezig als je dit type filter mag wijzigen
      "href": "https://ga.sgv.be/rest/ledenlijst/filter/d5f75b320b812440010b8127f95f4db4",
      "method": "PATCH",
      "secties": ["id" /*Enkel bij `huidige`*/, "naam", "groep" /*als type == "groep"*/, "kolommen", "filter", "sortering"]  //"naam" niet zichtbaar voor "huidige"
    }
  ],
  "aangepast": "2015-06-04T08:34:41.823Z"
}
```

#### `PUT`
Om een filter te updaten.

De kolommen mogen een lijst zijn met id's ipv een lijst met objecten.

Dus ipv:
```javascript
  "kolommen": [
    {
       "type" : "vinkje", // Zie dynamische velden
       "id" : "c81e728d9d4c2f636f067f89cc14862c", // leesbare id voor verbondsvelden
       "label": "tekst veld",
       "beschrijving": "voor hover",
       "van": "groep"
    }, {
       "type" : "tekst", // Zie dynamische velden
       "id" : "persoonsgegevens.voornaam", //pad naar veld in lid json structuur (zie foutmeldingen)
       "label": "Voornaam",
       "beschrijving": "voor hover",
       "van": "verbond"
    }
  ]
```
Mag de client ook het volgende opsturen
```javascript
  "kolommen": ["c81e728d9d4c2f636f067f89cc14862c","persoonsgegevens.voornaam"]
```
Voor de objecten zal de server enkel naar de waarden van de `id` velden kijken.


##### Response
zoals `GET` indien succesvol

#### `DELETE`
Om een filter te deleten, `huidige` mag niet ge-deleted worden.

##### Request
Geen body nodig.

##### Response
HTTP 204 zonder body indien toegelaten.


### `/ledenlijst/filter`
#### `GET`

##### Request
Geen body nodig.

##### Response
```javascript
{
  "filters": [ //Enkel opgeslage filters, huidige niet dus.
    {
      "id": "d5f75e23385c5e6e0139493b8546035e",  //Niet aanwezig voor `huidige` filter als niet opgeslagen
      "naam": "Mijn filter", //Niet aanwezig voor `huidige` filter als niet opgeslagen
      "type":"verbond",  // Niet aanwezig voor `huidige` als niet opgeslagen.  Mogelijkheden ['verbond', 'groep', 'lid']
      "groep": "A3143G", // Enkel aanwezig indien type groep
      "links":[
        {    
          "href": "https://ga.sgv.be/rest/ledenlijst/filter/d5f75e23385c5e6e0139493b8546035e",  //Niet aanwezig voor `huidige` filter als niet opgeslagen
          "rel": "self",
          "method": "GET"
        }, {
          "rel": "update", //Enkel aanwezig als je dit type filter mag wijzigen
          "href": "https://ga.sgv.be/rest/ledenlijst/filter/d5f75b320b812440010b8127f95f4db4",
          "method": "PATCH",
          "secties": ["id", "naam", "groep" /*als type == "groep"*/, "kolommen", "filter", "sortering"]  //"naam" niet zichtbaar voor "huidige"
        }
      ]
    }
  ],
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/ledenlijst/filter",
      "rel": "self",
      "method": "GET"
    }, {
      "rel": "create",
      "href": "https://ga.sgv.be/rest/ledenlijst/filter",
      "method": "POST",
    }, {    
      "href": "https://ga.sgv.be/rest/ledenlijst/filter/huidige",
      "rel": "current",
      "method": "GET"
    }, 
  ]
}
```

#### `POST`
##### Request
Alle secties behalve `links` en `id`

##### Response
Redirect naar nieuwe filter.

### `/ledenlijst/kolom-type`
#### `GET`
//Een lijst met alle toegelaten kolommen van een filter, exact zoals de kolomtypes zelf weergegeven

##### Request
Geen body nodig.

##### Response
```javascript 
{
  "kolommen": [
    {
       "type" : "vinkje", // Zie dynamische velden
       "id" : "c81e728d9d4c2f636f067f89cc14862c", // leesbare id voor verbondsvelden
       "label": "tekst veld",
       "beschrijving": "voor hover",
       "van": "groep"
    }, {
       "type" : "tekst", // Zie dynamische velden
       "id" : "persoonsgegevens.voornaam", //pad naar veld in lid json structuur (zie foutmeldingen)
       "label": "Voornaam",
       "beschrijving": "voor hover",
       "van": "verbond"
    },
    ...
  ],
  "links":[
    {    
      "href": "https://ga.sgv.be/rest/ledenlijst/kolom-type",
      "rel": "self",
      "method": "GET"
    } 
  ]
}
```

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
  ],
  "aangepast": "2015-06-04T08:34:41.823Z"
}
```


## Meer lezen

* [PayPal REST API](https://developer.paypal.com/webapps/developer/docs/api/) veel gespiekt hier
* [HATEOAS](http://timelessrepo.com/haters-gonna-hateoas)
* [HAL](http://blog.stateless.co/post/13296666138/json-linking-with-hal) (formele spec van een hateos manier)
* [json schema](http://json-schema.org/examples.html) (Beschrijving voor ongekende velden)
* [Jersey, jax-rs en etag caching](https://devcenter.heroku.com/articles/jax-rs-http-caching)

# Dynamische velden

Op verschilende plaatsen van de groepsadministratie gebruiken we formulieren
waarvan de velden door een andere gebruiker gedefinieerd zijn.  Dit is
bijvoorbeeld het geval met de persoonseigen gegevens of de groepseigen velden.

Dit houdt in dat de server niet alleen de waardes moet doorsturen, maar ook
de eigenschappen en hoe ze gestructureerd en weergegeven moeten worden.

We kiezen ervoor om de waarden en de structuur los te koppelen.
Dit omdat ze een ander gedrag hebben.  De waarden zijn door andere momenten en
door andere partijen te wijzigen dan de structuur.

Hieronder een voorbeeld bij een GET op een lid. Bij een GET op een groep wordt enkel het schema getoond.
```json
{
   "waarden" : {
      "c4ca4238a0b923820dcc509a6f75849b" : true,
      "c81e728d9d4c2f636f067f89cc14862c" : "Beetje tekst",
      "eccbc87e4b5ce2fe28308fd9f2a7baf3" : "5bd15ca24cee57242a9b28b79481da6d"
      ...
   },
   "schema" : [
      {
         "type" : "vinkje",
         "label" : "Een vinkje",
         "beschrijving" : "Dit is een vinkje dat je <strong>aan</strong> of uit mag klikken",
         "meer-info" : "<i>NOG</i> meer info",
         "id" : "c4ca4238a0b923820dcc509a6f75849b"
      },
      {
         "type" : "groep",
         "label" : "titel/label van de groep",
         "beschrijving" : "Al deze velden horen bij elkaar",
         "velden" : [
            {
               "type" : "tekst",
               "id" : "c81e728d9d4c2f636f067f89cc14862c",
               "label": "tekst veld"
            },
            {
                "type" : "keuze",
                "id": "eccbc87e4b5ce2fe28308fd9f2a7baf3",
                "label": "keuze veld",
                "keuzes": [
                    {
                        "id": "5bd15ca24cee57242a9b28b79481da6d",
                        "label": "Een keuze"   
                    }, ...
                ]
            }
            , ...
         ]
      }
      , ...
   ]
}
```

## Hoe zit het ineen?

Op het eerste niveau wordt er altijd de scheiding gemaakt tussen de waarden en het schema.

### De waarden

De waarden is een zeer simpel die voor elk input-veld zijn id bevat en de corresponderende waarde.
Dit is ook de structuur die terug naar de server geduwd wordt wanneer het veld wordt ingevuld.

### Het Schema

Het schema bepaald de structuur en het type van de velden.
Er zijn twee soorten velden: input-velden en structuur-velden.
Het schema is ook de structuur die gebruikt wordt door de formulieren die de dynamische velden definieren.

#### Input-velden

Een input veld is gebonden aan een mogelijke input die in de waarden structuur terug te vinden is.

We definieren de volgende types input-velden:

  * `tekst`: Een tekst veld
  * `vinkje`: Een vinkje (waarde `true` of `false`)
  * `keuze`: Een keuze veld, de mogelijkheden vind je terug in de `keuzes` 
    array.  Die voor elke keuze een `id` en een `label` bevatten (beiden 
    _verplicht_)
  * `email`: Een e-mail veld

De volgende attributen zijn gedefinieerd op input-velden:

  * `id`: _verplicht_
  * `label`: korte tekst die het veld definieert _verplicht_
  * `beschrijving`: langere tekst altijd weergegeven in de buurt van het veld 
     kan een subset van html bevatten _optioneel_
  * `meer-info`: Nog meer info over dit veld.  Kan html bevatten en getoond worden als een link die uit kan klappen of een hover tooltip. _optioneel_
  * `alleen-lezen`: Of een veld gewijzigd mag worden door de gebruiker. 
  _optioneel default false_

#### Structuur-velden

De structuur velden zorgen dat de input-velden gestructureerd kunnen worden.

  * `groep` groepeert een aantal velden.  Het kan de volgende attributen 
    bevatten:
    * `label`: De titel/korte tekst voor de groep _optioneel_
    * `beschrijving`: Een langere tekst over de velden in de groep.  kan ook 
    html bevatten zoals bij input-velden _optioneel_
    * `velden`: Een array met de velden van de groep.  Deze kunnen op zich
    terug van het type groep zijn! _verplicht_

# Opmerkingen
  * Tijdens de implementatie kunnen er natuurlijk nog velden toegevoegd worden zoals een datum veld, beperkingen op lengte van tekst, een paragraaf met gewoon tekst, een horizontale lijn, ...

  

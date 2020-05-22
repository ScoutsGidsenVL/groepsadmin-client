# Groepsadmin front-end

Dit is een front-end voor de nieuwe groepsadministratie van [Scouts en Gidsen Vlaanderen](https://www.scoutsengidsenvlaanderen.be/).

Je kan deze front-end op twee manieren gebruiken:

* Ofwel gebruik je de [Groepsadministratie](https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/). Je krijgt deze front-end daar te zien, na het inloggen.
* Ofwel draai je deze front-end op je eigen computer (localhost), zodat je zelf aanpassingen kan doen.

Zie ook de [handleiding](https://wiki.scoutsengidsenvlaanderen.be/doku.php?id=handleidingen:groepsadmin:nieuwe_versie_testen) over het testen van de groepsadministratie.

## Zelf opzetten in localhost

1. Installeer [Git](https://git-scm.com/).
1. Voer `git clone https://github.com/ScoutsGidsenVL/groepsadmin-client` uit.
1. Installeer [NPM en Bower](#npm-en-bower)
1. Voer [`grunt serve`](#grunt-serve) uit.
1. Er is een lokale proxy ingesteld die de routing naar de API beheert. Indien nodig kan je de host van de api aanpasen in gruntfile.js in de sectie connect-->proxies

1. Open <http://localhost:8000> in je browser.

### Gaat er iets mis?

Open steeds de browser-console (`F12`) om te zien wat er mis gaat.

**Zie je 'connection refused' in de foutmeldingen?**

* Er draait bij jou waarschijnlijk geen kopie van de _back_-end op [http://localhost:**8080**](http://localhost:8080). ;-)
* Open `app/services/rest-service.js` in een editor.
* Stel rond regel 12 `apiHost` in op 'groepsadmin-develop' (en zet de oorspronkelijke lijn in commentaar).
* Laad <http://localhost:8000> opnieuw in je browser.

**Zie je bij sommige URLs foutmeldingen over een onveilige verbinding?**

* Open één van deze URLs en voeg hiervoor een uitzondering toe.
* Je krijgt nu `401 Unauthorized`, maar dat is ok.
* Laad <http://localhost:8000> opnieuw in je browser.

**Is er iets mis met je token?**

* Open [logintest.html](http://localhost:8000/logintest.html) om te zien welk token je krijgt.
* Open [apitest.html](http://localhost:8000/apitest.html) om te zien wat er in je token staat.

**Wil je de `$scope` van angular debuggen**

Geef in de browser-console bvb. `angular.element(document.getElementById('_email')).scope().lid.contacten[0]` in om het eerste contact op te vragen op de profielpagina.

**Gaat er nog iets anders mis?**

Stuur een e-mail naar [informatica@scoutsengidsenvlaanderen.be](email:informatica@scoutsengidsenvlaanderen.be).

## Wireframes

[Wireframes voor het inloggen en de nieuwe groepsadmin](https://xd.adobe.com/view/f7e66441-128f-4885-aecd-ef33ba1f869e/)

## API

De [documentatie](https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/docs/api.html) van de REST-API staat mee online. Deze documentatie is aangemaakt met [Aglio](#aglio-optioneel).

Het is altijd fijn als de documentatie wordt aangevuld of gecorrigeerd waar nodig. In het bestand api.apib kan je aanpassingen doen m.b.t. de documentatie van de API.

### Lidaanvraag formulier

Het formulier om een nieuwe lidaanvraag te versturen kan je openen via http://localhost:8000/formulier.html#/lidworden?groep=[groepsnummer]

### Testen

Gebruik bij het testen steeds de test-versie van de groepsadministratie. De URLs van test-versie beginnen met `https://`**`ga-develop`**`.scoutsengidsenvlaanderen.be/`. De aanpassingen via deze URLs hebben geen effect op de gegevens in de gewone groepsadministratie. E-mails worden ***wel*** verstuurd.

Op `/groepsadmin/client/apitest.html` kan je API calls doen, waarbij het access/keycloak token wordt meegegeven in de header `Authorization`.

* Ofwel open je lokaal [apitest.html](http://localhost:8000/apitest.html) in je browser, zoals hierboven.
* Ofwel open [apitest.html](https://groepsadmin-develop.scoutsengidsenvlaanderen.net/groepsadmin/client/apitest.html) je op de test-versie van de groepsadmin.

Velden:

* Url: de volledige url, bijvoorbeeld `https://groepsadmin-develop.scoutsengidsenvlaanderen.net/groepsadmin/rest-ga/lid/profiel`
* Client id: Een id van een client die ingesteld is in keycloak. In deze client is ingesteld in keycloak bepaalt of de url van de huidige pagina toegelaten is.
  * `groepsadmin-localhost-8000-client` voor [localhost:8000](http://localhost:8000)
  * `groepsadmin-dev-tvl-client` voor [groepsadmin-dev-tvl](https://groepsadmin-dev-tvl.scoutsengidsenvlaanderen.be)
  * `groepsadmin-staging-client` voor [groepsadmin-develop](https://groepsadmin-develop.scoutsengidsenvlaanderen.net)
* Accept: Dit stelt de header `Accept` in. Dit geeft aan welke content-types jij aanvaardt.
* Content-Type: (Enkel bij POST en PATCH) Dit stelt de header `Content-Type` in. Dit is het content-type van de body in je request.
* Body: (Enkel bij POST en PATCH) De inhoud van je request

## Technisch

De nieuwe Groepsadmin is een AngularJS webapp die communiceert met een REST-API.

Voor de front-end worden volgende technologieën gebruikt:

1. [NPM](#npm-en-bower)
2. [Bower](#npm-en-bower)
3. [Grunt](#grunt)
4. [Twitter Bootstrap](#twitter-bootstrap)
5. [LiveReload](#livereload-optioneel)
5. [Aglio](#aglio-optioneel)
6. [AngularJS](#angularjs)

### NPM

[NPM](https://nodejs.org/) (node package manager) beheert de packages die NodeJS gebruikt. Bijvoorbeeld voor het compileren van LESS naar CSS gebruiken we de package 'grunt-contrib-less', voor het versiebeheer van de libraries gebruiken we de package 'bower' (angularJS, bootstrap, JQuery, keyCloak, lodash enz.), voor  het injecteren van de nodige scripts in de index.html 'grunt-wiredep'.

Als er nieuwe libraries of dependencies worden toegevoegd aan het project, doen we dit steeds met 'npm install ...' of 'bower install ...'. Op die manier worden ze mooi verzameld in de file 'package.json' en/of 'bower.json' en kunnen we alles gemakkelijker up to date houden alsook conflicten vermijden met verouderde versies van (een) bepaalde librarie(s).

* Installeer eerst NodeJS, dit is een platform dat ons toelaat het Groepsadmin-project gemakkelijker te beheren en een aantal taken te automatiseren. NodeJS heeft NPM voorgeïnstalleerd. Heb je al een versie van node en/of npm dan doe je er vast goed aan alles een keer te updaten. In Windows dien je de 'omgevingsvariabelen' nog correct in te stellen. Hier vind je een tutorial hoe dat moet: https://www.computerhope.com/issues/ch000549.htm
* Installeer Bower en Grunt via NPM: bvb.`npm install -g bower` als administrator/root (zie `package.json`)
  * Alternatief zonder extra rechten: bvb. `npm install bower`
  * Mogelijk krijg je foutmeldingen over de installatie van *protagonist*, deze meldingen mag je negeren.
* Gebruik dan Bower om de benodigde libraries te installeren: `bower install` (zie `bower.json`)

### Bower

[Bower](https://bower.io/) Is een package manager, alle dependencies die je met 'bower install' installeert staan genoteerd in 'bower.json'.
LET OP: de volgorde van de dependencies in deze file is belangrijk, want ze worden ook in deze volgorde geïnjecteerd in index.html.  

### Grunt

[Grunt](http://gruntjs.com) is een task runner die helpt om onze workflow te automatiseren.

[Introductie tot Grunt](http://24ways.org/2013/grunt-is-not-weird-and-hard)

Grunt moet local worden gerund en niet global.

```{r, engine='bash', count_lines}
$ node_modules/.bin/grunt serve
```

In de Gruntfile zijn momenteel 3 taken gedefiniëerd:

#### `grunt watch`

* Compiled automatisch LESS files naar CSS
* Genereert een Source Map (geeft de juiste filenaam en lijnnummer voor het debuggen van CSS/LESS)
* (maakt het eenvoudiger om LESS te debuggen)

#### `grunt build`

Creëert een build map met alle files geoptimaliseerd (minify, concat, ..), klaar voor production. (Todo)

#### `grunt serve`

Start een statische webserver.

De `watch` task is opgenomen in `grunt serve`, deze hoef je dus niet nog eens apart te draaien.

#### `grunt less`

Compileert de less bestanden tot één css bestand met bijhorende source map.

De `less` task is opgenomen in `grunt watch`.

### Twitter Bootstrap

Als CSS framework gebruiken we [Twitter Bootstrap](http://getbootstrap.com) (momenteel v3.1.1). De CSS/JavaScript componenten vormen een goede basis en worden aangepast/uitgebreid waar nodig.

Indien bestaande styles overriden te omslachtig is, kan je deze blokken uitschakelen door ze in comments te zetten. Verwijder nooit de Bootstrap code. Mocht je bestaande code in aanpassen, plaats er `ga-adjustment` bij. Dit maakt het eenvoudiger om later nog up te daten.

Maar probeer dit te vermijden. Beter is om Bootstrap te overriden. Bestaande classes overschrijven en styles specifiek voor de Groepsadmin schrijven we in files met een `ga` prefix.

Wil je bijvoorbeeld classes uit *forms.less* overriden, doe dit dan in een file *ga-forms.less*.

Zo kunnen Bootstrap en Groepsadmin styles makkelijk van elkaar onderscheiden worden.

Aangezien we verder bouwen op Bootstrap is het logisch om dezelfde CSS-property volgorde te gebruiken.
Meer info over de property order:

* <http://codeguide.co/#css-declaration-order>
* <http://markdotto.com/2011/11/29/css-property-order>

### LiveReload (optioneel)

[LiveReload](http://livereload.com) monitort wijzigingen in de bronbestanden. Zodra een aanpassing in een bestand wordt opgeslagen (en Grunt klaar is met CSS/JavaScript compilen), wordt het browservenster automatisch geüpdatet.

### Aglio (optioneel)

[Aglio](https://github.com/danielgtaylor/aglio/blob/master/README.md) is een tool om de documentatie van de REST-API om te zetten van APIB naar HTML:

`node_modules/.bin/aglio --theme-condense-nav=false --theme-style default --theme-style docs/custom.less -i docs/api.apib -o docs/api.html`

### AngularJS

[AngularJS](http://angularjs.org) is een MVC javascript-framework. Het laat ons toe om makkelijk een single-page webapp te bouwen die volledig op de client side draait.

Alle Angular functionaliteit zit in de namespace `ng`, om niet in het vaarwater te komen van (toekomstige) HTML5 syntax.

We kunnen zelf ook directives (custom HTML elementen) schrijven, dit doen we in onze eigen namespace ‘ga’. Zo vermijden we conflicten met Angular of HTML5 elementen.

Bijvoorbeeld `ga-lid="{{lid.id}}"` creëert een EventListener om de pagina van dat lid te laden.

[Cursus AngularJS](http://angular.codeschool.com)

#### Dependencies

##### UI Bootstrap - v1.3.2

In deze client word er voor sommige onderdelen gebruikgemaakt [UI Bootstrap](https://angular-ui.github.io/bootstrap/), components die speciaal voor AngularJS geschreven zijn.

Onderdelen die included zijn in de custom build voor deze applicatie:

* Collapse
* Alert
* Dataparser
* Dropdown
* Typeahead

##### jQuery UI - v1.10.4

[jQueryUI](https://jqueryui.com)

* Collapse
* jquery.ui.core.js
* jquery.ui.widget.js
* jquery.ui.mouse.js
* jquery.ui.draggable.js
* jquery.ui.droppable.js
* jquery.ui.resizable.js
* jquery.ui.selectable.js
* jquery.ui.sortable.js

##### ngInfiniteScroll - v1.0.0

[ngInfiniteScroll](https://sroze.github.io/ngInfiniteScroll)

#### ng-inspector (optioneel)

[ng-inspector](http://ng-inspector.org) is een een debug panel voor AngularJS.

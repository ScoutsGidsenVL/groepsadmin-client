# Groepsadmin front-end documentatie

De nieuwe Groepsadmin wordt een AngularJS webapp die communiceert met een [REST webservice](https://github.com/ScoutsGidsenVL/groepsadmin-client/blob/master/docs/api.md). Voor de front-end worden volgende technologieën gebruikt.

1. [Twitter Bootstrap](#twitter-bootstrap)
2. [Grunt](#grunt)
3. [LiveReload (optioneel)](#livereload-optioneel)
4. [AngularJS](#angularjs)



## Twitter Bootstrap

<http://getbootstrap.com>

Als CSS framework gebruiken we Twitter Bootstrap (momenteel v3.1.1). De CSS/JavaScript componenten vormen een goede basis en worden aangepast/uitgebreid waar nodig.

Indien bestaande styles overriden te omslachtig is, kan je deze blokken uitschakelen door ze in comments te zetten. Verwijder nooit de Bootstrap code. Mocht je bestaande code in aanpassen, plaats er `ga-adjustment` bij. Dit maakt het eenvoudiger om later nog up te daten.

Maar probeer dit te vermijden. Beter is om Bootstrap te overriden. Bestaande classes overschrijven en styles specifiek voor de Groepsadmin schrijven we in files met een `ga` prefix.

Wil je bijvoorbeeld classes uit *forms.less* overriden, doe dit dan in een file *ga-forms.less*.

Zo kunnen Bootstrap en Groepsadmin styles makkelijk van elkaar onderscheiden worden.

Aangezien we verder bouwen op Bootstrap is het logisch om dezelfde CSS-property volgorde te gebruiken.
Meer info over de property order:

* <http://codeguide.co/#css-declaration-order>
* <http://markdotto.com/2011/11/29/css-property-order>



## NPM en Bower

<https://nodejs.org/>
<http://bower.io/>

Bower wordt gebruikt om dependencies te beheren.

Installeer Bower via npm: `npm install -g bower`

Gebruik dan Bower om onze dependencies (Keycloak) te installeren: `bower install`



## Grunt

<http://gruntjs.com>

Grunt is een task runner die helpt om onze workflow te automatiseren.
Introductie tot Grunt: <http://24ways.org/2013/grunt-is-not-weird-and-hard>

In de Gruntfile zijn momenteel 3 taken gedefiniëerd:


### `grunt watch`

* Compiled automatisch LESS files naar CSS
* Genereert een Source Map (geeft de juiste filenaam en lijnnummer voor het debuggen van CSS/LESS)
* (maakt het eenvoudiger om LESS te debuggen)


### `grunt build`

Creëert een build map met alle files geoptimaliseerd (minify, concat, ..), klaar voor production. (Todo)


### `grunt serve`

Start een statische webserver.

De `watch` task is opgenomen in `grunt serve`, deze hoef je dus niet nog eens apart te draaien.

### `grunt less`

Compileert de less bestanden tot één css bestand met bijhorende source map.

De `less` task is opgenomen in `grunt watch`.



## LiveReload (optioneel)

<http://livereload.com>

LiveReload monitort wijzigingen in de bronbestanden. Zodra een aanpassing in een bestand wordt opgeslagen (en Grunt klaar is met CSS/JavaScript compilen), wordt het browservenster automatisch geüpdatet.



## AngularJS

<http://angularjs.org>

AngularJS is een MVC framework. Het laat ons toe om makkelijk een single-page webapp te bouwen die volledig op de client side draait.

Alle Angular functionaliteit zit in de namespace `ng`, om niet in het vaarwater te komen van (toekomstige) HTML5 syntax.

We kunnen zelf ook directives (custom HTML elementen) schrijven, dit doen we in onze eigen namespace ‘ga’. Zo vermijden we conflicten met Angular of HTML5 elementen.

Bijvoorbeeld `ga-lid="{{lid.id}}"` creëert een EventListener om de pagina van dat lid te laden.

Cursus AngularJS: <http://angular.codeschool.com>

### Dependencies
#### UI Bootstrap - v1.3.2

<https://angular-ui.github.io/bootstrap/>

In deze client word er voor sommige ondendelen gebruikgemaakt van Bootstrap components die speciaal voor AngularJS geschreven zijn.
Onderdelen die included zijn in de custom build voor deze applicatie:
* Collapse
* Alert
* Dataparser
* Dropdown
* Typeahead

#### jQuery UI - v1.10.4

<https://jqueryui.com/>

* Collapse
* jquery.ui.core.js
* jquery.ui.widget.js
* jquery.ui.mouse.js
* jquery.ui.draggable.js
* jquery.ui.droppable.js
* jquery.ui.resizable.js
* jquery.ui.selectable.js 
* jquery.ui.sortable.js

#### ng-infinite-scroll - v1.0.0

<https://sroze.github.io/ngInfiniteScroll/index.html>

### ng-inspector (optioneel)

<http://ng-inspector.org>

Een debug panel voor AngularJS.

# Multiselect
With this script you can add the following extensions to an existing Splunk mulitselect inputfield.

### import and init:
```javascript
    require(['/static/app/ConsistSplunkToolbox/extensions/mulitselect/multiselect.js'], function(Multiselect) {
        var Multiselect = new Multiselect('nameOfInput');
    });
```

___
## smartDefaultValue
removes default value if user selects an entry
and removes all entries if user selects the default value from dropdown list

Important: To use this feature you should configure a default-value in simpleXML

### use:
```javascript
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.smartDefaultValue();
    });
```

___
## applyCopyToClipboard
Adds a button above the multiselect box, that allows user to copy current selection to clipboard to use in another editor etc.

### use:
```js
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.applyCopyToClipboard();
    });
```
___
## pastable
user can paste a list of values to multiselect box
(tied to Wagennummer at the momnt...)

### use:
```js
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.applyCopyToClipboard();
    });
```

___
## refreshable
Adds a button above multiselect box, that allows user to refresh current selection to default value
Important: To use this feature you should configure a default-value in simpleXML

### use:
```javascript
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.refreshable();
    });
```

___
## sortable
user can sort entries by drag and drop to a specific order. 
Not neccessary for filterfields, but maybe useful if the multifield is used for another porpose (tableColumnchooser)

WARNING: Works only with fixed choices, not with a search

### use:
```javascript
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.sortable();
    });
```
___
## livesearch
Wenn das Suchergebnis für die Multiselect Box eine sehr große Ergebnismenge hat, kann dies mit der Livesuche eingeschränkt werden.
Es werden zunächst nur die ersten 10 Treffer angezeigt und kann mit der Eingabe eine Suchbergriffs weiter spezifiert werden.
Die Subsuche für die Inputfelder greift auf die Felder fieldForValue und fieldForLabel im SimpleXML zu. In diesen Feldern sollte das Ergebnis der Subsuche stehen.

### parameters:

| parameter           | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `count`             | number             | true     | number of result, default = 10        |

### use:
```javascript
    require(['/static/app/ConsistSplunkToolbox/extensions/multiselect/multiselect.js'], function(Multiselect) {
        var multiselect = new Multiselect('nameOfInput');
        multiselect.livesearch();
    });
```

input field in simpleXML can be configured as usual, except that the search has get an id and has to be initialized outside of the inputfield. 
```xml
    <search id="countrySearch">
        <query>
          | inputlookup countryList.csv | search $region$ | rename "alpha-2" as alpha2 | fields name alpha2
        </query>
      </search>
      <input id="country" type="multiselect" token="country" searchWhenChanged="true">
        <label>Land</label>
        <fieldForValue>alpha2</fieldForValue>
        <fieldForLabel>name</fieldForLabel>
        <prefix>(</prefix>
        <suffix>)</suffix>
        <valuePrefix>alpha2="</valuePrefix>
        <valueSuffix>"</valueSuffix>
        <delimiter> OR </delimiter>
        <choice value="*">Alle</choice>
        <default>*</default>
      </input>
```
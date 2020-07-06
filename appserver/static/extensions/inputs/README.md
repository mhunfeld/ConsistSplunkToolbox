# input
With this script you can add the following extensions to an existing Splunk mulitselect inputfield.

### import and init:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
    });
```

___
## smartDefaultValue
removes default value if user selects an entry
and removes all entries if user selects the default value from dropdown list

Important: To use this feature you should configure a default-value in simpleXML

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.smartDefaultValue();
    });
```

___
## applyCopyToClipboard
Adds a button above the multiselect box, that allows user to copy current selection to clipboard to use in another editor etc.

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.applyCopyToClipboard();
    });
```
___
## pastable
user can paste a list of values to multiselect box
(tied to Wagennummer at the momnt...)

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.applyCopyToClipboard();
    });
```

___
## refreshable
Adds a button above multiselect box, that allows user to refresh current selection to default value
Important: To use this feature you should configure a default-value in simpleXML

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.refreshable();
    });
```

___
## sortable
user can sort entries by drag and drop to a specific order. 
Not neccessary for filterfields, but maybe useful if the multifield is used for another porpose (tableColumnchooser)

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.sortable();
    });
```

___

## addReplaceableSearchCommand
setzt den übergebenen Wert in übergebene Token, wenn kein Defaultwert in der Inputbox ausgewählt ist.
Wird z. B. genutzt, um einen Suchstring dynamisch aufzubauen, falls eine Suche durch zu viele Filter einen zu großen Umfang hat (und lange dauert)
Beispiel: ein Filter sucht nach "Gattung", Gattung wird jedoch nur zum Resultset hinzugefügt, damit dieser Filter funktioniert.
In diesem Fall wird (latest(Gattung)) nur zum Suchstring hinzugefügt, falls auch ein Wert im Filter enthalten ist (!= defaultwert)

### parameters:

| parameter           | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `searchcommand`     | string             | false    | ID of the base search |
| `tokenname`         | strings            | false    | if the multivalue field should limit its results to selected value of another field |

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.addReplaceableSearchCommand('searchcommand', 'tokenname');
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
| `baseSearch`        | string             | false    | ID of the base search                 |
| `count`             | number             | true     | number of result, default = 10        |

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/input/input.js'], function(Input) {
        var input = new Input('nameOfInput');
        input.livesearch({
            baseSearch: 'baseSearch'
        });
    });
```
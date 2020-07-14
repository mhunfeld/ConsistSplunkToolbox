# Range Slider

Mit dem Range Slider können einfache Werte in einem bestimmte Bereich (Range) abgefragt werden. Der Range Slider kann auch für relative Zeitangeben (letzte 24 h etc.) verwendet werden. Der Range Slider wurde als SimpleSplunkView implementiert und wird deshalb in Javascript initialisiert. Allerdings wurde das bekannte Verhalten von Inputs aus SimpleXML implementiert, sodass die Konfiguration ähnlich zu Inputs in SimpleXML läuft.

Folgende Eigenschaften aus SimpleXML wurden übertragen:
- Theming in dark mode / light mode
- es kann ein Token mit dem ausgewählten Wert belegt werden
- dieser wird je nach Konfiguration des Dashbaord (Standard Splunk Verhalten) in das default, submitted und/oder url Tokenmodel übertragen
- auch der form.token wird gesetzt
- es können prefixes und suffixes bestimmt werden, sodass der Token direkt in Suchen weiterverwendet werden kann.


## Konfiguration: 


https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_baseview.html
https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_simplesplunk.html 


zusätzlich wurden weitere Optionen hinzugefügt:

| parameter           | type               | optional | default             | description                           |
| ---------           | -------------------| ---------| --------------------| --------------------------------------|
| `label`             | string             | true     | -                   | label for this input                  |
| `token`             | string             | true     | -                   | name of token for this input          |
| `default`           | number             | true     | -                   | default value of slider               |
| `prefix`            | any                | true     | -                   | prefix for token                      |
| `suffix`            | any                | true     | -                   | suffix for token                      |
| `theme`             | string             | true     | actual theme of dashboard | theme of slider dark or light   |
| `min`               | number             | true     | 0                   | minimum of slider range               |
| `max`               | number             | true     | 100                 | maximum of slider range               |
| `step`              | number             | true     | 10                  | step of range                         |
| `value`             | number             | true     | current value       | current value                         |
| `labelPrefix`       | any                | true     | -                   | prefix for label (only for view)      |
| `labelSuffix`       | any                | true     | -                   | suffix for label (only for view)      |


## use: 

```javascript
    require([
        '/static/app/ConsistSplunkToolbox/components/range-slider/rangeSlider.js',
        'splunkjs/mvc/simplexml/ready!'
    ], function( 
        RangeSlider
    ){
        var testSlider = new RangeSlider({
            label: 'Slider as Backbone View',
            min: 0,
            max: 96,
            defaultValue: 24,
            step:   12,
            id: 'my-range-slider',
            token: 'slider_tok',
            prefix: '-@',
            suffix: '$timeUnit$',
            labelPrefix: 'letzte ',
            labelSuffix: '$labelSuffix$'
        }, {tokens: true});

        //ANMERKUNG: Hier können Tokens, wie in SimpleXML mit $$ verwendet werden. Diese aktualisieren sich auch automatisch, wenn sich der Wert ändert.

        //Rendern des Sliders
        testSlider.render();
        //und angewünschter Stelle im HTML-Dom einhängen    
        $('#customFieldset .fieldset').append(testSlider.el);

    });
```

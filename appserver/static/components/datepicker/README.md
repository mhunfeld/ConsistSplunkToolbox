# Datepicker

Mit dem Datepicker kann schnell ein Datum ausgewählt und in Tokens weiterverwendet werden (Forms/Suchen). Der Datepicker kann für die Auswahl eines einzelnen Datum oder einer Zeitspanne (von/bis) konfiguriert werden. 

Der Datepicker nutzt im Hintergrund eine vorgefertigte Komponente: http://www.daterangepicker.com/ Die Datepicker-Komponente kann sehr spezifisch konfiguriert werden. Aktuell werden nur einfache Features zur Auswahl eines Datums und einer Zeitspanne unterstützt. In Zukunft können jedoch weitere Optionen aktiviert werdne.
Der Datepicker wurde als SimpleSplunkView implementiert und wird deshalb in Javascript initialisiert. Allerdings wurde das bekannte Verhalten von Inputs aus SimpleXML implementiert, sodass die Konfiguration ähnlich zu Inputs in SimpleXML läuft.

Folgende Eigenschaften aus SimpleXML wurden übertragen:
- Theming in dark mode / light mode
- es kann ein Token mit dem ausgewählten Wert belegt werden, bei Auswahl einer Range wird earliest und latest im Token als epoch timestamp gesetzt.
- dieser wird je nach Konfiguration des Dashbaord (Standard Splunk Verhalten) in das default, submitted und/oder url Tokenmodel übertragen
- auch der form.token wird gesetzt


## Konfiguration: 


https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_baseview.html
https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_simplesplunk.html 


zusätzlich wurden weitere Optionen hinzugefügt:

| parameter           | type               | optional | default             | description                           |
| ---------           | -------------------| ---------| --------------------| --------------------------------------|
| `label`             | string             | true     | -                   | label for this input                  |
| `token`             | string             | true     | -                   | name of token for this input          |



## use: 

```javascript
   require([
    'underscore',
    'jquery',
    '/static/app/ConsistSplunkToolbox/components/datepicker/datepicker.js',
    '/static/app/ConsistSplunkToolbox/utils/showtokens.js',
    'splunkjs/mvc/simplexml/ready!'
], function( 
        _,
        $,
        Datepicker
    ){

        /*base config as single date*/
        var singelDatepicker = new Datepicker({
            id: 'customSingleDatepicker',
            token: 'customdate_tok',
            default: 'now'
        });
        

        singelDatepicker.render();

        $('#customSingleDatepicker').append(singelDatepicker.el);

        /* base config as date range picker*/ 
        var rangeDatepicker = new Datepicker({
            id: 'customRangeDatepicker',
            token: 'customrangedate_tok',
            asRange: true
        });
        

        rangeDatepicker.render();

        $('#customRangeDatepicker').append(rangeDatepicker.el);



    });
```

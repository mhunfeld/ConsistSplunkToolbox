# Popovers
Popovers basieren eigentlich auf Bootstrap Popovers und können in Splunk Out Of The Box genutzt werden. In diesem Script sind nur einige Helferlein, die die Verwendung von Popups in SimpleXML erleichtern sollen.

### import and init:
```javascript
    require([
        '/static/app/ConsistSplunkToolbox/components/popovers/popovers.js'
    ], function(Popovers) {
        ...
    });
```

### erstellen eines Popovers in SimpleXML/HTML:

```xml
    <a href="#" title="See What I Did There?" data-placement="right" data-toggle="popover" data-trigger="click" 
          data-content="hier ist der Inhalt der Popovers">
            <h2>Popover on Click</h2>
            <li class="icon-info-circle"></li>
          </a>
```
| html-Attribute            | description             |
| ---------                 | -------------------|
| `data-toggle="popover"`   | anhand dieses Selektors wird in initAll ein Popover initialisiert              |
| title| Überschrift im Popover |
|data-content| Inhalt des Popovers|
| data-placement| Ausrichtung des Popovers|
| data-trigger| Auslöser des Popvers: click / hover / focus / manual|

witere Attribute sind in der Doku von Boostrap zu finden: https://getbootstrap.com/docs/4.0/components/popovers/

___
## initAll
Alle Popovers innerhalb eines bestimmten Bereichs inititalisieren.
Es werden alle Elemente mit dem Attribute "data-toggle="popover" gesucht und initialisiert. 

Soll nur in einem Teilbereich nach dem Attribute gesucht weren, kann als erster Parameter ein JQuery Selector übergeben werden.

Wenn es viele Popovers mit den gleichen Optionen gibt, kann als 2. Parameter ein Objekt für die Konfiguration der Popovers übergeben werden (Parameter siehe Bootstrap-Doku). 

### Aufruf:
```javascript
    //alle Elemente mit data-toggle="popover" werden mit den angegebenen HTML-Attributen initialisiert
    popover.initAll();


    //alle Elemente unterhalb "panel_1" werden mit den angegebenen HTML-Attributen initialisiert
    popover.initAll('#panel_1');

    //alle Elemente mit den übergebenen Optionen konfiguriert
    //die restlichen Parameter können nach wie vor aus dem HTML übernommen werden (z. B. title und content)
    popover.initAll('', {
        data-placement: 'bottom'
    });
```

___

## initInTableCellRenderer
Popovers in Tabellen müssen jeweils nach dem Rendern initialisiert werden. Mit dier Funktion wird eine Initialiseirung bei jedem "on rendered" Event einer Tabelle ausgeführt.

Als Parameter wird die ID der Splunk Tabelle und ein optionales Options-Objekt übergeben.

### Aufruf:
```javascript
    //da popovers in tabellen erst nach dem rendern initialisiert werden können, 
    //müssen wir eine gesonderte Funktion aufrufen, die bei jedem Rendern der Tabelle aufgerufen wird
    popovers.initInTableCellRenderer('table');

    //alle Elemente mit den übergebenen Optionen konfiguriert
    //die restlichen Parameter können nach wie vor aus dem HTML übernommen werden (z. B. title und content)
    popover.initInTableCellRenderer('table', {
        data-placement: 'bottom'
    });
```

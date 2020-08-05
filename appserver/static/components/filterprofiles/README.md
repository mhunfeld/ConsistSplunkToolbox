## Filterprofile

Mit der Filterprofil-Komponente kann der Anwender häufig verwendete Filter-Voreinstellungen unter einem Namen abspeichern und bei Bedarf wieder auswählen. Ein Profil kann zudem als Default-Profil gespeichert werden. Das Default-Profil wird beim Aufruf der Seite direkt geladen. 
Wurde das Dashboard per Drilldown aufgerufen, wird das Default-Profil nicht geladen. Für einzelne Felder können Ausnahmen hinterlegt werden (s. Unterprunkt 2, Javascript)

Die fachliche Doku zum Filterprofil befindet sich unter: (confluence...)
### Einrichtung:

#### Benutzeroberfläche
 - __SimpleXML:__

    Für die Filterprofil-Komponente wird ein HTML-"Anker" im SimpleXML benötigt.
    Beispiel:

    ```HTML
      <html>
        <div id="filterprofile"></div>
      </html>
    ```

    Die Inputfelder, die in das Filterprofil aufgenommen werden sollen, sind Standard-Splunk Inputfields und werden anhand der ID über Splunkjs.mvc.components identifiziert.

 - __JavaScript:__

    Das Script für die Initialisierung der Filterprofil-Komponente kann wie folgt importiert werden:

    ```JAVASCRIPT
        require([
            '/static/app/ConsistSplunkToolbox/components/filterprofile/filterprofile.js',
        ], function(
            Filterprofile
        ) { ... });
    ```
    Innerhalb des RequireJS-Callbacks wird nun die FilterComponente initialisiert:
    ```JAVASCRIPT
        var filterprofiles = new Filterprofile({
            el: '#in_filterprofile',                            //HTML-Anker
            collection: 'filterprofiles/',     //Name der KV-Store Collection
            kvStoreEndpoint: "endpoint" //Name des KV-Store Endpoints
        });
    ```

    Anschließend können nun die Inputfelder hinzugefügt werden. Hier gibt es 2 Möglichkeiten. 

    1. alle Input-Felder des Dashboards, die sich in der Splunk-Registry befinden, hinzufügen:
    ```JAVASCRIPT
        filterprofiles.addAllInputfields();
    ```

    2. Nur einzelne Felder hinzufügen:
    ```JAVASCRIPT
        filterprofiles.addInputfield('in_geoGroupsTok', false);
        filterprofiles.addInputfield('in_epsilonTok', false);
    ```
    - Der erste Parameter ist die ID mit der das Inputfeld in der Splunk-Registry identifiziert werden kann.
    - mit dem 2. Paramter kann eine Ausnahme für Drilldown eingerichtet werden: Normalerweise wird beim Drilldown das Defaultprofil nicht geladen. Für Parameter, die selten per Drilldown übergeben werden, jedoch meistens vom Anwender vorbelegt werden, kann eine Ausnahme eingerichtet werden. (s. Confluence-Doku)


#### KV-Store
Pro Dashboard muss ein KV-Store für die Filterprofile angelegt werden.



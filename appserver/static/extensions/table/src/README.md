
# Table
With this script you can add the following extensions to an existing Splunk table.

### import and init:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {
        var table = new Table('nameOfTable');
    });
```

___
## renameTableHeader

shortens column headers of a table and show the long information in a tooltip:


![rename table header with tooltip](./screenshots/renameTableHeaderWithTooltip.PNG)

### use:
```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {

        var table = new Table('nameOfTable');

        //first parameter is the current header, which should be shown in tooltip
        //second paramter is the new header
        table.renameHeader('Nächstgelegene Bahnstelle', 'Bahnstelle');
        table.renameHeader('Entfernung zur Bahnstelle [km]', 'Entfernung');
    });
```

___
## addXlsExporter

adds a button to export the table in xls format

you can add a button above the table ...

![external xls exporter](./screenshots/tableExporterExtern.PNG)

... or overwrite the existing export-button in the splunk toolbar of the table:

![exporter in splunk table toolbar](./screenshots/exporterSplunkToolbar.PNG)

the export will be saved on users computer automatically with the name or title of the table:

![downloaded file](./screenshots/exporterFile.PNG)
        
### use:

```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {

        var table = new Table('nameOfTable');

       //description of parameters see in section: parameters
        table.addExporter({
            showExternalButton: false,
            externalSearchId: 'nameOfExternalSearch',
            title: 'Filename of Exported File'
        });
    });
```
### parameters:

| parameter           | type    | optional | description                           |
| ---------           | ------- | ---------| --------------------------------------|
| `showExternalButton`| boolean | true     | true - if export button should be above the table, false - overwrite existing eport button in splunk toolbar of the table, default: true |
| `externalSearchId`  | string  | true     | if you don't want to use the search of the table, you can configure an external search   |
| `title`             | string  | true     | if you don't want to use the id of the table as filename, you can give a title filename  |



___
## addNumberOfTableRowsToggler
adds a count to a search of a table, so that the user can choose how many rows he want to see at once.

This feature needs configuration in JS and SimpleXML.

![Choose number of rows](./screenshots/NumberOfRowsChooser.PNG)


### use:

define a token and set it in init of simpleXML:

```xml
<init>
    <set token="tableRowsCountTok">10</set>
</init>
```

and use this token for the count option of the table:

```xml
<table>
...
<option name="count">$tableRowsCountTok$</option>
</table>
```

Initialisiation of the table of rows toggler in javascript:

```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {

        var table = new Table('nameOfTable');

        //parameter is the name of the token, which is used in simpleXML
        table.addNumberOfTableRowsToggler('tableRowsCountTok');
    });
```


### use:

___
## addDrilldownRowMarker
marks a selected row and sets a token with a selected value which cab be use for drilldown in another visualisation. In the screenshot below you can see a hovered row und the associated marker in a map:

![choose columns of table](./screenshots/tableRowMarker.PNG)

this feature needs configuration in simpleXML and javascript!

### use: 

___
## addColumnChooser

![choose columns of table](./screenshots/tableColumnChooser.PNG)

### use: 


```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {

        var table = new Table('nameOfTable');

        //parameter is the name of the token, which is used in simpleXML
        table.addColumnChooser({
            cookieName: 'tableRowsTok_cookie', 
            inputfieldId: 'in_tableRowsTok'
        })
    });
```

#### Example SimpleXML:

InputField:

```xml
    <input type="multiselect" id="in_tableColumnsDetail" token="tableColumnsDetail_tok" searchWhenChanged="true">
      <label>Tabellenspalten auswählen</label>
      <default>Wagennummer,Land</default>  <-- columns which should be shown as default (before user selected his own fields)
      <choice value="Wagennummer">Wagennummer</choice>
      <choice value="Land">Land</choice>
      <choice value="Ort">Ort</choice>
      <prefix>| table Zeitstempel "</prefix>      <-- table-command here as prefix, with fields that should not be deselectable. This fields should not be listed as choice in input
      <suffix>"</suffix>
      <delimiter>" "</delimiter>
    </input>
````


Search-Command: 

```xml
    <query>| loadjob $searchBaseID$ | eval Zeitstempel=_time          
        | eval Beladestatus = Beladestatus.case(source_loadstatus=="Sensor",", seit ".if(loadstatus_lastChange="Unbekannt","Unbekannt",strftime(strptime(loadstatus_lastChange, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M")),source_loadstatus=="FLO-LSO",", Information vom ".if(base_wgfTimestamp="Unbekannt","Unbekannt",strftime(strptime(base_wgfTimestamp, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M")),1=1,", ")." (Quelle: ".source_loadstatus.")", Bewegungsstatus = Bewegungsstatus." seit ".if(moveState_lastChange="Unbekannt","Unbekannt",strftime(strptime(moveState_lastChange, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M"))
        | fieldformat Zeitstempel = strftime(Zeitstempel, `db_rsi_wi_1src_ma_fieldformatTimeFormat`)
          $tableColumnsDetail_tok$ | rename gps_determination as " "</query>                                  <-- use token with table-command here in search-command
```
___

## markWeekend

colors table headers with weedend dates in green

![choose columns of table](./screenshots/markWeekendTableheader.PNG)

### use: 

```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {
        var table = new Table('nameOfTable').markWeekend();
    });
```

___

# TODO

- toggle number of table rows: make steps configurable, default "10 25 50 100"
- drilldownMarker: refactor 3 parameters to a config-object: column, token, searchToken:
.addDrilldownRowMarker("Wagennummer", "selected_event", "put_first_tok")
- docs for "markWeekend"

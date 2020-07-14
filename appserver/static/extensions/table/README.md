
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

___
## addColumnChooser

![choose columns of table](./screenshots/tableColumnChooser.PNG)

### use: 


___
## addFixedColumn

freezes first column of table

![fixed first column](./screenshots/fixedColumns.PNG)

### use: 


```javascript
    require(['/static/app/db_rsi_wi_1web_u/table/table.js'], function(Table) {

        var table = new Table('nameOfTable');

        table.addFixedColumn();
    });
```

___

# TODO

- toggle number of table rows: make steps configurable, default "10 25 50 100"

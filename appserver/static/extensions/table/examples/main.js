require([
    '/static/app/ConsistSplunkToolbox/extensions/table/src/table.js'
], function(Table){

    new Table('exampleTable')
        .addNumberOfTableRowsToggler('numberOfRowsToken')
        .addColumnChooser({
            inputfieldId: 'exampleFields',
            sortable: true,
            cookieName: 'exampleTableColumns'
        });


    new Table('fixedColumnTable')
        .addNumberOfTableRowsToggler('numberOfRowsToken')
        .addFixedColumns(2);
});

//@ sourceURL=table_main.js
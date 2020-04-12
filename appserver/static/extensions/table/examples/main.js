require([
    '/static/app/ConsistSplunkToolbox/extensions/table/src/table.js'
], function(Table){

    console.log('test');
    console.log(Table);

    Table('exampleTable')
        .addNumberOfTableRowsToggler('numberOfRowsToken')
        .addColumnChooser({
            inputfieldId: 'exampleFields',
            sortable: true,
            cookieName: 'exampleTableColumns'
        })
});

//@ sourceURL=table_main.js
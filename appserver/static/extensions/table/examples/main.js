require([
    '/static/app/ConsistSplunkToolbox/extensions/table/src/table.js'
], function(Table){

    console.log('test');
    console.log(Table);

    Table('exportableTable').addNumberOfTableRowsToggler('numberOfRowsToken')
});

//@ sourceURL=table_main.js
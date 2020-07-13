define([
    'underscore',
    'splunkjs/mvc',
    './renameHeader/renameHeader.js',
    './numberOfTableRowsComponent/numberOfTableRowsToggler.js',
    './tableColumnChooser/tableColumnChooserView.js',
    './fixedColumn/fixedColumn.js',
    'css!./table.css',
    'splunkjs/mvc/simplexml/ready!'
], function (_, mvc, renameHeader, addNumberOfTableRowsComponent, tableColumnChooser, fixedColumn) {

    var Table = function(tableComponentId) {
        this.tableComponent =   mvc.Components.get(tableComponentId);

        if(!this.tableComponent) {
            console.error('no table found with id: ' + tableComponentId);
            return;
        }
        this.tableId = tableComponentId;
        this.tableElement =  this.tableComponent.$el;

        return this;
    }    

    _.extend(Table.prototype, renameHeader, addNumberOfTableRowsComponent, tableColumnChooser, fixedColumn);


    return Table;
});
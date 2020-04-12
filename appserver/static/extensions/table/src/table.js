define([
    'underscore',
    'splunkjs/mvc',
    './numberOfTableRowsComponent/numberOfTableRowsToggler.js',
    './tableColumnChooser/tableColumnChooserView.js',
    'css!./table.css',
    'splunkjs/mvc/simplexml/ready!'
], function (_, mvc, addNumberOfTableRowsComponent, tableColumnChooser) {

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

    _.extend(Table.prototype, addNumberOfTableRowsComponent, tableColumnChooser);


    return Table;
});
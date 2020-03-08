define([
    'splunkjs/mvc',
    './renameHeader.js',
    './numberOfTableRowsComponent/numberOfTableRowsToggler.js',
    './drilldownTableRowMarker/drilldownTableRowMarker.js',
    './tableColumnChooser/tableColumnChooserView.js',
    'css!./table.css',
    'splunkjs/mvc/simplexml/ready!'
], function (mvc, renameHeader, addNumberOfTableRowsComponent, drilldownTableRowMarker, tableColumnChooser) {

    function table(tableComponentId) {
        this.tableComponent =   mvc.Components.get(tableComponentId);

        if(!this.tableComponent) {
            console.error('no table found with id: ' + tableComponentId);
            return;
        }
        this.tableId = tableComponentId;
        this.tableElement =  this.tableComponent.$el;

        this.renameHeader = renameHeader.bind(this);
        this.addNumberOfTableRowsToggler = addNumberOfTableRowsComponent.bind(this);
        this.addDrilldownRowMarker = drilldownTableRowMarker.bind(this);
        this.addColumnChooser = tableColumnChooser.bind(this);

        return this;
    }    

    return table;
});
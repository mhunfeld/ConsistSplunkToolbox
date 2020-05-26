define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'css!./fixedColumn.css'
], function ($, _, mvc, TableView) {

    var defaultTokens = mvc.Components.getInstance("default");
    
    var FixedColumnRenderer = TableView.BaseCellRenderer.extend({

        canRender: function(cell) {
            return cell.index === 0;
        },

        render: function($td, cell) {
            $td.addClass('fixedColumn');
            return $td.html(cell.value);
        }
    });
    return {
        
        
        addFixedColumns: function(options) {
            
            var tableComponent = this.tableComponent || mvc.Components.get(options.table);
            
            tableComponent.getVisualization(function(tableView) {
                tableView.addCellRenderer(new FixedColumnRenderer());
                tableView.on('rendered', function() {
                    setTimeout(function() {
                        var tableHeader = tableView.$el.find('th:first-child');
                        tableHeader.addClass('fixedColumn');
                    }, 100);
                })
                tableView.render();
            });

            return this;
        }
    }
    

});
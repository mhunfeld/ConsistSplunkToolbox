define([
    "underscore",
    "backbone",
    "splunkjs/mvc"
], function (_, Backbone, mvc) { 

    
    var defaultTokens = mvc.Components.getInstance("default");
    var submittedTokens = mvc.Components.getInstance("submitted");

    function drilldownTableRowMarker(field, inTokenName, outTokenName) {
        
        require(['css!/static/app/db_rsi_wi_1web_u/table/drilldownTableRowMarker/drilldownTableRowMarker.css']);
        
        defaultTokens.on("change:" + inTokenName, function(newIndexName, tokValue, options) {
            var searchString = '| eval put_first=if(' + field + '="' + tokValue + '",0,1) | sort limit=0 put_first';
            defaultTokens.set(outTokenName, searchString);
            submittedTokens.set(outTokenName, searchString);
        });

        defaultTokens.on("change:" + outTokenName, function(newIndexName, tokValue, options) {
            if(!tokValue) return;
            var selectedValue = defaultTokens.get(inTokenName);
            // Listener für Markierung in Tabelle bei Klicken auf Wagen in Map
            this.tableComponent.getVisualization(function(tableView) {
                tableView.on('rendered', function() {
                    //bisherige Markierungen entfernen
                    tableView.$el.find("tr").removeClass('drilldown-row');
                    
                    //selektierten Eintrag markieren
                    var tableCell = tableView.$el.find("td").filter(function() {
                        return $(this).text().split(selectedValue).length > 1;
                    });

                    var tableRow = tableCell.closest("tr");
                    tableRow.addClass('drilldown-row');
                });
            });
    
        }, this);

        return this;
    };


    return drilldownTableRowMarker;
    

});
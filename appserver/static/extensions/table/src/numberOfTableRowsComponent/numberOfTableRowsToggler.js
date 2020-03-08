define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "css!./numberOfTableRowsToggler.css"
], function(_, Backbone, mvc) {

    var NumberOfTableRowsComponent = Backbone.View.extend({

        tagName: 'div',

        className: 'tableRowCountDiv',

        countItemTemplate: _.template('<a class="tableRowCountItem" data-value="<%=count%>"><%=count%></a>'),

        counts: [10, 25, 50, 100],

        template: _.template('<span class="tableRowCountLabel">Anzahl</span>'),
        
        initialize: function(options) { 
            this.table = options.table;
            this.tableComponent =  options.tableComponent;
            this.tokenName = options.tokenName;
            this.submittedTokens = mvc.Components.getInstance("submitted");
            this.defaultTokens = mvc.Components.getInstance("default");

            this.paginatorSelector = this.table + " .splunk-paginator";


            var searchManagerId = this.tableComponent.settings.get('managerid');
            var searchManager = mvc.Components.get(searchManagerId);
            searchManager.on('search:done', function(state, job) {
                //Anzahl der Tabellen-Einträge merken
                this.maxCount = state.content.resultCount;
                this.render();
            }.bind(this));

            this.tableComponent.getVisualization(function(tableView) {
                tableView.on('rendered', function() {
                    this.render();
                }.bind(this));
            }.bind(this));
        },
       
        events: {
            'click .tableRowCountItem': 'toggleToken'
        }, 

        toggleToken: function (event) {
            var tokenValue = event.currentTarget.dataset.value;
            this.defaultTokens.set(this.tokenName, tokenValue);
            this.submittedTokens.set(this.tokenName, tokenValue);
            this.tableComponent.getVisualization(function(tableView) {
                tableView.settings.set("offset", 0);
                tableView.paginator.settings.set("page", 0);
            });
        },

        render: function() {

            if(!this.maxCount || this.maxCount < 10) return;

            this.$el.html(this.template);

            //Paging-Stufen abhängig von der Anzahl der Ergebnisse anzeigen
            //maximal 100, da Splunk nur 100 Einträge pro Seite anzeigt
            _.each(this.counts, function(count, index) {
                //dne ersten Eintrag immer, ansonsten bis zur nächsten Stufe
                //Bsp. 40 Eintäge: Paging 10, 25, 50
                //60Einträge: Pagin 10, 25, 50, 100
                (index === 0 || this.counts[index - 1] < this.maxCount) && this.$el.append(this.countItemTemplate({count: count}));
            }.bind(this));

            //Count and Pager problem.
            this.$el.insertBefore(this.paginatorSelector);
        }
    });

    return function(tokenName) {
        new NumberOfTableRowsComponent({
            table: '#' + this.tableComponent.id,
            tableComponent: this.tableComponent,
            tokenName: tokenName
        });

        return this;
    };;
});
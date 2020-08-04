define([
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/simplesplunkview',
    'markercluster'
], function(_, Backbone, mvc, SimpleSplunkView) {

    var BaseMapsDataView = SimpleSplunkView.extend({
        outputMode: 'json',

        initialize: function(options) {
            BaseMapsDataView.__super__.initialize.apply(this, arguments);

            this.mapView = mvc.Components.get(options.mapView);
            this.panel = mvc.Components.get(options.panel);
            this.drilldownToken = options.drilldownToken;

            this.searchManager = mvc.Components.get(options.managerid);

            this.listenTo(this.searchManager, 'search:start', this.onSearchStart);
            this.listenTo(this.searchManager, 'search:done', this.onSearchDone);

            //add searchResultsLink to base map
            this.panel.addResultsLink({
                id: options.id + "resultsLink",
                managerid: options.managerid
            });

            //add search progress bar to base map
            this.panel.addProgressBar({
                id: options.id + "prgressBar",
                managerid: options.managerid
            });
        },

        /**
         * show Progress and Messages on search start on map
         */
        onSearchStart: function() {
            this.mapView.showProgress(true);
            this.panel.showMessage();
        },

        /**
         * Stop Progress on search done
         * @param {*} job 
         */
        onSearchDone: function(job) {
            this.mapView.showProgress(false);
        },

        createView: function() {
            return this;
        },

        formatData: function(data) {
            return data;
        },
        
        /**
         * overwrite displayMessage to show Messages on Map
         * (private)
         * @param {*} messages 
         */
        displayMessage: function(messages) {
            if(messages instanceof Object) {
                this.mapView.showMessage(messages);
            } 
        },

        /**
         * add PopupRenderer to Subview
         * @param {BasePopupRenderer} popupRenderer 
         */
        addPopupRenderer: function(popupRenderer) {
            this.popupRenderer = popupRenderer;
        },

        /**
        //  * renderPopup without popup-Renderer
        //  * searchResult
        //  */
        // renderPopup: function(entry) {
        //     var compiledTemplate = _.template(this.templateString);
        //     return compiledTemplate({data: entry, tokens: defaultTokens});
        // },

        // updateView: function(viz, data) { 
        //     throw new Error("Must implement method updateView.")
        // }
    });

    /////////////////////////PopupRenderer////////////////////////////
    var BasePopupRenderer = function() {
        this.initialize.apply(this, arguments)
    };

    _.extend(BasePopupRenderer.prototype, Backbone.Events, {
        initialize: function() {},
        canRender: function(data) {
            throw new Error("Must implement method canRender.")
        },
        setup: function(data) {},
        teardown: function(data) {},
        render: function(data) {}
    });
    
    BasePopupRenderer.prototype.constructor = BasePopupRenderer;

    BasePopupRenderer.extend = Backbone.Model.extend;

    BaseMapsDataView.BasePopupRenderer = BasePopupRenderer;

    return BaseMapsDataView;

});
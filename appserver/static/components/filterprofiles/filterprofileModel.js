define([
    'backbone',
    'underscore'
], function (Backbone, _) {


    /**
     * Backbone model for filterprofiles
     * Model attributes reflect the structure of kv-store
     * _key: String - dashboard + username + profilename
     * value: dashboardname
     * related: dashboardname
     */
    var FilterprofileModel = Backbone.Model.extend({
        /**
         * constructor function
         * @param {object} options model attributes
         */
        initialize: function(options) {
            //nicht Teil der model attributes
            //da nur für select verwendet wird
            this.label = options.related;
            this.value = options.related;
            this.filters = new FilterCollection();
        },

        /**
         * adds single filters to filterprofile-model
         * @param {object} filterOptions model attributes of filter
         */
        addFilter: function(filterOptions) {
            this.filters.add(new FilterModel(filterOptions));
        },

        /**
         * creates filtermodel by token value
         * @param {String} token name of token
         * @param {*} value value of inputfield
         */
        addFilterByToken: function(token, value) {
            var filterOptions = {
                _key: this.get('_key') + '_' + token,
                value: value,
                related: this.get('related'),
                token: token
            }

            this.addFilter(filterOptions);
        },

        /**
         * transforms javasript-object to json-string
         */
        toJson: function() {
            var responseData = [];
            responseData.push(this.attributes);

            _(this.filters.models).each(function(filter) {
                responseData.push(filter.attributes);
            });

            return JSON.stringify(responseData);
        }
    });

    /**
     * Backbone collection for filters in filterprofile
     */
    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
    });

    /**
     * single filter in filterprofile
     */
    var FilterModel = Backbone.Model.extend({
        toJson: function() {
            return JSON.stringify(this.attributes);
        }

        
    });

    return FilterprofileModel;
});
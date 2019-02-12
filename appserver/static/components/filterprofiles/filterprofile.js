define([
    'backbone',
    'underscore',
    './filterprofileStoreService.js',
    './filterprofileSelectorView.js', 
    './filterprofileTokenService.js',
    './kvStoreService.js'
], function(
    Backbone,
    _,
    FilterProfileStore, 
    FilterprofileSelectorView, 
    FilterprofileTokenService,
    KvStoreService
) {

    /**
     * Adds filterprofile component to a given html-anchor
     * filterprofiles will be stored in kv-store
     * 
     * @param options {Object} Config-Options for filterprofile Component
     * @param options.el {String} Selector for anchor of filterprofile component
     * @param options.collection {String} name of Collection in kv-store
     * @param options.kvStoreEndpoint {String} url of kv-store endpoint
     */
    var FilterprofileComponent = function(options) {
        var filterprofileEventDispatcher = _.extend({}, Backbone.Events);
    
        var tokenHelper = new FilterprofileTokenService(filterprofileEventDispatcher);

        var kvStore = new KvStoreService(options.kvStoreEndpoint);
        var filterprofileStore = new FilterProfileStore(options.collection, filterprofileEventDispatcher, tokenHelper, kvStore);
    
        var filterprofileSelectorView = new FilterprofileSelectorView({
            el: $(options.el),
            eventDispatcher: filterprofileEventDispatcher
        });
    
        filterprofileSelectorView.render();
    

        return {
            /**
             * adds all inputfields of a dashboard to filterprofile
             */
            addAllInputfields: function() {
                tokenHelper.registerAllInputfields();
                filterprofileStore.activateDefaultFilterprofile(tokenHelper.checkIfDrilldown());
                return this;
            }, 
            /**
             * adds a inputfield to filterprofile
             * @param inputfieldSelector {string} id of splunk-inputfield component for splunkjs-mvc component
             * @param isDrilldownField {bool} if false, this field will be filled by default profile if drilldown is active
             *                                default is true - fields will not be filled, if drilldown is active 
             */
            addInputfield: function(inputfieldSelector, isDrilldownField = true) {
                tokenHelper.registerInputfield(inputfieldSelector, isDrilldownField);
                return this;
            },

            /**
             * excludes a inputfield for filterprofile
             * @param inputfieldSelector {string} id of splunk-inputfield component for splunkjs-mvc component
             * @param isDrilldownField {bool} if false, this field will be filled by default profile if drilldown is active
             *                                default is true - fields will not be filled, if drilldown is active 
             */
            excludeInputfield: function(inputfieldSelector) {
                tokenHelper.excludeInputfield(inputfieldSelector);
                return this;
            }
        } 
    }

    return FilterprofileComponent;
});
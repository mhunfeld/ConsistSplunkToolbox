define([
    'underscore',
    'backbone',
    "splunkjs/mvc/dropdownview",
    'css!./filterprofileSelectorView.css'
], function (_, Backbone, DropdownInput) {

    /**
     * UI-Component for managing of filterprofile
     * SelectBox and 4 Icons for add, delete, import, export
     */
    var FilterprofileSelectorView = Backbone.View.extend({

        template: _.template('<div class="filterprofileSelector">\
                                <label class="filterlabel">Suchprofile</label>\
                                <div class="filter-actions">\
                                    <span title="Filterprofile speichern" data-toggle="tooltip" class="filterprofile-tooltip"><a class="newFilterprofile"><i class="material-icons">save</i></a></span>\
                                    <span title="Filterprofile löschen" data-toggle="tooltip"  class="filterprofile-tooltip"><a class="deleteFilterprofile"><i class="material-icons">delete</i></a></span>\
                                    <span title="Filterprofile exportieren" data-toggle="tooltip"  class="filterprofile-tooltip"><a class="exportFilterprofile"><i class="material-icons">arrow_downward</i></a></span>\
                                    <span title="Filterprofile importieren" data-toggle="tooltip"  class="filterprofile-tooltip"><a class="importFilterprofile"><i class="material-icons">arrow_upward</i></a></span>\
                                </div>\
                        </div>'),

        events: {
            'click .newFilterprofile': 'newFilterprofile',
            'click .deleteFilterprofile': 'deleteFilterprofile',
            'click .exportFilterprofile': 'exportFilterprofile',
            'click .importFilterprofile': 'importFilterprofile'
        },

        /**
         * contructor-funktion
         * @param {Object} options Backbone-View Options 
         * @param {Object} options.eventDispatcher EventDispatcher
         *                  -> listens to added if new filterprofiles were added
         *                  -> listens to activate if a profile should be selected
         *                  -> fires "add" if Button for add new has been clicked
         *                  -> fires "delete" if Button delete has been clicked
         *                  -> fires export if Button export has been clicked
         *                  -> fires "import" if Button import has been clicked
         *                  -> fires "changed" if another profile has been selected in dropdown 
         */
        initialize: function(options) {
            this.filterDropdown = new DropdownInput({
                "showClearButton": true,
                id: "filterprofile-dropdown"
            });

            this.eventDispatcher = options.eventDispatcher;

            this.listenTo(this.filterDropdown, "change", this.changeFilterprofile, this);
            this.eventDispatcher.on("filterprofile:added", this.addFilterprofiles, this);
            this.eventDispatcher.on('filterprofile:activate', this.setFilterprofile, this);
        }, 

        render: function() {
            this.$el.empty();
            this.$el.append(this.template);

            this.$el.find('.filterprofileSelector').append(this.filterDropdown.render().el);
            this.$el.find('.filterprofile-tooltip').tooltip();

            return this;
        },

        addFilterprofiles: function(filterprofiles) {
            this.filterDropdown.settings.set("choices", filterprofiles);
            this.filterDropdown.render();
		},

        newFilterprofile: function() {
            this.eventDispatcher.trigger('filterprofile:new');
        },

        deleteFilterprofile: function() {
            var selectedFilterprofile = this.filterDropdown.val();
            if(!selectedFilterprofile) {
                this.showError('Bitte wählen Sie ein Suchprofil aus.')
            } else {
                this.eventDispatcher.trigger('filterprofile:delete', selectedFilterprofile);
            }
        },

        exportFilterprofile: function() {
            var selectedFilterprofile = this.filterDropdown.val();
            if(!selectedFilterprofile) {
                this.showError('Bitte wählen Sie ein Suchprofil aus.')
            } else {
                this.eventDispatcher.trigger('filterprofile:export', selectedFilterprofile);
            }
        },

        importFilterprofile: function() {
            this.eventDispatcher.trigger('filterprofile:showImport');
        },

        changeFilterprofile: function(activeFilterprofile) {
            if(activeFilterprofile) {
                this.eventDispatcher.trigger('filterprofile:changed', activeFilterprofile);
            }
        },

        setFilterprofile: function(selectedFilterprofile) {
            selectedFilterprofile ? this.filterDropdown.val(selectedFilterprofile.value) : this.filterDropdown.val('');
        },

        showError: function(error) {
            alert(error);
        },

    });


    return FilterprofileSelectorView;
});
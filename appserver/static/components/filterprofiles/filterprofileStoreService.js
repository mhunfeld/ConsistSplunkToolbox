define([
    'underscore',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    './filterprofileModel.js',
    './addFilterModalView.js',
    './filterprofileService.js',
    './polyfills.js'
], function (_, SearchManager, utils, FilterprofilModel, AddFilterModal, FilterprofileService) {

    /**
     * 
     * @param {*} collection 
     * @param {*} eventDispatcher 
     * @param {*} tokenService 
     * @param {*} store 
     */
    var FilterprofileStore = function(collection, eventDispatcher, tokenService, store) {

        this.username = $C.USERNAME;
        this.dashboard = $(".dashboard-title")[0].textContent;

        this.collection = collection;
        this.delimiter = "_";
        this.prefix = this.username + this.delimiter + this.dashboard;
        this.defaultFilterprofile = undefined;
        //filterprofiles as map for quick-access key=>related value=>profile
        this.filterprofiles = {};

        this.isDrilldown = false;

        this.initFilterprofileSearch();
        
        this.tokenService = tokenService;
        
        this.filterprofileService = new FilterprofileService();

        this.store = store;
        
        this.eventDispatcher = eventDispatcher;
        this.eventDispatcher.on('filterprofile:changed', this.changeFilterprofile, this);
        this.eventDispatcher.on('filterprofile:new', this.newFilterprofile, this);
        this.eventDispatcher.on('filterprofile:save', this.saveFilterprofile, this);
        this.eventDispatcher.on('filterprofile:delete', this.deleteFilterprofile, this);
        this.eventDispatcher.on('filterprofile:export', this.exportFilterprofile, this);
        this.eventDispatcher.on('filterprofile:showImport', this.showImportDialog, this);
        this.eventDispatcher.on('filterprofile:import', this.importFilterprofile, this);
    }
    

    FilterprofileStore.prototype.initFilterprofileSearch = function() {
        this.filterItemsSearch = new SearchManager({
            "id": "filtersearch_test",
            "sample_ratio": null,
            "autostart": true,
            "search": '| inputlookup ' + this.collection + ' | search _key="' + this.prefix + this.delimiter + '*"',
            "cancelOnUnload": true,
            "status_buckets": 0,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": false,
            "count": 0,
            "runWhenTimeIsUndefined": false,
            "output_mode": "JSON"
        }, {
            tokens: true
        });
        
        this.filterItems = this.filterItemsSearch.data("results", {
            count: 0
        });
        
        this.filterItems.on('data', this.parseSearchResult.bind(this));

        this.filterItemsSearch.startSearch();
    }


    FilterprofileStore.prototype.parseSearchResult = function() {
        var filterprofileAsJson = this.filterItems.collection().toJSON();
        this.createFilterprofileModelFromJson(filterprofileAsJson);
    }

    FilterprofileStore.prototype.createFilterprofileModelFromJson = function(filterprofileAsJson) {
        this.defaultFilterprofile = this.filterprofileService.getDefaultFilterprofile(filterprofileAsJson);

        this.filterprofiles = this.filterprofileService.getFilterprofiles(filterprofileAsJson, this.defaultFilterprofile);
       
        this.eventDispatcher.trigger('filterprofile:added', _(this.filterprofiles).values());
        
        this.filterprofileService.addFilterToFilterprofiles(filterprofileAsJson, this.filterprofiles);

        if(this.defaultFilterprofile) {
            this.filterprofileService.setAsDefault(this.filterprofiles[this.defaultFilterprofile]);
            this.eventDispatcher.trigger('filterprofile:activateDefault', this.filterprofiles[this.defaultFilterprofile], this.isDrilldown);
            if(!this.isDrilldown) {
                this.eventDispatcher.trigger('filterprofile:activate', this.filterprofiles[this.defaultFilterprofile]);
            }
        }
    }

    FilterprofileStore.prototype.changeFilterprofile = function(selectedFilterprofileName) {
        var selectedFilterprofile = selectedFilterprofileName ? this.filterprofiles[selectedFilterprofileName] : undefined;
        this.eventDispatcher.trigger('filterprofile:activate', selectedFilterprofile);
    }

    FilterprofileStore.prototype.newFilterprofile = function() {
        var addFilterModal = new AddFilterModal({}, this.eventDispatcher);
        addFilterModal.show();
    }

    FilterprofileStore.prototype.showImportDialog = function() {
        var addFilterModal = new AddFilterModal({import: true}, this.eventDispatcher);
        addFilterModal.show();
    }

    FilterprofileStore.prototype.activateDefaultFilterprofile = function(isDrilldownActive) {
        this.isDrilldown = isDrilldownActive;
    }


    FilterprofileStore.prototype.saveFilterprofile = function(userInput) {

        var filterprofileName = userInput.filterprofileName;
        
        var isDefault = userInput.isDefault;

        if(this.filterprofiles[userInput.filterprofileName]){
            if(!confirm("Achtung! Profil bereits vorhanden. Möchten Sie es überschreiben?")) {
                return;
            } 
            this.deleteFilterprofile(userInput.filterprofileName ,true);
        }    


        var filterprofileProperties = {
            _key: this.prefix + this.delimiter + filterprofileName, 
            related: filterprofileName, 
            value: filterprofileName
        }
        var filterprofile = this.tokenService.getFilterValuesFromTokenModel(new FilterprofilModel(filterprofileProperties));

        if(isDefault) {
            this.filterprofileService.setAsDefault(filterprofile);
        }
        this.store.saveRecordsInBatch(this.collection, filterprofile.toJson());
        
        this.filterprofiles[filterprofileName] = filterprofile;
        this.eventDispatcher.trigger('filterprofile:added', _(this.filterprofiles).values());
        
        this.eventDispatcher.trigger('filterprofile:saved');
        this.changeFilterprofile(filterprofileName);
    }

    FilterprofileStore.prototype.deleteFilterprofile = function(selectedFilterprofileName, overwrite) {

        if (typeof selectedFilterprofileName === "undefined" || selectedFilterprofileName === "") {
            alert("Bitte wählen Sie ein Suchprofil zum löschen aus.");
            return;
        }
        
        var selectedFilterprofile = this.filterprofiles[selectedFilterprofileName];
        
        if (overwrite || confirm("Möchten Sie das ausgewählte Suchprofil \"" + selectedFilterprofileName + "\" wirklich löschen?")) {
            this.store.deleteRecord(this.collection, selectedFilterprofile.toJSON());

            selectedFilterprofile.filters.each(function(filter) {
                this.store.deleteRecord(this.collection, filter.toJSON());
            }.bind(this));
            
            if(!overwrite) {
                delete this.filterprofiles[selectedFilterprofileName];
    
                this.eventDispatcher.trigger('filterprofile:added', _(this.filterprofiles).values());
                this.changeFilterprofile(undefined);
            }
                
        }
    }

    FilterprofileStore.prototype.exportFilterprofile = function(selectedFilterprofileName) {
        var selectedFilterprofile = this.filterprofiles[selectedFilterprofileName];

        var userAgnosticFilterprofile = this.filterprofileService.prepareFilterprofileForExport(selectedFilterprofile);

        // Download happening here
        var element = document.createElement('a');
        // Set file content (the profile)
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(userAgnosticFilterprofile.toJson()));
        // Set name of the file thats about to be downloaded
        element.setAttribute('download', this.dashboard + "_" + selectedFilterprofileName);
        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            element.dispatchEvent(event);
        } else {
            element.click();
        }
    }

    FilterprofileStore.prototype.importFilterprofile = function(input) {
        var reader = new FileReader();
        reader.readAsText(input.file);

        if(this.filterprofiles[input.filterprofileName] && !confirm("Achtung! Profil bereits vorhanden. Möchten Sie es überschreiben?")) {
            return;
        }

        var isDefault = input.isDefault;

		reader.onload = function (event) {
			try {
                var filterprofileAsJson = JSON.parse(event.target.result);
                var filterprofileAsJsonWithUserdata = this.filterprofileService.addUserDataToFilterprofile(filterprofileAsJson, input.filterprofileName);

                var filterprofiles = this.filterprofileService.getFilterprofiles(filterprofileAsJsonWithUserdata);
                this.filterprofiles = _.extend(this.filterprofiles, filterprofiles);
               
                this.filterprofileService.addFilterToFilterprofiles(filterprofileAsJsonWithUserdata, this.filterprofiles);
                
                var filterprofile = this.filterprofiles[input.filterprofileName];

                if(isDefault) {
                    this.filterprofileService.setAsDefault(filterprofile);
                }

                this.eventDispatcher.trigger('filterprofile:added', _(this.filterprofiles).values());
                this.store.saveRecordsInBatch(this.collection, filterprofile.toJson());
                this.eventDispatcher.trigger('filterprofile:saved');
                this.changeFilterprofile(input.filterprofileName);

			} catch(e) {
                this.eventDispatcher.trigger('filterprofile:error', 'Die importierte Datei enthält kein gültiges Filterprofil.');
			}
		}.bind(this);
    }

    return FilterprofileStore;

});
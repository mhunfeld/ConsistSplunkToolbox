define([
    'underscore',
    './filterprofileModel.js',
    'splunkjs/mvc/simplexml/ready!'
], function (_, FilterprofilModel) {

    /**
     * Service for managing filterprofiles
     */
    var FilterprofileService = function() {

        this.username = $C.USERNAME;
        this.dashboard = $(".dashboard-title")[0].textContent;

        this.delimiter = "_";
        this.prefix = this.username + this.delimiter + this.dashboard;
    }

    /**
     * extracts default-filterprofile from json-result
     * @param {json} filterprofilesAsJson jsonlist of filterprofiles (result from kv-store search)
     */
    FilterprofileService.prototype.getDefaultFilterprofile = function(filterprofilesAsJson) {
        var defaultFilterprofileEntry = _(filterprofilesAsJson).filter(function(filterprofileEntry) {
            return filterprofileEntry._key.includes("isdefaultTok");
        });

        if(defaultFilterprofileEntry > 1) {
            //throw errpr
        }
        return defaultFilterprofileEntry.length > 0 ? defaultFilterprofileEntry[0].value : "";
    }

    /**
     * sets default-profile Entry in given filterprofile.
     * this entry is stored in kv-store
     * @param {object} filterprofile  
     */
    FilterprofileService.prototype.setAsDefault = function(filterprofile) {
        var defaultProfileOptions = {
            _key: this.prefix + this.delimiter + 'isdefaultTok',
            value: filterprofile.get('related')
        }
        filterprofile.addFilter(defaultProfileOptions);
    }

    /**
     * extracts filterprofiles from json (result of kv-store search)
     * @param {json} filterprofileRows 
     */
    FilterprofileService.prototype.getFilterprofiles = function(filterprofileRows) {
        var filterprofileRows =_(filterprofileRows).filter(function(filterprofileRow){
            return  !filterprofileRow._key.includes("isdefaultTok") && filterprofileRow.related === filterprofileRow.value;
        });
        

        var filterprofiles = {};
        var filterprofileModels = _(filterprofileRows).map(function(filterprofileRow){
            var filterprofileName = filterprofileRow.related;
            var filterprofileModel = new FilterprofilModel(filterprofileRow);

            filterprofiles[filterprofileName] = filterprofileModel;
            return filterprofileModel;
        });
        
        return filterprofiles;
    }
    
    /**
     * extracts filter from json (result from kv-store) and
     * adds filter to filterprofils
     * @param {json} filterprofilesAsJson json result from kv-store 
     * @param {object} filterprofileModels List of existing filterprofiles
     */
    FilterprofileService.prototype.addFilterToFilterprofiles = function(filterprofilesAsJson, filterprofileModels) {
        var filterJsons = _(filterprofilesAsJson).filter(function(filterprofileEntry) {
            return  !filterprofileEntry._key.includes("isdefaultTok") && filterprofileEntry.related !== filterprofileEntry.value;
        });

        _(filterJsons).each(function(filterJson) {
            var filterprofileName = filterJson.related;
            var filterprofile = filterprofileModels[filterprofileName];
            filterJson.token = filterJson._key.substr((this.prefix + this.delimiter + filterprofileName + this.delimiter).length);
            if(filterprofile) {
                filterprofile.addFilter(filterJson);
            }
        }.bind(this));
    }
 
    /**
     * anonymize filterprofile for exprt
     * @param {object} filterprofile 
     */
    FilterprofileService.prototype.prepareFilterprofileForExport = function(filterprofile) {

        var exportFilterprofile = filterprofile.clone();

        var filterprofileName = filterprofile.get('related');

        exportFilterprofile.set('_key', this.dashboard);
        exportFilterprofile.unset('value');
        exportFilterprofile.unset('related');

        filterprofile.filters.each(function(filter) {
            exportFilter = filter.clone();
            //var profilename = exportFilter.get('related');
            var key = exportFilter.get('_key');
            var tokenname = key.substring((key.indexOf(filterprofileName) + filterprofileName.length));
            var newKey = this.dashboard + tokenname;

            exportFilter.set('_key', newKey);
            exportFilter.unset('related');
            exportFilterprofile.addFilter(exportFilter);

        }.bind(this));
        return exportFilterprofile;
    }

    /**
     * adds user-specific data to imported filterprofile-json 
     * @param {json} filterprofileAsJson 
     * @param {String} filterprofileName 
     */
    FilterprofileService.prototype.addUserDataToFilterprofile = function(filterprofileAsJson, filterprofileName) {
        _(filterprofileAsJson).each(function(filterJson){
            if(!filterJson.token) {
                var dashboardName = filterJson._key;
                if(dashboardName !== this.dashboard) {
                    throw new Error('Dashboard stimmt nicht mit Profil überein.');
                }
                var newKey = this.username + this.delimiter + filterJson._key + this.delimiter + filterprofileName;
                filterJson._key = newKey;
                filterJson.value = filterprofileName;
                filterJson.related = filterprofileName;
            } else {
                var newKey = this.username + this.delimiter + this.dashboard + this.delimiter + filterprofileName + this.delimiter + filterJson.token;
                filterJson._key = newKey;
                filterJson.related = filterprofileName;
            }

        }.bind(this));

        return filterprofileAsJson;
    }

    return FilterprofileService;

});
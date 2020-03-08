define([
    'underscore',
    'backbone',
    "splunkjs/mvc"
], function (_, Backbone, mvc) {
	
	var submittedTokens = mvc.Components.get('submitted');
	var defaultTokens = mvc.Components.get('default');

	/**
	 * Set a token in default and submitted Tokenmodels.
	 * @param {String} Tokenname
	 * @param {String} Tokenvalue
	 */
	function setToken(name, value) {

		// if(value === typeof(Object)) {

		// }
		defaultTokens.set(name, value);
		submittedTokens.set(name, value);
	}

	/**
	 * Unset a token in default and submitted Tokensmodels.
	 * @param {String} Tokenname
	 * @param {String} Tokenvalue
	 */
	function unsetToken(name) {
		defaultTokens.unset(name);
		submittedTokens.unset(name);
	}

	FilterprofileTokenHelper = function(eventDispatcher) {
		this.eventDispatcher = eventDispatcher;

		this.eventDispatcher.on('filterprofile:activate', this.setActiveFilter, this);
		this.eventDispatcher.on('filterprofile:activateDefault', this.setDefaultFilter, this);

		// Cached Arrays
		this.inputfields = [];
		this.noDrilldownFields = [];
		this.excludedInputs = [];
	}


	FilterprofileTokenHelper.prototype.registerAllInputfields = function() {

		this.inputfields = _.filter(mvc.Components.attributes, function(component) {
			return component.moduleId === "views/dashboard/form/Input" && (_.indexOf(this.excludedInputs, component.id) === -1);
		}, this);

		if(this.inputfields.length === 0) {
			throw Error("No inputfields found on this dashboard!");
		}
	}

	FilterprofileTokenHelper.prototype.registerInputfield = function(inputfieldId, isDrilldownField = true) {
		var inputfield = mvc.Components.get(inputfieldId);

		if(!inputfield) throw Error("No inputfield with ID " + inputfieldId + "found!");
		
		this.inputfields.push(inputfield);

		if(!isDrilldownField && this.isDefaultValue(inputfield)) {
			this.noDrilldownFields.push('form.' + inputfield.settings.get('token'));
		}
	}

	FilterprofileTokenHelper.prototype.excludeInputfield = function(inputfieldId) {
		var inputfield = mvc.Components.get(inputfieldId);

		if(!inputfield) throw Error("No inputfield with ID " + inputfieldId + "found!");
		
		if(_.indexOf(this.inputfields, inputfield) !== -1) {
			this.inputfields = _.without(this.inputfields, inputfield);
		} else {
			this.excludedInputs.push(inputfieldId);
		}
	}

	FilterprofileTokenHelper.prototype.addPriorityToInputfield = function(inputfieldId) {
		var inputfield = mvc.Components.get(inputfieldId);

		if(!inputfield) throw Error("No inputfield with ID " + inputfieldId + "found!");
	
		var index = _.indexOf(this.inputfields, inputfield);
		this.inputfields.unshift(this.inputfields.splice(index, 1)[0]);
	}

	FilterprofileTokenHelper.prototype.checkIfDrilldown = function() {
		var nonDefaultSettings = _.filter(this.inputfields , function(inputfield) {
			return !this.isDefaultValue(inputfield);
		}, this);
		
		return nonDefaultSettings.length > 0;
	}

	FilterprofileTokenHelper.prototype.isDefaultValue = function(inputfield) {

		if(inputfield.settings.get('default')) {
			return _.isEqual(inputfield.val(), inputfield.settings.get('default'));
		}

		if(inputfield.settings.get('initialValue')) {
			return _.isEqual(inputfield.val(), inputfield.settings.get('initialValue'));
		}

		return !inputfield.settings.get('value');
	}

	FilterprofileTokenHelper.prototype.resetActiveFilter = function() {
		_(this.inputfields).each(function(inputfield) {
			defaultTokens.unset('form.' + inputfield.settings.get('token'))
		});
	}

	FilterprofileTokenHelper.prototype.setActiveFilter = function(selectedFilterprofile) {
		this.resetActiveFilter();
		this.activeFilterprofile = selectedFilterprofile;
		if(selectedFilterprofile) {
			_(selectedFilterprofile.filters.models).each(function(filter) {
				setToken(filter.get('token'), filter.get('value'));
			});

		}
	}

	FilterprofileTokenHelper.prototype.setDefaultFilter = function(selectedFilterprofile, isDrilldown) {
		//this.resetActiveFilter();
		this.activeFilterprofile = selectedFilterprofile;
		if(selectedFilterprofile) {
			_(selectedFilterprofile.filters.models).each(function(filter) {
				if(!isDrilldown || this.noDrilldownFields.indexOf(filter.get('token')) !== -1 ) {
					setToken(filter.get('token'), filter.get('value'));
				}
			}, this);
		}
	}

	FilterprofileTokenHelper.prototype.getFilterValuesFromTokenModel = function(filterprofile) {
		_.each(this.inputfields, function(inputfield) {

			var defaultValue = inputfield.settings.get('default');
			var currentValue = inputfield.val();
			
			if (inputfield.options.type === 'time') {
				var token = 'form.' + inputfield.settings.get('token');

				var earliest = defaultTokens.get(token + ".earliest");
				filterprofile.addFilterByToken(token + '.earliest', earliest);
				
				var latest = defaultTokens.get(token + ".latest");
				filterprofile.addFilterByToken(token + '.latest', latest);
			} else if(!_.isEqual(defaultValue, currentValue)) {
				//nur form.token ins Filterprofil schreiben
				var token = 'form.' + inputfield.settings.get('token');
				filterprofile.addFilterByToken(token, currentValue);
			}
		});

		return filterprofile;
	};

	return FilterprofileTokenHelper;


});
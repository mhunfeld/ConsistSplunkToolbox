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
		this.tokens = [];
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

		this.tokens = _.map(this.inputfields, function(inputfield) {
			return inputfield.settings.get('token');
		});
	}

	FilterprofileTokenHelper.prototype.registerInputfield = function(inputfieldId, isDrilldownField = true) {
		var inputfield = mvc.Components.get(inputfieldId);

		if(!inputfield) throw Error("No inputfield with ID " + inputfieldId + "found!");
		
		this.inputfields.push(inputfield);

		if(!isDrilldownField && this.isDefaultValue(inputfield)) {
			this.noDrilldownFields.push(inputfield.settings.get('token'));
			//only form.token is set at drilldown, so we have to ignore this token, too.
			this.noDrilldownFields.push('form.' + inputfield.settings.get('token'));
		}
	
		_.uniq(this.tokens.push(inputfield.settings.get('token')));
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
		if(this.activeFilterprofile) {
			_(this.activeFilterprofile.filters.models).each(function(filter) {
				unsetToken(filter.get('token'));
			});
		}
	}

	FilterprofileTokenHelper.prototype.setActiveFilter = function(selectedFilterprofile) {
		this.activeFilterprofile = selectedFilterprofile;
		if(selectedFilterprofile) {
			_(selectedFilterprofile.filters.models).each(function(filter) {
				if(defaultTokens.get(filter.get('token')) === filter.get('value')) {
					defaultTokens.trigger('change:' + filter.get('token'));
				}
				setToken(filter.get('token'), filter.get('value'));
			});

		}
	}

	FilterprofileTokenHelper.prototype.setDefaultFilter = function(selectedFilterprofile, isDrilldown) {
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
		
		var filteredDefaultTokens = _.object(_.pairs(defaultTokens.attributes)
					.filter(function(tokenPair){
						return _.find(this.tokens, function(relevantToken){
								return tokenPair[0].includes(relevantToken);
						}.bind(this));
					}.bind(this)));

		return _.reduce(filteredDefaultTokens, function(filterprofile, value, token) {
			filterprofile.addFilterByToken(token, value);
			return filterprofile;
		}.bind(this), filterprofile);
	};

	return FilterprofileTokenHelper;


});
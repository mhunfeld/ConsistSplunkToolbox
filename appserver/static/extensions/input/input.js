define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/utils'
], function ($, _, mvc, SplunkUtils) { 


    var defaultTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');


    var inputfield = function(inputfieldId) {

        this.inputfieldComponent = mvc.Components.get(inputfieldId);
        this.id = inputfieldId;
        
        if(!this.inputfieldComponent) {
            console.error("No inputfiled found with id: " + inputfieldId);
            return;
        }
        
        return this;
    }

    inputfield.prototype.rememberSelectedValue = function() {

        var pageInfo = SplunkUtils.getPageInfo();
        this.itemName = pageInfo.app + "_" + pageInfo.page + "_" + this.inputfieldComponent.settings.get('id');
        this.localStorage = window.localStorage;

        if(!this.inputfieldComponent.val() || this.inputfieldComponent.val() === this.inputfieldComponent.settings.get('default')) {
            var localStorageValue = this.localStorage.getItem(this.itemName)
            localStorageValue = localStorageValue && localStorageValue.split(',');
            console.log(localStorageValue);
            localStorageValue && this.inputfieldComponent.val(localStorageValue);
        }

        defaultTokens.on('change:' + this.inputfieldComponent.settings.get('token'), function(value) {
            var tmpValue = defaultTokens.get('form.' + this.inputfieldComponent.settings.get('token'));
            console.log(tmpValue);
            this.localStorage.setItem(this.itemName, tmpValue);
        }, this);

    }

    return inputfield;


});
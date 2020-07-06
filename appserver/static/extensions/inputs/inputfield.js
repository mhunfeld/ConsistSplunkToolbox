define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    '/static/app/ConsistSplunkToolbox/extensions/inputs/livesearch.js',
    'css!/static/app/ConsistSplunkToolbox/extensions/inputs/inputfield.css'
], function ($, _, mvc, livesearch, livesearch2) { 


    var defaultTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');


    var inputfield = function(inputfieldId) {

        this.inputfieldComponent = mvc.Components.get(inputfieldId);
        
        if(!this.inputfieldComponent) {
            console.error("No inputfiled found with id: " + inputfieldId);
            return;
        }

        this.settings = this.inputfieldComponent.settings;
        this.currentValueTokenName = 'currentValue' + inputfieldId;
        this.formToken = 'form.' + this.inputfieldComponent.settings.get('token');
        
        return this;
    }
    
    inputfield.prototype.smartDefaultValue = function() {
        function smartDefaultValue(){
            var defaultValue = (this.inputfieldComponent.settings.get('default') instanceof Array) ? this.inputfieldComponent.settings.get('default')[0] : '';
            var values = this.inputfieldComponent.val();
            
            if (values.length > 1) {
                var firstElement = values[0];
                var lastElement = values.slice(-1).pop();

                if (firstElement === defaultValue) {
                    // "Alle" was first, remove and leave rest
                    values.shift();
                    defaultTokens.set(this.formToken, values);
    
                } else if (lastElement === defaultValue) {
                    // "Alle" was added later, remove everything before
                    defaultTokens.set(this.formToken, defaultValue);
                } 
            } else if(values.length < 1){
                defaultTokens.set(this.formToken, defaultValue);
            }
            
            this.inputfieldComponent.render();
        };
    
       this.inputfieldComponent.on("change", smartDefaultValue, this);

       return this;
    }

    inputfield.prototype.toSingleValue = function() {
        function toSingleValue(){
            var defaultValue = (this.inputfieldComponent.settings.get('default') instanceof Array) ? this.inputfieldComponent.settings.get('default')[0] : '';
            var values = this.inputfieldComponent.val();
            
            if (Array.isArray(values) && values.length > 1) {
                    values.shift();
                    defaultTokens.set(this.formToken, values);
            } else if(values.length < 1){
                defaultTokens.set(this.formToken, defaultValue);
            }

            this.inputfieldComponent.render();
        };
    
       this.inputfieldComponent.on("change", toSingleValue, this);

       return this;
    }

    inputfield.prototype.applyCopyToClipboard =  function () {

        var multiBox = this.inputfieldComponent;

        var label = multiBox.$el.find('label').first();
        label.css('display', 'inline');
        var icons = $('<span class="copyButton inputAction"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 17l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9m-6-6a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="#626262"/></svg></span>');
        
        var inputActions = multiBox.$el.find('.inputActions');
        if(inputActions.length == 0) {
            inputActions = $('<div class="inputActions"></div>');
            inputActions.insertAfter(label);
        }
        inputActions.append(icons);
        
     //   icons.insertAfter(multiBox.$el.find('label').first());
        
        icons.mouseover(function () {
            multiBox.$el.find('.splunk-choice-input-message').css('cssText', 'font-size: 12px');
            multiBox.$el.find('.splunk-choice-input-message').text("Kopieren in Zwischenablage");
        });

        icons.mouseout(function () {
            multiBox.$el.find('.splunk-choice-input-message').text("");
        });
        
        icons.on("click", function () {
            var selectedValues = multiBox.$el.find('button > div > div');
            var selectedValuesAsString = "";
            selectedValues.each(function(){
                selectedValuesAsString += $(this).text() + "\n";
            });

            var clipboardArea = document.createElement("textarea");
            document.body.appendChild(clipboardArea);
            clipboardArea.value = selectedValuesAsString;
            clipboardArea.select();
            document.execCommand("copy");
            document.body.removeChild(clipboardArea);
        }.bind(this));

        return this;
    }
    
    
    inputfield.prototype.pastable = function(){
        var multiSelectBox = this.inputfieldComponent;
        
        multiSelectBox.$el.bind("paste", function(e) {
            
            //Get the copied data    
            var pastedData = e.originalEvent.clipboardData.getData('text');
            
            //Check if the copied data has lines
            pastedData = pastedData.trim().replace(/[\t\r\n]+/g, ",");
            pastedData = pastedData.trim().replace(/;/g, ",");
            pastedData = pastedData.trim().replace(/:/g, ",");
            pastedData = pastedData.trim().replace(/-/g, "");
            pastedData = pastedData.trim().replace(/[\s]+/g, "");

            //merge old and pasted data
            var splittedDataAlt = pastedData.split(',');
            var oldData = multiSelectBox.val();
            var mergedData = _.union(oldData, splittedDataAlt);
            mergedData = _.without(mergedData, '*');

            multiSelectBox.val(mergedData);

            defaultTokens.set(this.currentValueTokenName, "*");
            submittedTokens.set(this.currentValueTokenName, "*");

        });

            return this;
    };


    inputfield.prototype.refreshable = function () {
        
        var multiBox = this.inputfieldComponent;
        var label = multiBox.$el.find("label").first();
        label.css("cssText", "display:inline");
        
        var icons = $('<span class="refreshButton inputAction"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span>');
        
        icons.mouseover(function () {
            multiBox.$el.find('.splunk-choice-input-message').css('cssText', 'font-size: 12px');
            multiBox.$el.find('.splunk-choice-input-message').text("Zurücksetzen auf Default-Wert");
        });
        
        icons.mouseout(function () {
            multiBox.$el.find('.splunk-choice-input-message').text("");
        });
        
        
        icons.on("click", function () {
            var defaultValue = multiBox.settings.get('default');
            multiBox.val(defaultValue);
        });

        var inputActions = multiBox.$el.find('.inputActions');
        if(inputActions.length == 0) {
            inputActions = $('<div class="inputActions"></div>');
            inputActions.insertAfter(label);
        }
        inputActions.append(icons);

        return this;
    }

    inputfield.prototype.sortable = function () { 
        var tokenName = this.formToken;
        this.inputfieldComponent.$el.find('[data-test="multiselect"]').sortable({
            cancel: '',
            items: "> button",
            update: function() {
                //get current sorting from input (buttons/label)
                var sortedInput = $(this).find('[data-test-value]').map(function(){
                    return $.trim($(this).attr('data-test-value'));
                }).get();
                //set current input as token (starts new search)
                defaultTokens.set(tokenName, sortedInput);
            }
        }).disableSelection();

        return this;
    }

    _.extend(inputfield.prototype, livesearch);

    return inputfield;

});
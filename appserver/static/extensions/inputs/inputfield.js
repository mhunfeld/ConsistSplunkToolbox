define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    '/static/app/ConsistSplunkToolbox/extensions/inputs/livesearch.js',
    '/static/app/ConsistSplunkToolbox/extensions/inputs/livesearch2.js',
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

        var icons = $('<button class="copyButton"></button>');
        icons.insertAfter(multiBox.$el.find('label').first());
        
        icons.mouseover(function () {
            multiBox.$el.find('.splunk-choice-input-message').css('cssText', 'font-size: 12px');
            multiBox.$el.find('.splunk-choice-input-message').text("Kopieren in Zwischenablage");
        });

        icons.mouseout(function () {
            multiBox.$el.find('.splunk-choice-input-message').text("");
        });
        
        icons.on("click", function () {
            var selectedValues = multiBox.$el.find('button > div > div');
            if (selectedValues[1].value != this.defaultValue) {
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
            }
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
            
            //Validation
            var reg = new RegExp('^(?:[0-9-*\s,]*$)');
            
            if (!pastedData.match(reg)){
                alert("Ungültige Wagennummer (Es müssen genau 12 Zahlen sein !!) : " + pastedData);
                return false;
            }
            
            var splittedDataCheck = pastedData.split(",");
            for (var i=0;i<splittedDataCheck.length;i++){
                var n = splittedDataCheck[i].indexOf("*");
                if (n == -1 && splittedDataCheck[i].length != 12){
                    alert("Ungültige Wagennummer (Es müssen genau 12 Zahlen, oder die Wildcard * vorhanden sein !!) : " + splittedDataCheck[i]);
                    return false;
                }
            } 

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
        multiBox.$el.find("label").css("cssText", "display:inline-block");
        
        var icons = $('<button class="refreshButton"></button>');
        
        icons.mouseover(function () {
            multiBox.$el.find('.splunk-choice-input-message').css('cssText', 'font-size: 12px');
            multiBox.$el.find('.splunk-choice-input-message').text("Zurücksetzen auf Alle");
        });
        
        icons.mouseout(function () {
            multiBox.$el.find('.splunk-choice-input-message').text("");
        });
        
        
        icons.on("click", function () {
            var defaultValue = multiBox.settings.get('default');
            multiBox.val(defaultValue);
        });

        icons.insertAfter(multiBox.$el.find('label').first());

        return this;
    }

    inputfield.prototype.sortable = function () { 
        var tokenName = this.formToken;
        this.inputfieldComponent.$el.find('[data-test="multiselect"]').sortable({
            cancel: '',
            items: "> button",
            update: function() {
                //get current sorting from input (buttons/label)
                var sortedInput = $(this).find('[data-test="label"]').map(function(){
                    return $.trim($(this).text());
                }).get();
                //set current input as token (starts new search)
                defaultTokens.set(tokenName, sortedInput);
            }
        }).disableSelection();

        return this;
    }

    inputfield.prototype.livesearch = livesearch;

    inputfield.prototype.livesearch2 = livesearch2;

    return inputfield;

});
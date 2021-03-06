define([ 'jquery',
'underscore',
'splunkjs/mvc',
'splunkjs/mvc/postprocessmanager',
'css!./multiselect.css'
], function($, _, mvc, PostProcessSearchManager){


    var defaultTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    
    //bereitet die Subsuche der Inputbox vor..
    var InputfieldSubsearch = function(baseSearch, searchByValueField, searchByLabelField, currentTokenname, inputfield) {

        this.currentValueTokenName = currentTokenname;
        this.inputfieldComponent = inputfield;

        function toListWithoutDefault(inputValue) {

            var returnValue = "";
    
            if(inputValue) {
                if(!Array.isArray(inputValue)) {
                    returnValue = (inputValue.includes('*') || inputValue.includes('1-1')) ? '""' : inputValue;
                } else {
                    returnValue ='"' + _.without(inputValue, '*', '1-1').join('", "') + '"';
                }
            }
            return returnValue;
        }
        
        function createSubSearchQuery(searchByValueField, searchByLabelField, currentValueTokenName, inputfieldSettings) {
    
            //TODO: search by value oder search by label per Parameter einfügen
            var valueField = inputfieldSettings.get('valueField'); 
            var labelField = inputfieldSettings.get('labelField');
            var tokenName = inputfieldSettings.get('token');
            
            //add current value from inputfield to search
            var inputFieldSearchByValueString = valueField + '=*$' + currentValueTokenName + '$* ';
            var inputFieldSearchByLabelString = labelField + '=*$' + currentValueTokenName + '$* ';

            var inputFieldSearchString = '|search ';
            inputFieldSearchString += searchByValueField ? inputFieldSearchByValueString : '';
            inputFieldSearchString += searchByValueField && searchByLabelField ? ' OR ' : '';
            inputFieldSearchString += searchByLabelField ? inputFieldSearchByLabelString : '';
            

            
            //add already selected values to search
            inputFieldSearchString += '$' + tokenName + '|excludeSelectedValue$ ';
            //prevent double values
            inputFieldSearchString += '| dedup ' + valueField + ' ';
            //rename output to value and label
            inputFieldSearchString += ' | eval value=' + valueField + ' , label=' + labelField + ' | fields value label ';
    
            return inputFieldSearchString
        }

        function excludeSelectedValue(inputValue) {
            if(inputValue.includes('"*"') || inputValue.includes('1-1')) {
                return "";
            }

            return inputValue.replace('=', '!=');
        }

        //als globale Filter setzen, damit diese Zusammen mit den Tokens verwendet werden können
        mvc.setFilter("toList", toListWithoutDefault);
        mvc.setFilter("excludeSelectedValue", excludeSelectedValue);

        //createSubsearchString
        var inputFieldSearchString = createSubSearchQuery(searchByValueField, searchByLabelField, currentTokenname, inputfield.settings);

        //createSearch
        this.inputFieldSearch = new PostProcessSearchManager({
            id: baseSearch + "_subsearch",
            managerid: baseSearch,
            search: inputFieldSearchString
        }, {tokens: true});
    
        return this.inputFieldSearch;
    }

    //Ändert das Verhalten der Standard Multiselectbox von Splunk, sodass Suchen bereits
    //während der Eingabe ausgeführt werden.
    var MultiValueLivesearchField = function(inputfield, currentValueTokenName) {
        this.inputfieldComponent = inputfield;
        this.currentValueTokenName = currentValueTokenName;

        this.inputfieldComponent.$el.on('input', 'input' , function(event) { 
            var currentVal = $(event.currentTarget).val();
            if(currentVal.indexOf("*") === -1) {
                event.stopPropagation();
            }
        });

        //Einmal feuern, wenn drilldown-Wert angegeben, damit Wert aus Drilldown in inputbox geladen wird
        if(!(_.isEmpty(_.difference(this.inputfieldComponent.val(), this.inputfieldComponent.settings.get('default'))) 
            && _.isEmpty(_.difference(this.inputfieldComponent.settings.get('default'), this.inputfieldComponent.val())))) {
            submittedTokens.set(this.currentValueTokenName, "*");
            defaultTokens.set(this.currentValueTokenName, "*");
        }


        this.inputfieldComponent.$el.focusout(setCurrentValue);
        this.inputfieldComponent.$el.focusin(setCurrentValue);

        function setCurrentValue(){
            //sobald das Inputfield des focus verliert, 
            //auch den Suchtoken für inputsearch wieder zurücksetzen
            this.currentValue = '';
            defaultTokens.set(currentValueTokenName, '*');
            submittedTokens.set(currentValueTokenName, '*');
        }
        
        //stop splunk internal events to prevent clearing inputfield
        this.inputfieldComponent.$el.on('keyup', 'input' , _.debounce(function(event) {
            var currentVal = $(event.currentTarget).val();

            //nur Chars, keine Steuerzeichen beachten
            if(event.key === 'Backspace' || event.key === 'Delete' || event.key.length === 1 && event.key !== '*') {
               this.currentValue = currentVal;
               defaultTokens.set(currentValueTokenName, currentVal);
               submittedTokens.set(currentValueTokenName, currentVal);
               //event aufhalten, damit unser input erhalten bleibt
            //    event.stopPropagation();
            //    console.log(new Date().valueOf());
               return;
            } 
        }, 1000));


        this.setChoices = function setChoicesOnInput(newChoices) {
            var defaultValue = (this.inputfieldComponent.settings.get('default') instanceof Array) ? this.inputfieldComponent.settings.get('default')[0] : '';

            var selectedValues = this.inputfieldComponent.val();

            //eigentlich gar nicht rausgeben, sondern nur input intern...
            var defaultChoices = _.filter(this.inputfieldComponent.settings.get('choices'), function(choice) {
                return choice.value === defaultValue 
                    || (_.contains(selectedValues, choice.value));
            });


            //Bug-Fix: wir bekommen aktuell auch die Ergebnisse der Base-Search
            //da diese nicht zu unseren erwarteten Suchergebnis passt, wird undefined/undefined
            //in die Inputs eingetragen
            newChoices = _.filter(newChoices, function(choice) {
                return choice.value && choice.label;
            })
            
            newChoices = _.union(newChoices, defaultChoices);
            
            var inputField = this.inputfieldComponent.$el.find('input');
            //gerade eingetippten Wert merken
            var tmpInputSearchVal = inputField.val();

            //neue Auswahl als Choices an Inputbox hinterlegen
            this.inputfieldComponent.settings.set('choices', newChoices);
    
            //akutellen Wert wieder in html-inputfield setzen, da es beim einsetzen der neuen Choices überschrieben wird
            inputField.val(tmpInputSearchVal);
        }
    }


    return {

        livesearch: function livesearch(options) {
    
            this.livesearchField = new MultiValueLivesearchField(this.inputfieldComponent, this.currentValueTokenName);

            this.searchByValueField = options.searchByValueField == undefined ? true : options.searchByValueField; //default = true
            this.searchByLabelField = options.searchByLabelField == undefined ? false : options.searchByLabelField; //default = false
            this.inputSearchManager = new InputfieldSubsearch(options.baseSearch, this.searchByValueField, this.searchByLabelField, this.currentValueTokenName, this.inputfieldComponent);
            this.count = options.count || 10;

    
            this.searchResults = this.inputSearchManager.data('preview', {
                output_mode: 'json',
                count: this.count
            });

            //Da results.on(data) nicht feuert, wenn es keine Ergebnisse gibt, 
            //brauchen wir diese sonderfall behandlung :(
            this.inputSearchManager.on('search:done', function(state, job){
                if(state.content.resultCount == 0 || !this.searchResults.hasData()) {
                    this.livesearchField.setChoices([]);
                }
            }.bind(this));
    
            
            this.searchResults.on("data", function(results){
                var newChoices = this.searchResults.hasData() ? this.searchResults.data().results.slice() : [];
                this.livesearchField.setChoices(newChoices)
            }, this);
    
    
            this.livesearchField.inputfieldComponent.on('change', function() {
                this.livesearchField.currentValue = '';
                var innerInputField = this.livesearchField.inputfieldComponent.$el.find('input');
                innerInputField.val('');
                defaultTokens.set(this.currentValueTokenName, "*");
                submittedTokens.set(this.currentValueTokenName, "*");
            }, this);
         
            return this;
        }
    }
    
});


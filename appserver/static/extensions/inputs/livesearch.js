define([ 'jquery',
'underscore',
'splunkjs/mvc',
'splunkjs/mvc/postprocessmanager',
'css!./inputfield.css'
], function($, _, mvc, PostProcessSearchManager){


    var defaultTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    
    //bereitet die Subsuche der Inputbox vor..
    var InputfieldSubsearch = function(baseSearch, currentTokenname, inputfield, dependencies) {

        this.currentValueTokenName = currentTokenname;
        this.inputfieldComponent = inputfield;

        function removeDatamodelPrefix(inputValue) {  
            var transformedValue = inputValue.replace(/db_rsi_wi_\w{4}_dm[\w_]*?_root./g, "");
            transformedValue = transformedValue.replace(/WithNull/g, "");
            return transformedValue;
        }

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
        
        function createSubSearchQuery(currentValueTokenName, inputfieldSettings, dependencies) {
    
            var valueField = inputfieldSettings.get('valueField'); 
            var labelField = inputfieldSettings.get('labelField');
            var tokenName = inputfieldSettings.get('token');
            
            //add current value from inputfield to search
            var inputFieldSearchString = '|search ' + valueField + '="*$' + currentValueTokenName + '$*" ';
            
            //add already selected values to search
            inputFieldSearchString += '$' + tokenName + '|appendSelectedValues$ ';
          
            //add selected values from dependency inputifelds to search
            if(dependencies) {
                _.each(dependencies, function(dependency) {
                    var dependencyInputComponent = mvc.Components.get(dependency);

                    if(!dependencyInputComponent) {
                        throw "No dependent inputfield found with id: " + dependency;
                    }

                    inputFieldSearchString += '$' + dependencyInputComponent.settings.get('token') + '|toFilterDependentFields$ ';
                });
            }
    
            //prevent double values
            inputFieldSearchString += '| dedup ' + valueField;
    
            //add sorting: already selected values has to be on top
            inputFieldSearchString += '| eval sortKey = if(in(' + valueField + ', $form.' + tokenName + '|toList$), 0, 1) | sort sortKey '
            
            //rename output to value and label
            inputFieldSearchString += ' | eval value= ' + valueField + ', label=' + labelField + ' | fields value label';
    
            return inputFieldSearchString
        }

        function appendSelectedValues(inputValue) {
            if(inputValue.includes('"*"') || inputValue.includes('1-1')) {
                return "";
            }

            var transformedValue = removeDatamodelPrefix(inputValue);

            if(transformedValue.includes('*') || transformedValue.includes('1-1')) {
                var searchTearms = transformedValue.split('OR');

                //Wildcard muss explizit ausgeschlossen werden
                var wildcardSearchTearm = _.filter(searchTearms, function(value) {
                    return value.includes('*');
                }).join();

                wildcardSearchTearm = wildcardSearchTearm.replace('=', '!=').replace('(', '').replace(')', '')

                //Wildcard-Suchstring entfernen
                var newTearm = _.filter(searchTearms, function(value) {
                    return !value.includes('*');
                })
                
                //Dieser Teil der Suche muss als Ergebnis zwingend mit zurückkommen, 
                //damit die Inputbox weiterhin funktioniert.. 
                //gefilterterter Wert wieder mit OR verbinden und Klammern entfernen
                newTearm = newTearm.join(' OR ')
                    .replace('(', '')
                    .replace(')', '');
                //nur wenn auch was drinne steht mit OR verknüpfen
                newTearm = newTearm !== '' ? ' OR ' + newTearm : "";

                return newTearm + ' AND ' + wildcardSearchTearm;
            }

            
            return 'OR ' + transformedValue;
        }

        //als globale Filter setzen, damit diese Zusammen mit den Tokens verwendet werden können
        mvc.setFilter("toFilterDependentFields", removeDatamodelPrefix);
        mvc.setFilter("toList", toListWithoutDefault);
        mvc.setFilter("appendSelectedValues", appendSelectedValues);

        //createSubserachString
        var inputFieldSearchString = createSubSearchQuery(currentTokenname, inputfield.settings, dependencies);

        //createSearch
        this.inputFieldSearch = new PostProcessSearchManager({
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
        if(!(_.isEmpty(_.difference(this.inputfieldComponent.val(), this.inputfieldComponent.settings.get('default'))) && _.isEmpty(_.difference(this.inputfieldComponent.settings.get('default'), this.inputfieldComponent.val())))) {
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
        this.inputfieldComponent.$el.on('keyup keydown', 'input' , function(event) {
            var currentVal = $(event.currentTarget).val();

            //nur Chars, keine Steuerzeichen beachten
            if(event.key === 'Backspace' || event.key === 'Delete' || event.key.length === 1 && event.key !== '*') {
               this.currentValue = currentVal;
               defaultTokens.set(currentValueTokenName, currentVal);
               submittedTokens.set(currentValueTokenName, currentVal);
               //event aufhalten, damit unser input erhalten bleibt
               event.stopPropagation();
               return;
            } 
        });


        this.setChoices = function setChoicesOnInput(newChoices) {
            var defaultValue = (this.inputfieldComponent.settings.get('default') instanceof Array) ? this.inputfieldComponent.settings.get('default')[0] : '';

            var selectedValues = this.inputfieldComponent.val();

            //eigentlich gar nicht rausgeben, sondern nur input intern...
            var defaultChoices = _.filter(this.inputfieldComponent.settings.get('choices'), function(choice) {
                return choice.value === defaultValue 
                    || (_.contains(selectedValues, choice.value) && !_.contains(_.pluck(newChoices, 'value'), choice.value));
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

        //gibt die Anzahl der ausgewählten Filter ohne Default-Wert und WildCard-Suchen zurück
        this.getNumberOfSelectedValues = function toArrayLengthWithoutDefault() {
    
            var inputValue = this.inputfieldComponent.val();
            var returnValue = 0;
            if(!Array.isArray(inputValue)) {
                returnValue += (inputValue.includes('*') || inputValue.includes('1-1')) ? 0 : 1;
            } else {
                returnValue += (inputValue.includes('*') || inputValue.includes('1-1')) ? 0 : inputValue.length;
            }
            return returnValue;
        }
    
    }


    return function livesearch(options) {

        this.livesearchField = new MultiValueLivesearchField(this.inputfieldComponent, this.currentValueTokenName);
        this.inputSearchManager = new InputfieldSubsearch(options.baseSearch, this.currentValueTokenName, this.inputfieldComponent, options.dependencies);

        //Da results.on(data) nicht feuert, wenn es keine Ergebnisse gibt, 
        //brauchen wir diese sonderfall behandlung :(
        this.inputSearchManager.on('search:done', function(state, job){
            if(state.content.resultCount == 0 || !this.searchResults.hasData()) {
                this.livesearchField.setChoices([]);
            }
        }.bind(this));

        this.searchResults = this.inputSearchManager.data('preview', {
            output_mode: 'json',
            count: (this.livesearchField.getNumberOfSelectedValues() + 10) 
        });
        
        this.searchResults.on("data", function(results){
            var newChoices = this.searchResults.hasData() ? this.searchResults.data().results.slice() : [];
            this.livesearchField.setChoices(newChoices)
        }, this);


        this.livesearchField.inputfieldComponent.on('change', function() {
            this.searchResults.set("count", this.livesearchField.getNumberOfSelectedValues() + 10);
            this.livesearchField.currentValue = '';
            var innerInputField = this.livesearchField.inputfieldComponent.$el.find('input');
            innerInputField.val('');
            defaultTokens.set(this.currentValueTokenName, "*");
            submittedTokens.set(this.currentValueTokenName, "*");
        }, this);
     
        return this;
    }
});


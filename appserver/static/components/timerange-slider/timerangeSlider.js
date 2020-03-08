define([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'css!/static/app/ConsistSplunkToolbox/components/timerange-slider/timeRangeSlider.css'
], function ($, _, Backbone, mvc) { 


    var TimerangeSlider = Backbone.View.extend({

        sliderTemplate: _.template(' <input type="range" min=<%=min%> max=<%=max%> value=<%=value%> step=<%=step%> class="slider" id=<%=id%> />'),
        labelTemplate: _.template('<label><%=label%></label>'),
        valueLabelTemplate: _.template('<span class="slider-value"><%=labelPrefix%> <%=value%> <%=labelSuffix%></span>'),

        tagName: 'div',
        
        className: 'slidecontainer',

        defaultTokens: mvc.Components.getInstance('default'),

        submittedTokens: mvc.Components.getInstance('submitted'),

        urlTokens: mvc.Components.getInstance("url"),

        defaultOptions:  {
            'min': '0',
            'max': '100',
            'step':'10',
            'value': '0',
            'prefix': '',
            'suffix': '',
            'labelPrefix': '',
            'labelSuffix': '',
        },

        events: {
            'change .slider': 'onChange'
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaultOptions, options);
            this.token = options.token;
            this.options.value = options.defaultValue;
            this.submitButton = mvc.Components.get('submit');
        },

        render: function() {
            this.$el.empty();
            this.options.label && this.$el.append(this.labelTemplate(this.options));
            this.$el.append(this.sliderTemplate(this.options));
            this.$el.append(this.valueLabelTemplate(this.options));
        },

        onChange: function(event) {
            var selectedValue = $(event.currentTarget).val();
            var tokenValue = this.options.prefix + selectedValue + this.options.suffix; 
            this.defaultTokens.set(this.token, tokenValue);
            this.defaultTokens.set('form.' + this.token,tokenValue);

            if(!this.submitButton) {
                this.submitTokens(tokenValue);
            }

            this.options.value = selectedValue;
            this.render();
        }, 

        submitTokens: function(selectedValue) {
            this.submittedTokens.set(this.token, selectedValue);
            this.submittedTokens.set('form.' + this.token, selectedValue);

            this.urlTokens.set('form.' + this.token,  selectedValue);
            this.urlTokens.pushState(this.urlTokens.encode());
        }

    });


    class TimerangeSliderElement extends HTMLElement {
        constructor() {
            super();
            let options = {};

            options['id'] = this.getAttribute('id');
            options['token'] = this.getAttribute('token');

            options['label'] = this.getProperty('label');
            options['min'] = this.getProperty('min');
            options['max'] = this.getProperty('max');
            options['defaultValue'] = this.getProperty('defaultValue');
            options['step'] = this.getProperty('step');
            options['prefix'] = this.getProperty('prefix');
            options['suffix'] = this.getProperty('suffix');
            options['labelPrefix'] = this.getProperty('labelPrefix');
            options['labelSuffix'] = this.getProperty('labelSuffix');

            let timerangeSlider = new TimerangeSlider(options);

            timerangeSlider.render();
            let parentSelector = this.getProperty('parentElement');
            //Workaround, wenn WebComponent mit Splunk-default Inputs genutzt wird
            if(parentSelector) {
                this.addToParent(parentSelector, timerangeSlider.el);
            } else {
                this.appendChild(timerangeSlider.el);
            }
        }

        addToParent(parentSelector, element) {
            if(parentSelector) {
                let parent = document.getElementById(parentSelector);
                if(parent) {
                    parent.firstElementChild.getElementsByClassName('fieldset').item(0).append(element);
                }
            }
        }

        getProperty(propertyName) {

            let propertyList = this.getElementsByTagName(propertyName);
            //TODO: Fehlerhandling, Meldung an Nutzer, wenn falsche Config
            if(propertyList.length == 1) {
                let property = propertyList.item(0);
                let propertyValue = property.innerText;
                property.remove();
    
                return propertyValue;
            }
            return '';
        }
    }

    customElements.define('co-timerange-slider', TimerangeSliderElement);

    return TimerangeSlider;

});
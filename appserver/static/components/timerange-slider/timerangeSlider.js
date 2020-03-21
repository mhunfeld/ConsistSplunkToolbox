define([
    'jquery',
    'underscore',
    'splunkjs/mvc/simplesplunkview',
    'splunkjs/mvc',
    '../../utils/theme-utils.js',
    'css!./timeRangeSlider.css'
], function ($, _, SimpleSplunkView, mvc, themeUtils) { 

    var TimerangeSlider = SimpleSplunkView.extend({

        sliderTemplate: _.template(' <input type="range" min=<%=min%> max=<%=max%> value=<%=value%> step=<%=step%> class="time-slider <%=theme%>" id=<%=id%> />'),
        labelTemplate: _.template('<label><%=label%></label>'),
        valueLabelTemplate: _.template('<span class="time-slider-value <%=theme%>"><%=labelPrefix%> <%=value%> <%=labelSuffix%></span>'),

        tagName: 'div',
        
        className: 'time-slider-container',

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
            'change .time-slider': 'onChange'
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaultOptions, options);
            this.token = options.token;
            this.options.value = options.defaultValue;
            this.submitButton = mvc.Components.get('submit');

            this.options.theme = options.theme || themeUtils.getCurrentTheme();
        },

        render: function() {
            this.$el.empty();
            this.options.label && this.$el.append(this.labelTemplate(this.options));
            this.$el.append(this.sliderTemplate(this.options));
            this.$el.append(this.valueLabelTemplate(this.options));
            this.$el.addClass(this.options.theme);
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

            options['label'] = this.getOption('label');
            options['min'] = this.getOption('min');
            options['max'] = this.getOption('max');
            options['defaultValue'] = this.getOption('defaultValue');
            options['step'] = this.getOption('step');
            options['prefix'] = this.getOption('prefix');
            options['suffix'] = this.getOption('suffix');
            options['labelPrefix'] = this.getOption('labelPrefix');
            options['labelSuffix'] = this.getOption('labelSuffix');

            let timerangeSlider = new TimerangeSlider(options);

            timerangeSlider.render();
            let parentSelector = this.getOption('parentElement');
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

        getOption(optionName) {

            let optionList = this.getElementsByTagName(optionName);
            if(optionList.length == 1) {
                let option = optionList.item(0);
                let optionValue = option.innerText;
                option.remove();
    
                return optionValue;
            }
            return '';
        }
    }

    customElements.define('co-timerange-slider', TimerangeSliderElement);

    return TimerangeSlider;

});
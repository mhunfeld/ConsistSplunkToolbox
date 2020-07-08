define([
    'jquery',
    'underscore',
    'splunkjs/mvc/baseinputview',
    'splunkjs/mvc',
    '../../utils/theme-utils.js',
    'css!./rangeSlider.css'
], function ($, _, BaseInputView, mvc, themeUtils) { 

    var RangeSlider = BaseInputView.extend({

        sliderTemplate: _.template(' <input type="range" min=<%=min%> max=<%=max%> value=<%=value%> step=<%=step%> class="range-slider <%=theme%>" id=<%=id%> />'),
        labelTemplate: _.template('<label><%=label%></label>'),
        valueLabelTemplate: _.template('<span class="range-slider-value <%=theme%>"><%=labelPrefix%> <%=value%> <%=labelSuffix%></span>'),

        tagName: 'div',
        
        className: 'range-slider-container',

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
            'labelSuffix': ''
        },

        events: {
            'change .range-slider': 'onChange'
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaultOptions, options);
            this.options.value = options.defaultValue;
            this.options.theme = options.theme || themeUtils.getCurrentTheme();

            RangeSlider.__super__.initialize.apply(this, arguments);

            this.token = options.token;
            this.submitButton = mvc.Components.get('submit');
        },

        render: function() {
            console.log('render');
            this.$el.empty();
            this.settings.get('label') && this.$el.append(this.labelTemplate(this.settings.attributes));
            this.$el.append(this.sliderTemplate(this.settings.attributes));
            this.$el.append(this.valueLabelTemplate(this.settings.attributes));
            this.$el.addClass(this.settings.get('theme'));
            this.$el.find('.range-slider').trigger('change');
        },

        onChange: function(event) {
            console.log('change');
            var selectedValue = $(event.currentTarget).val();
            var tokenValue = this.settings.get('prefix') + selectedValue + this.settings.get('suffix'); 
            this.defaultTokens.set(this.token, tokenValue);
            this.defaultTokens.set('form.' + this.token, tokenValue);

            if(!this.submitButton) {
                this.submitTokens(tokenValue);
            }

            this.settings.set('value', selectedValue);
           // this.render();
        }, 

        submitTokens: function(selectedValue) {
            this.submittedTokens.set(this.token, selectedValue);
            this.submittedTokens.set('form.' + this.token, selectedValue);

            this.urlTokens.set('form.' + this.token,  selectedValue);
            this.urlTokens.pushState(this.urlTokens.encode());
        }

    });

    return RangeSlider;

});
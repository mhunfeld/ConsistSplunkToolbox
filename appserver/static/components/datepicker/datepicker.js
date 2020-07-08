require.config({
    paths: {
      "momentV2": "/static/app/ConsistSplunkToolbox/components/datepicker/vendor/daterangepicker/moment.min",
      "daterangepicker": "/static/app/ConsistSplunkToolbox/components/datepicker/vendor/daterangepicker/daterangepicker"
    },
    map: {
        'daterangepicker': {
            'moment': 'momentV2'
        }
    },
    shim: {
        "daterangepicker": {
            deps: [
                'moment', 
                'jquery',
                'css!/static/app/ConsistSplunkToolbox/components/datepicker/vendor/daterangepicker/daterangepicker.css'
            ]
        }
    }
});


define([
    'jquery',
    'underscore',
    'splunkjs/mvc/baseinputview',
    'splunkjs/mvc',
    '../../utils/theme-utils.js',
    'momentV2',
    'daterangepicker',
    'css!./customDatepicker.css'
], function ($, _, BaseInputView, mvc, themeUtils) { 

    var Datepicker = BaseInputView.extend({

        inputTemplate: _.template('<span class="icon-calendar datepicker-input"><span></span> <i class="icon-triangle-down-small"></i></span>'),

        labelTemplate: _.template('<label><%=label%></label>'),

        tagName: 'div',
        
        className: 'datepicker',
        
        defaultTokens: mvc.Components.getInstance('default'),

        submittedTokens: mvc.Components.getInstance('submitted'),

        urlTokens: mvc.Components.getInstance("url"),

        defaultOptions:  {
             
        },

        defaultSingleOptions:  {
            opens: 'right',
            singleDatePicker: true,
            autoUpdateInput: true,
            autoApply: true,
            locale: this.germanLocale,
            timePicker: !!0,
            timePicker24Hour: !!0
        },

        germanLocale: {
            format: "DD.MM.YYYY",
            separator: " - ",
            applyLabel: "Anwenden",
            cancelLabel: "Verwerfen",
            fromLabel: "Von",
            toLabel: "Bis",
            customRangeLabel: "Custom",
            weekLabel: "W",
            daysOfWeek: [
                "So",
                "Mo",
                "Di",
                "Mi",
                "Do",
                "Fr",
                "Sa"
            ],
            monthNames: [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ],
            firstDay: 1
        },

        events: {
            'change .datepicker-input': 'onChange'
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaultOptions, options);
            this.options.theme = options.theme || themeUtils.getCurrentTheme();

            Datepicker.__super__.initialize.apply(this, arguments);

            this.token = options.token;
            this.submitButton = mvc.Components.get('submit');
        },

        render: function() {
            if(!this.daterangepicker) {
                this.$el.empty();
                this.settings.get('label') && this.$el.append(this.labelTemplate(this.settings.attributes));
                this.$el.append(this.inputTemplate(this.settings.attributes));
                this.$el.addClass(this.settings.get('theme'));
                this.daterangepicker = this.$el.find('.datepicker-input').daterangepicker(this.defaultSingleOptions);
                this.daterangepicker.on("apply.daterangepicker", this.onChange.bind(this));
                $('.daterangepicker').addClass(this.settings.get('theme'));
                this.$el.find('.range-slider').trigger('change');
            }
        },

        onChange: function(event, picker) {
            console.log('change');

            var formattedDate = picker.startDate.format(this.germanLocale.format);
            var date = picker.startDate.unix();
            picker.element.find('span').text(formattedDate);
            this.defaultTokens.set(this.token, date);
            this.defaultTokens.set('form.' + this.token, date);

            //TODO: zusätzlich prüfen: "searchWhenChanged=true"
            if(!this.submitButton) {
                this.submitTokens(date);
            }

            this.settings.set('value', date);
           // this.render();
        }, 

        submitTokens: function(selectedValue) {
            this.submittedTokens.set(this.token, selectedValue);
            this.submittedTokens.set('form.' + this.token, selectedValue);

            this.urlTokens.set('form.' + this.token,  selectedValue);
            this.urlTokens.pushState(this.urlTokens.encode());
        }

    });

    return Datepicker;

});
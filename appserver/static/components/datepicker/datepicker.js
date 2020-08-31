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
], function ($, _, BaseInputView, mvc, themeUtils, moment) { 

    var Datepicker = BaseInputView.extend({

        inputTemplate: _.template('<div class="datepicker input"><span class="icon-calendar datepicker-input"><span class="date-label"></span> <i class="icon-triangle-down-small"></i></span></div>'),

        labelTemplate: _.template('<label><%=label%></label>'),

        tagName: 'div',
        
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

        defaultRangeOptions: {
            opens: 'right',
            singleDatePicker: false,
            autoUpdateInput: true,
            autoApply: true,
            locale: this.germanLocale
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
            this.datepickerOptions = !!options.asRange ? this.defaultRangeOptions : this.defaultSingleOptions;
            this.datepickerOptions = _.extend({}, this.datepickerOptions, options.datepickerOptions)
            this.isRangeDate = !!options.asRange;

            this.render();
        },

        render: function() {
            if(!this.daterangepicker) {
                this.$el.empty();
                this.settings.get('label') && this.$el.append(this.labelTemplate(this.settings.attributes));
                this.$el.append(this.inputTemplate(this.settings.attributes));
                this.$el.addClass(this.settings.get('theme'));

                this.daterangepicker = this.$el.find('.datepicker').daterangepicker(this.datepickerOptions);
                this.daterangepicker.on("apply.daterangepicker", this.onChange.bind(this));
                $('.daterangepicker').addClass(this.settings.get('theme'));

                if(this.isRangeDate) {
                    var startDate = this.getInitStartDate(this.token);
                    var endDate = this.getInitEndDate(this.token);
                    this.$el.find('.date-label').text(startDate.format(this.germanLocale.format) + ' - ' + endDate.format(this.germanLocale.format));
                } else {
                    var startDate = this.getInitSingleDate(this.token);
                    this.$el.find('.date-label').text(startDate.format(this.germanLocale.format));
                }

                this.bindDatePickerToInputfieldToken(this.token);
            }
        },


        setTokens: function(token, value) {
            this.defaultTokens.set(token, value);
            this.submittedTokens.set(token, value);
            this.defaultTokens.set('form.' + token,  value);
            this.submittedTokens.set('form.' + token,  value);
            this.urlTokens.set('form.' + token,  value);
            this.urlTokens.pushState(this.urlTokens.encode());
        },
    
        getInitStartDate: function(inputfieldToken) {
            //if not set, set to now
            if(this.urlTokens.get('form.' + inputfieldToken + '.earliest')) {
                var startDate = moment.unix(this.urlTokens.get('form.' + inputfieldToken + '.earliest'));
            } else if(this.submittedTokens.get('form.' + inputfieldToken + '.earliest')) {
                var startDate = moment.unix(this.submittedTokens.get('form.' + inputfieldToken + '.earliest'));
            } else {
                var startDate = moment();
            }
            
            this.setTokens(inputfieldToken + '.earliest', startDate.startOf('day').unix());
            return startDate;
        },

        getInitSingleDate: function(inputfieldToken) {
            //if not set, set to now
            if(this.urlTokens.get('form.' + inputfieldToken)) {
                var startDate = moment.unix(this.urlTokens.get('form.' + inputfieldToken));
            } else if(this.submittedTokens.get('form.' + inputfieldToken)) {
                var startDate = moment.unix(this.submittedTokens.get('form.' + inputfieldToken));
            } else {
                var startDate = moment();
            }
            
            this.setTokens(inputfieldToken, startDate.endOf('day').unix());
            return startDate;
        },
    
        getInitEndDate: function(inputfieldToken) {
            
            if(this.urlTokens.get('form.' + inputfieldToken + '.latest')) {
                var endDate = moment.unix(this.urlTokens.get('form.' + inputfieldToken + '.latest'));
            } else if(this.submittedTokens.get('form.' + inputfieldToken + '.latest')) {
                var endDate = moment.unix(this.urlTokens.get('form.' + inputfieldToken + '.latest'));
            } else {
                var endDate = moment();
            }
    
            this.setTokens(inputfieldToken + '.latest', endDate.endOf('day').unix());
            return endDate;
        },
    
        bindDatePickerToInputfieldToken: function(inputfieldToken) {
            var datePicker = this.daterangepicker.data('daterangepicker');
            if(this.isRangeDate) {
                //set Datepicker if token has changed
                this.defaultTokens.on('change:form.' + inputfieldToken + '.earliest', function(newIndexName, tokValue, options) {
                    datePicker.setStartDate(moment.unix(tokValue));
                });
        
                this.defaultTokens.on('change:form.' + inputfieldToken + '.latest', function(newIndexName, tokValue, options) {
                    datePicker.setEndDate(moment.unix(tokValue));
                });
            } else {
                this.defaultTokens.on('change:form.' + inputfieldToken, function(newIndexName, tokValue, options) {
                    datePicker.setStartDate(moment.unix(tokValue));
                });
            }
        },

        onInputReady: function() {
            console.log("huhu")
        },

        onChange: function(event, picker) {
            console.log('change');

            if(this.isRangeDate) {
                var formattedEarliestDate = picker.startDate.format(this.germanLocale.format);
                var earliestDate = picker.startDate.unix();
                this.defaultTokens.set(this.token + ".earliest", earliestDate);
                this.defaultTokens.set('form.' + this.token + ".earliest", earliestDate);

                var formattedLatestDate = picker.endDate.format(this.germanLocale.format);
                var latestDate = picker.endDate.unix();
                this.defaultTokens.set(this.token + ".latest", latestDate);
                this.defaultTokens.set('form.' + this.token + ".latest", latestDate);

                picker.element.find('.date-label').text(formattedEarliestDate + ' - ' + formattedLatestDate);
            } else {
                var formattedDate = picker.startDate.format(this.germanLocale.format);
                var date = picker.startDate.unix();
                picker.element.find('.date-label').text(formattedDate);
                this.defaultTokens.set(this.token, date);
                this.defaultTokens.set('form.' + this.token, date);
            }

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

require.config({
    paths: {
      "momentV2": "/static/app/db_rsi_wi_1web_u/customDatepicker/vendor/daterangepicker/moment.min",
      "daterangepicker": "/static/app/db_rsi_wi_1web_u/customDatepicker/vendor/daterangepicker/daterangepicker"
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
                'css!/static/app/db_rsi_wi_1web_u/customDatepicker/vendor/daterangepicker/daterangepicker.css'
            ]
        }
    }
});


define([
    'underscore',
    'splunkjs/mvc',
    'momentV2',
    'daterangepicker',
    'css!./customDatepicker.css'
], function(_, mvc, moment) {

    var deDELocaleSettings =  {
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
    };

    function getNowTimestamp() {
       return moment().unix();
    }

    function toMomentObject(timestamp) {
        return moment.unix(timestamp);
    }

    var defaultTokens = mvc.Components.getInstance("default");
    var submittedTokens = mvc.Components.getInstance("submitted");
    var urlTokens = mvc.Components.getInstance("url");

    var setTokens = function(token, value) {
        defaultTokens.set(token, value);
        submittedTokens.set(token, value);
        defaultTokens.set('form.' + token,  value);
        submittedTokens.set('form.' + token,  value);
        urlTokens.set('form.' + token,  value);
        urlTokens.pushState(urlTokens.encode());
    }

    var getInitStartDate = function(inputfieldToken) {
        //if not set, set to now
        if(urlTokens.get('form.' + inputfieldToken + '.earliest')) {
            var startDate = toMomentObject(urlTokens.get('form.' + inputfieldToken + '.earliest'));
        } else if(submittedTokens.get('form.' + inputfieldToken + '.earliest')) {
            var startDate = toMomentObject(submittedTokens.get('form.' + inputfieldToken + '.earliest'));
        } else {
            var startDate = moment();
        }
        
        setTokens(inputfieldToken + '.earliest', startDate.startOf('day').unix());
        return startDate;
    }

    var getInitEndDate = function(inputfieldToken) {
        
        if(urlTokens.get('form.' + inputfieldToken + '.latest')) {
            var endDate = toMomentObject(urlTokens.get('form.' + inputfieldToken + '.latest'));
        } else if(submittedTokens.get('form.' + inputfieldToken + '.latest')) {
            var endDate = toMomentObject(urlTokens.get('form.' + inputfieldToken + '.latest'));
        } else {
            var endDate = moment();
        }

        setTokens(inputfieldToken + '.latest', endDate.endOf('day').unix());
        return endDate;
    }

    var bindDatePickerToInputfieldToken = function(datePicker, inputfieldToken) {
        //set Datepicker if token has changed
        defaultTokens.on('change:form.' + inputfieldToken + '.earliest', function(newIndexName, tokValue, options) {
            datePicker.setStartDate(toMomentObject(tokValue));
        });

        defaultTokens.on('change:form.' + inputfieldToken + '.latest', function(newIndexName, tokValue, options) {
            datePicker.setEndDate(toMomentObject(tokValue));
        });
    }

    return {
        asRange: function(selector, options) {
            var inputfield = mvc.Components.get(selector);

            if(inputfield.settings.get('type') !== 'text') {
                throw new Error('Selected field is not a textfield');
            }

            var inputfieldToken = inputfield.settings.get('token');

            var startDate = getInitStartDate(inputfieldToken);
            var endDate = getInitEndDate(inputfieldToken);
            inputfield.val(startDate.format(deDELocaleSettings.format) - endDate.format(deDELocaleSettings.format));

            inputfield.$el.find('input').attr('autocomplete', 'new-password');
            //wichtig, damit input in filterComponent identifiziert werden kann.
            inputfield.$el.addClass('custom-timepicker');
            inputfield.$el.find('input').daterangepicker({
                                        opens: options.opens,
                                        singleDatePicker: false,
                                        startDate: startDate,
                                        endDate: endDate,
                                        autoUpdateInput: true,
                                        autoApply: true,
                                        locale: deDELocaleSettings
                                    },
                                    function(start, end, label) {
                                        setTokens(inputfieldToken + '.earliest', start.startOf('day').unix());
                                        setTokens(inputfieldToken + '.latest',  end.endOf('day').unix()); 
                                        inputfield.val('' + start.format(deDELocaleSettings.format) + ' - ' + end.format(deDELocaleSettings.format));                                       
                                    });

            var datePicker = inputfield.$el.find('input').data('daterangepicker');
            bindDatePickerToInputfieldToken(datePicker, inputfieldToken);
        },
        asSingleDate: function(selector, options) {
            options = options || {}
            var inputfield = mvc.Components.get(selector);

            if(inputfield.settings.get('type') !== 'text') {
                throw new Error('Selected field is not a textfield');
            }

            inputfield.$el.find('input').hide();
            inputfield.$el.append('<input type="text" class="datepickerInput" name="lname">');
            var datePickerInput = inputfield.$el.find('.datepickerInput');
            datePickerInput.attr('autocomplete', 'new-password');
            var inputfieldToken = inputfield.settings.get('token');

            datePickerInput.on('change', function(event){
                var currentValue = $(event.currentTarget).val();
                if(!currentValue) {
                    defaultTokens.unset('form.' + inputfieldToken);
                }
            });

            var locale = _.extend({}, deDELocaleSettings, {format: "YYYY-MM-DD HH:mm:ss"}, options.locale);
            
            setDate(defaultTokens.get(inputfieldToken), inputfield);

            var datepickerOptions = {
                opens: 'right',
                singleDatePicker: true,
                autoUpdateInput: false,
                autoApply: true,
                locale: locale,
                timePicker: !!options.timePicker,
                timePicker24Hour: !!options.timePicker24Hour,
                maxDate: options.maxDate && moment(),
                minDate: options.minDate && moment()
            }

            var datepicker = datePickerInput.daterangepicker(datepickerOptions);

            datepicker.on("apply.daterangepicker", function (e, picker) {
                picker.element.val(picker.startDate.format(locale.format));
                setTokens(inputfieldToken, picker.startDate.unix());
            });
            

            defaultTokens.on('change:form.' + inputfieldToken, function(newIndexName, tokValue, options) {
                setDate(tokValue, inputfield);
                
            });

            function setDate(tokValue, inputfield) {
                var inputfieldTokenname = inputfield.settings.get('token');
                var tokenTimestamp = getEpochTimestamp(tokValue);
                var datepickerTimestamp = getFormattedTime(tokenTimestamp);

                setTokens(inputfieldTokenname, tokenTimestamp);
                setDatepickerValue(datepickerTimestamp);
            }


            function setDatepickerValue(formattedTime) {
                var datepicker = datePickerInput.data('daterangepicker');
                if(datepicker) {
                    datepicker.element.val(formattedTime);
                } else {
                    datePickerInput.val(formattedTime);
                }
            }

            function getEpochTimestamp(tokValue) {
                if(tokValue === 'now') {
                    return moment().unix();
                } 
                return tokValue;
            }

            function getFormattedTime(tokValue) {
                if(tokValue) {
                    return toMomentObject(tokValue).format(locale.format);
                }
                //leeres Feld so lassen
                return tokValue;
            }

            return {
                reset: function() {
                    var timestamp = getEpochTimestamp('now');
                    setDatepickerValue(getFormattedTime());
                    defaultTokens.set(inputfieldToken, timestamp);
                }
            }
        },
        
    }
});
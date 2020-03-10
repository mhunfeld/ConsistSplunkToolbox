require([
    'underscore',
    'jquery',
    '/static/app/ConsistSplunkToolbox/components/timerange-slider/timerangeSlider.js',
    '/static/app/ConsistSplunkToolbox/utils/showtokens.js',
    'splunkjs/mvc/simplexml/ready!'
], function( 
        _,
        $,
        TimerangeSlider
    ){


        var testSlider = new TimerangeSlider({
            label: 'Slider as Backbone View',
            min: 0,
            max: 96,
            defaultValue: 24,
            step:   12,
            id: 'my-range-slider',
            token: 'slider_tok',
            prefix: '@',
            suffix: 'h',
            id: 'js-Component'
        });
        testSlider.render();

        $('#customFieldset .fieldset').append(testSlider.el);


    });
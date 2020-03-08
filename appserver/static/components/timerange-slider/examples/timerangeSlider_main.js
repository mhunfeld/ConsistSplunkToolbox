require([
    'backbone',
    'underscore',
    'jquery',
    'splunkjs/mvc',
    '/static/app/ConsistSplunkToolbox/components/timerange-slider/timerangeSlider.js',
    '/static/app/ConsistSplunkToolbox/utils/showtokens.js',
    'splunkjs/mvc/simplexml/ready!'
], function( 
        Backbone,
        _,
        $,
        mvc, 
        TimerangeSlider
    ){


        // var testSlider = new TimerangeSlider({
        //     label: 'TEST Slider',
        //     min: 0,
        //     max: 96,
        //     defaultValue: 24,
        //     step:   12,
        //     id: 'my-range-slider',
        //     token: 'slider_tok',
        //     prefix: '@',
        //     suffix: 'h'
        // });
        // testSlider.render();

        // $('#customFieldset .fieldset').append(testSlider.el);


    });
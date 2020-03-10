require([
    'backbone',
    'underscore',
    'jquery',
    'splunkjs/mvc',
    '/static/app/ConsistSplunkToolbox/extensions/inputs/inputfield.js',
    "splunkjs/mvc/multidropdownview",
    '/static/app/ConsistSplunkToolbox/utils/showtokens.js',
    'css!/static/app/ConsistSplunkToolbox/material-iconfont/material-icons.css',
    'splunkjs/mvc/simplexml/ready!'
], function( 
    Backbone,
        _,
        $,
        mvc, 
        Input,
        DropdownView
    ){


        var input1 = new Input('field1');
        input1.smartDefaultValue();

        var input2 = new Input('field2');
        input2.sortable();

        var input3 = new Input('field3');
        input3.applyCopyToClipboard();

        var region = new Input('region');
        region.smartDefaultValue();
        region.livesearch({
            baseSearch: 'regionSearch',
        });

        var country = new Input('country');
        country.smartDefaultValue();
        country.livesearch({
            baseSearch: 'countrySearch',
            dependencies: [
                'region'
                ]
        });

        var region2 = new Input('region2');
        region2.smartDefaultValue();
        region2.livesearch2({
            baseSearch: 'regionSearch2',
        });


       
});

//@ sourceURL=inputfields_main.js
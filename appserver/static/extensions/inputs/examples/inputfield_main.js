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

        new Input('field3')
            .applyCopyToClipboard()
            .pastable()
            .refreshable();


        var region = new Input('region');
        region.smartDefaultValue();
        region.livesearch({
            baseSearch: 'regionSearch',
        });

        var country = new Input('country');
        country.smartDefaultValue();
        country.livesearch({
            baseSearch: 'countrySearch',
            count: 20
        });
       
});

//@ sourceURL=inputfields_main.js
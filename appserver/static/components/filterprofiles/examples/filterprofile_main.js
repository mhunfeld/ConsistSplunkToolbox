require([
    'backbone',
    'underscore',
    'jquery',
    '/static/app/ConsistSplunkToolbox/components/filterprofiles/filterprofile.js',
    '/static/app/ConsistSplunkToolbox/utils/showtokens.js',
    'css!/static/app/ConsistSplunkToolbox/material-iconfont/material-icons.css',
    'splunkjs/mvc/simplexml/ready!'
], function( 
    Backbone,
        _,
        $, 
        Filterprofile
    ){
        $('.dashboard-view-controls').prepend('<div id="filterprofile" />');
    
        var filterprofiles = new Filterprofile({
            el: '#filterprofile',                                           //HTML-Anker
            collection: 'filterprofiles',                                   //Name der KV-Store Collection
            kvStoreEndpoint: "/servicesNS/nobody/ConsistSplunkToolbox/"     //Name des KV-Store Endpoints
        });
    
        filterprofiles.addAllInputfields();
});

//@ sourceURL=filterprofile_main.js
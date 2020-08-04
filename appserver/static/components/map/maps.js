define([
    'underscore',
    'backbone',
    'leaflet',
    'splunkjs/mvc',
    'splunkjs/mvc/simplesplunkview',
    "splunkjs/mvc/resultslinkview",
    "splunkjs/mvc/progressbarview",
    '../../utils/theme-utils.js',
    './vendor/spin.js/spin.js',
    './vendor/leaflet.spin.js',
    'leafletGestureHandling',
    'css!./maps.css'
], function(_, Backbone, L, mvc, SimpleSplunkView, ResultsLinkView, ProgressBarView, themeUtils) {

    var submittedTokens = mvc.Components.get('submitted');

    //TODO: strg zoom/zoom konfigurierbar machen (ggf. input mit cookies?)
    var MapView = SimpleSplunkView.extend({

        tagName: 'div',

        mapDefaultOptions:  {
            contextmenu: false,
            minZoom: 1,
            maxZoom: 19, 
            gestureHandling: true, 
            center: [51.3148025, 9.3205324],
            zoom: 6, 
            scale: true
        },

        scaleDefaults: {
            position: 
            'bottomleft', 
            imperial: false
        },

        defaultOptions:  {

        },
       
        initialize: function(options) {
            MapView.__super__.initialize.apply(this, arguments);
            this.options = _.extend({}, this.defaultOptions, options);
            this.mapOptions = _.extend({}, this.mapDefaultOptions, options.mapOptions);
            this.id = options.id;
            this.options.theme = options.theme || themeUtils.getCurrentTheme();
            this.render();

            this.$el.addClass('map-view');
            
            // if(!this.leafletMap) {
            //    this.initLeafletMap(options);
               //TODO: raus oder an Panel
            //    if(options.resizable) {
            //        this.$el.resizable({
            //             handles:'s',
            //            stop: function(e,ui) {
            //                this.refresh();
            //             }.bind(this)
            //        });
            //    }
            // }


           return this;
        },

        render: function() {
            if(!this.leafletMap) {
                this.initLeafletMap(this.options);
            }
            this.$el.addClass(this.options.theme);
            this.refresh();
            return this;
        },

        initLeafletMap: function(options) {
            this.leafletMap = L.map(this.el, this.mapOptions);
            
            if(this.mapOptions.scale) {
                var scaleOptions = _.extend({}, this.scaleDefaults, options.scaleOptions);
                L.control.scale(scaleOptions).addTo(this.leafletMap);
            }

            //TODO: ggf. konfigurierbar
            var sortFunction = function(layerA, layerB, nameA, nameB) {
                if(_.isNumber(nameA) && _.isNumber(nameB)) {
                    return parseInt(nameA) > parseInt(nameB)
                }
                return nameA > nameB;
            }

            //TODO: control konfigurierbar machen, default = da und mit layers
            this.control = L.control.layers(null, null, { collapsed: true, sortLayers: true, sortFunction: sortFunction});
            this.control.addTo(this.leafletMap);

            this.customTileLayerHandler = new CustomTileLayerHandler(this.leafletMap, this.control);
            this.customTileLayerHandler.createTileLayers();
        },

        showProgress: function(showProgress) {
            if(this.isProgress != showProgress) {
                this.leafletMap.spin(showProgress);
                this.isProgress = showProgress;
            }
            this.refresh();
        },

        //TODO: addToControl
        getControl: function() {
            return this.control;
        },

        //TODO: möglichst kein Leaflet rausgeben
        getLeafletMap: function() {
            return this.leafletMap;
        },

        addLayer: function(layer) {
            this.leafletMap.addLayer(layer);
        },

        addLayers: function(layers) {
            _.each(layers, function(layer) {
                this.leafletMap.addLayer(layer);
            }, this);
        },

        removeLayer: function(layer) {
            this.leafletMap.removeLayer(layer);
        },

        fitBounds: function(layer) {
            var bounds = new L.LatLngBounds();
            this.leafletMap.eachLayer(function (layer) {
                if (layer instanceof L.FeatureGroup) {
                    bounds.extend(layer.getBounds());
                }
            });
            if (bounds.isValid()) {
                this.leafletMap.fitBounds(bounds);
            } else {
                this.leafletMap.fitWorld();
            }
        },

        initGestureHandling: function(token) {
            
            this.toggleGestureHandling(submittedTokens.get(token));

            submittedTokens.on('change:' + token, function(object, tokValue) {
                this.toggleGestureHandling(tokValue);
            }, this);
        },

        toggleGestureHandling: function(enable) {
            if(enable === 'withcontrol') {
                this.leafletMap.gestureHandling.enable();
            } else {
                this.leafletMap.gestureHandling.disable();
            }
        },

        // Resize the Map 
        refresh: function callResizeEvent () {
            if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
                var evt = document.createEvent('UIEvents');
                evt.initUIEvent('resize', true, false, window, 0);
                window.dispatchEvent(evt);
            } else {
                window.dispatchEvent(new Event('resize'));
            }
        }


    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                  CUSTOM Tile Layers                                                                                                      //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var TILE_LAYERS =  [ // Define Constant collection of tilelayers
        {
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
            "name": "OpenStreetMap",
            "url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "minZoom": 1,
            "maxZoom": 19,
            "sortingIndex" : 1,
            "isOverlay": false 
        },
        {
            "url":'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
            "attribution": 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. '
                            + 'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
            "name":"Hoher Kontrast",
            "minZoom": 1,
            "maxZoom": 16,
            "sortingIndex": 5,
            "isOverlay": false
        },
        {
            "attribution": "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
            "name": "OpenStreetMap Graustufen",
            "url": "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
            "minZoom": 1,
            "maxZoom": 19,
            "sortingIndex": 2,
            "isOverlay": false
        },
        {
            "attribution": "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            "name": "Satellit",
            "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            "minZoom": 1,
            "maxZoom": 19,
            "sortingIndex": 3,
            "isOverlay": false
        },
        {
            "name":"Gelände",
            "url":'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
            "attribution": 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. '
                            + 'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
            "minZoom": 1,
            "maxZoom": 18,
            "sortingIndex": 4,
            "isOverlay": false
        }
        // ,
        // {
        //     "name":"Dark",
        //     "url": 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', 
        //     "minZoom": 1,
	    //     "maxZoom": 20,
	    //     "attribution": '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        //     "sortingIndex": 4,
        //     "isOverlay": false
        // }
    ];

    var CustomTileLayerHandler = function(map, control) {
        this.map = map;
        this.control = control;
        this.baselayerDictionary = [];
    }

    CustomTileLayerHandler.prototype.createTileLayers = function() {
        this.baselayerDictionary.forEach(function(element) {
            this.control.removeLayer(element);
            this.map.removeLayer(element);
        });

        this.tileLayer = undefined;
        this.baselayerDictionary = [];

        _.each(TILE_LAYERS, function(layerConfig) {
            var tileLayer = L.tileLayer(layerConfig.url, layerConfig);
            this.baselayerDictionary.push(tileLayer);
            
            if(!layerConfig.isOverlay) {
                this.control.addBaseLayer(tileLayer, layerConfig.name);
            }

            if (!this.tileLayer) {
                this.tileLayer = tileLayer;
                this.map.addLayer(this.tileLayer);
            }
        }, this);

        return this.tileLayer;
    }; 

    
    return  {
        MapView: MapView
    }
});
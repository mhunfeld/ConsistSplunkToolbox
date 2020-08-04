define([
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/simplesplunkview',
    './pieChartLight.js',
    'markercluster',
    'css!../customIconFont/customFontStyles.css'
], function(_, Backbone, mvc, SimpleSplunkView, ClusterPieChart) {

    var submittedTokens = mvc.Components.get('submitted');
    var defaultTokens = mvc.Components.get('default');
    
    function createIcon(data) {

        var style = 'background-color: ' + data.markerColor + '; width: 32px; height: 32px';

        var pie = L.DomUtil.create('div');
        pie.className = 'pie';
        pie.style = style;

        var myIcon = L.DomUtil.create('div');
        myIcon.className = 'custom-icon custom-icon-wagonFill';
        pie.appendChild(myIcon);

        var divIcon = new L.DivIcon({
            html: pie,
            className: 'marker', 
            iconSize: new L.Point(32, 32)
        });

        return divIcon;
    }

    var CssClusterMarkerView = SimpleSplunkView.extend({

        outputMode: 'json',

        initialize: function(options) {
            CssClusterMarkerView.__super__.initialize.apply(this, arguments);

            this.mapView = mvc.Components.get(options.mapView);
            this.drilldownToken = options.drilldownToken;

            var clusterPieChartCreator = new ClusterPieChart.PieChartCluster(this.mapView.getLeafletMap(), this.markerLegend);
            this.createPieChartIcon = clusterPieChartCreator.createPieChartClusterIcon.bind(clusterPieChartCreator);
            this.legend = new ClusterPieChart.MarkerLegend(this.mapView.getLeafletMap());

            this.searchManager = mvc.Components.get(options.managerid);

            this.listenTo(this.searchManager, 'search:start', this.onSearchStart);
            this.listenTo(this.searchManager, 'search:done', this.onSearchDone);

            //paging
            this.count = 50000;
            this.offset = 0;
            this.page = 0;
            this.currentResultCount = 0;

            this.markerMap = new Map();

            this.mapView.addResultsLink({
                id: options.id + "resultsLink",
                managerid: options.managerid
            });

            this.mapView.addProgressBar({
                id: options.id + "prgressBar",
                managerid: options.managerid
            });

            this.ceateMarkerClusterGroup();
        },

        getMarkerById: function(value) {
            return this.markerMap.get(value);
        },

        onSearchStart: function() {
            if(this.markerClusterGroup) {
                this.markerClusterGroup.clearLayers();
                this.legend.remove();
            }

            this.markerMap = new Map();

            //reset paging
            this.offset = 0;
            this.page = 0;
            this.currentResultCount = 0;
            this.resultcount = 0;
            this.paging = false;


            this.resultsModel.set('count', this.count);
            this.resultsModel.set('offset', this.offset);
            this.mapView.showProgress(true);
            this.mapView.showMessage();
        },

        onSearchDone: function(job) {
            this.resultCount = job.content.resultCount;
            this.mapView.showProgress(false);
        },

        createView: function() {
            return this;
        },

        formatData: function(data) {
            //alle mit 0/0 entfernen
            var filteredWithoutPosition = _.filter(data, function(wagon) {
                return wagon["latitude"] != 0 || wagon["longitude"] != 0;
            });
            return filteredWithoutPosition;
        },
        
        displayMessage: function(messages) {
            if(messages instanceof Object) {
                this.mapView.showMessage(messages);
            } 
        },


        addMarkersToClusterGroup: function(markerList) {
            this.markerClusterGroup.addLayer(markerList);
            this.mapView.fitBounds(markerList);
        }, 

        ceateMarkerClusterGroup: function() {
            if(!this.markerClusterGroup) {
                this.markerClusterGroup = L.markerClusterGroup({
                    chunkedLoading: false,
                    iconCreateFunction: this.createPieChartIcon,
                    singleMarkerMode: true,
                    removeOutsideVisibleBounds: true
                });
                this.mapView.addLayer(this.markerClusterGroup);
            }
        }, 

        createMarker: function(data) {

            var markerMap = data.reduce(function(markerMap, entry) {
                var marker = L.marker([parseFloat(entry["latitude"]),
                                     parseFloat(entry["longitude"])]);   
                
                marker.markerState = entry.markerState;
                marker.markerColor = entry.markerColor;
                marker.id = entry.id;

                if(entry.description) {
                    marker.bindPopup(entry.description);
                } else if(this.popupRenderer && this.popupRenderer.canRender(entry)) {
                    var popup = this.popupRenderer.render(entry);
                    marker.bindPopup(popup);
                }

                if(this.drilldownToken) {
                    marker.on('dblclick', function(drilldownToken, event) {
                        var marker = event.sourceTarget;
                        submittedTokens.set(drilldownToken, marker['id']);
                        defaultTokens.set(drilldownToken, marker['id']);
                    }.bind(undefined, this.drilldownToken));
                }

                markerMap.set(marker.id, marker);
                return markerMap;
            }.bind(this), new Map());

            
            var featureGroup = new L.featureGroup(Array.from(markerMap.values()));
            this.markerMap = new Map([...this.markerMap, ...markerMap]);
            return featureGroup;
        },

        addPopupRenderer: function(popupRenderer) {
            this.popupRenderer = popupRenderer;
        },

        // renderPopup: function(entry) {
        //     var compiledTemplate = _.template(this.templateString);
        //     return compiledTemplate({data: entry, tokens: defaultTokens});
        // },

        updateView: function(viz, data) { 
            
            this.currentResultCount = data.length;
            this.offset += data.length;            
            
            if(!this.paging && this.currentResultCount != this.count ) {
                this.markerClusterGroup.clearLayers();
            } 
            
            var markerFeatureGroup = this.createMarker(data);
            this.addMarkersToClusterGroup(markerFeatureGroup);
            this.legend.renderLegend(data);

            if(this.resultCount > this.offset) {
                this.resultsModel.set("offset", this.offset);
                this.paging = true;
            } else {
                this.mapView.showProgress(false);
            }
        }, 

        addDrilldownHighlight: function(token) {
            var closePopupDrilldown = function(activeMarker) {
                defaultTokens.unset(token);
                submittedTokens.unset(token);
            };
            
            var closeActiveMarker = function(activeMarker, closePopupDrilldown) {
                if(activeMarker) {
                    activeMarker.off('popupclose', closePopupDrilldown);
                    activeMarker.closePopup();
                }
            };

            defaultTokens.on('change:' + token, function(_, value) {
                
                if(value) {
                    
                    closeActiveMarker(this.activeMarker, closePopupDrilldown);
                    this.activeMarker = this.getMarkerById(value);
                    this.markerClusterGroup.zoomToShowLayer(this.activeMarker, function(activeMarker) {
                        if(!activeMarker.isPopupOpen()){
                            activeMarker.openPopup();
                            activeMarker.on('popupclose', closePopupDrilldown);
                        }
                    }.bind(undefined, this.activeMarker));
                }
            }, this);

        }

    });

    /////////////////////////PopupRenderer////////////////////////////
    var BasePopupRenderer = function() {
        this.initialize.apply(this, arguments)
    };

    _.extend(BasePopupRenderer.prototype, Backbone.Events, {
        initialize: function() {},
        canRender: function(data) {
            throw new Error("Must implement method canRender.")
        },
        setup: function(data) {},
        teardown: function(data) {},
        render: function(data) {}
    });
    
    BasePopupRenderer.prototype.constructor = BasePopupRenderer;

    BasePopupRenderer.extend = Backbone.Model.extend;

    CssClusterMarkerView.BasePopupRenderer = BasePopupRenderer;

    /////////////////////////////////////////////////////////////////////
    return CssClusterMarkerView;
});
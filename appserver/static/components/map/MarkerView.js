define([
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/simplesplunkview',
    './BaseMapsDataView.js',
    './MarkerRenderer.js'
], function(_, Backbone, mvc, SimpleSplunkView, BaseMapsDataView, MarkerRenderer) {

    var submittedTokens = mvc.Components.get('submitted');
    var defaultTokens = mvc.Components.get('default');

    var MarkerView = BaseMapsDataView.extend({

        outputMode: 'json',

        initialize: function(options) {
            MarkerView.__super__.initialize.apply(this, arguments);
            this.options = options;
            this.markerLayers = L.featureGroup();
        },

        onSearchStart: function() {
            MarkerView.__super__.onSearchStart.apply(this, arguments);
            this.removeLayers();
        },

        createView: function() {
            return this;
        },

        formatData: function(data) {

            //alle mit 0/0 entfernen
            var filteredWithoutPosition = _.filter(data, function(wagon) {
                return wagon["latitude"] != 0 || wagon["longitude"] != 0;
            });

            return data;
        },

        getMarkerById: function(value) {
            var marker = undefined;

            var marker = _.findWhere(this.markerList, {id: value});
            
            return marker;
        },

        addPopupRenderer: function(popupRenderer) {
            this.popupRenderer = popupRenderer;
        },

        updateView: function(viz, data) {  
            this.drawMarkers(data);
            this.mapView.addLayer(this.markerLayers);
            this.mapView.refresh();
            this.mapView.fitBounds();
            this.mapView.showProgress(false);
        }, 

        removeLayers: function() {
              if(this.markerLayers) {
                  this.markerLayers.clearLayers();
                  this.mapView.getControl().removeLayer(this.markerLayers);

              }
            this.markerList = [];
        },

        drawMarkers: function(data) {

            
            
            this.markerList = _.map(data, function(row, groupId) {
                                       
                    var markerCreator = MarkerRenderer.getMarkerCreator(row);
                    var marker = markerCreator.getMarker(row);
                    if(this.drilldownToken) {
                        marker.on('dblclick', function(drilldownToken, event) {
                            var marker = event.sourceTarget;
                            submittedTokens.set(drilldownToken, marker['id']);
                            defaultTokens.set(drilldownToken, marker['id']);
                        }.bind(undefined, this.drilldownToken));
                    }

                    if(row.description) {
                        marker.bindPopup(row.description);
                    } else if(this.popupRenderer && this.popupRenderer.canRender(row)) {
                        var popup = this.popupRenderer.render(row);
                        marker.bindPopup(popup);
                    }
                    return marker;

                }, this);


                this.markerLayers.addLayers(this.markerList);
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
                    if(!this.activeMarker.isPopupOpen()){
                        this.activeMarker.openPopup();
                        this.activeMarker.on('popupclose', closePopupDrilldown);
                    }
                }
            }, this);

        }
    });
    return MarkerView;
});
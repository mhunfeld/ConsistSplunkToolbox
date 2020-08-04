define([
    'underscore',
    'splunkjs/mvc',
    './BaseMapsDataView.js',
    './MarkerRenderer.js',
    './vendor/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js'
], function(_, mvc, BaseMapsDataView, MarkerRenderer) {

    var submittedTokens = mvc.Components.get('submitted');
    var defaultTokens = mvc.Components.get('default');

    var routeViewOptions = {
        groupBy: 'none',
        coloredRoutesByPathIdentifier: false,
        showDecorator: true,
        pathColorList: ['#55B9E6','#78BE14','#F75056','#FFD800','#55B9E6','#66A558'],
        decoratorColorList: ['#0087B9','#508B1B','#C50014','#FFBB00','#0087B9','#2A7230']
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var PolylineCreator = function(options, coloredRoutes) {
        this.defaults =  {
            pathWeight: 5,
            pathOpacity: 1
        }

        this.options = options;
        this.coloredRoutes = coloredRoutes;
    }

    PolylineCreator.prototype.convertHex = function(value) {
        // Pass markerColor prefixed with # regardless of given prefix ("#" or "0x")
        var hexRegex = /^(?:#|0x)([a-f\d]{6})$/i;
        if (hexRegex.test(value)) {
            var markerColor = "#" + hexRegex.exec(value)[1];
            return(markerColor);
        } else {
            return(value);
        }
    }

    PolylineCreator.prototype.addColoredRoutes = function(coloredRoutes) {
        this.coloredRoutes = coloredRoutes;
    }
    
    PolylineCreator.prototype.getCoordinates = function(data) {
        return L.latLng(data['latitude'], data['longitude']);

    }

    // PolylineCreator.prototype.getPolyline = function(lastCoordinates, data) {
    //     return L.polyline([lastCoordinates,this.getCoordinates(data)], this.getPolylineProperties(data));
    // }

    PolylineCreator.prototype.getPolyline = function(coordinates, data) {
        return L.polyline(coordinates, this.getPolylineProperties(data));
    }

    PolylineCreator.prototype.getPolylineProperties = function(data) {
        var polylineData = _.defaults(data, this.defaults);


        var polylineProperties = {
            'color': (_.has(polylineData, "pathColor")) ? polylineData["pathColor"] : this.getPathColor(data),
            'weight': polylineData.pathWeight,
            'opacity': polylineData.pathOpacity
        }

        return polylineProperties;
    }

    PolylineCreator.prototype.getPathColorFromList = function(data) {
        var colorIndex = this.options.coloredRoutesByPathIdentifier ?
            (_.indexOf(this.coloredRoutes, data['pathIdentifier']) % this.options.pathColorList.length) :
            2;

        return this.options.pathColorList[colorIndex];
    };
    PolylineCreator.prototype.getPathColor = function(data) {
        var pathColor = data.pathColor ? data.pathColor : this.getPathColorFromList(data);

        return this.convertHex(pathColor);
    };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var DecoratorCreator = function(options) {
        this.decoratorDefaults =  {
            offset: '50%',
            endOffset: '50%',
            repeat: '50%'
        }

        this.symbolPathOptionsDefaults =  {
            opacity:1.0,
            fillOpacity: 1.0,
            color: '#fff',
            fillColor: '#fff',
            weight: 1,
            stroke: 1,
            pixelSize : 100
        }

        this.symbolDefaults= {
            pixelSize: 8, 
            polygon: true, 
        }

        this.options = options;
    }


    DecoratorCreator.prototype.convertHex = function(value) {
        // Pass markerColor prefixed with # regardless of given prefix ("#" or "0x")
        var hexRegex = /^(?:#|0x)([a-f\d]{6})$/i;
        if (hexRegex.test(value)) {
            var markerColor = "#" + hexRegex.exec(value)[1];
            return(markerColor);
        } else {
            return(value);
        }
    }

    DecoratorCreator.prototype.addColoredRoutes = function(coloredRoutes) {
        this.coloredRoutes = coloredRoutes;
    }


    DecoratorCreator.prototype.createSymbol = function(data) {
        var symbolOptions = this.getSymbolOptions(data);
        return L.Symbol.arrowHead(symbolOptions);
     }

     DecoratorCreator.prototype.createDecorator = function(polyline, data) {

        var decoratorOptions = this.getDecoratorOptions(data);
        decoratorOptions.symbol = this.createSymbol(data);

        return L.polylineDecorator(polyline, {
            patterns: [
                    decoratorOptions
            ]
        })
    }
    
    DecoratorCreator.prototype.getDecoratorOptions = function(data) {
        var decoratorProperties = {
            offset: data['pathdecoratorOffset'], 
            repeat: data['pathdecoratorRepeat'], 
            endOffset: data['pathdecoratorEndoffset'],
        }
        decoratorProperties = _.defaults(decoratorProperties, this.decoratorDefaults);

        return decoratorProperties;
    }

    DecoratorCreator.prototype.getSymbolOptions = function(data) {

        var symbolPathOptions = {
            'color': (_.has(data, "decoratorColor")) ? data["decoratorColor"] : this.getDecoratorColor(data),
            'fillColor': (_.has(data, "decoratorColor")) ? data["decoratorColor"] : this.getDecoratorColor(data)
        };

        symbolPathOptions = _.defaults(symbolPathOptions, this.symbolPathOptionsDefaults);

        var symbolOptions = {
            pixelSize: Math.max(data['pathWeight'] - 2, this.symbolDefaults.pixelSize)
        }

        symbolOptions = _.defaults(symbolOptions, this.symbolDefaults);
        symbolOptions.pathOptions = symbolPathOptions
         
                              
        return symbolOptions;
    }

    DecoratorCreator.prototype.getDecoratorColor = function(data) {
        var colorIndex = this.options.coloredRoutesByPathIdentifier ?
                (_.indexOf(this.coloredRoutes, data['pathIdentifier']) % this.options.decoratorColorList.length) :
                2;
        return this.convertHex(this.options.decoratorColorList[colorIndex]);
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var RouteView = BaseMapsDataView.extend({

        outputMode: 'json',

        initialize: function(options) {
            RouteView.__super__.initialize.apply(this, arguments);

            this.options = _.defaults(options.routeViewOptions, routeViewOptions);

            this.polylineCreator = new PolylineCreator(this.options);
            this.decoratorCreator = new DecoratorCreator(this.options);

            //extending FeatureGroup to add an array of layers at once
            L.FeatureGroup.include({
                addLayers: function(layers) {
                    _.each(layers, function(layer) {
                        this.addLayer(layer);   
                    }, this);
                },
                addPolylinesWithDecorator: function(polylinesWithDecorator) {
                    

                    _.each(polylinesWithDecorator, function(polylineWithDecorator) {
                        polylineWithDecorator.decorator && this.addLayer(polylineWithDecorator.decorator);
                    }, this);

                    _.each(polylinesWithDecorator, function(polylineWithDecorator) {
                        polylineWithDecorator.polyline && this.addLayer(polylineWithDecorator.polyline);
                    }, this);

                    _.each(polylinesWithDecorator, function(polylineWithDecorator) {
                        polylineWithDecorator.marker && this.addLayer(polylineWithDecorator.marker);   
                    }, this);

                }
            });
        },

        onSearchStart: function() {
            this.removeLayers();
            this.pathLineLayers = {};
            this.markerLayers = {};
            RouteView.__super__.onSearchStart.apply(this, arguments);
        },

        formatData: function(data) {

            //alle mit 0/0 entfernen
            var filteredWithoutPosition = _.filter(data, function(wagon) {
                return wagon["latitude"] != 0 || wagon["longitude"] != 0;
            });

            if(this.options.coloredRoutesByPathIdentifier) {
                var coloredRoutes = _.union(_.pluck(filteredWithoutPosition, 'pathIdentifier'));

                this.polylineCreator.addColoredRoutes(coloredRoutes);
                this.decoratorCreator.addColoredRoutes(coloredRoutes);
            }

            var groupedData = _.groupBy(data, function(groupBy, data) {
                return data[groupBy];
            }.bind(undefined, this.options.groupBy));


            return groupedData;
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
            this.drawPath(data);
            this.mapView.addLayers(this.pathLineLayers);
            this.mapView.addLayers(this.markerLayers);
            _.each(this.markerLayers, function(layer){
                layer.bringToFront();
            });

            this.mapView.refresh();
            this.mapView.fitBounds();
            this.mapView.showProgress(false);
        }, 

        addLayers: function() {
            _.each(this.pathLineLayers, function(layer) {
                layer.addTo(this.mapView.getLeafletMap());   
                //this.mapView.getControl().addOverlay(layer, '<div class="dot" style="background:" + layer.options.name)
            }.bind(this));

            _.each(this.markerLayers, function(layer) {
                layer.addTo(this.mapView.getLeafletMap());   
            }.bind(this));
        },

        removeLayers: function() {
            _.each(this.pathLineLayers, function(layer, i) {
                layer.clearLayers();
                this.mapView.getControl().removeLayer(layer);
            }, this);

            _.each(this.markerLayers, function(layer, i) {
                layer.clearLayers();
                this.mapView.getControl().removeLayer(layer);
            }, this);

            this.markerList = [];
        },

        drawPath: function(groups) {

            this.pathLineLayers = _.map(groups, function(paths, groupId) {
                
                var lastCoordinates = null;

                var pathFeatureGroup = L.featureGroup();
                pathFeatureGroup.options.name = groupId;

                // var firstEntry = paths[0];

                // var lastCoordinates = this.polylineCreator.getCoordinates(firstEntry);
                
                // var polylines = _.map(paths, function(path) {
                //     var polyline = this.polylineCreator.getPolyline(lastCoordinates, path);
                    
                //     var decorator = "";
                //     if(this.options.showDecorator) {
                //         decorator = this.decoratorCreator.createDecorator(polyline, path);
                //     }
                    
                                       
                //     lastCoordinates = this.polylineCreator.getCoordinates(path);
                //     return {
                //         polyline: polyline,
                //         decorator: decorator
                //     };

                // }, this);

                var coordinates = _.map(paths, function(path) {
                    return L.latLng(
                        path.latitude,
                        path.longitude
                    );
                })

                var polylines = this.polylineCreator.getPolyline(coordinates, paths[0])

                pathFeatureGroup.addLayer(polylines);
                this.mapView.getControl().addOverlay(pathFeatureGroup, '<div class="dot" style="background:' + polylines.options.color + '"> </div>' + pathFeatureGroup.options.name)
                //pathFeatureGroup.addLayers(_.pluck(polylines, 'decorator'));

                return pathFeatureGroup;
            }, this);

           /* this.markerLayers = _.map(groups, function(paths, groupId) {
               
                var markerFeatureGroup = L.featureGroup();
                markerFeatureGroup.options.name = groupId + '_marker';

                var markers = _.map(paths, function(path) {
                                       
                    var markerCreator = MarkerRenderer.getMarkerCreator(path);
                    if(markerCreator) {
                        var marker = markerCreator.getMarker(path);
                        if(this.drilldownToken) {
                            marker.on('dblclick', function(drilldownToken, event) {
                                var marker = event.sourceTarget;
                                submittedTokens.set(drilldownToken, marker['id']);
                                defaultTokens.set(drilldownToken, marker['id']);
                            }.bind(undefined, this.drilldownToken));
                        }
    
                        if(path.description) {
                            marker.bindPopup(path.description);
                        } else if(this.popupRenderer && this.popupRenderer.canRender(path)) {
                            var popup = this.popupRenderer.render(path);
                            marker.bindPopup(popup);
                        }
                        return marker;
                    }

                }, this);


                markerFeatureGroup.addLayers(markers);

                this.markerList = markers;
                if(paths.length) {
                    var first = _.first(paths);
                    var startFlag = MarkerRenderer.getStartFlag(first);
                    markerFeatureGroup.addLayer(startFlag);
                    if(first.description) {
                        startFlag.bindPopup(first.description);
                    } else if(this.popupRenderer && this.popupRenderer.canRender(first)) {
                        var popup = this.popupRenderer.render(first);
                        startFlag.bindPopup(popup);
                    }

                    var last = _.last(paths);
                    var goalFlag = MarkerRenderer.getGoalFlag(last);
                    markerFeatureGroup.addLayer(goalFlag);
                    if(last.description) {
                        goalFlag.bindPopup(last.description);
                    } else if(this.popupRenderer && this.popupRenderer.canRender(last)) {
                        var popup = this.popupRenderer.render(last);
                        goalFlag.bindPopup(popup);
                    }
                }

                return markerFeatureGroup;
            }, this);*/
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

    return RouteView;
});
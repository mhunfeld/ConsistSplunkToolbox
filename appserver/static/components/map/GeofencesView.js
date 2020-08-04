    define([
        'underscore',
        'splunkjs/mvc',
    ],
        function (
            _,
            mvc
        ) {
    
            var defaultTokens = mvc.Components.get('default');

            var defaultColorList = [ '#F75056', '#78BE14', '#FFD800','#55B9E6','#66A558', '#0087B9','#508B1B','#55B9E6', '#C50014','#FFBB00','#0087B9','#2A7230'];

            var Geofences = function (map, geofencegroupToken, options) {
                this.mapView = mvc.Components.get(map);
                this.leafletMap = this.mapView.getLeafletMap();
                this.control = this.mapView.getControl();

                this.options = options || {};
                this.colorList = this.options.colorList || defaultColorList;

                this.overlaysDictionary = {};
             
                defaultTokens.on('change:' + geofencegroupToken, function(unused, geofencegroups) {
                    this.clearLayers();
                    geofencegroups && !geofencegroups.includes('comment') && !geofencegroups.includes('NA') && this.showGeofences(geofencegroups);
                }, this);

                var geofencegroups = defaultTokens.get(geofencegroupToken);
                geofencegroups && !geofencegroups.includes('comment') && !geofencegroups.includes('NA') && this.showGeofences(geofencegroups);
            }
    
            //TODO: mapview aufrufen und nicht direkt an leaflet
            Geofences.prototype.addLayer = function (layer) {
                this.leafletMap.addLayer(layer);
                var layerName = layer.controlName || layer.controlDescription;
                this.control.addOverlay(layer, layerName);
            };
    
            Geofences.prototype.showGeofences = function (geofencePreviews) {
    
                var geofencegruppen = geofencePreviews.split(",");

                //var geofencegruppe = geofencePreviews.split(",");
                
                _.each(geofencegruppen, function (geofencegruppe, index) {
                    if (geofencegruppe == "" || geofencegruppe == "-") { // catch empty string case
                        return;
                    }

                    //Workaround bis 
                    var splittedGeofenceGruppenInfo = geofencegruppe.split(';');
                    var geofencegruppenId = splittedGeofenceGruppenInfo[0];
                    var geofencegruppenName = splittedGeofenceGruppenInfo[1];
    
                    if (this.overlaysDictionary[geofencegruppenId]) {
                        var geofenceLayerGroup = this.overlaysDictionary[geofencegruppenId];
                        this.addLayer(geofenceLayerGroup);
                    } else {

                        if(geofencegruppenId.includes('geo_')) {
                            this.loadGeofenceGroupOld(geofencegruppenId);
                        } else {
                            this.loadGeofenceGroup(geofencegruppenId).done(this.parseGeofenceGroup.bind(this, geofencegruppenId, geofencegruppenName, index));
                        }
                    }
                }, this);
                
            };
            
            Geofences.prototype.loadGeofenceGroup = function(geofencegruppenId) {
                //TODO: neuen REST-Endpoint einbinden
                var url = location.origin + "/splunkd/__raw/services/db_rsi_wi_1web_u/geofences_proxy/" + geofencegruppenId;

                return $.ajax({
                    type: "GET",
                    url: url,
                    context: this,
                    cache: true,
                    timeout: 60000,
                    error: function (e) {
                        console.log("Error while executing Ajax call to geofenceProvider");
                        console.log(e);
                    }
                });
            }

            Geofences.prototype.loadGeofenceGroupOld = function(geofencegruppenId) {
                var url = location.origin + "/splunkd/__raw/services/db_rsi_wi_leaf_s/geofences/" + geofencegruppenId;
                $.ajax({
                    type: "GET",
                    url: url,
                    context: this,
                    cache: true,
                    timeout: 60000,
                    error: function (e) {
                        console.log("Error while executing Ajax call to geofenceProvider");
                        console.log(e);
                    }
                }).done(function (kml) {
                    var color = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';

                    var groupName = kml.groupname;
                    var shortGroupName = groupName.split("/geo_")[1];
                    var groupDescription =
                        "<span style='color:"
                        + color
                        + "'><i class='fa fa-square'></i> "
                        + shortGroupName
                        + "</span>";

                    var geojson = kml.geoJSON;
                    var layerGroup = L.layerGroup();
                    layerGroup.categoryName = groupName;
                    layerGroup.controlName = shortGroupName;
                    layerGroup.controlDescription = groupDescription;
                    L.geoJson(geojson.features, {
                        style: function (feature) {
                            return {
                                color: color
                            };
                        },

                        onEachFeature: function (feature, layer) {
                            //TODO: refactor
                            var fId = feature.properties.name;
                            // console.log(fId);
                            var text;
                            try {
                                var metaData = JSON.parse(fId);
                                text = "<table><tr><td><b id='textGrey'>Gruppe: </b></td>"
                                    + "<td class='textWhite'>" + shortGroupName + "</td></tr>"
                                    + "<tr><td class='textGrey'>Kategorie: </td>"
                                    + "<td class='textWhite'>" + metaData.category + "</td></tr>"
                                    + "<tr><td class='textGrey'>Ort: </td>"
                                    + "<td class='textWhite'>" + metaData.place + "</td></tr>"
                                    + "<tr><td class='textGrey'>Bezeichnung: </td>"
                                    + "<td class='textWhite'>" + metaData.description + "</td></tr>"
                                    + "<tr><td class='textGrey'>Subbezeichnung: </td>"
                                    + "<td class='textWhite'>" + metaData.subdescription + "</td></tr></table";
                            } catch (e) {
                                text = "<table><tr><td><b class='textGrey'>Gruppe: </b></td>"
                                    + "<td class='textWhite'>" + shortGroupName + "</td></tr>"
                                    + "<tr class='textWhite'>" + fId + "</tr></table>";
                            }

                            layer.bindPopup(text);
                            layerGroup.addLayer(layer);
                        }
                    });

                     // store layer into internal dictionary
                    try {
                        if (!this.overlaysDictionary[geofencegruppenId]) {
                            this.overlaysDictionary[geofencegruppenId] = layerGroup;
                            this.addLayer(layerGroup);
                        }
                    } catch (e) {
                        console.log("Error in geogeofencegruppenId request callback");
                        console.log(e);
                    }
                }, this);

            }


            Geofences.prototype.parseGeofenceGroup = function parseGeofenceGroup(geofencegruppenId, geofenceGruppenName, colorIndex, response) {

                //var color = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
                var color = this.colorList[colorIndex];

                var features = _.map(response.geofences, function(geofence) {
                    return {
                        type: 'Feature',
                        geometry: geofence.geofence,
                        properties: geofence.metadata,
                        name: geofence.name
                    }
                });

                var featureCollection = {
                    type: 'FeatureCollection',
                    features: features,
                    name: geofenceGruppenName
                }

                var groupDescription =
                    "<span style='color:"
                    + color
                    + "'><i class='fa fa-square'></i> "
                    + featureCollection.name
                    + "</span>";

                var layerGroup = L.layerGroup();
                layerGroup.categoryName = featureCollection.name;
                layerGroup.controlName = featureCollection.name;
                layerGroup.controlDescription = groupDescription;


                L.geoJson(featureCollection, {
                    style: function (feature) {
                        return {
                            color: color
                        };
                    },

                    onEachFeature: function (feature, layer) {
                        
                        var text = "<table><tr><td><b id='textGrey'>Gruppe: </b></td>"
                                + "<td class='textWhite'>" + featureCollection.name + "</td></tr>"
                                + "<tr><td class='textGrey'>Kategorie: </td>"
                                + "<td class='textWhite'>" + feature.properties.category + "</td></tr>"
                                + "<tr><td class='textGrey'>Ort: </td>"
                                + "<td class='textWhite'>" + feature.name + "</td></tr>"
                                + "<tr><td class='textGrey'>Bezeichnung: </td>"
                                + "<td class='textWhite'>" + feature.properties.description + "</td></tr>"
                                + "<tr><td class='textGrey'>Subbezeichnung: </td>"
                                + "<td class='textWhite'>" + feature.properties.subdescription + "</td></tr></table";
                        
                        layer.bindPopup(text);
                        layerGroup.addLayer(layer);
                    }
                });

                // store layer into internal dictionary
                try {
                    if (!this.overlaysDictionary[geofencegruppenId]) {
                        this.overlaysDictionary[geofencegruppenId] = layerGroup;
                        this.addLayer(layerGroup);
                    }
                } catch (e) {
                    console.log("Error in geogeofencegruppenId request callback");
                    console.log(e);
                }
            }
    
            //TODO: über Mapview und nicht direkt
            Geofences.prototype.clearLayers = function () {
                _.forEach(this.overlaysDictionary, function (overlay) {
                    this.control.removeLayer(overlay);
                    this.leafletMap.removeLayer(overlay);
                }, this);
            };
    
            return Geofences;
        });

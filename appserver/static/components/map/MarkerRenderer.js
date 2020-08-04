//TODO: MarkerRenderer
//CircleRenderer
//

define([
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/simplesplunkview',
    './vendor/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js',
    'leaflet.vector-markers'
], function(_, Backbone, mvc, SimpleSplunkView) {

    var submittedTokens = mvc.Components.get('submitted');
    var defaultTokens = mvc.Components.get('default');

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var VectorMarkerCreator = function(options, coloredRoutes) {
    this.iconDefaults = {
        markerColor: "#38AADD",
        markerSize: [35,45],
        markerAnchor: [15,50],
        shadowSize: [30,46],
        shadowAnchor:[30,30],
        icon: undefined,
        iconColor: '#fff',
        prefix: 'fa',
        extraClasses: 'fa-lg',
        popupAnchor: [-3, -35]
    }

    this.markerDefaults = {
        markerPane: 'markerPane',
        markerPriority: 0
    }
    
    this.colorList = ['#55B9E6','#78BE14','#F75056','#FFD800','#55B9E6','#66A558'],
    this.strokeColorList = ['#0087B9','#508B1B','#C50014','#FFBB00','#0087B9','#2A7230']

    this.options = options;
}

VectorMarkerCreator.prototype.convertHex = function(value) {
    // Pass markerColor prefixed with # regardless of given prefix ("#" or "0x")
    var hexRegex = /^(?:#|0x)([a-f\d]{6})$/i;
    if (hexRegex.test(value)) {
        var markerColor = "#" + hexRegex.exec(value)[1];
        return(markerColor);
    } else {
        return(value);
    }
}

VectorMarkerCreator.prototype.getCoordinates = function(data) {
    return L.latLng(data['latitude'], data['longitude']);

}

VectorMarkerCreator.prototype.getMarker = function(data) {

    var markerIcon = this.getIcon(data);
    var marker = L.marker(this.getCoordinates(data), this.getMarkerOptions(data, markerIcon));

    if(data.description) {
        marker.bindPopup(data.description);                   
    }

    
    marker.pathIdentifier = data.pathIdentifier;          
    marker.id = data.id;         

    return marker
}

VectorMarkerCreator.prototype.getIcon = function(data) {
    var iconOptions = this.getIconOptions(data);
    var markerIcon = L.VectorMarkers.icon(iconOptions);
    return markerIcon;
}

VectorMarkerCreator.prototype.getIconOptions = function(data) {
    var iconData = _.defaults(data, this.iconDefaults);

    var iconOptions = {
        icon: iconData.icon,
        iconColor: iconData.iconColor,
        markerColor: iconData.markerColor,
        shadowSize: iconData.shadowSize,
        shadowAnchor: iconData.shadowAnchor,
        extraIconClasses: iconData.extraClasses,
        prefix: iconData.prefix,
        popupAnchor: iconData.popupAnchor,
        iconSize: iconData.markerSize,
        iconAnchor: iconData.markerAnchor
    }
    return iconOptions;
}

VectorMarkerCreator.prototype.getMarkerOptions = function(data, markerIcon) {
    var markerData = _.defaults(data, this.markerDefaults);

    var markerOptions = {
        pane: markerData.markerPane,
        markerPriority: markerData.markerPriority,
        icon: markerIcon
    }
    return markerOptions;
}

VectorMarkerCreator.prototype.getPathColorFromList = function(data) {
    var colorIndex = this.options.coloredRoutesByPathIdentifier ?
        (_.indexOf(this.coloredRoutes, data['pathIdentifier']) % this.options.pathColorList.length) :
        0;

    return this.options.pathColorList[colorIndex];
};
VectorMarkerCreator.prototype.getPathColor = function(data) {
    var pathColor = data.pathColor ? data.pathColor : this.getPathColorFromList(data);

    return this.convertHex(pathColor);
};

var vectorMarkerCreator = new VectorMarkerCreator();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var CircleMarkerCreator = function(options, coloredRoutes) {
        this.defaults = {
            markerPane: 'markerPane',
            circleRadius: 10,
            circleStroke: true,
            circleColor: '#3388ff',
            circleWeight: 1,
            circleOpacity: 1.0,
            circleStrokeColor: '#3388ff',
            circleStrokeOpacity: 1.0
        }

        
        this.colorList = ['#55B9E6','#78BE14','#F75056','#FFD800','#55B9E6','#66A558'],
        this.strokeColorList = ['#0087B9','#508B1B','#C50014','#FFBB00','#0087B9','#2A7230']

        this.options = options;
    }

    CircleMarkerCreator.prototype.convertHex = function(value) {
        // Pass markerColor prefixed with # regardless of given prefix ("#" or "0x")
        var hexRegex = /^(?:#|0x)([a-f\d]{6})$/i;
        if (hexRegex.test(value)) {
            var markerColor = "#" + hexRegex.exec(value)[1];
            return(markerColor);
        } else {
            return(value);
        }
    }
    
    CircleMarkerCreator.prototype.getCoordinates = function(data) {
        return L.latLng(data['latitude'], data['longitude']);

    }

    CircleMarkerCreator.prototype.getMarker = function(data) {
        var marker = L.circleMarker(this.getCoordinates(data), this.getCircleProperties(data));

        if(data.description) {
            marker.bindPopup(data.description);
            marker.pathIdentifier = data.pathIdentifier;          
            marker.id = data.id;         
        }

        return marker
    }

    CircleMarkerCreator.prototype.getCircleProperties = function(data) {
        var circleData = _.defaults(data, this.defaults);

        var circleProperties = {
            pane: circleData.markerPane,
            radius: circleData.circleRadius,
            fill: circleData.circleStroke,
            color: circleData.circleStrokeColor,
            weight: circleData.circleWeight,
            opacity: circleData.circleStrokeOpacity,
            fillColor: circleData.circleColor,
            fillOpacity: circleData.circleOpacity
        }
        return circleProperties;
    }

    CircleMarkerCreator.prototype.getPathColorFromList = function(data) {
        var colorIndex = this.options.coloredRoutesByPathIdentifier ?
            (_.indexOf(this.coloredRoutes, data['pathIdentifier']) % this.options.pathColorList.length) :
            0;

        return this.options.pathColorList[colorIndex];
    };
    CircleMarkerCreator.prototype.getPathColor = function(data) {
        var pathColor = data.pathColor ? data.pathColor : this.getPathColorFromList(data);

        return this.convertHex(pathColor);
    };

    var circleMarkerCreator = new CircleMarkerCreator();


    ////////////////////////////////////////////////////////////////////////////////////////////

    var getStartFlag = function(firstDataRow) {
        var lat = firstDataRow['latitude'];
        var lon = firstDataRow['longitude'];
        var latlon = new L.LatLng(lat,lon);

        var startIcon = L.VectorMarkers.icon({
                markerPane: 'markerPane',
                icon: 'fa-flag',
                prefix: 'fa',
                markerColor: '#0087B9'
            });
        
        
        var startFlag = L.marker(latlon,{icon:startIcon, zIndexOffset:10000}).bindPopup(firstDataRow['description']);   
        
        startFlag.pathIdentifier = firstDataRow.pathIdentifier;          
        startFlag.id = firstDataRow.id;   
        return startFlag;
        
    };

    var getGoalFlag = function(lastDataRow) {
        var lat = lastDataRow['latitude'];
        var lon = lastDataRow['longitude'];
        var latlon = new L.LatLng(lat,lon);

        var goalIcon = L.VectorMarkers.icon({
            markerPane: 'markerPane',
            prefix: 'custom-icon',
            icon: 'custom-icon-wagonFill',
            markerColor: '#FE6972'
        });

        var goalFlag = L.marker(latlon,{icon: goalIcon, zIndexOffset:10000}).bindPopup(lastDataRow['description']);
        
        goalFlag.pathIdentifier = lastDataRow.pathIdentifier;          
        goalFlag.id = lastDataRow.id;  
        return goalFlag
    };

////////////////////////////////////////////////////////////////////////////////////////////
    var getMarkerCreator = function(data) {
        switch(data.markerType) {
            case 'circle':
                return circleMarkerCreator; 
                break;
            case 'svg': 
                return vectorMarkerCreator;
                break;
            default:
                break;
        }
    }


    return {
        getMarkerCreator: getMarkerCreator,
        getStartFlag: getStartFlag,
        getGoalFlag: getGoalFlag
    }

});
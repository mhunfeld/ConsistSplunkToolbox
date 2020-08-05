# MapView

The MapView is handling the general leaflet features. However, it does not include your own searches, but accepts and displays the data of the "subviews".

The MapView is "responsible" for the following features:

- Tile layer
- Control (showing and hiding layers)
- Ctrl zoom settings

Various subviews can be assigned to a map, which then display the actual data. Theoretically, several SubViews can be combined. 
The following subviews are currently available:

- ClusterMarkerView
- RouteView
- MarkerView


The subviews are described in more detail below.

### import and init:
```javascript
    require(['/static/app/ConsistSplunkToolbox/components/map/maps.js'], function(MapView) {

         var map = new MapView.MapView({
            id: 'map1',
            el: '#map'
        });

        map.initGestureHandling('conf_mapControlZoom_tok');
    });
```

### options:

| option              | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `id`                | string             | true     | ID of the view, with this id you can get the view from the Splunk-registry |
| `el`                | string             | false    | html-element for view, the Map will be appended to HTML-Element of el |

### public methods:
initGestureHandling: user can control zoom level of map by scroll wheel of mouse

```javascript
        map.initGestureHandling('conf_mapControlZoom_tok');
```

parameter: token name as string of the token which controls behavior:
- enabled: zoom with scroll-wheel
- withcontrol: STRG+scrool-wheel for zoom
- disabled: without zoom 

___

# ClusterMarkerView
With the ClusterMarkerView, many markers can be displayed and grouped in a cluster. The MarkerClusterView uses the markercluster plugin for Leaflet (https://github.com/Leaflet/Leaflet.markercluster). The markers and clusters can be adjusted using parameters (see options and search parameters below). 

It is also possible to display different groupings of markers in a PieChart cluster.

## usage:

### import and init:
```javascript
    require(['/static/app/ConsistSplunkToolbox/components/map/CSSClusterMarkerView.js'], function(WagonClusterMarkerView) {
        var wagonClusterMarkers = new WagonClusterMarkerView({
            id: 'mapCluster',
            managerid: 'map_search', 
            el: '#map',
            mapView: 'map1',
            data: 'results',
            preview: false,
            height: '950px',
            drilldownToken: 'selected_event'
        });
        wagonClusterMarkers.addDrilldownHighlight('selected_event');
    });
```

### options:

| option              | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `id`                | string             | true     | ID of the view, with this id you can get the view from the Splunk-registry |
| `el`                | string             | false    | html-element for view, the Map will be appended to HTML-Element of el |
| `managerid`         | string             | false    | id of searchmanager |
| `mapView`           | string             | false    | id of parent map |
| `drilldownToken`    | string             | false    | id of clicked marker (see search parameter 'id') will be set in this token and can be used for drilldown behavior |

The options from SimpleSplunkView can also be used: https://docs.splunk.com/DocumentationStatic/WebFramework/1.0/

### search:
```javascript
| eval id = Wagennummer
| eval lastTimestamp  = strftime(_time, "%d.%m.%Y %H:%M:%S")
| eval markerState = case(moveState=="Fahrend", "Fahrend", moveState=="Stehend", "Stehend/Parkend", moveState=="Parkend", "Stehend/Parkend", true(), "Unbekannt")
| eval markerColor = case(markerState=="Fahrend", "#0087B9", markerState=="Stehend/Parkend", "#FE6972", markerState="Unbekannt","lightgray", true(), "lightgray")
| eval icon="train"
```

| option              | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `latitude`          | string             | true     | position on map |
| `longitude`         | string             | true     | position on map |
| `id`                | string             | false    | html-element for view, the Map will be appended to HTML-Element of el |
| `markerState`       | string             | false    | field for grouping categories of pieChart |
| `markerColor`       | string             | false    | field for color categories of pieChart |
| `icon`              | string             | false    | icon of singleMarker (see markerRenderer) |





___

# RouteView
With this script you can add a dialog to contact helpdesk.

### import and init:
```javascript
    require(['/static/app/ConsistSplunkToolbox/components/feedbackEmail/feedbackEmail.js'], function(feedbackEmail) {
        feedbackEmail.addFeedbackDialog();
    });
```

The Helpdesk-Button will be automatically inserted after ".dashboard-title" because the button should be visible on a fixed position on AIC-Cockpit, too.

___

# MarkerView
With this script you can add a dialog to contact helpdesk.

### import and init:
```javascript
    require(['/static/app/ConsistSplunkToolbox/components/feedbackEmail/feedbackEmail.js'], function(feedbackEmail) {
        feedbackEmail.addFeedbackDialog();
    });
```

The Helpdesk-Button will be automatically inserted after ".dashboard-title" because the button should be visible on a fixed position on AIC-Cockpit, too.

___

# GeofencesView
Add geofences to the map. This view is not based on a splunk search, but loads the geofences as a KMZ file via a REST end point

### import and init:
```javascript
    require([
        '/static/app/ConsistSplunkToolbox/components/map/GeofencesView.js'
    ], function(GeofencesView) {
        new GeofencesView('map1', 'geofenceGroupForPreview_tok');
    });
```

| option              | type               | optional | description                           |
| ---------           | -------------------| ---------| --------------------------------------|
| `map-id`                | string             | true     | ID of the view, with this id you can get the view from the Splunk-registry |
| `el`                | string             | false    | html-element for view, the Map will be appended to HTML-Element of el |

___

# PopupRenderer:
Just as the appearance of a column can be influenced with the BaseCellRenderer for a table, the appearance of the popup in a map can be adjusted with the BasePopupRenderer.

Two steps are necessary:
First extend the BasePopupRenderer and then assign it to the subview

The following subviews can be used with a BasePopupRenderer:
- MarkerView
- MarkerClusterView
- Routeview (with marker)

```javascript
    require(['/static/app/ConsistSplunkToolbox/components/map/CSSClusterMarkerView.js'], function(WagonClusterMarkerView) {

        //get baseRenderer from view and extend to own conditionss
        var WatiPopupRenderer = WagonClusterMarkerView.BasePopupRenderer.extend({

            /** template which should be renderered in popup*/
            template: function(data) {    
                return /*html*/`<h3><b>${data.Gattung} ${data.Bauart}, ${data.Wagennummer}</b></h3>${data.lastTimestamp}`
            },

            /*check if popup could be rendered. Are all mandatory parameter set?*/
            canRender: function(data) {
                return data.Gattung 
                    && data.Bauart 
                    && data.Wagennummer 
                    && data.lastTimestamp;
            },

            /*render opup content*/
            render: function(data) {
                return this.template(data);
            }
        });
    });

    //create view...
    var wagonClusterMarkers = new WagonClusterMarkerView(
     ....

    //assign popup renderer to view:
    wagonClusterMarkers.addPopupRenderer(new WatiPopupRenderer());
```

# Create your own MapSubView with BaseMapsDataView:
BaseMapsDataView is a SimpleSplukView with some extensions to show search result on a MapView

```javascript
    require(['/static/app/ConsistSplunkToolbox/components/map/CSSClusterMarkerView.js'], function(WagonClusterMarkerView) {

        //get baseRenderer from view and extend to own conditionss
        var WatiPopupRenderer = WagonClusterMarkerView.BasePopupRenderer.extend({

            /** template which should be renderered in popup*/
            template: function(data) {    
                return /*html*/`<h3><b>${data.Gattung} ${data.Bauart}, ${data.Wagennummer}</b></h3>${data.lastTimestamp}`
            },

            /*check if popup could be rendered. Are all mandatory parameter set?*/
            canRender: function(data) {
                return data.Gattung 
                    && data.Bauart 
                    && data.Wagennummer 
                    && data.lastTimestamp;
            },

            /*render opup content*/
            render: function(data) {
                return this.template(data);
            }
        });
    });

    //create view...
    var wagonClusterMarkers = new WagonClusterMarkerView(
     ....

    //assign popup renderer to view:
    wagonClusterMarkers.addPopupRenderer(new WatiPopupRenderer());
```
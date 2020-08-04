var basePath = '/static/app/ConsistSplunkToolbox/components/';

require.config({
    waitSeconds: 0,
    paths: {
        'leaflet': basePath + 'map/vendor/leaflet/dist/leaflet-src',
        'markercluster': basePath + 'map/vendor/leaflet.markercluster/dist/leaflet.markercluster-src',
        'leafletGestureHandling': basePath + 'map/vendor/leaflet-gesture-handling.min',
        'PruneClusterForLeaflet': basePath + 'map/vendor/PruneCluster/dist/PruneCluster',
        'PruneCluster': basePath + 'map/vendor/PruneCluster/dist/PruneCluster',
        'leaflet.vector-markers': basePath + 'map/vendor/leaflet.vector-markers',
        'overlapping-spiderfy': basePath + 'map/vendor/overlappingSpiderfy'
    },
    shim: {
        leaflet: {
            exports: 'L',
            deps: ['css!' + basePath + 'map/vendor/leaflet/dist/leaflet.css']
        },
        markercluster: {
            deps: [
                'leaflet', 
                'css!' + basePath + 'map/vendor/leaflet.markercluster/dist/MarkerCluster.css',  
                'css!' + basePath + 'map/vendor/leaflet.markercluster/dist/MarkerCluster.Default.css'
            ]
        },
        leafletGestureHandling: {
            deps: [
                'leaflet', 
                'css!' + basePath + 'map/vendor/leaflet-gesture-handling.min.css'
            ]
        },
        'leaflet.vector-markers': {
            deps: [
                'leaflet', 
                'css!' + basePath + 'map/vendor/leaflet.vector-markers.css'
            ]
        },
        'overlapping-spiderfy': {
            deps: [
                'leaflet'
            ]
        }
    }
});
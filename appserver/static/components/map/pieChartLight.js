define([
    'jquery',
    'underscore',
    'css!./pieChart.css'
],
function(
    $,
    _,
) { 



    var MarkerLegend = function(map, options) {
        this.map = map;
        this.categories = {};
    }

    MarkerLegend.prototype.renderLegend = function(data) {

        this.remove();

        this.legendControl = L.control({position: 'bottomright'});


        this.legendControl.onAdd = function (map) {

          var categories = _.groupBy(data, function(entry) {
                return entry.markerState;
            });

            var legend = L.DomUtil.create('div');
            legend.className = 'legend';
            legend.id = 'legend';

            var categoryPies = _.map(categories, function(categoryEntries, category) {

                var style = 'background-color: ' + categoryEntries[0].markerColor + '; width: 16px; height: 16px';
                //var legendItem = $('<div class="legend"> </div>')
                var legendItem = L.DomUtil.create('div');
                legendItem.className = 'legenditem';

                var legendCircle = L.DomUtil.create('div');
                legendCircle.className = 'legendCircle';
                legendCircle.style = style;
                legendItem.appendChild(legendCircle);

                var legendLabel = L.DomUtil.create('div');
                legendLabel.className = 'legenditemLabel';
                legendLabel.textContent = category;

                legendItem.appendChild(legendLabel);

                legend.appendChild(legendItem);
            });
           return legend;
        };



        this.legendControl.addTo(this.map);
    };

    MarkerLegend.prototype.remove = function() {
        if(this.legendControl) {
            this.map.removeControl(this.legendControl);
            this.legendControl = null;
        }
    };


    /*******************************************************************************************************************************************************************************/

    var PieChartCluster = function(map, legend) {
        this.map = map;
        this.legend = legend;
        
    }

    PieChartCluster.prototype.calculateSize = function(numberOfMarkers) {
        return (numberOfMarkers < 10 ? 40 : numberOfMarkers < 100 ? 48 : numberOfMarkers < 500 ? 64 :  numberOfMarkers < 1000 ? 80 : 96) 
    }

    //https://keithclark.co.uk/articles/single-element-pure-css-pie-charts/
    PieChartCluster.prototype.createPieChartClusterIcon = function(cluster) {
        var children = cluster.getAllChildMarkers();
        var numberOfMarkers = children.length; 


        var size = this.calculateSize(numberOfMarkers);  

        var categories = _.groupBy(children, function(child) {
            return child.markerColor;
        });

        
        var pieChart = _.map(categories, function(categoryEntries, color) {
            var colorEntry = {};
            colorEntry[color] = categoryEntries.length/numberOfMarkers*100;
            return colorEntry;
        });
        var pieChartCSS = _.reduce(pieChart, function(memoizer, value) {
            var color = _.keys(value)[0];
            var percent = memoizer.sum + value[color];
            return {
                css: memoizer.css + (memoizer.css ? ', ' : '') + color + ' 0 ' + percent + '%', 
                sum: memoizer.sum + percent
            }
        }, {css: "", sum: 0});
        
        
        var style = 'background-image: conic-gradient(' + pieChartCSS.css + '); width: ' + size + 'px; height: ' + size + 'px';

        var html = '<div class="pie" style="' + style + '">' + numberOfMarkers + '</div>';

        var myIcon = new L.DivIcon({
                html: html,
                className: 'marker-cluster', 
                iconSize: new L.Point(size + 10, size + 10)
            });

        return myIcon;
    }    
    return {PieChartCluster: PieChartCluster,
            MarkerLegend: MarkerLegend
        };


});
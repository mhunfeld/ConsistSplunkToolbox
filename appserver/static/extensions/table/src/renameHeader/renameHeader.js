define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'css!./renameHeader.css'
], function ($, _, mvc) {


    return {
        
        renameHeader: function(longHeader, shortHeader) {

            var selector = this.tableComponent.id;
            this.tableComponent.getVisualization(function(tableView) {
                tableView.on('rendered', function() {

                    setTimeout(function() {
                        var headerElement =  tableView.$el.find(" th:contains(" + longHeader + ")");

                        headerElement.each(function(index, header) {
                            //get Ref in Header
                            var headerRef = $(header).find('a');
                                
                            //Rename Header
                            var headerText = headerRef[0].childNodes[0];
                            headerText.nodeValue = shortHeader;
                            //add Icon
                            headerRef.find('i').before('<i class="icon-info-circle"></i>');

                            //add tooltip handler with longHeader
                            headerRef.attr('data-toggle', 'tooltip');
                            headerRef.attr('title', longHeader);

                            //remove existing tooltip before re-rendering header
                            //after Sorting
                            headerRef.on('click', function(){
                                var existingTooltips = $(selector +' .tooltip');
                                existingTooltips.remove();
                            }.bind(this));

                            headerRef.tooltip({
                                container: '#' + selector,
                                trigger: 'hover'
                            });
                        }); 
                    }, 100); 
                });
                
                //tableView.render();
            }, this);

            return this;
        }
    }
});
define(
    [
        'underscore',
        'jquery',
        'splunkjs/mvc',
        'css!./addExportToXlsText.css'
    ], 
    function(_, $, mvc){

        
        
        /**
        Calls the export to xls endpoint from Splunk endpoints
        * @param {Array} searchManager of the table components
        */
        function callExportEndpoint(searchManager, fileName) {
            fileName = (fileName.split(' ').join('_')) + ".xlsx";
            var url = Splunk.util.make_url('splunkd/__raw/services/excelExporter?sid=' + searchManager.getSid() + "&filename=" + fileName);
            downloadFile(url);
        }

        /**
        Calls the URL and gets the data
        * @param {Array} url to be called
        */ 
        function downloadFile(url) {
            var link = document.createElement("a");
            link.download = name;
            link.href = url;
            link.click();
        }


        /**
        Attaches the export to xls functionality to a link
        */ 
       return {
        addXLSXExporter: function addExportToXlsEventToFile(options) {
        
        var tableComponent = this.tableComponent || mvc.Components.get(options.table);
        var searchManagerId = (options && options.externalSearchId) || tableComponent.settings.get('managerid');
        var searchManager = mvc.Components.get(searchManagerId);

        //external exportbutton above Table
        if(options && options.showExternalButton) {        
            var tableExport = $('<div class="tableExport"><a style="margin-left: 86%">Tabelle exportieren</a></div>');
            tableComponent.$el.find('.panel-head').append(tableExport);
            addExportListener(tableExport, tableComponent, searchManager);
        } else {
            //exchange existing export-button in tablefooter
            tableComponent.getVisualization(function(tableView) {
                tableView.on('rendered', function(e) {
                    var $tableExport = $('<a class="btn-pill export" title data-original-title="Export" data-toggle="tooltip" title="Export" data-searchId="' + tableComponent.settings.get('managerid') + '"><i class="icon-export"></i><span class="hide-text">Export</span></a>');
                    var menus = tableComponent.$el.find(".menus");
                    menus.find(".export").css("cssText", "display: none;");
                    $tableExport.insertAfter(menus.find(".refresh"));                    
                    $('[data-toggle="tooltip"]').tooltip();  
                    addExportListener($tableExport, tableComponent, searchManager);
                })
                tableView.render();
            }); 
        }

        function addExportListener($tableExportButton, tableComponent, searchManager) {
            var tableId = tableComponent.id;
            $tableExportButton.on( "click",  function(e) {
                var filename = (options && options.title) || tableComponent.settings.get('title') || tableId;
                callExportEndpoint(searchManager, filename.trim());
            }.bind(this));
        };

        return this;
    }
}
    });
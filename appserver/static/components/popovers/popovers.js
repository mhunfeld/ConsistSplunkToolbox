define(['jquery',
        'underscore',
        'splunkjs/mvc',
        '../../utils/theme-utils.js',
        'css!./popovers.css',
        'splunkjs/ready!',
        'bootstrap.popover',
        'bootstrap.tooltip'
    ],
    function(
        $, _, mvc, themeUtils) {


        var initAll = function(selector, options) {

            //wenn kein Selector angegeben wurde, kann der erste Parameter auch ein Options-Objekt sein
            options = !options && selector && typeof selector == 'object' ? selector : {};
            //wenn kein selector angegeben wurde, leeren String verwenden.
            selector = selector && typeof selector == 'string' ? selector + ' ' : '';

            var currentTheme = themeUtils.getCurrentTheme();

            //damit die Stylesheets von Splunk griefen, muss ein Popover diese Struktur haben.
            options.template = options.template ? options.template : `<div class="popover ${currentTheme}">
                                        <div class="arrow"></div>
                                        <h3 class="popover-title"></h3>
                                        <div class="popover-content"></div>
                                    </div>`;

            var $popoverElements = $(selector + "[data-toggle=popover]");
            $popoverElements.popover(options);
        };

        var initInTableCellRenderer = function(tableId, options) {
            var table = mvc.Components.get(tableId);

            table.getVisualization(function(tableView) {
                tableView.on('rendered', function() {
                    initAll('#table');
                });
            });
        }


        return {
            initAll: initAll,
            initInTableCellRenderer: initInTableCellRenderer
        }
    })
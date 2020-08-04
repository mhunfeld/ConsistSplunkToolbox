define(["jquery",
        '../../utils/theme-utils.js',
        'css!./popovers.css',
        "splunkjs/ready!",
        "bootstrap.popover",
        "bootstrap.tooltip"
    ],
    function(
        $, themeUtils) {

        return {
            initAll: function() {
                var currentTheme = themeUtils.getCurrentTheme();
                var popoverTemplate = `<div class="popover ${currentTheme}">
                                            <div class="arrow"></div>
                                            <h3 class="popover-title"></h3>
                                            <div class="popover-content"></div>
                                        </div>`;
                $("[data-toggle=popover]").addClass(currentTheme).popover({template: popoverTemplate})
                $("[data-toggle=tooltip]").addClass(currentTheme).tooltip()
            }
        }
    })
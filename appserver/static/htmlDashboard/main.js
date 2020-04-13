
require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/layoutview",
    "splunkjs/mvc/simplexml/dashboardview",
    "splunkjs/mvc/simplexml/dashboard/panelref",
    "splunkjs/mvc/simplexml/element/chart",
    "splunkjs/mvc/simplexml/element/event",
    "splunkjs/mvc/simplexml/element/html",
    "splunkjs/mvc/simplexml/element/list",
    "splunkjs/mvc/simplexml/element/map",
    "splunkjs/mvc/simplexml/element/single",
    "splunkjs/mvc/simplexml/element/table",
    "splunkjs/mvc/simplexml/element/visualization",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simplexml/searcheventhandler",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/radiogroup",
    "splunkjs/mvc/simpleform/input/linklist",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/submit",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/simplexml/urltokenmodel"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        DashboardController,
        LayoutView,
        Dashboard,
        PanelRef,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        VisualizationElement,
        FormUtils,
        EventHandler,
        SearchEventHandler,
        DropdownInput,
        RadioGroupInput,
        LinkListInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        UrlTokenModel
      ) {
        var pageLoading = true;


        // Create token namespaces
        var urlTokenModel = new UrlTokenModel();
        mvc.Components.registerInstance('url', urlTokenModel);
        var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
        var submittedTokenModel = mvc.Components.getInstance('submitted', {create: true});

        urlTokenModel.on('url:navigate', function() {
            defaultTokenModel.set(urlTokenModel.toJSON());
            if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
                submitTokens();
            } else {
                submittedTokenModel.clear();
            }
        });

        // Initialize tokens
        defaultTokenModel.set(urlTokenModel.toJSON());

        function submitTokens() {
            // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
            FormUtils.submitForm({ replaceState: pageLoading });
        }

        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }

        function unsetToken(name) {
            defaultTokenModel.unset(name);
            submittedTokenModel.unset(name);
        }
        
        //$('header').remove();
        new LayoutView({"hideChrome": true, "hideAppBar": true, "hideSplunkBar": true})
            .render()
            .getContainerElement()
            .appendChild($('.dashboard-body')[0]);

       
        new Dashboard({
            id: 'dashboard',
            el: $('.dashboard-body'),
            showTitle: true,
            editable: true
        }, {tokens: true}).render();

        // Initialize time tokens to default
        if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
            defaultTokenModel.set({ earliest: '0', latest: '' });
        }

        submitTokens();

        DashboardController.ready();
        pageLoading = false;

    }
);
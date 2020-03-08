define([
    'backbone', 
    'underscore',
    'splunkjs/mvc',
    'css!./tableColumnChooser.css'
], function (Backbone, _, mvc) {

    /**
    * Show and hide selected columns of a table.
    * The settings are stored in the cookie on the user page and are available the next time the page is loaded.
    * Dashboard examples with tableColumnChooser in use: db_rsi_wi_waco_u
    * 
    * @param {Object} options - Settings for TableColumnChooser.
    * @param {string} options.token - Name of token for selected columns. Used in searchresult of connected table.
    * @param {string} options.cookieName - Name of cookie, where settings should be stored
    * @param {string} options.inputFieldHtmlId - Html-Id of simpleXML multi-select inputfield 
    * 
    * Example Instantiation in JS:
    * var tableColumnsDetailToggler = new TableColumnChooserView({
    *        token: 'form.tableColumnsDetail_tok', 
    *        cookieName: 'tableColumnsDetail_cookie', 
    *        inputFieldHtmlId: '#in_tableColumnsDetail'
    *    });
    * 
    * Example SimpleXML:
    * InputField:
    * <input type="multiselect" id="in_tableColumnsDetail" token="tableColumnsDetail_tok" searchWhenChanged="true">
    *   <label>Tabellenspalten auswählen</label>
    *   <default>Wagennummer,Land</default>  <-- columns which should be shown as default (before user selected his own fields)
    *   <choice value="Wagennummer">Wagennummer</choice>
    *   <choice value="Land">Land</choice>
    *   <choice value="Ort">Ort</choice>
    *   <prefix>| table Zeitstempel "</prefix>      <-- table-command here as prefix, with fields that should not be deselectable. This fields should not be listed as choice in input
    *   <suffix>"</suffix>
    *   <delimiter>" "</delimiter>
    * </input>
    * 
    * Search-Command: 
    * <query>| loadjob $searchBaseID$ | eval Zeitstempel=_time          
    *     | eval Beladestatus = Beladestatus.case(source_loadstatus=="Sensor",", seit ".if(loadstatus_lastChange="Unbekannt","Unbekannt",strftime(strptime(loadstatus_lastChange, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M")),source_loadstatus=="FLO-LSO",", Information vom ".if(base_wgfTimestamp="Unbekannt","Unbekannt",strftime(strptime(base_wgfTimestamp, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M")),1=1,", ")." (Quelle: ".source_loadstatus.")", Bewegungsstatus = Bewegungsstatus." seit ".if(moveState_lastChange="Unbekannt","Unbekannt",strftime(strptime(moveState_lastChange, `db_rsi_wi_1src_ma_eventTimeFormat`), "%d.%m.%Y %H:%M"))
    *     | fieldformat Zeitstempel = strftime(Zeitstempel, `db_rsi_wi_1src_ma_fieldformatTimeFormat`)
    *       $tableColumnsDetail_tok$ | rename gps_determination as " "</query>                                  <-- use token with table-command here in search-command
    * 
    */
    var TableColumnChooserView = Backbone.View.extend({
            
        togglerTemplate: _.template('<a class="tableEdit">Tabelle bearbeiten</a>\
                          <a class="tableClose" style="display:none">Tabelle schliessen</a>'),

        tagName: 'div',

        events: {
            'click': 'toggleEditColumns'
        },

        className: 'tableColumnSelector',

        initialize: function(options) {
            this.cookieName = options.cookieName;

            this.inputFieldHtmlId = '#' + options.inputfieldId;
            
            this.inputfield = mvc.Components.get(options.inputfieldId);

            if(!this.inputfield) {
                console.error('no inputfield found with id: ' + options.inputfieldId);
                return;
            }

            this.inputfield.$el.hide();

            
            
            this.tokenName = 'form.' + this.inputfield.settings.get('token');

            this.sortable();

            this.render();
        },

        sortable: function () {
            var tokenName = this.tokenName;
            var inputfield = this.inputfield;
            inputfield.$el.find('[data-test="multiselect"]').sortable({
                cancel: '',
                items: "> button",
                update: function() {
                    //get current sorting from input (buttons/label)
                    //1. get Label from input
                    //2. get value for label
                    //because if value and label are different: a new Choice is created 
                    //and this value can be selected twice
                    var sortedInput = $(this).find('[data-test="label"]').map(function(){
                        var label = $.trim($(this).text());
                        return _.findWhere(inputfield.settings.get('choices'), {label: label}).value;
                     }).get();
                    defaultTokens.set(tokenName, sortedInput);
                }
            }).disableSelection();
        },

        toggleEditColumns: function (event) {
            var element = event.currentTarget;
            this.inputfield.$el.toggle();
            $(element).find(".tableClose").toggle();
            $(element).find(".tableEdit").toggle();
        },

        render: function() {
            this.$el.html(this.togglerTemplate);
            this.inputfield.$el.addClass('fullWidth');
            this.inputfield.$el.find('div').addClass('fullWidth');
            return this;
        }
    });

    var defaultTokens = mvc.Components.getInstance("default");

    return function addTableColumnChooser(options) {

        var tableComponent = this.tableComponent || mvc.Components.get(options.table);
        
        var tableColumnsDetailToggler = new TableColumnChooserView(options);       
        var $tableHeader = tableComponent.$el.find('.panel-head');
        $tableHeader.append(tableColumnsDetailToggler.$el);
        
        var  $tableColumnInputfield = $('#' + options.inputfieldId);
        $tableHeader.after($tableColumnInputfield);
        
        return this;
    }

});
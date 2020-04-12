define([
    'backbone', 
    'underscore',
    'splunkjs/mvc',
    'css!./tableColumnChooser.css'
], function (Backbone, _, mvc) {

    /**
    * Show and hide selected columns of a table.
    * The settings could be stored in the cookie on the user page and are available the next time the page is loaded.
    * 
    * @param {Object} options - Settings for TableColumnChooser.
    * @param {string} options.token - Name of token for selected columns. Used in searchresult of connected table.
    * @param {string} options.cookieName - Name of cookie, where settings should be stored
    * @param {string} options.inputfieldId -Id of simpleXML multi-select inputfield 
    * @param {string} options.sortable - selction of columns is sortable per drag and drop in inputfield
    * 
    * Example Instantiation in JS:
    * var tableColumnsDetailToggler = new TableColumnChooserView({
    *        token: 'form.tableColumnsDetail_tok', 
    *        cookieName: 'tableColumnsDetail_cookie', 
    *        inputfieldId: 'in_tableColumnsDetail'
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
    * <query>
    *       ... 
    *       $tableColumnsDetail_tok$                                  <-- use token with table-command here in search-command
    * </query>
    * 
    */
    var TableColumnChooserView = Backbone.View.extend({

        togglerTemplate: _.template('<div class="edit-column">\
            <a class="tableClose">\
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">\
                    <path d="M 12 0 C 10.347656 0 9 1.347656 9 3 L 9 47 C 9 48.652344 10.347656 50 12 50 L 38 50 C 39.652344 50 41 48.652344 41 47 L 41 27.75 L 48.125 20.625 C 48.125 20.625 48.261719 20.488281 48.375 20.375 C 48.421875 20.328125 48.464844 20.273438 48.5 20.21875 C 48.652344 20.066406 48.8125 19.90625 48.8125 19.90625 C 50.410156 18.308594 50.40625 15.71875 48.8125 14.125 C 47.214844 12.527344 44.625 12.53125 43.03125 14.125 L 42.71875 14.4375 C 42.671875 14.476563 42.632813 14.515625 42.59375 14.5625 L 42.34375 14.84375 L 41 16.15625 L 41 3 C 41 1.347656 39.652344 0 38 0 Z M 43.75 16.25 L 46.6875 19.1875 L 32.78125 33.09375 L 29.84375 30.15625 Z M 28.4375 31.5625 L 31.375 34.53125 L 27.34375 35.59375 Z"></path>\
                </svg>\
            </a>\
            <a class="tableClose" style="display:none">\
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">\
                    <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/>\
                </svg>\
            </a>\
            </div>'),

        tagName: 'div',

        events: {
            'click': 'toggleEditColumns'
        },

        className: 'tableColumnSelector',

        initialize: function(options) {
            this.inputfield = mvc.Components.get(options.inputfieldId);
            
            if(!this.inputfield) {
                console.error('no inputfield found with id: ' + options.inputfieldId);
                return;
            }
            
            this.inputfield.$el.hide();
            this.tokenName = 'form.' + this.inputfield.settings.get('token');
            
            if(options.sortable) {
                this.sortable();
            }

            if(options.cookieName) {
                this.addCookieHandler(options.cookieName);
            }
            
            this.render();
        },

        addCookieHandler: function(cookieName) {

            this.inputfield.on('change', function() {
                var selectedValue = this.inputfield.val();
                this.setCookie(cookieName, selectedValue);
            }, this);

            var cookieValue = this.getCookie(cookieName);
            this.inputfield.val(cookieValue);
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
            //this.inputfield.$el.css("display", "block");
            this.$el.html(this.togglerTemplate);
            this.inputfield.$el.addClass('fullWidth');
            //this.inputfield.$el.find('div').addClass('fullWidth');
            this.inputfield.$el.find('[data-test="multiselect"]').addClass('fullWidth');
            return this;
        },

        getCookie: function(cookieName) {
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                // write cookie content to tokens
                if (c.indexOf(cookieName + "=") == 0) {
                    return c.substring(c.indexOf("=") + 1).split(',');
                }
            }
        },

        setCookie: function(cookieName, cookieValue) {
            document.cookie = cookieName + "=" + cookieValue + ";" + this.getExpiryDate() + ";path=" + this.getCurrentPath();
        },

        getExpiryDate: function() {
            var exdays = 90;
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();

            return expires;
        },

        getCurrentPath: function() {
            var envTokenModel = splunkjs.mvc.Components.get('env');

            var appName = envTokenModel.get('app');
            var locale = envTokenModel.get('locale');

            var path =  locale + '/app/' + appName;
            
            return path;
        }
    });

    var defaultTokens = mvc.Components.getInstance("default");

    return {

        addColumnChooser: function(options) {
    
            var tableComponent = this.tableComponent || mvc.Components.get(options.table);
            
            var tableColumnsDetailToggler = new TableColumnChooserView(options);       
            var $tableHeader = tableComponent.$el.find('.panel-head');
            $tableHeader.append(tableColumnsDetailToggler.$el);
            
            var  $tableColumnInputfield = $('#' + options.inputfieldId);
            $tableHeader.after($tableColumnInputfield);
            
            return this;
        }
    }
    

});
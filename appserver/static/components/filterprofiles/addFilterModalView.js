define([
    'underscore',
    'backbone',
    'jquery',
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/checkboxgroup",
    "css!./addFilterModalView_blue.css",
    "splunkjs/mvc/simplexml/ready!"
], function(_, Backbone, $, TextInput, CheckboxGroupInput) {

    /**
     * Popup for adding or importing new filterprofile
     */
    var ModalView = Backbone.View.extend({

        template: _.template('<div class="modal">\
                                <div class="modal-header"><h3>Filterkriterien speichern</h3></div>\
                                <div class="modal-body">\
                                    <div class="filtername" style="float: none !important" autofocus/>\
                                    <div class="isDefault" style="float: none !important"/>\
                                </div>\
                                <div class="modal-footer">\
                                    <div class="btn-group" role="group">\
                                        <button data-toggle="modal" class="cancel btn btn-default">Abbrechen</button>\
                                        <button data-toggle="modal" class="save btn btn-primary btn-firstAttempt">Speichern</button>\
                                    </div>\
                                </div>\
                               </div>\
                               <div data-dismiss="modal" class="modal-backdrop"></div>\
                            '),

        /**
         * Constuctor for Backbone-View
         * @param {object} options Backbone-options for view
         * @param {object} eventDispatcher Dispatcher for Backbone-Events
         *                                  -> fires "import" and "save" Events for adding new profiles
         *                                  -> listens To "saved" Event for successfully adding new profiles
         *                                  -> listens To "error" Event for error-messages at saving new profiles
         */
        initialize: function(options, eventDispatcher) {
            this.options = options;
            this.childViews = [];
           //TODO: mahu 27.10.2018 von außen
            $(document.body).append(this.render().el);

            this.eventDispatcher = eventDispatcher;
            this.eventDispatcher.on('filterprofile:saved', this.close, this);
            this.eventDispatcher.on('filterprofile:error', this.showError, this);

            this.isdefault = new CheckboxGroupInput({
                choices: [{
                    "value": "true",
                    "label": "Als Standard-Suchprofil speichern"
                }],
                el: this.$el.find('.isDefault'),
            });

            this.nameinput = new TextInput({
                el: this.$el.find('.filtername'),
                label: "Profilname"
            });

            this.childViews.push(this.nameinput);
            this.childViews.push(this.isdefault);
        },

        events: {
            'click .btn-default': 'close',
            'click .modal-backdrop': 'close',
            'click .save': 'save',
            'change .upload-file-button': 'validateFile'/*,
            'focusout .filtername input': 'validate'*/
        },

        render: function() {
            var data = {
                title: this.options.title
            };
            this.$el.html(this.template(data));

            if(this.options.import) {
                // Build fileinput for user
                this.fileinput = "<input type='file' class='btn upload-file-button'>";
                this.$el.find('.modal-body').append(this.fileinput); 

                this.childViews.push($(this.fileinput));
            }

          //  this.$el.find('.save').prop("disabled", true);
            
            return this;
        },

        show: function() {
            this.isdefault.render();
            this.nameinput.render();

            // Set the profilname text input over the checkbox despise the adding order
            // so that the checkbox doesn't overlap the input space of profilname
            $('.modal-input > .splunk-textinput').css({
                'float': 'left',
                'margin-right': '20px',
                'position': 'relative',
                'z-index': '1000'
            });
			 this.$el.find('input[type=text]').focus();
        },

        close: function() {
            _.each(this.childViews, function(childView) {
                childView.unbind();
                childView.remove();
            });

            this.eventDispatcher.off('filterprofile:saved');
            this.eventDispatcher.off('filterprofile:error');

            this.unbind();
            this.remove();
        },

        validateName: function() {
            var unsupChars = /[^\w|\s]/;

            var filterprofileName = this.nameinput.val();
            if(!filterprofileName || (filterprofileName.search(unsupChars) >= 0)) {
                this.showError('Die Eingabe ist ungültig, bitte verwenden Sie ausschließlich Zeichen bestehend aus [A-z_0-9].');
                return false;
            }

            filterprofileName.trim();

            return true;
        },

        save: function() {

            if(this.validateName()) {

                if(!this.options.import) {
                    var inputData = {
                        filterprofileName: this.nameinput.val(),
                        isDefault:  _.contains(this.isdefault.val(), 'true'),
                    }
        
                    this.eventDispatcher.trigger('filterprofile:save', inputData);
                } else {
                    if(this.validateFile()) {
                        var inputData = {
                            filterprofileName: this.nameinput.val(),
                            isDefault: _.contains(this.isdefault.val(), 'true'),
                            file: this.file
                        }
            
                        this.eventDispatcher.trigger('filterprofile:import', inputData);
                    }
                }
            }
        },

        showError: function(error) {
            alert(error);
        },

        validateFile: function(event) {  

            if(event && event.currentTarget.files && event.currentTarget.files.length > 0) {        
                this.file = event.currentTarget.files[0];
            }


            if(!this.file) { 
                this.showError("Bitte wählen Sie eine Datei aus.");
                return false;
            }

            if(this.file.type !== "text/plain" || !this.file.name.includes('.txt')) {
                this.showError("Die Datei ist ungültig. Es können nur Text-Dateien importiert werden.");
                return false;
            } 

            return true;
        }
    });
    return ModalView;

    //# sourceURL=db_rsi_wi_stdz_js_modalviewfilterprofile.js

});
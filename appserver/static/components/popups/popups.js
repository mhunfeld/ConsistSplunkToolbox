define([
    'underscore', 
    'backbone',
    'splunkjs/mvc',
    'css!./protocolModal.css'
], function(_, Backbone, mvc) {

    var defaultTokens = mvc.Components.getInstance('default');

    var PopupView = Backbone.View.extend({

        tagName: 'div',

        className: 'modal fade hide',

        template: function(title, body) {
            return /*html*/`
            <div class="modal-header">
                <button aria-label="Schließen" type="button" class="close close-button">×</button>
                <h3 class="modal-title">${title}</h3>
            </div>
            <div class="modal-body">
                ${typeof body === 'object' ? "" : body }
            </div>
            <div class="modal-footer">
                <div class="btn-group" role="group">
                    <button id="close" class="close-button btn btn-primary modal-btn-primary pull-right">Schließen</button>
                </div>
            </div>`
        },
                
        initialize: function(options) {
            this.options = options;

            this.title = options.title || "";
            this.body = options.body || "";

            //TODO: show/hide with tokens
            // defaultTokens.on('change:' + options.showHideToken, function(ununsed, value) {
            //     if(value) {
            //         this.show();
            //     } 
            // }, this);
        },

        setTitle: function(title) {
            this.title = title;
        },

        setBody: function(body) {
            this.body = body;
        },
        
        events: {
            'click .close-button': 'close'
        },
        
        show: function() {
            this.$el.modal('show');
        },

        close: function() {
            // defaultTokens.unset(this.options.showHideToken);
            this.$el.modal('hide');
        },

        render: function() {
            this.$el.empty();
            this.$el.append(this.template(this.title, this.body));
            if(typeof this.title  === 'object') {
                this.$el.find('.modal-title').append(this.title);
            }

            if(typeof this.body  === 'object') {
                this.$el.find('.modal-body').append(this.body);
            }

            this.$el.data('backdrop', false);
        }
    });

    
    

    return PopupView;

});
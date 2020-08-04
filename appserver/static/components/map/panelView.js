define([
    'underscore',
    'backbone',
    'splunkjs/mvc/simplesplunkview',
    "splunkjs/mvc/resultslinkview",
    "splunkjs/mvc/progressbarview",
    "css!./panelView.css"
], function(_, Backbone, SimpleSplunkView, ResultsLinkView, ProgressBarView) {

    var PanelView = SimpleSplunkView.extend({

        headerTemplate: function(options) {
                            return /*html*/`<div id="${options.id}-element-header" class="element-header">
                                    <div class="progress-container pull-right"></div>
                                    <div class="dashboard-element-searchmessages"></div>
                                    ${options.title ? `<h3 class="dashboard-element-title" data-view="views/dashboard/element/Title">${options.title}</h3>` : ''}
                                </div>`;
                        },
        
        bodyTemplate: function(options) {
            return /*html*/`<div id="${options.id}-element-body" class="element-body"></div>`;
        },
        
        footerTemplate: function(options) {
                            return /*html*/`<div id="${options.id}-element-footer" class="element-footer dashboard-element-footer" data-view="views/dashboard/element/Footer">
                                <div class="menus"></div>\
                            </div>`;
                        },

        tagName: 'div',

        className: 'element-view',
            
        defaults: {
            showResultsLink: true,
            showProgressbar: true,
        },

        initialize: function(options, childView) {
            PanelView.__super__.initialize.apply(this, arguments);
            this.options = _.defaults(options, this.defaults);

            this.id = options.id;
            this.childView = childView;

            this.render();
            
            if(this.options.showResultsLink) {
                this.addResultsLink({
                    id: childView.options.id + "resultsLink",
                    managerid: childView.options.managerid
                });
            }

            if(this.options.showProgressbar) {
                this.addProgressBar({
                    id: childView.options.id + "prgressBar",
                    managerid: childView.options.managerid
                });
            }

            return this;
        },

        render: function() {
            this.$el.addClass('element-view');
            this.$el.append(this.headerTemplate(this.options));
            this.$el.append(this.bodyTemplate(this.options));
            this.$el.append(this.footerTemplate(this.options));


            this.$el.find('.element-body').append(this.childView.render().$el);
           
            return this;
        },

        addResultsLink: function(options) {
            var resultsLink = new ResultsLinkView(options);
            
            this.$el.find('.element-footer > .menus').append(resultsLink.render().$el);
        },

        addProgressBar: function(options) {
            var progressBar = new ProgressBarView(options);

            this.$el.find('.element-header > .progress-container').append(progressBar.render().$el);
        },

        showMessage: function(message) {

            this.$el.find('.dashboard-element-searchmessages').empty();

            if(message) {
                var iconTemplate = _.template(
                    '<div class="alert alert-error">\
                        <i class="icon-<%=icon%>"></i>\
                        <%=message%>\
                    </div>');
                this.$el.find('.map-header > .dashboard-element-searchmessages').append(iconTemplate(message));
    
                var messageTemplate = _.template('<div class="dropdown-menu">\
                                                    <ul class="error-list">\
                                                        <li class="warning"><i class="icon-<%=icon%>"></i>\
                                                            <%=message%>\
                                                        </li>\
                                                    </ul>\
                                                </div>');
    
                this.$el.find('.map-header > .dashboard-element-searchmessages').append(messageTemplate(message));
            }
        },

        addToHeader: function(element) {
            this.$el.find('.map-header').append(element);
        },

        displayMessage: function(messages) {
            return "message of Map";
        },
    })

    return PanelView;

});
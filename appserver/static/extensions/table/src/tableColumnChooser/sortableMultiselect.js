define([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc) {
    
    var tokens = mvc.Components.getInstance('default');

    return {
        addSortable: function (splunkInputfield, token) {
            var name = splunkInputfield.$el.find("div > input");
            name.select2("container").find("ul.select2-choices").sortable({
                start: function() {
                    name.select2("onSortStart");
                },
                update: function() {
                    name.select2("onSortEnd");
                    tokens.set(token, name.val().split(','));
                }
            });
        }
    }

});

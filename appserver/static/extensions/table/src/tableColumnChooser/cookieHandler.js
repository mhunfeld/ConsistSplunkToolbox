define(function () {
    return {
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
    };
});
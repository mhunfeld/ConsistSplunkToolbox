

define([
    'underscore',
    'splunkjs/mvc',
    './timerangeSlider.js',
], function (_, mvc, TimerangeSlider) { 

  
    
    class TimerangeSliderElement extends HTMLElement {
        constructor() {
            super();
            console.log('constructor');
            this.style.display = 'none';
        }
        
        connectedCallback() {
            console.log('connected');
            let options = {};
            
            //Attribute ohne token ?token?
            options['id'] = this.getAttribute('id');
            options['token'] = this.getAttribute('token');
            var searchWhenChanged = this.getAttribute('searchWhenChanged');

            //Attribute mit Token
            var depends = this.getAttribute('depends');
            var rejects = this.getAttribute('rejects');
            
            options['label'] = this.getOption('label');
            options['min'] = this.getOption('min');
            options['max'] = this.getOption('max');
            options['defaultValue'] = this.getOption('defaultValue');
            options['step'] = this.getOption('step');
            options['prefix'] = this.getOption('prefix');
            options['suffix'] = this.getOption('suffix');
            options['labelPrefix'] = this.getOption('labelPrefix');
            options['labelSuffix'] = this.getOption('labelSuffix');
            
            this.timerangeSlider = mvc.Components.get(options.id) || new TimerangeSlider(options, {tokens: true, tokenNamespace: "submitted"});
            this.timerangeSlider.render();


            let parentSelector = this.getOption('parentElement');
            //Workaround, wenn WebComponent mit Splunk-default Inputs genutzt wird
            if(parentSelector) {
                this.addToParent(parentSelector, this.timerangeSlider.el);
            } else {
                this.appendChild(this.timerangeSlider.el);
            }
        }

        getAttribute(name) {
            var attributeValue = super.getAttribute(name);

            //TODO: Verkettung von tokens ermöglichen
            if(attributeValue && attributeValue.startsWith('?') && attributeValue.endsWith('?')) {
                var defaultTokens = mvc.Components.getInstance('default');
                var token = attributeValue.replace(/\?/g, '');

                if(name === 'depends') {
                    defaultTokens.on('change:' + token, function(unused, value) {
                        console.log('depends token changed');
                        value ? this.timerangeSlider.$el.show() : this.timerangeSlider.$el.hide();
                    }, this);
                }

                if(name === 'rejects') {
                    defaultTokens.on('change:' + token, function(unused, value) {
                        console.log('rejects token changed');
                        !value ? this.timerangeSlider.$el.show() : this.timerangeSlider.$el.hide();
                    }, this);
                }
            }

            return attributeValue;
        }

        disconnectedCallback() {
            console.log('disconnected');
            this.timerangeSlider.remove();
            this.timerangeSlider = undefined;
        }

        attributeChangedCallback() {
            console.log('attributeChanged');
        }

        addToParent(parentSelector, element) {
            if(parentSelector) {
                let parent = document.getElementById(parentSelector);
                if(parent) {
                    parent.firstElementChild.getElementsByClassName('fieldset').item(0).append(element);
                }
            }
        }

        getOption(optionName) {

            let optionList = this.getElementsByTagName(optionName);
            if(optionList.length == 1) {
                let option = optionList.item(0);
                let optionValue = option.innerText;
                option.remove();
                if(optionValue.startsWith('?') && optionValue.endsWith('?')) {
                    var defaultTokens = mvc.Components.getInstance('default');
                    var token = optionValue.replace(/\?/g, '');

                    defaultTokens.on('change:' + token, function(unused, value) {
                        console.log('token changed');
                        this.timerangeSlider.settings.set(optionName, value);
                    }, this);

                    return defaultTokens.get(token);
                }

                return optionValue;
            }
            return '';
        }


    }

    customElements.define('co-timerange-slider', TimerangeSliderElement);
});

//@ sourceURL=timerangeSliderWebComponent.js
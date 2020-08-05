# Range Slider

The range slider can be used to select simple values ​​in a certain range. The range slider can also be used for relative times (last 24 hours etc.). The range slider has been implemented as SimpleSplunkView and is therefore initialized in Javascript. However, the known behavior of inputs from SimpleXML has been implemented, so that the configuration is similar to inputs in SimpleXML.

The following properties from SimpleXML were transferred:
- Theming in dark mode / light mode
- the selected value can be assigned to a token
- depending on the configuration of the dashboard (standard splunk behavior), this token value is transferred to the default, submitted and / or url token model
- the form.token is also set
- prefixes and suffixes can be determined so that the token can be used directly in searches.


## Configuration: 


https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_baseview.html
https://docs.splunk.com/DocumentationStatic/WebFramework/1.5/compref_simplesplunk.html 


additional options have been added:

| parameter           | type               | optional | default             | description                           |
| ---------           | -------------------| ---------| --------------------| --------------------------------------|
| `label`             | string             | true     | -                   | label for this input                  |
| `token`             | string             | true     | -                   | name of token for this input          |
| `default`           | number             | true     | -                   | default value of slider               |
| `prefix`            | any                | true     | -                   | prefix for token                      |
| `suffix`            | any                | true     | -                   | suffix for token                      |
| `theme`             | string             | true     | actual theme of dashboard | theme of slider dark or light   |
| `min`               | number             | true     | 0                   | minimum of slider range               |
| `max`               | number             | true     | 100                 | maximum of slider range               |
| `step`              | number             | true     | 10                  | step of range                         |
| `value`             | number             | true     | current value       | current value                         |
| `labelPrefix`       | any                | true     | -                   | prefix for label (only for view)      |
| `labelSuffix`       | any                | true     | -                   | suffix for label (only for view)      |


## use: 

```javascript
    require([
        '/static/app/ConsistSplunkToolbox/components/range-slider/rangeSlider.js',
        'splunkjs/mvc/simplexml/ready!'
    ], function( 
        RangeSlider
    ){
        var testSlider = new RangeSlider({
            label: 'Slider as Backbone View',
            min: 0,
            max: 96,
            defaultValue: 24,
            step:   12,
            id: 'my-range-slider',
            token: 'slider_tok',
            prefix: '-@',
            suffix: '$timeUnit$',
            labelPrefix: 'letzte ',
            labelSuffix: '$labelSuffix$'
        }, {tokens: true});

        // NOTE: Here you can use tokens like in SimpleXML with $$. These also update automatically when the value changes.

        //Rendern des Sliders
        testSlider.render();
        //und angewünschter Stelle im HTML-Dom einhängen    
        $('#customFieldset .fieldset').append(testSlider.el);

    });
```

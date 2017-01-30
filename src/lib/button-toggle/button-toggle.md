`<md-button-toggle>` are on/off toggles with the appearance of a button. These toggles can be 
configured to behave as either radio-buttons or checkboxes. While they can be standalone, they are 
typically part of a `md-button-toggle-group`.


<!-- example(button-toggle-overview) -->

### Exclusive selection vs. multiple selection
By default, `md-button-toggle-group` acts like a radio-button group- only one item can be selected.
In this mode, the `value` of the `md-button-toggle-group` will reflect the value of the selected 
button and `ngModel` is supported. 

Adding the `multiple` attribute allows multiple items to be selected (checkbox behavior). In this
mode the values of the the toggles are not used, the `md-button-toggle-group` does not have a value, 
and `ngModel` is not supported.

### Accessibility
The button-toggles will present themselves as either checkboxes or radio-buttons based on the 
presence of the `multiple` attribute. 

### Orientation
The button-toggles can be rendered in a vertical orientation by adding the `vertical` attribute.

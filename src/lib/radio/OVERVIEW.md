`<md-radio>` provides the same functionality as a native `<input type="radio">` enhanced with 
Material Design styling and animations.  
 
<!-- example(radio-overview) -->
 
All radio buttons with the same `name` comprise a set from which only one may be selected at a time.
  
### Radio-button label
The radio-button label is provided as the content to the `<md-checkbox>` element. The label can be 
positioned before or after the radio-button by setting the `labelPosition` property to `'before'` 
or `'after'`.

If you don't want the label to appear next to the radio-button, you can use 
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to 
specify an appropriate label.


### Radio groups
Radio-buttons should typically be placed inside of an `<md-radio-group>` unless the DOM structure
would make that impossible (e.g., radio buttons inside of table cells). The radio-group has a 
`value` property that reflects the currently selected radio-button inside of the group.

Individual radio-buttons inside of a radio-group will inherit the `name` of the group.


### Use with `@angular/forms`
`<md-radio-group>` is compatible with `@angular/forms` and supports both `FormsModule` 
and `ReactiveFormsModule`.

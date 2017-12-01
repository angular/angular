`<mat-checkbox>` provides the same functionality as a native `<input type="checkbox">`
enhanced with Material Design styling and animations.

<!-- example(checkbox-overview) -->

### Checkbox label
The checkbox label is provided as the content to the `<mat-checkbox>` element. The label can be 
positioned before or after the checkbox by setting the `labelPosition` property to `'before'` or
`'after'`.

If you don't want the label to appear next to the checkbox, you can use 
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to 
specify an appropriate label.

### Use with `@angular/forms`
`<mat-checkbox>` is compatible with `@angular/forms` and supports both `FormsModule` 
and `ReactiveFormsModule`.

### Indeterminate state
`<mat-checkbox>` supports an `indeterminate` state, similar to the native `<input type="checkbox">`.
While the `indeterminate` property of the checkbox is true, it will render as indeterminate 
regardless of the `checked` value. Any interaction with the checkbox by a user (i.e., clicking) will
remove the indeterminate state.

### Click action config
When user clicks on the `mat-checkbox`, the default behavior is toggle `checked` value and set
`indeterminate` to `false`. Developers now are able to change the behavior by providing a new value
of `MatCheckboxClickAction` to the checkbox. The possible values are:

#### `noop`
Do not change the `checked` value or `indeterminate` value. Developers have the power to
implement customized click actions.

#### `check`
Toggle `checked` value of the checkbox, ignore `indeterminate` value. If the
checkbox is in `indeterminate` state, the checkbox will display as an `indeterminate` checkbox
regardless the `checked` value.

####`check-indeterminate`
Default behavior of `mat-checkbox`. Always set `indeterminate` to `false`
when user click on the `mat-checkbox`.
This matches the behavior of native `<input type="checkbox">`.

### Theming
The color of a `<mat-checkbox>` can be changed by using the `color` property. By default, checkboxes
use the theme's accent color. This can be changed to `'primary'` or `'warn'`.  

### Accessibility
The `<mat-checkbox>` uses an internal `<input type="checkbox">` to provide an accessible experience.
This internal checkbox receives focus and is automatically labelled by the text content of the
`<mat-checkbox>` element.

Checkboxes without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`.

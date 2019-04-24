`<mat-slide-toggle>` is an on/off control that can be toggled via clicking or dragging. 

<!-- example(slide-toggle-overview) -->

The slide-toggle behaves similarly to a checkbox, though it does not support an `indeterminate` 
state like `<mat-checkbox>`.

_Note: the sliding behavior for this component requires that HammerJS is loaded on the page._

### Slide-toggle label
The slide-toggle label is provided as the content to the `<mat-slide-toggle>` element. 

If you don't want the label to appear next to the slide-toggle, you can use 
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or 
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to 
specify an appropriate label.

### Use with `@angular/forms`
`<mat-slide-toggle>` is compatible with `@angular/forms` and supports both `FormsModule` 
and `ReactiveFormsModule`.

### Theming
The color of a `<mat-slide-toggle>` can be changed by using the `color` property. By default, 
slide-toggles use the theme's accent color. This can be changed to `'primary'` or `'warn'`.  

### Accessibility
The `<mat-slide-toggle>` uses an internal `<input type="checkbox">` to provide an accessible
experience. This internal checkbox receives focus and is automatically labelled by the text content
of the `<mat-slide-toggle>` element.

Slide toggles without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`.

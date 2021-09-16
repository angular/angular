`<mat-slide-toggle>` is an on/off control that can be toggled via clicking.

<!-- example(slide-toggle-overview) -->

The slide-toggle behaves similarly to a checkbox, though it does not support an `indeterminate`
state like `<mat-checkbox>`.

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

`MatSlideToggle` uses an internal `<input type="checkbox">` with `role="switch"` to provide an
accessible experience. This internal checkbox receives focus and is automatically labelled by the
text content of the `<mat-slide-toggle>` element. Avoid adding other interactive controls into the
content of `<mat-slide-toggle>`, as this degrades the experience for users of assistive technology.

Always provide an accessible label via `aria-label` or `aria-labelledby` for toggles without
descriptive text content. For dynamic labels, `MatSlideToggle` provides input properties for binding
`aria-label` and `aria-labelledby`. This means that you should not use the `attr.` prefix when
binding these properties, as demonstrated below.

```html
<mat-slide-toggle [aria-label]="isSubscribedToEmailsMessage">
</mat-slide-toggle>
```

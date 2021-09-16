`<mat-button-toggle>` are on/off toggles with the appearance of a button. These toggles can be
configured to behave as either radio-buttons or checkboxes. While they can be standalone, they are
typically part of a `mat-button-toggle-group`.


<!-- example(button-toggle-overview) -->

### Exclusive selection vs. multiple selection
By default, `mat-button-toggle-group` acts like a radio-button group- only one item can be selected.
In this mode, the `value` of the `mat-button-toggle-group` will reflect the value of the selected
button and `ngModel` is supported.

Adding the `multiple` attribute allows multiple items to be selected (checkbox behavior). In this
mode the values of the toggles are not used, the `mat-button-toggle-group` does not have a value,
and `ngModel` is not supported.

<!-- example(button-toggle-mode) -->

### Appearance
By default, the appearance of `mat-button-toggle-group` and `mat-button-toggle` will follow the
latest Material Design guidelines. If you want to, you can switch back to the appearance that was
following the previous Material Design spec by using the `appearance` input. The `appearance` can
be configured globally using the `MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS` injection token.

<!-- example(button-toggle-appearance) -->

### Use with `@angular/forms`
`<mat-button-toggle-group>` is compatible with `@angular/forms` and supports both `FormsModule`
and `ReactiveFormsModule`.

### Orientation
The button-toggles can be rendered in a vertical orientation by adding the `vertical` attribute.

### Accessibility
`MatButtonToggle` internally uses native `button` elements with `aria-pressed` to convey toggle
state. If a toggle contains only an icon, you should specify a meaningful label via `aria-label`
or `aria-labelledby`. For dynamic labels, `MatButtonToggle` provides input properties for binding
`aria-label` and `aria-labelledby`. This means that you should not use the `attr.` prefix when
binding these properties, as demonstrated below.

```html
<mat-button-toggle [aria-label]="alertsEnabled ? 'Disable alerts' : 'Enable alerts'">
  <mat-icon>notifications</mat-icon>
</mat-button-toggle>
```

The `MatButtonToggleGroup` surrounding the individual buttons applies
`role="group"` to convey the association between the individual toggles. Each
`<mat-button-toggle-group>` element should be given a label with `aria-label` or `aria-labelledby`
that communicates the collective meaning of all toggles. For example, if you have toggles for
"Bold", "Italic", and "Underline", you might label the parent group "Font styles".

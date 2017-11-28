`<mat-form-field>` is a component used to wrap several Angular Material components and apply common
[Text field](https://material.io/guidelines/components/text-fields.html) styles such as the
underline, floating label, and hint messages.

In this document, "form field" refers to the wrapper component `<mat-form-field>` and
"form field control" refers to the component that the `<mat-form-field>` is wrapping
(e.g. the input, textarea, select, etc.)

The following Angular Material components are designed to work inside a `<mat-form-field>`:
* [`<input matInput>` &amp; `<textarea matInput>`](https://material.angular.io/components/input/overview)
* [`<mat-select>`](https://material.angular.io/components/select/overview)
* [`<mat-chip-list>`](https://material.angular.io/components/chips/overview)

<!-- example(form-field-overview) -->

### Floating label

The floating label is a text label displayed on top of the form field control when
the control does not contain any text. By default, when text is present the floating label
floats above the form field control. The label for a form field can be defined either through a
`mat-label` element, by setting the `placeholder` attribute on the form control or using the
`mat-placeholder` element. If there are multiple clashing values (e.g. a `placeholder` and a
label) the `mat-label` will take precedence and the `placeholder` will be shown only when there is
no value.

Placeholder text can be specified using the `placeholder` property on the form field control, or
by adding a `<mat-placeholder>` element inside the form field. Only one of these options should be
used, specifying both will raise an error.

If the form field control is marked with a `required` attribute, an asterisk will be appended to the
label to indicate the fact that it is a required field. If unwanted, this can be disabled by
setting the `hideRequiredMarker` property on `<mat-form-field>`

The `floatLabel` property of `<mat-form-field>` can be used to change this default floating
behavior. It can set to `never` to hide the label instead of float it when text is present in
the form field control. It can be set to `always` to float the label even when no text is
present in the form field control. It can also be set to `auto` to restore the default behavior.

<!-- example(form-field-label) -->

Global default label options can be specified by setting providing a value for
`MAT_LABEL_GLOBAL_OPTIONS` in your application's root module. Like the property, the global
setting can be either `always`, `never`, or `auto`.

```ts
@NgModule({
  providers: [
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
```

### Hint labels

Hint labels are additional descriptive text that appears below the form field's underline. A
`<mat-form-field>` can have up to two hint labels; one start-aligned (left in an LTR language, right
in RTL), and one end-aligned.

Hint labels are specified in one of two ways: either by using the `hintLabel` property of
`<mat-form-field>`, or by adding a `<mat-hint>` element inside the form field. When adding a hint
via the `hintLabel` property, it will be treated as the start hint. Hints added via the
`<mat-hint>` hint element can be added to either side by setting the `align` property on
`<mat-hint>` to either `start` or `end`. Attempting to add multiple hints to the same side will
raise an error.

<!-- example(form-field-hint) -->

### Error messages

Error messages can be shown under the form field underline by adding `mat-error` elements inside the
form field. Errors are hidden initially and will be displayed on invalid form fields after the user
has interacted with the element or the parent form has been submitted. Since the errors occupy the
same space as the hints, the hints are hidden when the errors are shown.

If a form field can have more than one error state, it is up to the consumer to toggle which
messages should be displayed. This can be done with CSS, `ngIf` or `ngSwitch`. Multiple error
messages can be shown at the same time if desired, but the `<mat-form-field>` only reserves enough
space to display one error message at a time. Ensuring that enough space is available to display
multiple errors is up to the user.

<!-- example(form-field-error) -->

### Prefix & suffix

Custom content can be included before and after the input tag, as a prefix or suffix. It will be
included within the visual container that wraps the form control as per the Material specification.

Adding the `matPrefix` directive to an element inside the `<mat-form-field>` will designate it as
the prefix. Similarly, adding `matSuffix` will designate it as the suffix.

<!-- example(form-field-prefix-suffix) -->

### Custom form field controls

In addition to the form field controls that Angular Material provides, it is possible to create
custom form field controls that work with `<mat-form-field>` in the same way. For additional
information on this see the guide on
[Creating Custom mat-form-field Controls](https://material.angular.io/guide/creating-a-custom-form-field-control).

### Theming

`<mat-form-field>` has a `color` property which can be set to `primary`, `accent`, or `warn`. This
will set the color of the form field underline and floating label based on the theme colors
of your app.

`<mat-form-field>` inherits its `font-size` from its parent element. This can be overridden to an
explicit size using CSS. We recommend a specificity of at least 1 element + 1 class.

```css
mat-form-field.mat-form-field {
  font-size: 16px;
}
```

<!-- example(form-field-theming) -->

### Accessibility

If a floating label is specified, it will be automatically used as the label for the form
field control. If no floating label is specified, the user should label the form field control
themselves using `aria-label`, `aria-labelledby` or `<label for=...>`.

Any errors and hints added to the form field are automatically added to the form field control's
`aria-describedby` set.

### Troubleshooting

#### Error: Placeholder attribute and child element were both specified

This error occurs when you have specified two conflicting placeholders. Make sure that you haven't
included both a `placeholder` property on your form field control and a `<mat-placeholder>`
element.

#### Error: A hint was already declared for align="..."

This error occurs if you have added multiple hints for the same side. Keep in mind that the
`hintLabel` property adds a hint to the start side.

#### Error: mat-form-field must contain a MatFormFieldControl

This error occurs when you have not added a form field control to your form field. If your form
field contains a native `<input>` or `<textarea>` element, make sure you've added the `matInput`
directive to it. Other components that can act as a form field control include `<mat-select>`,
`<mat-chip-list>`, and any custom form field controls you've created.

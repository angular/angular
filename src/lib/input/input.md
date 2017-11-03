`matInput` is a directive that allows native `<input>` and `<textarea>` elements to work with
[`<mat-form-field>`](https://material.angular.io/components/form-field/overview). 

<!-- example(input-overview) -->

### `<input>` and `<textarea>` attributes

All of the attributes that can be used with normal `<input>` and `<textarea>` elements can be used
on elements inside `<mat-form-field>` as well. This includes Angular directives such as `ngModel`
and `formControl`.

The only limitations are that the `type` attribute can only be one of the values supported by
`matInput` and the native element cannot specify a `placeholder` attribute if the `<mat-form-field>`
also contains an `<mat-placeholder>` element.

### Supported `<input>` types

The following [input types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) can
be used with `matInput`:
* date
* datetime-local
* email
* month
* number
* password
* search
* tel
* text
* time
* url
* week

### Form field features

There are a number of `<mat-form-field>` features that can be used with any `<input matInput>` or
`<textarea matInput>`. These include error messages, hint text, prefix & suffix, and theming. For
additional information about these features, see the
[form field documentation](https://material.angular.io/components/form-field/overview).

### Placeholder

A placeholder is a text label displayed in the input area when the input does not contain text.
When text is present, the placeholder will float above the input area. The placeholder can be
specified either via a `placeholder` attribute on the input or a `<mat-placeholder>` element in the
same form field as the `matInput`. The `<mat-form-field>` also has additional options for changing
the behavior of the placeholder. For more information see the
[form field placeholder documentation](https://material.angular.io/components/form-field/overview#floating-placeholder).

### Changing when error messages are shown

The `<mat-form-field>` allows you to
[associate error messages](https://material.angular.io/components/form-field/overview#error-messages)
with your `matInput`. By default, these error messages are shown when the control is invalid and
either the user has interacted with (touched) the element or the parent form has been submitted. If
you wish to override this behavior (e.g. to show the error as soon as the invalid control is dirty
or when a parent form group is invalid), you can use the `errorStateMatcher` property of the
`matInput`. The property takes an instance of an `ErrorStateMatcher` object. An `ErrorStateMatcher`
must implement a single method `isErrorState` which takes the `FormControl` for this `matInput` as
well as the parent form and returns a boolean indicating whether errors should be shown. (`true`
indicating that they should be shown, and `false` indicating that they should not.)

<!-- example(input-error-state-matcher) -->

A global error state matcher can be specified by setting the `ErrorStateMatcher` provider. This
applies to all inputs. For convenience, `ShowOnDirtyErrorStateMatcher` is available in order to
globally cause input errors to show when the input is dirty and invalid.

```ts
@NgModule({
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
```

### Auto-resizing `<textarea>` elements

`<textarea>` elements can be made to automatically resize to fit their contents by applying the
`matTextareaAutosize` directive. This works with `<textarea matInput>` elements as well as plain
native `<textarea>` elements. The min and max size of the textarea can be specified in rows, using
the `matAutosizeMinRows` and `matAutosizeMaxRows` properties respectively.

<!-- example(input-autosize-textarea) -->

### Accessibility

The `matInput` directive works with native `<input>` to provide an accessible experience.

If a placeholder attribute is added to the input, or a `mat-placeholder` element is added
in the form field, the placeholder text will automatically be used as the label for the input.
If there's no placeholder specified, `aria-label`, `aria-labelledby` or `<label for=...>` should be
added.

Any `mat-error` and `mat-hint` are automatically added to the input's `aria-describedby` list, and
`aria-invalid` is automatically updated based on the input's validity state.

### Troubleshooting

#### Error: Input type "..." isn't supported by matInput

This error is thrown when you attempt to set an input's `type` property to a value that isn't
supported by the `matInput` directive. If you need to use an unsupported input type with
`<mat-form-field>` consider writing a
[custom form field control](https://material.angular.io/guide/creating-a-custom-form-field-control)
for it.

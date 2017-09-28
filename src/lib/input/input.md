`<mat-form-field>` is a wrapper for native `input` and `textarea` elements. This container
applies Material Design styles and behavior while still allowing direct access to the underlying
native element.

The native element wrapped by the `mat-form-field` must be marked with the `matInput` directive.

<!-- example(input-overview) -->

### `input` and `textarea` attributes

All of the attributes that can be used with normal `input` and `textarea` elements can be used on
elements inside `mat-form-field` as well. This includes Angular directives such as
`ngModel` and `formControl`.

The only limitations are that the `type` attribute can only be one of the values supported by
`matInput` and the native element cannot specify a `placeholder` attribute if the `mat-form-field`
also contains an `mat-placeholder` element.

### Supported `input` types

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

### Error messages

Error messages can be shown beneath an input by specifying `mat-error` elements inside the
`mat-form-field`. Errors are hidden by default and will be displayed on invalid inputs after
the user has interacted with the element or the parent form has been submitted. In addition,
whenever errors are displayed, the container's `mat-hint` labels will be hidden.

If an input element can have more than one error state, it is up to the consumer to toggle which
messages should be displayed. This can be done with CSS, `ngIf` or `ngSwitch`.

Note that, while multiple error messages can be displayed at the same time, it is recommended to
only show one at a time.

<!-- example(input-errors) -->

### Placeholder

A placeholder is an indicative text displayed in the input zone when the input does not contain
text. When text is present, the indicative text will float above this input zone.

The `floatPlaceholder` attribute of `mat-form-field` can be set to `never` to hide the
indicative text instead when text is present in the input.

When setting `floatPlaceholder` to `always`, the floating label will always show above the input.

A placeholder for the input can be specified in one of two ways: either using the `placeholder`
attribute on the `input` or `textarea`, or using an `mat-placeholder` element in the
`mat-form-field`. Using both will raise an error.

Global default placeholder options can be specified by setting the `MAT_PLACEHOLDER_GLOBAL_OPTIONS`
provider. This setting will apply to all components that support the floating placeholder.

```ts
@NgModule({
  providers: [
    {provide: MAT_PLACEHOLDER_GLOBAL_OPTIONS, useValue: {float: 'always'}}
  ]
})
```

Here are the available global options:

| Name            | Type    | Values              | Description                               |
| --------------- | ------- | ------------------- | ----------------------------------------- |
| float           | string  | auto, always, never | The default placeholder float behavior.   |

### Prefix and Suffix

HTML can be included before and after the input tag, as a prefix or suffix. It will be underlined
as per the Material specification, and clicking it will focus the input.

Adding the `matPrefix` attribute to an element inside the `mat-form-field` will designate it as
the prefix. Similarly, adding `matSuffix` will designate it as the suffix.

<!-- example(input-prefix-suffix) -->

### Hint Labels

Hint labels are the labels that show below the underline. An `mat-form-field` can have up to two
hint labels; one on the `start` of the line (left in an LTR language, right in RTL), and one on the
`end`.

Hint labels are specified in one of two ways: either using the `hintLabel` attribute of
`mat-form-field`, or using an `mat-hint` element inside the `mat-form-field`, which takes an
`align` attribute containing the side. The attribute version is assumed to be at the `start`.
Specifying a side twice will result in an exception during initialization.

<!-- example(input-hint) -->

### Underline Color

The underline (line under the `input` content) color can be changed by using the `color`
attribute of `mat-form-field`. A value of `primary` is the default and will correspond to the
theme primary color. Alternatively, `accent` or `warn` can be specified to use the theme's accent or
warn color.

### Custom Error Matcher

By default, error messages are shown when the control is invalid and either the user has interacted with
(touched) the element or the parent form has been submitted. If you wish to override this
behavior (e.g. to show the error as soon as the invalid control is dirty or when a parent form group
is invalid), you can use the `errorStateMatcher` property of the `matInput`. To use this property,
create a function in your component class that returns a boolean. A result of `true` will display
the error messages.

```html
<mat-form-field>
  <input matInput [(ngModel)]="myInput" required [errorStateMatcher]="myErrorStateMatcher">
  <mat-error>This field is required</mat-error>
</mat-form-field>
```

```ts
function myErrorStateMatcher(control: FormControl, form: FormGroupDirective | NgForm): boolean {
  // Error when invalid control is dirty, touched, or submitted
  const isSubmitted = form && form.submitted;
  return !!(control.invalid && (control.dirty || control.touched || isSubmitted));
}
```

A global error state matcher can be specified by setting the `MAT_ERROR_GLOBAL_OPTIONS` provider. This applies
to all inputs. For convenience, `showOnDirtyErrorStateMatcher` is available in order to globally set
input errors to show when the input is dirty and invalid.

```ts
@NgModule({
  providers: [
    {provide: MAT_ERROR_GLOBAL_OPTIONS, useValue: {errorStateMatcher: showOnDirtyErrorStateMatcher}}
  ]
})
```

Here are the available global options:

| Name              | Type     | Description |
| ----------------- | -------- | ----------- |
| errorStateMatcher | Function | Returns a boolean specifying if the error should be shown |

### Accessibility
The `matInput` directive works with native `<input>` to provide an accessible experience.

If a placeholder attribute is added to the input, or a `mat-placeholder` element is added
in the form field, the placeholder text will automatically be used as the label for the input.
If there's no placeholder specified, `aria-label`, `aria-labelledby` or `<label for=...>` should be
added.

Any `mat-error` and `mat-hint` are automatically added to the input's `aria-describedby`.

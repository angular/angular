`<mat-select>` is a form control for selecting a value from a set of options, similar to the native
`<select>` element. You can read more about selects in the
[Material Design spec](https://material.google.com/components/menus.html). It is designed to work
inside of a [`<mat-form-field>`](https://material.angular.io/components/form-field/overview)
element.

To add options to the select, add `<mat-option>` elements to the `<mat-select>`. Each `<mat-option>`
has a `value` property that can be used to set the value that will be selected if the user chooses
this option. The content of the `<mat-option>` is what will be shown to the user.

<!-- example(select-overview) -->

### Getting and setting the select value

The `<mat-select>` supports 2-way binding to the `value` property without the need for Angular
forms.

<!-- example(select-value-binding) -->

The `<mat-select>` also supports all of the form directives from the core `FormsModule` and
`ReactiveFormsModule` (`ngModel`, `formControl`, etc.) As with native `<select>`, `<mat-select>`
also supports a `compareWith` function. (Additional information about using a custom `compareWith`
function can be found in the
[Angular forms documentation](https://angular.io/api/forms/SelectControlValueAccessor#caveat-option-selection)).

<!-- example(select-form) -->

### Form field features

There are a number of `<mat-form-field>` features that can be used with any `<mat-select>`. These
include error messages, hint text, prefix & suffix, and theming. For additional information about
these features, see the
[form field documentation](https://material.angular.io/components/form-field/overview).

<!-- example(select-hint-error) -->

### Setting a static placeholder

The placeholder is a text label displayed in the select trigger area when no value is selected. When
a value is selected, the placeholder will float above the select trigger area. The placeholder can
be specified either via a `placeholder` attribute on the `<mat-select>` or a `<mat-placeholder>`
element in the same form field as the `<mat-select>`. The `<mat-form-field>` also has additional
options for changing the behavior of the placeholder. For more information see the
[form field placeholder documentation](https://material.angular.io/components/form-field/overview#floating-placeholder).

### Disabling the select or individual options

It is possible to disable the entire select or individual options in the select by using the
disabled property on the `<mat-select>` and the `<mat-option>` components respectively.

<!-- example(select-disabled) -->

### Resetting the select value

If you want one of your options to reset the select's value, you can omit specifying its value.

<!-- example(select-reset) -->

### Creating groups of options

The `<mat-optgroup>` element can be used to group common options under a subheading. The name of the
group can be set using the `label` property of `<mat-optgroup>`. Like individual `<mat-option>`
elements, an entire `<mat-optgroup>` can be disabled or enabled by setting the `disabled` property
on the group.

<!-- example(select-optgroup) -->

### Multiple selection

`<mat-select>` defaults to single-selection mode, but can be configured to allow multiple selection 
by setting the `multiple` property. This will allow the user to select multiple values at once. When
using the `<mat-select>` in multiple selection mode, its value will be a sorted list of all selected
values rather than a single value.

<!-- example(select-multiple) -->

### Customizing the trigger label

If you want to display a custom trigger label inside a select, you can use the
`<mat-select-trigger>` element.

<!-- example(select-custom-trigger) -->

### Disabling the ripple effect

By default, when a user clicks on a `<mat-option>`, a ripple animation is shown. This can be disabled
by setting the `disableRipple` property on `<mat-select>`.

<!-- example(select-no-ripple) -->

### Adding custom styles to the dropdown panel

In order to facilitate easily styling the dropdown panel, `<mat-select>` has a `panelClass` property
which can be used to apply additional CSS classes to the dropdown panel.

<!-- example(select-panel-class) -->

### Changing when error messages are shown

The `<mat-form-field>` allows you to
[associate error messages](https://material.angular.io/components/form-field/overview#error-messages)
with your `<mat-select>`. By default, these error messages are shown when the control is invalid and
either the user has interacted with (touched) the element or the parent form has been submitted. If
you wish to override this behavior (e.g. to show the error as soon as the invalid control is dirty
or when a parent form group is invalid), you can use the `errorStateMatcher` property of the
`<mat-select>`. The property takes an instance of an `ErrorStateMatcher` object. An
`ErrorStateMatcher` must implement a single method `isErrorState` which takes the `FormControl` for
this `<mat-select>` as well as the parent form and returns a boolean indicating whether errors
should be shown. (`true` indicating that they should be shown, and `false` indicating that they
should not.)

<!-- example(select-error-state-matcher) -->

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

### Keyboard interaction

- <kbd>DOWN_ARROW</kbd>: Focus next option
- <kbd>UP_ARROW</kbd>: Focus previous option
- <kbd>ENTER</kbd> or <kbd>SPACE</kbd>: Select focused item

### Accessibility

The select component without text or label should be given a meaningful label via
`aria-label` or `aria-labelledby`.

The select component has `role="listbox"` and options inside select have `role="option"`.

### Troubleshooting

#### Error: Cannot change `multiple` mode of select after initialization

This error is thrown if you attempt to bind the `multiple` property on `<mat-select>` to a dynamic
value. (e.g. `[multiple]="isMultiple"` where the value of `isMultiple` changes over the course of
the component's lifetime). If you need to change this dynamically, use `ngIf` or `ngSwitch` instead:

```html
<mat-select *ngIf="isMultiple" multiple>
  ...
</mat-select>
<mat-select *ngIf="!isMultiple">
  ...
</mat-select>
```

#### Error: Value must be an array in multiple-selection mode

This error is thrown if you attempt to assign a value other than `null`, `undefined`, or an array to
a `<mat-select multiple>`. For example, something like `mySelect.value = 'option1'`. What you likely
meant to do was `mySelect.value = ['option1']`.

#### Error: `compareWith` must be a function

This error occurs if you attempt to assign something other than a function to the `compareWith`
property. For more information on proper usage of `compareWith` see the
[Angular forms documentation](https://angular.io/api/forms/SelectControlValueAccessor#caveat-option-selection)).

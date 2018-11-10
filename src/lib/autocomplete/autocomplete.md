The autocomplete is a normal text input enhanced by a panel of suggested options.

### Simple autocomplete

Start by adding a regular `matInput` to your template. Let's assume you're using the `formControl`
directive from `ReactiveFormsModule` to track the value of the input.

> Note: It is possible to use template-driven forms instead, if you prefer. We use reactive forms
in this example because it makes subscribing to changes in the input's value easy. For this
example, be sure to import `ReactiveFormsModule` from `@angular/forms` into your `NgModule`.
If you are unfamiliar with using reactive forms, you can read more about the subject in the
[Angular documentation](https://angular.io/guide/reactive-forms).

*my-comp.html*
```html
<mat-form-field>
  <input type="text" matInput [formControl]="myControl">
</mat-form-field>
```

Next, create the autocomplete panel and the options displayed inside it. Each option should be
defined by a `mat-option` tag. Set each option's value property to whatever you'd like the value
of the text input to be upon that option's selection.

*my-comp.html*
```html
<mat-autocomplete>
  <mat-option *ngFor="let option of options" [value]="option">
    {{ option }}
  </mat-option>
</mat-autocomplete>
```

Now we'll need to link the text input to its panel. We can do this by exporting the autocomplete
panel instance into a local template variable (here we called it "auto"), and binding that variable
to the input's `matAutocomplete` property.

*my-comp.html*
```html
<mat-form-field>
  <input type="text" matInput [formControl]="myControl" [matAutocomplete]="auto">
</mat-form-field>

<mat-autocomplete #auto="matAutocomplete">
  <mat-option *ngFor="let option of options" [value]="option">{{option}}</mat-option>
</mat-autocomplete>
```

<!-- example(autocomplete-simple) -->

### Adding a custom filter

At this point, the autocomplete panel should be toggleable on focus and options should be
selectable. But if we want our options to filter when we type, we need to add a custom filter.

You can filter the options in any way you like based on the text input\*. Here we will perform a
simple string test on the option value to see if it matches the input value, starting from the
option's first letter. We already have access to the built-in `valueChanges` Observable on the
`FormControl`, so we can simply map the text input's values to the suggested options by passing
them through this filter. The resulting Observable, `filteredOptions`, can be added to the
template in place of the `options` property using the `async` pipe.

Below we are also priming our value change stream with an empty string so that the options are
filtered by that value on init (before there are any value changes).

\*For optimal accessibility, you may want to consider adding text guidance on the page to explain
filter criteria. This is especially helpful for screenreader users if you're using a non-standard
filter that doesn't limit matches to the beginning of the string.

<!-- example(autocomplete-filter) -->

### Setting separate control and display values

If you want the option's control value (what is saved in the form) to be different than the option's
display value (what is displayed in the text field), you'll need to set the `displayWith`
property on your autocomplete element. A common use case for this might be if you want to save your
data as an object, but display just one of the option's string properties.

To make this work, create a function on your component class that maps the control value to the
desired display value. Then bind it to the autocomplete's `displayWith` property.

<!-- example(autocomplete-display) -->

### Automatically highlighting the first option

If your use case requires for the first autocomplete option to be highlighted when the user opens
the panel, you can do so by setting the `autoActiveFirstOption` input on the `mat-autocomplete`
component. This behavior can be configured globally using the `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS`
injection token.

<!-- example(autocomplete-auto-active-first-option) -->

### Attaching the autocomplete panel to a different element

By default the autocomplete panel will be attached to your input element, however in some cases you
may want it to attach to a different container element. You can change the element that the
autocomplete is attached to using the `matAutocompleteOrigin` directive together with the
`matAutocompleteConnectedTo` input:

```html
<div class="custom-wrapper-example" matAutocompleteOrigin #origin="matAutocompleteOrigin">
  <input
    matInput
    [formControl]="myControl"
    [matAutocomplete]="auto"
    [matAutocompleteConnectedTo]="origin">
</div>

<mat-autocomplete #auto="matAutocomplete">
  <mat-option *ngFor="let option of options" [value]="option">{{option}}</mat-option>
</mat-autocomplete>
```

### Keyboard interaction
- <kbd>DOWN_ARROW</kbd>: Next option becomes active.
- <kbd>UP_ARROW</kbd>: Previous option becomes active.
- <kbd>ENTER</kbd>: Select currently active item.

### Option groups
`mat-option` can be collected into groups using the `mat-optgroup` element:
<!-- example(autocomplete-optgroup) -->


```html
<mat-autocomplete #auto="matAutocomplete">
  <mat-optgroup *ngFor="let group of filteredGroups | async" [label]="group.name">
    <mat-option *ngFor="let option of group.options" [value]="option">
      {{option.name}}
    </mat-option>
  </mat-optgroup>
</mat-autocomplete>
```

### Accessibility
The input for an autocomplete without text or labels should be given a meaningful label via
`aria-label` or `aria-labelledby`.

The autocomplete trigger is given `role="combobox"`. The trigger sets `aria-owns` to the
autocomplete's id, and sets `aria-activedescendant` to the active option's id.

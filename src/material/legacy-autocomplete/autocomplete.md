The autocomplete is a normal text input enhanced by a panel of suggested options.

### Simple autocomplete

Start by creating the autocomplete panel and the options displayed inside it. Each option should be
defined by a `mat-option` tag. Set each option's value property to whatever you'd like the value
of the text input to be when that option is selected.

<!-- example({"example":"autocomplete-simple",
              "file":"autocomplete-simple-example.html", 
              "region":"mat-autocomplete"}) -->

Next, create the input and set the `matAutocomplete` input to refer to the template reference we assigned 
to the autocomplete. Let's assume you're using the `formControl` directive from `ReactiveFormsModule` to 
track the value of the input.

> Note: It is possible to use template-driven forms instead, if you prefer. We use reactive forms
in this example because it makes subscribing to changes in the input's value easy. For this
example, be sure to import `ReactiveFormsModule` from `@angular/forms` into your `NgModule`.
If you are unfamiliar with using reactive forms, you can read more about the subject in the
[Angular documentation](https://angular.io/guide/reactive-forms).

Now we'll need to link the text input to its panel. We can do this by exporting the autocomplete
panel instance into a local template variable (here we called it "auto"), and binding that variable
to the input's `matAutocomplete` property.

<!-- example({"example":"autocomplete-simple",
              "file":"autocomplete-simple-example.html", 
              "region":"input"}) -->

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

### Autocomplete on a custom input element

While `mat-autocomplete` supports attaching itself to a `mat-form-field`, you can also set it on
any other `input` element using the `matAutocomplete` attribute. This allows you to customize what
the input looks like without having to bring in the extra functionality from `mat-form-field`.

<!-- example(autocomplete-plain-input) -->

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
| Keyboard shortcut                      | Action                                                         |
|----------------------------------------|----------------------------------------------------------------|
| <kbd>Down Arrow</kbd>                  | Navigate to the next option.                                   |
| <kbd>Up Arrow</kbd>                    | Navigate to the previous option.                               |
| <kbd>Enter</kbd>                       | Select the active option.                                      |
| <kbd>Escape</kbd>                      | Close the autocomplete panel.                                  |
| <kbd>Alt</kbd> + <kbd>Up Arrow</kbd>   | Close the autocomplete panel.                                  |
| <kbd>Alt</kbd> + <kbd>Down Arrow</kbd> | Open the autocomplete panel if there are any matching options. |

### Option groups
`mat-option` can be collected into groups using the `mat-optgroup` element:
<!-- example({"example":"autocomplete-optgroup",
              "file":"autocomplete-optgroup-example.html", 
              "region":"mat-autocomplete"}) -->

### Accessibility

`MatAutocomplete` implements the ARIA combobox interaction pattern. The text input trigger specifies
`role="combobox"` while the content of the pop-up applies `role="listbox"`. Because of this listbox
pattern, you should _not_ put other interactive controls, such as buttons or checkboxes, inside
an autocomplete option. Nesting interactive controls like this interferes with most assistive
technology.

Always provide an accessible label for the autocomplete. This can be done by using a
`<mat-label>` inside of `<mat-form-field>`, a native `<label>` element, the `aria-label`
attribute, or the `aria-labelledby` attribute.

`MatAutocomplete` preserves focus on the text trigger, using `aria-activedescendant` to support
navigation though the autocomplete options.

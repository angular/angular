The autocomplete is a normal text input enhanced by a panel of suggested options.
You can read more about autocompletes in the [Material Design spec](https://material.io/guidelines/components/text-fields.html#text-fields-auto-complete-text-field).

### Simple autocomplete

Start by adding a regular `mdInput` to the page. Let's assume you're using the `formControl`
directive from the `@angular/forms` module to track the value of the input.

*my-comp.html*
```html
<md-form-field>
   <input type="text" mdInput [formControl]="myControl">
</md-form-field>
```

Next, create the autocomplete panel and the options displayed inside it. Each option should be
defined by an `md-option` tag. Set each option's value property to whatever you'd like the value
of the text input to be upon that option's selection.

*my-comp.html*
```html
<md-autocomplete>
   <md-option *ngFor="let option of options" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

Now we'll need to link the text input to its panel. We can do this by exporting the autocomplete
panel instance into a local template variable (here we called it "auto"), and binding that variable
to the input's `mdAutocomplete` property.

*my-comp.html*
```html
<md-form-field>
   <input type="text" mdInput [formControl]="myControl" [mdAutocomplete]="auto">
</md-form-field>

<md-autocomplete #auto="mdAutocomplete">
   <md-option *ngFor="let option of options" [value]="option">
      {{ option }}
   </md-option>
</md-autocomplete>
```

<!-- example(autocomplete-simple) -->

### Adding a custom filter

At this point, the autocomplete panel should be toggleable on focus and options should be
selectable. But if we want our options to filter when we type, we need to add a custom filter.

You can filter the options in any way you like based on the text input*. Here we will perform a
simple string test on the option value to see if it matches the input value, starting from the
option's first letter. We already have access to the built-in `valueChanges` observable on the
`FormControl`, so we can simply map the text input's values to the suggested options by passing
them through this filter. The resulting observable (`filteredOptions`) can be added to the
template in place of the `options` property using the `async` pipe.

Below we are also priming our value change stream with `null` so that the options are filtered by
that value on init (before there are any value changes).

*For optimal accessibility, you may want to consider adding text guidance on the page to explain
filter criteria. This is especially helpful for screenreader users if you're using a non-standard
filter that doesn't limit matches to the beginning of the string.

<!-- example(autocomplete-filter) -->

### Setting separate control and display values

If you want the option's control value (what is saved in the form) to be different than the option's
display value (what is displayed in the actual text field), you'll need to set the `displayWith`
property on your autocomplete element. A common use case for this might be if you want to save your
data as an object, but display just one of the option's string properties.

To make this work, create a function on your component class that maps the control value to the
desired display value. Then bind it to the autocomplete's `displayWith` property.

<!-- example(autocomplete-display) -->

### Keyboard interaction
- <kbd>DOWN_ARROW</kbd>: Next option becomes active.
- <kbd>UP_ARROW</kbd>: Previous option becomes active.
- <kbd>ENTER</kbd>: Select currently active item.

#### Option groups
`md-option` can be collected into groups using the `md-optgroup` element:

```html
<md-autocomplete #auto="mdAutocomplete">
  <md-optgroup *ngFor="let group of filteredGroups | async" [label]="group.name">
    <md-option *ngFor="let option of group.options" [value]="option">
      {{ option.name }}
    </md-option>
  </md-optgroup>
</md-autocomplete>
```

### Accessibility
The input for autocomplete without text or labels should be given a meaningful label via
`aria-label` or `aria-labelledby`.

Autocomplete trigger is given `role="combobox"`. The trigger sets `aria-owns` to the autocomplete's
id, and sets `aria-activedescendant` to the active option's id.

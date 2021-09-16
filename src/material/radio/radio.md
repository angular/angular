`<mat-radio-button>` provides the same functionality as a native `<input type="radio">` enhanced with
Material Design styling and animations.

<!-- example(radio-overview) -->

All radio-buttons with the same `name` comprise a set from which only one may be selected at a time.

### Radio-button label
The radio-button label is provided as the content to the `<mat-radio-button>` element. The label can
be positioned before or after the radio-button by setting the `labelPosition` property to `'before'`
or `'after'`.

If you don't want the label to appear next to the radio-button, you can use
[`aria-label`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-label) or
[`aria-labelledby`](https://www.w3.org/TR/wai-aria/states_and_properties#aria-labelledby) to
specify an appropriate label.


### Radio groups
Radio-buttons should typically be placed inside of an `<mat-radio-group>` unless the DOM structure
would make that impossible (e.g., radio-buttons inside of table cells). The radio-group has a
`value` property that reflects the currently selected radio-button inside of the group.

Individual radio-buttons inside of a radio-group will inherit the `name` of the group.


### Use with `@angular/forms`
`<mat-radio-group>` is compatible with `@angular/forms` and supports both `FormsModule`
and `ReactiveFormsModule`.

### Default Color Configuration
The default color for radio buttons can be configured globally using the `MAT_RADIO_DEFAULT_OPTIONS` provider

```
providers: [{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'accent' },
}]
```

### Accessibility

`MatRadioButton` uses an internal `<input type="radio">` to provide an accessible experience.
This internal radio button receives focus and is automatically labelled by the text content of the
`<mat-radio-button>` element. Avoid adding other interactive controls into the content of
`<mat-radio-button>`, as this degrades the experience for users of assistive technology.

Always provide an accessible label via `aria-label` or `aria-labelledby` for radio buttons without
descriptive text content. For dynamic labels and descriptions, `MatRadioButton` provides input
properties for binding `aria-label`, `aria-labelledby`, and `aria-describedby`. This means that you
should not use the `attr.` prefix when binding these properties, as demonstrated below.

```html
<mat-radio-button [aria-label]="getMultipleChoiceAnswer()">
</mat-radio-button>
```

Prefer placing all radio buttons inside of a `<mat-radio-group>` rather than creating standalone
radio buttons because groups are easier to use exclusively with a keyboard. 

You should provide an accessible label for all `<mat-radio-group>` elements via `aria-label` or
`aria-labelledby`. 

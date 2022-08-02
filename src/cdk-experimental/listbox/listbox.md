The `@angular/cdk/listbox` module provides directives to help create custom listbox interactions
based on the [WAI ARIA listbox pattern][aria].

By using `@angular/cdk/listbox` you get all the expected behaviors for an accessible experience,
including bidi layout support, keyboard interaction, and focus management. All directives apply
their associated ARIA roles to their host element.

### Supported ARIA Roles

The directives in `@angular/cdk/listbox` set the appropriate roles on their host element.

| Directive  | ARIA Role |
|------------|-----------|
| cdkOption  | option    |
| cdkListbox | listbox   |

### CSS Styles and Classes

The `@angular/cdk/listbox` is designed to be highly customizable to your needs. It therefore does not
make any assumptions about how elements should be styled. You are expected to apply any required
CSS styles, but the directives do apply CSS classes to make it easier for you to add custom styles.
The available CSS classes are listed below, by directive.

| Directive      | CSS Class          | Applied...              |
|:---------------|--------------------|-------------------------|
| cdkOption      | .cdk-option        | Always                  |
| cdkOption      | .cdk-option-active | If the option is active |
| cdkListbox     | .cdk-listbox       | Always                  |

In addition to CSS classes, these directives add aria attributes that can be targeted in CSS.

| Directive  | Attribute Selector               | Applied...                              |
|:-----------|----------------------------------|-----------------------------------------|
| cdkOption  | \[aria-disabled="true"]          | If the option is disabled               |
| cdkOption  | \[aria-disabled="false"]         | If the option is not disabled           |
| cdkOption  | \[aria-selected="true"]          | If the option is selected               |
| cdkOption  | \[aria-selected="false"]         | If the option is not selected           |
| cdkListbox | \[aria-disabled="true"]          | If the listbox is disabled              |
| cdkListbox | \[aria-disabled="false"]         | If the listbox is not disabled          |
| cdkListbox | \[aria-multiselectable="true"]   | If the listbox is multiple selection    |
| cdkListbox | \[aria-multiselectable="false"]  | If the listbox is single selection      |
| cdkListbox | \[aria-orientation="horizontal"] | If the listbox is oriented horizontally |
| cdkListbox | \[aria-orientation="vertical"]   | If the listbox is oriented vertically   |

### Getting started

Import the `CdkListboxModule` into the `NgModule` in which you want to create a listbox. You can
then apply listbox directives to build your custom listbox. A typical listbox consists of the
following directives:

- `cdkListbox` - Added to the container element containing the options to be selected
- `cdkOption` - Added to each selectable option in the listbox

<!-- example({
  "example": "cdk-listbox-overview",
  "file": "cdk-listbox-overview-example.html",
  "region": "listbox"
}) -->

### Option values

Each option in a listbox is bound to the value it represents when selected, e.g.
`<li cdkOption="red">Red</li>`. Within a single listbox, each option must have a unique value. If 
an option is not explicitly given a value, its value is considered to be `''` (empty string), e.g.
`<li cdkOption>No color preference</li>`.

<!-- example({
  "example": "cdk-listbox-overview",
  "file": "cdk-listbox-overview-example.html",
  "region": "option"
}) -->

### Single vs multiple selection

Listboxes only support a single selected option at a time by default, but adding 
`cdkListboxMultiple` will enable selecting more than one option.

<!-- example({
  "example": "cdk-listbox-multiple",
  "file": "cdk-listbox-multiple-example.html",
  "region": "listbox"
}) -->

### Listbox value

The listbox's value is an array containing the values of the selected option(s). This is true even
for the single selection listbox, whose value is an array containing a single element. The listbox's
value can be bound using `[cdkListboxValue]` and `(cdkListboxValueChange)`.

<!-- example({
  "example": "cdk-listbox-value-binding",
  "file": "cdk-listbox-value-binding-example.html",
  "region": "listbox"
}) -->

Internally the listbox compares the listbox value against the individual option values using
`Object.is` to determine which options should appear selected. If your option values are complex
objects, you should provide a custom comparison function instead. This can be set via the
`cdkListboxCompareWith` input on the listbox.

<!-- example({
  "example": "cdk-listbox-compare-with",
  "file": "cdk-listbox-compare-with-example.html",
  "region": "listbox"
}) -->

### Angular Forms support 

The CDK Listbox supports both template driven forms and reactive forms.

<!-- example({
  "example": "cdk-listbox-template-forms",
  "file": "cdk-listbox-template-forms-example.html",
  "region": "listbox"
}) -->

<!-- example({
  "example": "cdk-listbox-reactive-forms",
  "file": "cdk-listbox-reactive-forms-example.html",
  "region": "listbox"
}) -->

#### Forms validation

The CDK listbox integrates with Angular's form validation API and has the following built-in
validation errors:

- `cdkListboxUnexpectedOptionValues` - Raised when the bound value contains values that do not
  appear as option value in the listbox. The validation error contains a `values` property that
  lists the invalid values
- `cdkListboxUnexpectedMultipleValues` - Raised when a single-selection listbox is bound to a value
  containing multiple selected options.

<!-- example({
  "example": "cdk-listbox-forms-validation",
  "file": "cdk-listbox-forms-validation-example.ts",
  "region": "errors"
}) -->

### Disabling options

You can disable options for selection by setting `cdkOptionDisabled`.
In addition, the entire listbox control can be disabled by setting `cdkListboxDisabled` on the
listbox element.

<!-- example({
  "example": "cdk-listbox-disabled",
  "file": "cdk-listbox-disabled-example.html",
  "region": "listbox"
}) -->

### Accessibility

The directives defined in `@angular/cdk/listbox` follow accessibility best practices as defined
in the [ARIA spec][aria]. Keyboard interaction is supported as defined in the
[ARIA listbox keyboard interaction spec][keyboard] _without_ the optional selection follows focus
logic (TODO: should we make this an option?).

#### Listbox label

Always give the listbox a meaningful label for screen readers. If your listbox has a visual label,
you can associate it with the listbox using `aria-labelledby`, otherwise you should provide a
screen-reader-only label with `aria-label`.

#### Roving tabindex vs active descendant

By default, the CDK listbox uses the [roving tabindex][roving-tabindex] strategy to manage focus.
If you prefer to use the [aria-activedescendant][activedescendant] strategy instead, set
`useActiveDescendant=true` on the listbox.

<!-- example({
  "example": "cdk-listbox-activedescendant",
  "file": "cdk-listbox-activedescendant-example.html",
  "region": "listbox"
}) -->

#### Orientation

Listboxes assume a vertical orientation by default, but can be customized by setting the
`cdkListboxOrientation` input. Note that this only affects the keyboard navigation. You
will still need to adjust your CSS styles to change the visual appearance.

<!-- example({
  "example": "cdk-listbox-horizontal",
  "file": "cdk-listbox-horizontal-example.html",
  "region": "listbox"
}) -->

#### Option typeahead

The CDK listbox supports typeahead based on the option text. If the typeahead text for your options
needs to be different than the display text (e.g. to exclude emoji), this can be accomplished by
setting the `cdkOptionTypeaheadLabel` on the option.

<!-- example({
  "example": "cdk-listbox-custom-typeahead",
  "file": "cdk-listbox-custom-typeahead-example.html",
  "region": "listbox"
}) -->

#### Keyboard navigation options

When using keyboard navigation to navigate through the options, the navigation wraps when attempting
to navigate past the start or end of the options. To change this, set
`cdkListboxNavigationWrapDisabled` on the listbox.

Keyboard navigation skips disabled options by default. To change this set
`cdkListboxNavigatesDisabledOptions` on the listbox.

<!-- example({
  "example": "cdk-listbox-custom-navigation",
  "file": "cdk-listbox-custom-navigation-example.html",
  "region": "listbox"
}) -->

<!-- links -->

[aria]: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ 'WAI ARIA Listbox Pattern'
[keyboard]: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboard-interaction-11 'WAI ARIA Listbox Keyboard Interaction'
[roving-tabindex]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex 'MDN Roving Tabindex Technique'
[activedescendant]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_2_aria-activedescendant 'MDN aria-activedescendant Technique'

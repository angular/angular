Chips allow users to view information, make selections, filter content, and enter data.

### Static Chips

Chips are always used inside a container. To create chips, start with a `<mat-chip-set>` element. Then, nest `<mat-chip>` elements inside the `<mat-chip-set>`.

<!-- example(chips-overview) -->

By default, `<mat-chip>` renders a chip with Material Design styles applied. For a chip with no styles applied, use `<mat-basic-chip>`.

*Hint: `<mat-basic-chip>` receives the `mat-mdc-basic-chip` CSS class in addition to the `mat-mdc-chip` class.*

#### Disabled appearance

Although `<mat-chip>` is not interactive, you can set the `disabled` Input to give it disabled appearance.

```html
<mat-chip disabled>Orange</mat-chip>
```

### Selection Chips

Use `<mat-chip-listbox>` and `<mat-chip-option>` for selecting one or many items from a list. Start with creating a `<mat-chip-listbox>` element. If the user may select more than one option, add the `multiple` attribute. Nest a `<mat-chip-option>` element inside the `<mat-chip-listbox>` for each available option.

#### Disabled `<mat-chip-option>`

Use the `disabled` Input to disable a `<mat-chip-option>`. This gives the `<mat-chip-option>` a disabled appearance and prevents the user from interacting with it.

```html
<mat-chip-option disabled>Orange</mat-chip-option>
```

#### Keyboard Interactions

Users can move through the chips using the arrow keys and select/deselect them with space. Chips also gain focus when clicked, ensuring keyboard navigation starts at the currently focused chip.

### Chips connected to an input field

Use `<mat-chip-grid>` and `<mat-chip-row>` for assisting users with text entry.

Chips are always used inside a container. To create chips connected to an input field, start by creating a `<mat-chip-grid>` as the container. Add an `<input/>` element, and register it to the `<mat-chip-grid>` by passing the `matChipInputFor` Input. Always use an `<input/>` elemnt with `<mat-chip-grid>`. Nest a `<mat-chip-row>` element inside the `<mat-chip-grid>` for each piece of data entered by the user. An example of of using chips for text input.

<!-- example(chips-input) -->

#### Disabled `<mat-chip-row>`

Use the `disabled` Input to disable a `<mat-chip-row>`. This  gives the `<mat-chip-row>` a disabled appearance and prevents the user from interacting with it.

```html
<mat-chip-row disabled>Orange</mat-chip-row>
```

#### Keyboard Interactions

Users can move through the chips using the arrow keys and select/deselect them with the space. Chips also gain focus when clicked, ensuring keyboard navigation starts at the appropriate chip.

Users can press delete to remove a chip. Pressing delete triggers the `removed` Output on the chip, so be sure to implement `removed` if you require that functionality.

#### Autocomplete

An example of chip input with autocomplete.

<!-- example(chips-autocomplete) -->

### Icons
You can add icons to chips to identify entities (like individuals) and provide additional functionality.

#### Adding up to two icons with content projection

You can add two additional icons to an individual chip. A chip has two slots to display icons using content projection. All variants of chips support adding icons including `<mat-chip>`, `<mat-chip-option>`, and `<mat-chip-row>`.

A chip has a front slot for adding an avatar image. To add an avatar, nest an element with `matChipAvatar` attribute inside of `<mat-chip>`.

<!-- example(chips-avatar) -->

You can add an additional icon to the back slot by nesting an element with either the `matChipTrailingIcon` or `matChipRemove` attribute.

#### Remove Button

Sometimes the end user would like the ability to remove a chip. You can provide that functionality using `matChipRemove`. `matChipRemove` renders to the back slot of a chip and triggers the `removed` Output when clicked.

To create a remove button, nest a `<button>` element with `matChipRemove` attribute inside the `<mat-chip-option>`. Be sure to implement the `removed` Output.

```html
 <mat-chip-option>
  Orange
  <button matChipRemove aria-label="Remove orange">
    <mat-icon>cancel</mat-icon>
  </button>
</mat-chip-option>
```

See the [accessibility](#accessibility) section for how to create accessible icons.

### Orientation

By default, chips are displayed horizontally. To stack chips vertically, apply the `mat-mdc-chip-set-stacked` class to `<mat-chip-set>`, `<mat-chip-listbox>` or `<mat-chip-grid>`. 

<!-- example(chips-stacked) -->

### Specifying global configuration defaults
Use the `MAT_CHIPS_DEFAULT_OPTIONS` token to specify default options for the chips module.

```html
@NgModule({
  providers: [
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [COMMA, SPACE]
      }
    }
  ]
})
```

### Theming

By default, chips use the primary color. Specify the `color` property to change the color to `accent` or `warn`.

### Interaction Patterns

The chips components support 3 user interaction patterns, each with its own container and chip elements:

#### Listbox

`<mat-chip-listbox>` and `<mat-chip-option>` : These elements implement a listbox accessibility pattern. Use them to present set of user selectable options.

```html
<mat-chip-listbox aria-label="select a shirt size">
  <mat-chip-option> Small </mat-chip-option>
  <mat-chip-option> Medium </mat-chip-option>
  <mat-chip-option> Large </mat-chip-option>
</mat-chip-listbox>
```

#### Text Entry

`<mat-chip-grid>` and `<mat-chip-row>` : These elements implement a grid accessibility pattern. Use them as part of a free form input that allows users to enter text to add chips.

```html
<mat-form-field>
  <mat-chip-grid #myChipGrid [(ngModel)]="mySelection"
  aria-label="enter sandwich fillings">
    <mat-chip-row *ngFor="let filling of fillings"
                 (removed)="remove(filling)">
      {{filling.name}}
      <button matChipRemove>
        <mat-icon>cancel</mat-icon>
      </button>
    </mat-chip-row>
    <input [matChipInputFor]="myChipGrid"
           [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
           (matChipInputTokenEnd)="add($event)" />
  </mat-chip-grid>
</mat-form-field>
```

#### Static Content

`<mat-chip-set>` and `<mat-chip>` as an unordered list : Present a list of items that are not interactive. This interaction pattern mimics using `ul` and `li` elements. Apply role="list" to the `<mat-list>`. Apply role="listitem" to each `<mat-list-item>`.

```html
<mat-chip-set role="list">
  <mat-chip role="listitem"> Sugar </mat-chip>
  <mat-chip role="listitem"> Spice </mat-chip>
  <mat-chip role="listitem"> Everything Nice </mat-chip>
</mat-chip-set>
```

`<mat-chip-set>` and `<mat-chip>` : These elements do not implement any specific accessibility pattern. Add the appropriate accessibility depending on the context. Note that Angular Material does not intend `<mat-chip>`, `<mat-basic-chip>`, and `<mat-chip-set>` to be interactive.

```html
<mat-chip-set>
  <mat-chip> John </mat-chip>
  <mat-chip> Paul </mat-chip>
  <mat-chip> James </mat-chip>
</mat-chip-set>
```

### Accessibility

The [Interaction Patterns](#interaction-patterns) section describes the three variants of chips available. Choose the chip variant that best matches your use case.

For both MatChipGrid and MatChipListbox, always apply an accessible label to the control via `aria-label` or `aria-labelledby`.

Always apply MatChipRemove to a `<button>` element, never a `<mat-icon>` element.

When using MatChipListbox, never nest other interactive controls inside of the `<mat-chip-option>` element. Nesting controls degrades the experience for assistive technology users.

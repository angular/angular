`<mat-chip-list>` displays a list of values as individual, keyboard accessible, chips.

<!-- example(chips-overview) -->

_Note: chips are still early in their development and more features are being actively worked on._

```html
<mat-chip-list>
  <mat-chip>Papadum</mat-chip>
  <mat-chip>Naan</mat-chip>
  <mat-chip>Dal</mat-chip>
</mat-chip-list>
```

### Unstyled chips
By default, `<mat-chip>` has Material Design styles applied. For a chip with no styles applied,
use `<mat-basic-chip>`. You can then customize the chip appearance by adding your own CSS.

_Hint: `<mat-basic-chip>` receives the `mat-basic-chip` CSS class in addition to the `mat-chip` class._

### Selection
Chips can be selected via the `selected` property. Selection can be disabled by setting
`selectable` to `false` on the `<mat-chip-list>`.

Whenever the selection state changes, a `ChipSelectionChange` event will be emitted via 
`(selectionChange)`.

### Disabled chips
Individual chips may be disabled by applying the `disabled` attribute to the chip. When disabled,
chips are neither selectable nor focusable. Currently, disabled chips receive no special styling.

### Chip input
The `MatChipInput` directive can be used together with a chip-list to streamline the interaction
between the two components. This directive adds chip-specific behaviors to the input element
within `<mat-form-field>` for adding and removing chips. The `<input>` with `MatChipInput` can
be placed inside or outside the chip-list element.

An example of chip input placed inside the chip-list element.
<!-- example(chips-input) -->

An example of chip input placed outside the chip-list element.

```html
<mat-form-field>
  <mat-chip-list #chipList>
    <mat-chip>Chip 1<mat-chip>
    <mat-chip>Chip 2<mat-chip>
  </mat-chip-list>
  <input matChipInputFor="chipList">
</mat-form-field>
```

### Keyboard interaction
Users can move through the chips using the arrow keys and select/deselect them with the space. Chips
also gain focus when clicked, ensuring keyboard navigation starts at the appropriate chip.

### Orientation
If you want the chips in the list to be stacked vertically, instead of horizontally, you can apply
the `mat-chip-list-stacked` class, as well as the `aria-orientation="vertical"` attribute:

```html
<mat-chip-list class="mat-chip-list-stacked" aria-orientation="vertical">
  <mat-chip>Papadum</mat-chip>
  <mat-chip>Naan</mat-chip>
  <mat-chip>Dal</mat-chip>
</mat-chip-list>
```

### Theming
The selected color of an `<mat-chip>` can be changed by using the `color` property. By default, chips
use a neutral background color based on the current theme (light or dark). This can be changed to
`'primary'`, `'accent'`, or `'warn'`.

### Accessibility
A chip-list behaves as a `role="listbox"`, with each chip being a `role="option"`. The chip input
should have a placeholder or be given a meaningful label via `aria-label` or `aria-labelledby`.

`<md-chip-list>` displays a list of values as individual chips.

<!-- example(chips-overview) -->

_Note: chips are still early in their development and more features are being actively worked on._

```html
<md-chip-list>
  <md-chip>Papadum</md-chip>
  <md-chip>Naan</md-chip>
  <md-chip>Dal</md-chip>
</md-chip-list>
```

### Unstyled chips
By default, `<md-chip>` has Material Design styles applied. For a chip with no styles applied,
use `<md-basic-chip>`. You can then customize the chip appearance by adding your own CSS.

### Selection
Chips can be selected via the `selected` property. Selection can be disabled by setting
`selectable` to `false` on the `<md-chip-list>`. 

### Keyboard interation
Users can move through the chips using the arrow keys and select them with the space.


### Theming
The color of an `<md-chip>` can be changed by using the `color` property. By default, chips
use a neutral background color based on the current theme (light or dark). This can be changed to 
`'primary'`, `'accent'`, or `'warn'`.

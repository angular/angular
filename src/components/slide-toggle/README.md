# MdSlideToggle
`MdSlideToggle` is a two-state control, which can be also called `switch`

### Screenshots
![image](https://material.angularjs.org/material2_assets/slide-toggle/toggles.png)

## `<md-slide-toggle>`
### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `disabled` | boolean | Disables the `slide-toggle` |
| `color` | `"primary" | "accent" | "warn"` | The color palette of the `slide-toggle` |
| `checked` | boolean | Sets the value of the `slide-toggle` |

### Events
| Name | Type | Description |
| --- | --- | --- |
| `change` | boolean | Event will be emitted on every value change.<br/>It emits the new `checked` value. |

### Examples
A basic slide-toggle would have the following markup.
```html
<md-slide-toggle [(ngModel)]="slideToggleModel">
  Default Slide Toggle
</md-slide-toggle>
```

Slide toggle can be also disabled.
```html
<md-slide-toggle disabled>
  Disabled Slide Toggle
</md-slide-toggle>
```

The `slide-toggle` can be also set to checked without a `ngModel`
```html
<md-slide-toggle [checked]="isChecked">
  Input Binding
</md-slide-toggle>
```

You may also want to listen on changes of the `slide-toggle`<br/>
The `slide-toggle` always emits the new value to the event binding `(change)`
```html
<md-slide-toggle (change)="printValue($event)">
  Prints Value on Change
</md-slide-toggle>
```

## Theming
A slide-toggle is default using the `accent` palette for its styling.

Modifying the color on a `slide-toggle` can be easily done, by using the following markup.
```html
<md-slide-toggle color="primary">
  Primary Slide Toggle
</md-slide-toggle>
```

The color can be also set dynamically by using a property binding.
```html
<md-slide-toggle [color]="myColor">
  Dynamic Color
</md-slide-toggle>
```
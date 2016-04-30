# MdRadio
Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side.

![Preview](https://material.angularjs.org/material2_assets/radio/radios.png)

### Examples
A basic radio group would have the following markup.
```html
<md-radio-group>
  <md-radio-button value="option_1">1</md-radio-button>
  <md-radio-button value="option_2">2</md-radio-button>
</md-radio-group>
```

A dynamic example, populated from a `data` variable:
```html
<md-radio-group [(value)]="groupValue">
  <md-radio-button *ngFor="let d of data" [value]="d.value">
    {{d.label}}
  </md-radio-button>
</md-radio-group>
```

A dynamic example for use inside a form showing support for `[(ngModel)]`:
```html
<md-radio-group [(ngModel)]="chosenOption">
  <md-radio-button *ngFor="let o of options" [value]="o.value">
    {{o.label}}
  </md-radio-button>
</md-radio-group>
```

## `<md-radio-group>`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `selected` | `MdRadioButton` | The currently selected button. |
| `value` | `any` | The current value for this group. |
| `disabled` | `boolean` | Whether the group is disabled. |

When selection is changed, an event is emitted from the `change` EventEmitter property.

### Notes
The `md-radio-group` component has no button initially selected.

## `<md-radio-button>`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `id` | `string` | The unique ID of this radio button. |
| `name` | `string` | Group name, defaults to parent radio group if present. |
| `value` | `any` | The value of this radio button. |
| `checked` | `boolean` | Whether the radio is checked. |
| `disabled` | `boolean` | Whether the radio is disabled. |

When checked, an event is emitted from the `change` EventEmitter property.

### Notes
* The `md-radio-button` component by default uses the accent color from the theme palette.

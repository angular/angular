# MdTooltip
Tooltip allows the user to specify text to be displayed when the mouse hover over an element.

### Setup
For alpha.7, you need to include the overlay styles in your app via a `link` element. This will
look something like
```html
<link href="vendor/@angular2-material/core/overlay/overlay.css" rel="stylesheet">
```


### Examples
A button with a tooltip
```html
<button md-tooltip="some message" tooltip-position="below">Button</button>
```

## `[md-tooltip]`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `md-tooltip` | `string` | The message to be displayed. |
| `tooltip-position` | `"above"|"below"|"before"|"after"` | The position of the tooltip. |

### Methods

| Name | Description |
| --- | --- | --- |
| `show` | Displays the tooltip. |
| `hide` | Removes the tooltip. |
| `toggle` | Displays or hides the tooltip. |

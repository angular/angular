# MdTooltip
Tooltip allows the user to specify text to be displayed when the mouse hovers over an element.

The positions `before` and `after` should be used instead of `left` and `right` respectively when the tooltip positioning should change depending on the HTML dir global attribute for left-to-right or right-to-left layout.

### Examples
A button with a tooltip
```html
<button mdTooltip="some message" mdTooltipPosition="below">Button</button>
```



## `[mdTooltip]`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `mdTooltip` | `string` | The message to be displayed. |
| `mdTooltipPosition` | `"before"|"after"|"above"|"below"|"left"|"right"` | The position of the tooltip. |

### Methods

| Name | Description |
| --- | --- |
| `show` | Displays the tooltip. |
| `hide` | Removes the tooltip. |
| `toggle` | Displays or hides the tooltip. |

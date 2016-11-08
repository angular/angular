# MdSidenav

MdSidenav is the side navigation component for Material 2. It is composed of two components; `<md-sidenav-layout>` and `<md-sidenav>`.

## Screenshots

<img src="https://material.angularjs.org/material2_assets/sidenav-example.png">


## `<md-sidenav-layout>`

The parent component. Contains the code necessary to coordinate one or two sidenav and the backdrop.

## `<md-sidenav>`

The sidenav panel.

### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `align` | `"start"|"end"` | The alignment of this sidenav. In LTR direction, `"start"` will be shown on the left, `"end"` on the right. In RTL, it is reversed. `"start"` is used by default. If there is more than 1 sidenav on either side the layout will be considered invalid and none of the sidenavs will be visible or toggleable until the layout is valid again. |
| `mode` | `"over"|"push"|"side"` | The mode or styling of the sidenav, default being `"over"`. With `"over"` the sidenav will appear above the content, and a backdrop will be shown. With `"push"` the sidenav will push the content of the `<md-sidenav-layout>` to the side, and show a backdrop over it. `"side"` will resize the content and keep the sidenav opened. Clicking the backdrop will close sidenavs that do not have `mode="side"`. |
| `opened` | `boolean` | Whether or not the sidenav is opened. Use this binding to open/close the sidenav. |

### Events

| Name | Description |
| --- | --- |
| `open-start` | Emitted when the sidenav is starting opening. This should only be used to coordinate animations. |
| `close-start` | Emitted when the sidenav is starting closing. This should only be used to coordinate animations. |
| `open` | Emitted when the sidenav is done opening. Use this for, e.g., setting focus on controls or updating state. |
| `close` | Emitted when the sidenav is done closing. |

### Methods

| Signature | Description |
| --- | --- |
| `open(): Promise<void>` | Open the sidenav. Equivalent to `opened = true`. Returns a promise that will resolve when the animation completes, or be rejected if the animation was cancelled. |
| `close(): Promise<void>` | Close the sidenav. Equivalent to `opened = false`. Returns a promise that will resolve when the animation completes, or be rejected if the animation was cancelled. |
| `toggle(): Promise<void>` | Toggle the sidenav. This is equivalent to `opened = !opened`. Returns a promise that will resolve when the animation completes, or be rejected if the animation was cancelled. |

### Notes

The `<md-sidenav>` will resize based on its content. You can also set its width in CSS, like so:

```css
md-sidenav {
  width: 200px;
}
```

Try to avoid percent based width as `resize` events are not (yet) supported.

## Examples

Here's a simple example of using the sidenav:

```html
<app>
  <md-sidenav-layout>
    <md-sidenav #start (open)="closeStartButton.focus()">
      Start Sidenav.
      <br>
      <button md-button #closeStartButton (click)="start.close()">Close</button>
    </md-sidenav>
    <md-sidenav #end align="end">
      End Sidenav.
      <button md-button (click)="end.close()">Close</button>
    </md-sidenav>

    My regular content. This will be moved into the proper DOM at runtime.
    <button md-button (click)="start.open()">Open start sidenav</button>
    <button md-button (click)="end.open()">Open end sidenav</button>

  </md-sidenav-layout>
</app>
```


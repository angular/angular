**NOTE: The <code>mat-sidenav-layout</code> element is deprecated. <code>mat-sidenav-container</code>
should be used instead.**


# MatSidenav

MatSidenav is the side navigation component for Angular Material. It is composed of two components: `<mat-sidenav-container>` and `<mat-sidenav>`.

## Screenshots

<img src="https://material.angularjs.org/material2_assets/sidenav-example.png">


## `<mat-sidenav-container>`

The parent component. Contains the code necessary to coordinate one or two sidenav and the backdrop.

## `<mat-sidenav>`

The sidenav panel.

### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `position` | `"start"\|"end"` | The position of this sidenav. In LTR direction, `"start"` will be shown on the left, `"end"` on the right. In RTL, it is reversed. `"start"` is used by default. If there is more than 1 sidenav on either side the container will be considered invalid and none of the sidenavs will be visible or toggleable until the container is valid again. |
| `mode` | `"over"\|"push"\|"side"` | The mode or styling of the sidenav, default being `"over"`. With `"over"` the sidenav will appear above the content, and a backdrop will be shown. With `"push"` the sidenav will push the content of the `<mat-sidenav-container>` to the side, and show a backdrop over it. `"side"` will resize the content and keep the sidenav opened. Clicking the backdrop will close sidenavs that do not have `mode="side"`. |
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

The `<mat-sidenav>` will resize based on its content. You can also set its width in CSS, like so:

```css
mat-sidenav {
  width: 200px;
}
```

Try to avoid percent based width as `resize` events are not (yet) supported.

## Examples

Here's a simple example of using the sidenav:

```html
<app>
  <mat-sidenav-container>
    <mat-sidenav #start (open)="closeStartButton.focus()">
      Start Sidenav.
      <br>
      <button mat-button #closeStartButton (click)="start.close()">Close</button>
    </mat-sidenav>
    <mat-sidenav #end position="end">
      End Sidenav.
      <button mat-button (click)="end.close()">Close</button>
    </mat-sidenav>

    My regular content. This will be moved into the proper DOM at runtime.
    <button mat-button (click)="start.open()">Open start sidenav</button>
    <button mat-button (click)="end.open()">Open end sidenav</button>

  </mat-sidenav-container>
</app>
```

For a fullscreen sidenav, the recommended approach is set up the DOM such that the
`mat-sidenav-container` can naturally take up the full space:

```html
<app>
  <mat-sidenav-container>
    <mat-sidenav mode="side" opened="true">Drawer content</mat-sidenav>
    <div class="my-content">Main content</div>
  </mat-sidenav-container>
</app>
```
```css
html, body, material-app, mat-sidenav-container, .my-content {
  margin: 0;
  width: 100%;
  height: 100%;
}
```

For a sidenav with a FAB (or other floating element), the recommended approach is to place the FAB
outside of the scrollable region and absolutely position it.

```html
<app>
  <mat-sidenav-container class="my-container">
    <mat-sidenav mode="side" opened="true">
      <button mat-mini-fab class="my-fab">
        <mat-icon>add</mat-icon>
      </button>
      <div class="my-scrolling-content">
        Lorem ipsum dolor sit amet, pede a libero aenean phasellus, lectus metus sint ut risus,
        fusce vel in pellentesque. Nisl rutrum etiam morbi consectetuer tempor magna, aenean nullam
        nunc id, neque vivamus interdum sociis nulla scelerisque sem, dolor id wisi turpis magna
        aliquam magna. Risus accumsan hac eget etiam donec sed, senectus erat mattis quam, tempor
        vel urna occaecat cras, metus urna augue nec at. Et morbi amet dui praesent, nec eu at,
        ligula ipsum dui sollicitudin, quis nisl massa viverra ligula, mauris fermentum orci arcu
        enim fringilla. Arcu erat nulla in aenean lacinia ullamcorper, urna ante nam et sagittis,
        tristique vehicula nibh ipsum vivamus, proin proin. Porta commodo nibh quis libero amet.
        Taciti dui, sapien consectetuer.
      </div>
    </mat-sidenav>
    <button mat-mini-fab class="my-fab">
      <mat-icon>add</mat-icon>
    </button>
    <div class="my-scrolling-content">
      Lorem ipsum dolor sit amet, pede a libero aenean phasellus, lectus metus sint ut risus, fusce
      vel in pellentesque. Nisl rutrum etiam morbi consectetuer tempor magna, aenean nullam nunc id,
      neque vivamus interdum sociis nulla scelerisque sem, dolor id wisi turpis magna aliquam magna.
      Risus accumsan hac eget etiam donec sed, senectus erat mattis quam, tempor vel urna occaecat
      cras, metus urna augue nec at. Et morbi amet dui praesent, nec eu at, ligula ipsum dui
      sollicitudin, quis nisl massa viverra ligula, mauris fermentum orci arcu enim fringilla. Arcu
      erat nulla in aenean lacinia ullamcorper, urna ante nam et sagittis, tristique vehicula nibh
      ipsum vivamus, proin proin. Porta commodo nibh quis libero amet. Taciti dui, sapien
      consectetuer.
    </div>
  </mat-sidenav-container>
</app>
```
```css
.my-container {
  width: 500px;
  height: 300px;
}

.my-container .mat-sidenav {
  max-width: 200px;
}

.my-container .mat-sidenav-content,
.my-container mat-sidenav {
  display: flex;
}

.my-scrolling-content {
  overflow: auto;
}

button.my-fab {
  position: absolute;
  right: 20px;
  bottom: 10px;
}
```

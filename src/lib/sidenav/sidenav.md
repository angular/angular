`<mat-sidenav>` is a panel that can be placed next to or above some primary content. A sidenav is
typically used for navigation, but can contain any content.

<!-- example(sidenav-overview) -->

The sidenav and its associated content live inside of an `<mat-sidenav-container>`:
```html
<mat-sidenav-container>
  <mat-sidenav>
    <!-- sidenav content -->
  </mat-sidenav>

  <!-- primary content -->
</mat-sidenav-container>
```

A sidenav container may contain one or two `<mat-sidenav>` elements. When there are two 
`<mat-sidenav>` elements, each must be placed on a different side of the container.
See the section on positioning below.

### Sidenav mode
The sidenav can render in one of three different ways based on the `mode` property.

| Mode | Description                                                                               |
|------|-------------------------------------------------------------------------------------------|
| over | Sidenav floats _over_ the primary content, which is covered by a backdrop                 |
| push | Sidenav _pushes_ the primary content out of its way, also covering it with a backdrop     |
| side | Sidenav appears _side-by-side_ with the primary content                                   |

Using the `side` mode on mobile devices can affect the performance and is also not recommended by the
[Material Design specification](https://material.io/guidelines/patterns/navigation-drawer.html#navigation-drawer-behavior).

### Positioning the sidenav
The `position` property determines whether the sidenav appears at the `"start"` or `"end"` of the
container. This is affected by the current text direction ("ltr" or "rtl"). By default, the sidenav
appears at the start of the container.


### Sizing the sidenav
The `<mat-sidenav>` will, by default, fit the size of its content. The width can be explicitly set
via CSS:

```css
mat-sidenav {
  width: 200px;
}
```

Try to avoid percent based width as `resize` events are not (yet) supported.

For a fullscreen sidenav, the recommended approach is set up the DOM such that the
`<mat-sidenav-container>` can naturally take up the full space:

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

### FABs inside sidenav
For a sidenav with a FAB (Floating Action Button) or other floating element, the recommended approach is to place the FAB
outside of the scrollable region and absolutely position it.


### Disabling closing of sidenav
By default, sidenav can be closed either by clicking on the backdrop or by pressing <kbd>ESCAPE</kbd>.
The `disableClose` attribute can be set on `mat-sidenav` to disable automatic closing when the backdrop
is clicked or <kbd>ESCAPE</kbd> is pressed. To add custom logic on backdrop click, add a `(backdropClick)` listener to
`mat-sidenav-container`. For custom <kbd>ESCAPE</kbd> logic, a standard `(keydown)` listener will suffice.
```html
<mat-sidenav-container (backdropClick)="customBackdropClickHandler()">
  <mat-sidenav disableClose (keydown)="customKeydownHandler($event)"></mat-sidenav>
</mat-sidenav-container>
```
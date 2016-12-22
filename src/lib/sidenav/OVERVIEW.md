`<md-sidenav>` is a panel that can be placed next to or above some primary content. A sidenav is
typically used for navigation, but can contain any content.

<!-- example(sidenav-overview) -->

The sidenav and its associated content live inside of an `<md-sidenav-container>`:
```html
<md-sidenav-container>
  <md-sidenav>
    <!-- sidenav content -->
  </md-sidenav>

  <!-- primary content -->
</md-sidenav-container>
```

A sidenav container may contain one or two `<md-sidenav>` elements. When there are two 
`<md-sidenav>` elements, each must be placed on a different side of the container.
See the section on positioning below.

### Sidenav mode
The sidenav can render in one of three different ways based on the `mode` property.

| Mode | Description                                                                               |
|------|-------------------------------------------------------------------------------------------|
| over | Sidenav floats _over_ the primary content, which is covered by a backdrop                 |
| push | Sidenav _pushes_ the primary content out of its way, also covering it with a backdrop     |
| side | Sidenav appears _side-by-side_ with the primary content                                   |


### Positioning the sidenav
The `align` property determines whether the sidenav appears at the `"start"` or `"end"` of the
container. This is affected by the current text direction ("ltr" or "rtl"). By default, the sidenav
appears at the start of the container.


### Sizing the sidenav
The `<md-sidenav>` will, by default, fit the size of its content. The width can be explicitly set
via CSS:

```css
md-sidenav {
  width: 200px;
}
```

Try to avoid percent based width as `resize` events are not (yet) supported.

For a fullscreen sidenav, the recommended approach is set up the DOM such that the
`<md-sidenav-container>` can naturally take up the full space:

```html
<app>
  <md-sidenav-container>
    <md-sidenav mode="side" opened="true">Drawer content</md-sidenav>
    <div class="my-content">Main content</div>
  </md-sidenav-container>
</app>
```
```css
html, body, material-app, md-sidenav-container, .my-content {
  margin: 0;
  width: 100%;
  height: 100%;
}
```

### FABs inside sidenav
For a sidenav with a FAB (or other floating element), the recommended approach is to place the FAB
outside of the scrollable region and absolutely position it.

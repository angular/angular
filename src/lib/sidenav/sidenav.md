Angular Material provides two sets of components designed to add collapsible side content (often
navigation, though it can be any content) alongside some primary content. These are the sidenav and
drawer components.

The sidenav components are designed to add side content to a fullscreen app. To set up a sidenav we
use three components: `<mat-sidenav-container>` which acts as a structural container for our content
and sidenav, `<mat-sidenav-content>` which represents the main content, and `<mat-sidenav>` which
represents the added side content.

<!-- example(sidenav-overview) -->

The drawer component is designed to add side content to a small section of your app. This is
accomplished using the `<mat-drawer-container>`, `<mat-drawer-content>`, and `<mat-drawer>`
components, which are analogous to their sidenav equivalents. Rather than adding side content to the
app as a whole, these are designed to add side content to a small section of your app. They support
almost all of the same features, but do not support fixed positioning.

<!-- example(sidenav-drawer-overview) -->

### Specifying the main and side content

Both the main and side content should be placed inside of the `<mat-sidenav-container>`, content
that you don't want to be affected by the sidenav, such as a header or footer, can be placed outside
of the container.

The side content should be wrapped in a `<mat-sidenav>` element. The `position` property can be used
to specify which end of the main content to place the side content on. `position` can be either
`start` or `end` which places the side content on the left or right respectively in left-to-right
languages. If the `position` is not set, the default value of `start` will be assumed. A
`<mat-sidenav-container>` can have up to two `<mat-sidenav>` elements total, but only one for any
given side.

The main content should be wrapped in a `<mat-sidenav-content>`. If no `<mat-sidenav-content>` is
specified for a `<mat-sidenav-container>`, one will be created implicitly and all of the content
inside the `<mat-sidenav-container>` other than the `<mat-sidenav>` elements will be placed inside
of it.

<!-- example(sidenav-position) -->

The following are examples of valid sidenav layouts:

```html
<!-- Creates a layout with a left-positioned sidenav and explicit content. -->
<mat-sidenav-container>
  <mat-sidenav>Start</mat-sidenav>
  <mat-sidenav-content>Main</mat-sidenav-content>
</mat-sidenav-container>
```

```html
<!-- Creates a layout with a left and right sidenav and implicit content. -->
<mat-sidenav-container>
  <mat-sidenav>Start</mat-sidenav>
  <mat-sidenav position="end">End</mat-sidenav>
  <section>Main</section>
</mat-sidenav-container>
```

```html
<!-- Creates an empty sidenav container with no sidenavs and implicit empty content. -->
<mat-sidenav-container></mat-sidenav-container>
```

And these are examples of invalid sidenav layouts:

```html
<!-- Invalid because there are two `start` position sidenavs. -->
<mat-sidenav-container>
  <mat-sidenav>Start</mat-sidenav>
  <mat-sidenav position="start">Start 2</mat-sidenav>
</mat-sidenav-container>
```

```html
<!-- Invalid because there are multiple `<mat-sidenav-content>` elements. -->
<mat-sidenav-container>
  <mat-sidenav-content>Main</mat-sidenav-content>
  <mat-sidenav-content>Main 2</mat-sidenav-content>
</mat-sidenav-container>
```

```html
<!-- Invalid because the `<mat-sidenav>` is outside of the `<mat-sidenav-container>`. -->
<mat-sidenav-container></mat-sidenav-container>
<mat-sidenav></mat-sidenav>
```

These same rules all apply to the drawer components as well.

### Opening and closing a sidenav

A `<mat-sidenav>` can be opened or closed using the `open()`, `close()` and `toggle()` methods. Each
of these methods returns a `Promise<boolean>` that will be resolved with `true` when the sidenav
finishes opening or `false` when it finishes closing.

The opened state can also be set via a property binding in the template using the `opened` property.
The property supports 2-way binding.

`<mat-sidenav>` also supports output properties for just open and just close events, The `(opened)`
and `(closed)` properties respectively.

<!-- example(sidenav-open-close) -->

All of these properties and methods work on `<mat-drawer>` as well.

### Changing the sidenav's behavior

The `<mat-sidenav>` can render in one of three different ways based on the `mode` property.

| Mode   | Description                                                                             |
|--------|-----------------------------------------------------------------------------------------|
| `over` | Sidenav floats over the primary content, which is covered by a backdrop               |
| `push` | Sidenav pushes the primary content out of its way, also covering it with a backdrop   |
| `side` | Sidenav appears side-by-side with the main content, shrinking the main content's width to make space for the sidenav. |

If no `mode` is specified, `over` is used by default.

<!-- example(sidenav-mode) -->

`<mat-drawer>` also supports all of these same modes.

### Disabling automatic close

Clicking on the backdrop or pressing the <kbd>Esc</kbd> key will normally close an open sidenav.
However, this automatic closing behavior can be disabled by setting the `disableClose` property on
the `<mat-sidenav>` or `<mat-drawer>` that you want to disable the behavior for.

Custom handling for <kbd>Esc</kbd> can be done by adding a keydown listener to the `<mat-sidenav>`.
Custom handling for backdrop clicks can be done via the `(backdropClick)` output property on
`<mat-sidenav-container>`.

<!-- example(sidenav-disable-close) -->

### Resizing an open sidenav
By default, Material will only measure and resize the drawer container in a few key moments
(on open, on window resize, on mode change) in order to avoid layout thrashing, however there
are cases where this can be problematic. If your app requires for a drawer to change its width
while it is open, you can use the `autosize` option to tell Material to continue measuring it.
Note that you should use this option **at your own risk**, because it could cause performance
issues.

<!-- example(sidenav-autosize) -->

### Setting the sidenav's size

The `<mat-sidenav>` and `<mat-drawer>` will, by default, fit the size of its content. The width can
be explicitly set via CSS:

```css
mat-sidenav {
  width: 200px;
}
```

Try to avoid percent based width as `resize` events are not (yet) supported.

### Fixed position sidenavs

For `<mat-sidenav>` only (not `<mat-drawer>`) fixed positioning is supported. It can be enabled by
setting the `fixedInViewport` property. Additionally, top and bottom space can be set via the
`fixedTopGap` and `fixedBottomGap`. These properties accept a pixel value amount of space to add at
the top or bottom.

<!-- example(sidenav-fixed) -->

### Creating a responsive layout for mobile & desktop

A sidenav often needs to behave differently on a mobile vs a desktop display. On a desktop, it may
make sense to have just the content section scroll. However, on mobile you often want the body to be
the element that scrolls; this allows the address bar to auto-hide. The sidenav can be styled with
CSS to adjust to either type of device.

<!-- example(sidenav-responsive) -->

### Accessibility

The `<mat-sidenav>` an `<mat-sidenav-content>` should each be given an appropriate `role` attribute
depending on the context in which they are used.

For example, a `<mat-sidenav>` that contains links
to other pages might be marked `role="navigation"`, whereas one that contains a table of
contents about might be marked as `role="directory"`. If there is no more specific role that
describes your sidenav, `role="region"` is recommended.

Similarly, the `<mat-sidenav-content>` should be given a role based on what it contains. If it
represents the primary content of the page, it may make sense to mark it `role="main"`. If no more
specific role makes sense, `role="region"` is again a good fallback.

### Troubleshooting

#### Error: A drawer was already declared for 'position="..."'

This error is thrown if you have more than one sidenav or drawer in a given container with the same
`position`. The `position` property defaults to `start`, so the issue may just be that you forgot to
mark the `end` sidenav with `position="end"`.

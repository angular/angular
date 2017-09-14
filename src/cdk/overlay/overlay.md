### Overlay

The `Overlay` service provides a way to open floating panels on the screen.

### Creating overlays
Calling `overlay.create()` will return an `OverlayRef` instance. This instance is a handle for
managing that specific overlay.

The `OverlayRef` _is_ a `PortalHost`- once created, content can be added by attaching a `Portal`.
See the documentation on portals for further information.
```ts
const overlayRef = overlay.create();
const userProfilePortal = new ComponentPortal(UserProfile);
overlayRef.attach(userProfilePortal);
```

### Configuring an overlay
When creating an overlay, an optional configuration object can be provided.
```ts
const overlayRef = overlay.create({
  height: '400px',
  width: '600px',
});
```

The full set of configuration options can be found in the API documentation.

#### Position strategies
The `positionStrategy` configuration option determines how the overlay will be positioned on-screen.
There are two position strategies available as part of the library: `GlobalPositionStrategy` and
`ConnectedPositionStrategy`.

`GlobalPositionStrategy` is used for overlays that require a specific position in the viewport,
unrelated to other elements. This is commonly used for modal dialogs and application-level
notifications.

`ConnectedPositionStrategy` is used for overlays that are positioned relative to some other "origin"
element on the page. This is commonly used for menus, pickers, and tooltips. When using the
connected strategy, a set of preferred positions is provided; the "best" position will be selected
based on how well the overlay would fit within the viewport.

A custom position strategy can be created by implementing the `PositionStrategy` interface.
Each `PositionStrategy` defines an `apply` method that is called whenever the overlay's position
should be updated. A custom position strategy can additionally expose any other APIs necessary as
related to the positioning of the overlay element.


#### Scroll strategies
The `scrollStrategy` configuration option determines how the overlay will react to scrolling outside
the overlay element. There are four scroll strategies available as part of the library.

`NoopScrollStrategy` is the default option. This strategy does nothing.

`CloseScrollStrategy` will automatically close the overlay when scrolling occurs.

`BlockScrollStrategy` will block page scrolling while the overlay is open. Note that some
applications may implement special or customized page scrolling; if the `BlockScrollStrategy`
conflicts with this kind of situation, it can be overriden by re-providing `BlockScrollStrategy`
with a custom implementation.

`RepositionScrollStrategy` will re-position the overlay element on scroll. Note that this will have
some performance impact on scrolling- users should weigh this cost in the context of each specific
application.


A custom scroll strategy can be created by implementing the `ScrollStrategy` interface. Each
strategy will typically inject `ScrollDispatcher` (from `@angular/cdk/scrolling`) to be notified
of when scrolling takes place. See the documentation for `ScrollDispatcher` for more information
on how scroll events are detected and dispatched.

### The overlay container
The `OverlayContainer` provides a handle to the container element in which all individual overlay
elements are rendered. By default, the overlay container is appended directly to the document body
so that an overlay is never clipped by an `overflow: hidden` parent.

#### Full-screen overlays
The `FullscreenOverlayContainer` is an alternative to `OverlayContainer` that supports correct
displaying of overlay elements in
[fullscreen mode](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen).

`FullscreenOverlayContainer` can be enabled by providing it in your `NgModule`:
```ts
@NgModule({
  providers: [{provide: OverlayContainer, useClass: FullscreenOverlayContainer}],
  // ...
})
export class MyModule { }
```

The `scrolling` package provides helpers for directives that react to scroll events.

### cdkScrollable and ScrollDispatcher
The `cdkScrollable` directive and the `ScrollDispatcher` service to together to allow components to
react to scrolling in any of its ancestor scrolling containers.

The `cdkScrollable` directive should be applied to any element that acts as a scrolling container.
This marks the element as a `Scrollable` and registers it with the `ScrollDispatcher`. The
dispatcher, then, allows components to share both event listeners and knowledge of all of the
scrollable containers in the application.

# Hydration with unsupported Zone.js instance

This warning means that the hydration was enabled for an application that was configured to use an unsupported version of Zone.js: either a custom or a "noop" one (see more info [here](api/core/BootstrapOptions#ngZone)).

Hydration relies on a signal from Zone.js when it becomes stable inside an application, so that Angular can start the serialization process on the server or post-hydration cleanup on the client (to remove DOM nodes that remained unclaimed).

Providing a custom or a "noop" Zone.js implementation may lead to a different timing of the "stable" event, thus triggering the serialization or the cleanup too early or too late. This is not yet a fully supported configuration.

If you use a custom Zone.js implementation, make sure that the "onStable" event is emitted at the right time and does not result in incorrect application behavior with hydration.

More information about hydration can be found in the [hydration guide](guide/hydration).

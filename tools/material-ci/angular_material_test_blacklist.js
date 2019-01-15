/**
 * Blacklist of unit tests from angular/material2 with ivy that are skipped when running on
 * angular/angular. As bugs are resolved, items should be removed from this blacklist.
 *
 * The `notes` section should be used to keep track of specific issues associated with the failures.
 *
 * TODO(jelbourn): it's not currently straightforward to regenerate this blacklist from scratch.
 */
window.testBlacklist = {
  'Portals CdkPortalOutlet should load a template into the portal': {
    'error': 'TypeError: Cannot read property \'createEmbeddedView\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should project template context bindings in the portal': {
    'error': 'TypeError: Cannot read property \'createEmbeddedView\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should set the `portal` when attaching a component portal programmatically': {
    'error': 'TypeError: Cannot read property \'attachComponentPortal\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should not clear programmatically-attached portals on init': {
    'error': 'TypeError: Cannot read property \'attach\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should be considered attached when attaching using `attach`': {
    'error': 'TypeError: Cannot read property \'hasAttached\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should be considered attached when attaching using `attachComponentPortal`': {
    'error': 'TypeError: Cannot read property \'hasAttached\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should be considered attached when attaching using `attachTemplatePortal`': {
    'error': 'TypeError: Cannot read property \'hasAttached\' of undefined',
    'notes': 'Unknown',
  },
  'Portals CdkPortalOutlet should use the `ComponentFactoryResolver` from the portal, if available': {
    'error': 'TypeError: Cannot read property \'attachComponentPortal\' of undefined',
    'notes': 'Unknown',
  },
  'Portals DomPortalOutlet should attach and detach a component portal': {
    'error': 'Error: Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node.',
    'notes': 'Unknown',
  },
  'Portals DomPortalOutlet should attach and detach a component portal with a given injector': {
    'error': 'Error: Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node.',
    'notes': 'Unknown',
  },
  'Portals DomPortalOutlet should attach and detach a template portal with a binding': {
    'error': 'Error: Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node.',
    'notes': 'Unknown',
  },
  'Portals DomPortalOutlet should change the attached portal': {
    'error': 'Error: Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node.',
    'notes': 'Unknown',
  },
  'Portals DomPortalOutlet should attach and detach a component portal without a ViewContainerRef': {
    'error': 'Error: Expected \'<pizza-msg><p>Pizza</p><p>Chocolate</p></pizza-msg>\' to be \'\', \'Expected the DomPortalOutlet to be empty after detach\'.',
    'notes': 'Unknown',
  },
  'AutofillMonitor should add monitored class and listener upon monitoring': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should not add multiple listeners to the same element': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should remove monitored class and listener upon stop monitoring': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should stop monitoring all monitored elements upon destroy': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should emit and add filled class upon start animation': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should emit and remove filled class upon end animation': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should cleanup filled class if monitoring stopped in autofilled state': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should complete the stream when monitoring is stopped': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should emit on stream inside the NgZone': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AutofillMonitor should not emit on init if input is unfilled': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to create a message element': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should not register empty strings': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should not register non-string values': {
    'error': 'Error: Expected function not to throw, but it threw TypeError: Cannot read property \'nativeElement\' of undefined.',
    'notes': 'Unknown',
  },
  'AriaDescriber should not throw when trying to remove non-string value': {
    'error': 'Error: Expected function not to throw, but it threw TypeError: Cannot read property \'nativeElement\' of undefined.',
    'notes': 'Unknown',
  },
  'AriaDescriber should de-dupe a message registered multiple times': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to register multiple messages': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to unregister messages': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to unregister messages while having others registered': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to append to an existing list of aria describedby': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should be able to handle multiple regisitrations of the same message to an element': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'AriaDescriber should clear any pre-existing containers': {
    'error': 'TypeError: Cannot read property \'nativeElement\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render initial state': {
    'error': 'Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the data length': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the viewport size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered range': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the scroll offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should measure range size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set a class based on the orientation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set the vertical class if an invalid orientation is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set rendered range': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to top of content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to bottom of content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should output scrolled index': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls down': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls up': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the end when scrolled to the top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start and end when scrolled to the middle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start when scrolled to the bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic buffer size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item array': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls right in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls left in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with an Observable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with a DataSource': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy value by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy index when specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should recycle views when template cache is large enough to accommodate': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not recycle views when template cache is full': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render up to maxBufferPx when buffer dips below minBufferPx': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should register and degregister with ScrollDispatcher': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should emit on viewChange inside the Angular zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not throw when disposing of a view that will not fit in the cache': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should initially be scrolled all the way right and showing the first item in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should scroll through items as user scrolls to the left in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should interpret scrollToOffset amount as an offset from the right in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should scroll to the correct index in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should emit the scrolled to index in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should set total content size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with RTL direction should set total content size in horizontal mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with no VirtualScrollStrategy should fail on construction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions should be able to expand and collapse dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions should toggle descendants correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions should be able to expand/collapse all the dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions should handle null children': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions with children array should be able to expand and collapse dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions with children array should toggle descendants correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkNestedTreeControl base tree control actions with children array should be able to expand/collapse all the dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkFlatTreeControl base tree control actions should be able to expand and collapse dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkFlatTreeControl base tree control actions should return correct expandable values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkFlatTreeControl base tree control actions should return correct levels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkFlatTreeControl base tree control actions should toggle descendants correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkFlatTreeControl base tree control actions should be able to expand/collapse all the dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the viewport size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the viewport bounds when the page is not scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the viewport bounds when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the bounds based on client coordinates when the page is pinch-zoomed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the scroll position when the page is not scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler should get the scroll position when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler changed event should dispatch an event when the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler changed event should dispatch an event when the orientation is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler changed event should be able to throttle the callback': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ViewportRuler changed event should run the resize event outside the NgZone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should be registered with the scrollable directive with the scroll service': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should have the scrollable directive deregistered when the component is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should notify through the directive and service that a scroll event occurred': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should not execute the global events in the Angular zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should not execute the scrollable events in the Angular zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should be able to unsubscribe from the global scrollable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should complete the `scrolled` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should complete the scrollable stream when it is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Basic usage should not register the same scrollable twice': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Nested scrollables should be able to identify the containing scrollables of an element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Nested scrollables should emit when one of the ancestor scrollable containers is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher Nested scrollables should not emit when a non-ancestor is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher lazy subscription should lazily add global listeners as service subscriptions are added and removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher lazy subscription should remove global listeners on unsubscribe, despite any other live scrollables': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ScrollDispatcher lazy subscription should remove the global subscription on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render initial state for uniform items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render extra content if first item is smaller than average': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in LTR context should initially be scrolled to top-left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in LTR context should scrollTo top-left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in LTR context should scrollTo bottom-right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in LTR context should scroll to top-end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in LTR context should scroll to bottom-start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in RTL context should initially be scrolled to top-right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in RTL context should scrollTo top-left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in RTL context should scrollTo bottom-right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in RTL context should scroll to top-end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkScrollable in RTL context should scroll to bottom-start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should be able to start dragging an item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should be able to stop dragging an item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should stop dragging an item if it is removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch `mousemove` events after starting to drag via the mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch `touchmove` events after starting to drag via touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch pointer move events if event propagation is stopped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch `mouseup` events after ending the drag via the mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch `touchend` events after ending the drag via touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should dispatch pointer up events if event propagation is stopped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should complete the pointer event streams on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should not throw when trying to register the same container again': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should not prevent the default `touchmove` actions when nothing is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should prevent the default `touchmove` action when an item is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should prevent the default `touchmove` if event propagation is stopped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should not prevent the default `wheel` actions when nothing is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should prevent the default `wheel` action when an item is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should not prevent the default `selectstart` actions when nothing is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'DragDropRegistry should prevent the default `selectstart` action when an item is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should drag an element freely to a particular position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should drag an SVG element freely to a particular position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should drag an element freely to a particular position when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should continue dragging the element from where it was left off': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should continue dragging from where it was left off when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should not drag an element with the right mouse button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should not drag the element if it was not moved more than the minimum distance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should be able to stop dragging after a double click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should preserve the previous `transform` value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should not generate multiple own `translate3d` values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable mouse dragging should prevent the `mousedown` action for native draggable elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should drag an element freely to a particular position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should drag an element freely to a particular position when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should continue dragging the element from where it was left off': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should continue dragging from where it was left off when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should prevent the default `touchmove` action on the page while dragging': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable touch dragging should not prevent `touchstart` action for native draggable elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should dispatch an event when the user has started dragging': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should dispatch an event when the user has stopped dragging': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should emit when the user is moving the drag element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should not emit events if it was not moved more than the minimum distance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should emit to `moved` inside the NgZone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should complete the `moved` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should be able to lock dragging along the x axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should be able to lock dragging along the y axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should add a class while an element is being dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should not add a class if item was not dragged more than the threshold': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should be able to set an alternate drag root element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should handle the root element selector changing after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should not be able to drag the element if dragging is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should enable native drag interactions if dragging is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should stop propagation for the drag sequence start event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should not throw if destroyed before the first change detection run': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should enable native drag interactions when there is a drag handle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should be able to reset a freely-dragged item to its initial position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should start dragging an item from its initial position after a reset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should not dispatch multiple events for a mouse event right after a touch event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should round the transform value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should allow for dragging to be constrained to an element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag standalone draggable should throw if attached to an ng-container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should not be able to drag the entire element if it has a handle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should be able to drag an element using its handle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should not be able to drag the element if the handle is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should not be able to drag using the handle if the element is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should be able to use a handle that was added after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should be able to use more than one handle to drag the element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should be able to drag with a handle that is not a direct descendant': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should disable the tap highlight while dragging via the handle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag draggable with a handle should preserve any existing `webkitTapHighlightColor`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to attach data to the drop container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to attach data to a drag item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to overwrite the drop zone id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should toggle a class when the user starts dragging an item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should toggle a class when the user starts dragging an item with OnPush change detection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not toggle dragging class if the element was not dragged more than the threshold': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should dispatch the `dropped` event when an item has been dropped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should expose whether an item was dropped over a container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should expose whether an item was dropped outside of a container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should dispatch the `sorted` event as an item is being sorted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not move items in a vertical list if the pointer is too far away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not move the original element from its initial DOM position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should dispatch the `dropped` event in a horizontal drop zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should dispatch the correct `dropped` event in RTL horizontal drop zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not move items in a horizontal list if pointer is too far away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should create a preview element while the item is dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to constrain the preview position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should clear the id from the preview': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not create a preview if the element was not dragged far enough': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should pass the proper direction to the preview in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should remove the preview if its `transitionend` event timed out': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should emit the released event as soon as the item is released': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should reset immediately when failed drag happens after a successful one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not wait for transition that are not on the `transform` property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should pick out the `transform` duration if multiple properties are being transitioned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should create a placeholder element while the item is dragged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should remove the id from the placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not create placeholder if the element was not dragged far enough': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted down': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted down on a scrolled page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted up': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted up on a scrolled page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted to the right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should move the placeholder as an item is being sorted to the left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, if an element skips multiple positions when sorting vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, when swapping down with a taller element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, when swapping up with a taller element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out elements correctly, when swapping an item with margin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, if an element skips multiple positions when sorting horizontally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, when swapping to the right with a wider element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out the elements correctly, when swapping left with a wider element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lay out elements correctly, when horizontally swapping an item with margin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not swap position for tiny pointer movements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should swap position for pointer movements in the opposite direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should clean up the preview element if the item is destroyed mid-drag': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to customize the preview element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should handle the custom preview being removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to constrain the position of a custom preview': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should revert the element back to its parent after dragging with a custom preview has stopped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should position custom previews next to the pointer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lock position inside a drop container along the x axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should lock position inside a drop container along the y axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should inherit the position locking from the drop container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should be able to customize the placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should handle the custom placeholder being removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should clear the `transform` value from siblings when item is dropped`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not move the item if the list is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not throw if the `touches` array is empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a drop container should not move the item if the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should dispatch the `dropped` event when an item has been dropped into a new container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to move the element over a new container and return it': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to move the element over a new container and return it to the initial one, even if it no longer matches the enterPredicate': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should transfer the DOM element from one drop zone to another': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should not be able to transfer an item into a container that is not in `connectedTo`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should not be able to transfer an item that does not match the `enterPredicate`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should call the `enterPredicate` with the item and the container it is entering': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to start dragging after an item has been transferred': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to return the last item inside its initial container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should assign a default id on each drop zone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to connect two drop zones by id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to connect two drop zones using the drop list group': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to pass a single id to `connectedTo`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should return DOM element to its initial container after it is dropped, in a container with one draggable item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should be able to return an element to its initial container in the same sequence, even if it is not connected to the current container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should not add child drop lists to the same group as their parents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should not be able to drop an element into a container that is under another element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should set a class when a container can receive an item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkDrag in a connected drop container should toggle the `receiving` class when the item enters a new list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should initialize with a connected data source': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should initialize with a rendered header with the right number of header cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should initialize with rendered rows with right number of row cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should initialize with column class names provided to header and data row cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should initialize with the right accessibility roles': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should disconnect the data source when table is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should re-render the rows when the data changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should clear the `mostRecentCellOutlet` on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data is heterogeneous': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data contains multiple occurrences of the same object instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should clear the row view containers on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should match the right table content with dynamic data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable in a typical simple use case should be able to dynamically change the columns for header and rows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should render no rows when the data is null': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to render multiple header and footer rows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to render and change multiple header and footer rows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with different data inputs other than data source should render with data array input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with different data inputs other than data source should render with data stream input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with different data inputs other than data source should throw an error if the data source is not valid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable missing row defs should be able to render without a header row def': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable missing row defs should be able to render without a data row def': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable missing row defs should be able to render without a footer row def': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should render correctly when using native HTML tags': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should render cells even if row data is falsy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to apply class-friendly css class names for the column cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should not clobber an existing table role': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should throw an error if two column definitions have the same name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should throw an error if a column definition is requested but not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should throw an error if the row definitions are missing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should not throw an error if columns are undefined on initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to dynamically add/remove column definitions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to register column, row, and header row definitions outside content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate should be able to display different row templates based on the row data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate should error if there is row data that does not have a matching row template': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate should fail when multiple rows match data without multiTemplateDataRows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate with multiTemplateDataRows should be able to render multiple rows per data object': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies when data contains multiple instances of the same object instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should stick and unstick headers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should stick and unstick footers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should stick and unstick left columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should stick and unstick right columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should reverse directions for sticky columns in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on "display: flex" table style should stick and unstick combination of sticky header, footer, and columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick and unstick headers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick and unstick footers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick tfoot when all rows are stuck': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick and unstick left columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick and unstick right columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with sticky positioning on native table layout should stick and unstick combination of sticky header, footer, and columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with trackBy should add/remove/move rows with reference-based trackBy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with trackBy should add/remove/move rows with changed references without property-based trackBy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with trackBy should add/remove/move rows with changed references with property-based trackBy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with trackBy should add/remove/move rows with changed references with index-based trackBy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable with trackBy should change row implicit data even when trackBy finds no changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should match the right table content with dynamic data source': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to apply classes to rows based on their context': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTable should be able to apply classes to cells based on their row context': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should toggle its expanded state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should set its expanded state to expanded': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should set its expanded state to closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should emit a closed event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should not emit a closed event when the item is closed already': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should emit an opened event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is not disabled should emit a destroyed event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should not toggle its expanded state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should not set its expanded state to expanded': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should not set its expanded state to closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should not emit a closed event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should not emit an opened event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item that is disabled should emit a destroyed event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item should emit to and complete the `destroyed` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item should complete the `opened` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem single item should complete the `closed` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem items without accordion should not change expanded state based on unrelated items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem items without accordion should not change expanded state for disabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordionItem items in accordion should change expanded state based on related items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordion should ensure only one item is expanded at a time': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordion should allow multiple items to be expanded simultaneously': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkAccordion should not register nested items to the same accordion': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple sizes ripple to cover element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple creates ripple on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should launch ripples on touchstart': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should clear ripples if the touch sequence is cancelled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should launch multiple ripples for multi-touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should ignore synthetic mouse events after touchstart': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should ignore fake mouse events from screen readers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple removes ripple after timeout': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should remove ripples after mouseup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should not hide ripples while animating.': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple creates ripples when manually triggered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple creates manual ripples with the default ripple config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple cleans up the event handlers when the container gets destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple does not run events inside the NgZone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple should only persist the latest ripple on pointer down': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple basic ripple when page is scrolled create ripple with correct position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple manual ripples should allow persistent ripple elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple manual ripples should remove ripples that are not done fading-in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple manual ripples should properly set ripple states': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple manual ripples should allow setting a specific animation config for a ripple': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple manual ripples should allow passing only a configuration': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple global ripple options should work without having any binding set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple global ripple options when disabled should not show any ripples on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple global ripple options when disabled should still allow manual ripples': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple global ripple options should support changing the animation duration': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple global ripple options should allow ripples to fade out immediately on pointer up': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple with disabled animations should set the animation durations to zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior sets ripple color': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior does not respond to events when disabled input is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior allows specifying custom trigger element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior expands ripple from center if centered input is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior uses custom radius if set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRipple configuring behavior should be able to specify animation config through binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should ensure only one item is expanded at a time': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should allow multiple items to be expanded simultaneously': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should expand or collapse all enabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should not expand or collapse disabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should not register nested panels to the same accordion': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should update the expansion panel if hideToggle changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should move focus to the next header when pressing the down arrow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should move focus to the next header when pressing the up arrow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should skip disabled items when moving focus with the keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should focus the first header when pressing the home key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAccordion should focus the last header when pressing the end key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should expand and collapse the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should be able to render panel content lazily': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should render the content for a lazy-loaded panel that is opened on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel emit correct events for change in panel expanded state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should create a unique panel id for each panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should set `aria-labelledby` of the content to the header id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should set the proper role on the content element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should toggle the panel when pressing SPACE on the header': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should toggle the panel when pressing ENTER on the header': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should not toggle if a modifier key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should not be able to focus content while closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should restore focus to header if focused element is inside panel on close': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should not override the panel margin if it is not inside an accordion': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should be able to hide the toggle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should update the indicator rotation when the expanded state is toggled programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should make sure accordion item runs ngOnDestroy when expansion panel is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should support two-way binding of the `expanded` property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should emit events for body expanding and collapsing animations': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel should be able to set the default options through the injection token': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel disabled state should toggle the aria-disabled attribute on the header': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel disabled state should toggle the expansion indicator': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel disabled state should not be able to toggle the panel via a user action if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatExpansionPanel disabled state should be able to toggle a disabled expansion panel programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should apply a mode of "determinate" if no mode is provided.': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should define default values for value and bufferValue attributes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should clamp value and bufferValue between 0 and 100': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should return the transform attribute for bufferValue and mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should prefix SVG references with the current path': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should account for location hash when prefixing the SVG references': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should not be able to tab into the underlying SVG element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation basic progress-bar should use latest path when prefixing the SVG references': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation animation trigger on determinate setting should trigger output event on primary value bar animation end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation animation trigger on buffer setting should bind on transitionend eventListener on primaryBarValue': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation animation trigger on buffer setting should trigger output event on primary value bar animation end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar with animation animation trigger on buffer setting should trigger output event with value not bufferValue': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar With NoopAnimations should not bind transition end listener': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressBar With NoopAnimations should trigger the animationEnd output on value set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should be able to open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should be able to close': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should resolve the open method promise with the new state of the drawer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should resolve the close method promise with the new state of the drawer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should be able to close while the open animation is running': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods does not throw when created without a drawer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should emit the backdropClick event when the backdrop is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should close when pressing escape': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should fire the open event when open on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should not close by pressing escape when disableClose is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should not close by clicking on the backdrop when disableClose is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should restore focus on close if focus is inside drawer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer methods should not restore focus on close if focus is outside drawer': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should correctly parse opened="false"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should correctly parse opened="true"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should remove align attr from DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should throw when multiple drawers have the same position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should not throw when drawers swap positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should bind 2-way bind on opened property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer attributes should not throw when a two-way binding is toggled quickly while animating': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer focus trapping behavior should trap focus when opened in "over" mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer focus trapping behavior should trap focus when opened in "push" mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer focus trapping behavior should not trap focus when opened in "side" mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer focus trapping behavior should focus the drawer if there are no focusable elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawer focus trapping behavior should be able to disable auto focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should be able to open and close all drawers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should animate the content when a drawer is added at a later point': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should recalculate the margin if a drawer is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should recalculate the margin if the drawer mode is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should recalculate the margin if the direction has changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should not animate when the sidenav is open on load ': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should recalculate the margin if a drawer changes size while open in autosize mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should not set a style property if it would be zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should be able to toggle whether the container has a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should be able to explicitly enable the backdrop in `side` mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should expose a scrollable when the consumer has not specified drawer content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDrawerContainer should expose a scrollable when the consumer has specified drawer content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSidenav should be fixed position when in fixed mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSidenav should set fixed bottom and top when in fixed mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should have the sort headers register and deregister themselves': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should mark itself as initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should use the column definition if used within a cdk table': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should use the column definition if used within an mat table': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should be correct when mousing over headers and leaving on mouseleave': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should be correct when mousing over header and then sorting': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should be correct when cycling through a default sort header': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should not enter sort with animations if an animations is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should be correct when sort has changed while a header is active': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort checking correct arrow direction and view state for its various states should be correct when sort has been disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should be able to cycle from asc -> desc from either start point': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should be able to cycle asc -> desc -> [none]': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should be able to cycle desc -> asc -> [none]': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should allow for the cycling the sort direction to be disabled per column': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should allow for the cycling the sort direction to be disabled for all columns': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should reset sort direction when a different column is sorted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should throw an error if an MatSortable is not contained within an MatSort directive': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should throw an error if two MatSortables have the same id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should throw an error if an MatSortable is missing an id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should throw an error if the provided direction is invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should allow let MatSortable override the default sort parameters': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should apply the aria-labels to the button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should toggle indicator hint on button focus/blur and hide on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should toggle indicator hint on mouseenter/mouseleave and hide on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should apply the aria-sort label to the header when sorted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSort should re-render when the i18n labels have changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center should be center position if origin is unchanged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center should be center position if origin is explicitly set to null': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center in LTR direction should be left-origin-center position with negative or zero origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center in LTR direction should be right-origin-center position with positive nonzero origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center in RTL direction should be right-origin-center position with negative or zero origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody when initialized as center in RTL direction should be left-origin-center position with positive nonzero origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in LTR to be left position with negative position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in LTR to be center position with zero position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in LTR to be left position with positive position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in RTL to be right position with negative position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in RTL to be center position with zero position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should properly set the position in RTL to be left position with positive position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabBody should update position if direction changed at runtime': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should default to the first tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior will properly load content on first change detection pass': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should change selected index on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should support two-way binding for selectedIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should set to correct tab on fast change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should change tabs based on selectedIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should update tab positions when selected index is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should clamp the selected index to the size of the number of tabs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should not crash when setting the selected index to NaN': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should show ripples for tab-group labels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should allow disabling ripples for tab-group labels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should set the isActive flag on each of the tabs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should fire animation done event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should add the proper `aria-setsize` and `aria-posinset`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should emit focusChange event on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup basic behavior should emit focusChange on arrow key navigation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup aria labelling should set the aria-label attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup aria labelling should set the aria-labelledby attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup aria labelling should not be able to set both an aria-label and aria-labelledby': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup disable tabs should have one disabled tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup disable tabs should set the disabled flag on tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should be able to add a new tab, select it, and have correct origin position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should update selected index if the last tab removed while selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should maintain the selected tab if a new tab is added': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should maintain the selected tab if a tab is removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should be able to select a new tab after creation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup dynamic binding tabs should not fire `selectedTabChange` when the amount of tabs changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup async tabs should show tabs when they are available': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup with simple api should support a tab-group with the simple api': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup with simple api should support @ViewChild in the tab content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup with simple api should only have the active tab in the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup with simple api should support setting the header position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup lazy loaded tabs should lazy load the second tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabGroup special cases should not throw an error when binding isActive to the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'nested MatTabGroup with enabled animations should not throw when creating a component with nested tab groups': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton should expose the ripple instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton should not clear previous defined classes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button[mat-fab] should have accent palette by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button[mat-mini-fab] should have accent palette by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button[mat-button] should handle a click on the button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button[mat-button] should not increment if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button[mat-button] should disable the native button element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton a[mat-button] should not redirect if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton a[mat-button] should remove tabindex if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton a[mat-button] should add aria-disabled attribute if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton a[mat-button] should not add aria-disabled attribute if disabled is false': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton a[mat-button] should be able to set a custom tabindex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button ripples should disable the ripple if matRippleDisabled input is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButton button ripples should disable the ripple when the button is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should complete the `stateChanges` stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should not emit to `onSelectionChange` if selecting an already-selected option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should not emit to `onSelectionChange` if deselecting an unselected option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should be able to set a custom id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should select the option when pressing space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should select the option when pressing enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component should not do anything when pressing the selection keys with a modifier': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component ripples should show ripples by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatOption component ripples should not show ripples if the option is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should initialize to the selected index': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should send focus change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should not set focus a disabled tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should move focus right and skip disabled tabs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should move focus left and skip disabled tabs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should support key down events to move and select focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should move focus to the first tab when pressing HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should skip disabled items when moving focus using HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should move focus to the last tab when pressing END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader focusing should skip disabled items when moving focus using END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination ltr should show width when tab list width exceeds container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination ltr should scroll to show the focused tab label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination ltr should show ripples for pagination buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination ltr should allow disabling ripples for pagination buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination rtl should scroll to show the focused tab label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination should re-align the ink bar when the direction changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination should re-align the ink bar when the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination should update arrows when the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabHeader pagination should update the pagination state if the content of the labels changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view has correct month label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view has 31 days': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view shows selected date if in same month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view does not show selected date if in different month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view fires selected change event on cell clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view should mark active date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should decrement date on left arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should increment date on left arrow press in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should increment date on right arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should decrement date on right arrow press in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go up a row on up arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go down a row on down arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go to beginning of the month on home press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go to end of the month on end press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go back one month on page up press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should go forward one month on page down press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should select active date on enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView standard month view a11y calendar body should select active date on space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView month view with date filter should disable filtered dates': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMonthView month view with custom date classes should be able to add a custom class to some dates': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view has correct year label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view has 12 months': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view shows selected month if in same year': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view does not show selected month if in different year': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view fires selected change event on cell clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view should emit the selected month on cell clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view should mark active date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view should allow selection of month with less days than current active date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should decrement month on left arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should increment month on left arrow press in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should increment month on right arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should decrement month on right arrow press in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go up a row on up arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go down a row on down arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go to first month of the year on home press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go to last month of the year on end press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go back one year on page up press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView standard year view a11y calendar body should go forward one year on page down press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatYearView year view with date filter should disable months with no enabled days': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view has correct number of years': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view shows selected year if in same range': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view does not show selected year if in different range': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view fires selected change event on cell clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view should emit the selected year on cell clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view should mark active date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should decrement year on left arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should increment year on right arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go up a row on up arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go down a row on down arrow press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go to first year in current range on home press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go to last year in current range on end press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go to same index in previous year range page up press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView standard multi-year view a11y calendar body should go to same index in next year range on page down press': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMultiYearView multi year view with date filter should disablex years with no enabled days': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should throw error if cols is not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should throw error if rowHeight ratio is invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should throw error if tile colspan is wider than total cols': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should not throw when setting the `rowHeight` programmatically before init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should preserve value when zero is set as row height': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should set the columns to zero if a negative number is passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should default to 1:1 row height if undefined ': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should use a ratio row height if passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should divide row height evenly in "fit" mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should use the fixed row height if passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should default to pixels if row height units are missing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should default gutter size to 1px': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should be able to set the gutter size to zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should lay out the tiles correctly for a nested grid list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should set the gutter size if passed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should use pixels if gutter units are missing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should allow alternate units for the gutter size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should set the correct list height in ratio mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should set the correct list height in fixed mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should allow adjustment of tile colspan': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should allow adjustment of tile rowspan': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should lay out tiles correctly for a complex layout': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should lay out tiles correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should lay out tiles correctly when single cell to be placed at the beginning': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should add not add any classes to footers without lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should add class to footers with two lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should not use calc() that evaluates to 0': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should reset the old styles when switching to a new tile styler': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should ensure that all tiles are inside the grid when there are no matching gaps': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should default to LTR if empty directionality is given': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should set `right` styles for RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should lay out the tiles if they are not direct descendants of the list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatGridList should throw if an invalid value is set as the `rowHeight`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDivider should apply vertical class to vertical divider': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDivider should apply horizontal class to horizontal divider': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDivider should apply inset class to inset divider': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDivider should apply inset and vertical classes to vertical inset divider': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDivider should add aria roles properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get year': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get day of week': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get long month names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get narrow month names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get month names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get date names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get date names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get long day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get short day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get narrow day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get day of week names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get year name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get year name in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get first day of week': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should create Date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should not create Date with month over/under-flow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should not create Date with date over/under-flow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should create Date with low year number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should get today\'s date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should parse string': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should parse number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should parse Date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should parse invalid value as invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should format with custom format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should format with a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should throw when attempting to format invalid date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should add years': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should respect leap years when adding years': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should add months': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should respect month length differences when adding months': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should add days': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should clone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should preserve time when cloning': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should compare dates': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should clamp date at lower bound': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should clamp date at upper bound': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should clamp date already within bounds': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should use UTC for formatting by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should count today as a valid date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should count an invalid date as an invalid date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should count a string as not a date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should create dates from valid ISO strings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should create an invalid date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should not throw when attempting to format a date with a year less than 1': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter should not throw when attempting to format a date with a year greater than 9999': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter with MAT_DATE_LOCALE override should take the default locale id from the MAT_DATE_LOCALE injection token': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'NativeDateAdapter with LOCALE_ID override should cascade locale id from the LOCALE_ID injection token to MAT_DATE_LOCALE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should change active index on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should add the active class if active': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should toggle aria-current based on active state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should add the disabled class if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should update aria-disabled if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should disable the ripples on all tabs when they are disabled on the nav bar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should have the `disableRipple` from the tab take precendence over the nav bar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should update the tabindex if links are disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should make disabled links unclickable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should show ripples for tab links': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should be able to disable ripples on a tab link': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should re-align the ink bar when the direction changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should re-align the ink bar when the tabs list change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should re-align the ink bar when the tab labels change the width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should re-align the ink bar when the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar basic behavior should hide the ink bar when all the links are inactive': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar should clean up the ripple event handlers on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar should support the native tabindex attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTabNavBar should support binding to the tabIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should update the badge based on attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should update the badge position on direction change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should change visibility to hidden': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should change badge sizes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should change badge overlap': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should toggle `aria-describedby` depending on whether the badge has a description': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should toggle visibility based on whether the badge has content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should apply view encapsulation on create badge content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should toggle a class depending on the badge disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBadge should update the aria-label if the description changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon should apply a class if there is no color': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon should mark mat-icon as aria-hidden by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon should not override a user-provided aria-hidden attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon should apply inline styling': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Ligature icons should add material-icons class by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Ligature icons should use alternate icon font if set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should register icon URLs by name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should throw an error when using an untrusted icon url': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should throw an error when using an untrusted icon set url': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should extract icon from SVG icon set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should never parse the same icon set multiple times': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should allow multiple icon sets in a namespace': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should clear the id attribute from the svg node': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should unwrap <symbol> nodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should not wrap <svg> elements in icon sets in another svg tag': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should return unmodified copies of icons from icon sets': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should not throw when toggling an icon that has a binding in IE11': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should remove the SVG element from the DOM when the binding is cleared': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from URLs should keep non-SVG user content inside the icon element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should register icon HTML strings by name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should throw an error when using untrusted HTML': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should extract an icon from SVG icon set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should allow multiple icon sets in a namespace': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should return unmodified copies of icons from icon sets': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should add an extra string to the end of `style` tags inside SVG': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should prepend the current path to attributes with `url()` references': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should use latest path when prefixing the `url()` references': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon Icons from HTML string should update the `url()` references when the path changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon custom fonts should apply CSS classes for custom font and icon': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon custom fonts should handle values with extraneous spaces being passed in to `fontSet`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon custom fonts should handle values with extraneous spaces being passed in to `fontIcon`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatIcon without HttpClientModule should throw an error when trying to load a remote icon': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should apply a mode of "determinate" if no mode is provided.': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should not modify the mode if a valid mode is provided.': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should define a default value of zero for the value attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should set the value to 0 when the mode is set to indeterminate': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should retain the value if it updates while indeterminate': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should use different `circle` elements depending on the mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should clamp the value of the progress between 0 and 100': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should default to a stroke width that is 10% of the diameter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should allow a custom diameter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should allow a custom stroke width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should expand the host element if the stroke width is greater than the default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should not collapse the host element if the stroke width is less than the default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should set the color class on the mat-spinner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should set the color class on the mat-progress-spinner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should remove the underlying SVG element from the tab order explicitly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should handle the number inputs being passed in as strings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should update the element size when changed dynamically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should be able to set a default diameter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatProgressSpinner should be able to set a default stroke width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatToolbar with single row should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatToolbar with single row should not wrap the first row contents inside of a generated element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatToolbar with multiple rows should project each toolbar-row element inside of the toolbar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatToolbar with multiple rows should throw an error if different toolbar modes are mixed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatToolbar with multiple rows should throw an error if a toolbar-row is added later': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree should initialize with rendered dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree should initialize with the right accessibility roles': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree should initialize with the right data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree with toggle should expand/collapse the node': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree with toggle should expand/collapse the node recursively': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree with when node template with the right data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree flat tree with undefined or null children should initialize with rendered dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree with undefined or null children should initialize with rendered dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree should initialize with rendered dataNodes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree should initialize with the right accessibility roles': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree should initialize with the right data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree should initialize with nested child data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree with when node with the right data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree with toggle should expand/collapse the node': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTree nested tree with toggle should expand/collapse the node recursively': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should open a dialog with a component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should open a dialog with a template': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should emit when dialog opening animation is complete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should use injector from viewContainerRef for DialogInjector': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should open a dialog with a component and no ViewContainerRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should apply the configured role to the dialog element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should apply the specified `aria-describedby`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close a dialog and get back a result': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should only emit the afterCloseEvent once when closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close a dialog and get back a result before it is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close a dialog via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close from a ViewContainerRef with OnPush change detection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should emit the backdropClick stream when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should emit the keyboardEvent stream when key events target the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should notify the observers if a dialog has been opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should notify the observers if all open dialogs have finished closing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should emit the afterAllClosed stream on subscribe if there are no open dialogs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the min-width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the max-width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the min-height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the max-height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the top offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the bottom offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the left offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should override the right offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should allow for the position to be updated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should allow for the dimensions to be updated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should allow setting the layout direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should inject the correct layout direction in the component instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should fall back to injecting the global direction if none is passed by the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close all of the dialogs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should set the proper animation states': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close all dialogs when the user goes forwards/backwards in history': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close all open dialogs when the location hash changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should have the componentInstance available in the afterClosed callback': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should close all open dialogs on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should complete the various lifecycle streams on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog passing in data should be able to pass in data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog passing in data should default to null if no data is passed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should not keep a reference to the component after the dialog is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should assign a unique id to each dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should allow for the id to be overwritten': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should throw when trying to open a dialog with the same id as another dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog should be able to find a dialog by id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog disableClose option should prevent closing via clicks on the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog disableClose option should prevent closing via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog disableClose option should allow for the disableClose option to be updated while open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog hasBackdrop option should have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog hasBackdrop option should not have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog panelClass option should have custom panel class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog backdropClass option should have default backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog backdropClass option should have custom backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog focus management should focus the first tabbable element of the dialog on open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog focus management should allow disabling focus of the first tabbable element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog focus management should re-focus trigger element when dialog closes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog focus management should allow the consumer to shift focus in afterClosed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog focus management should move focus to the container if there are no focusable elements in the dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog aria-label should be able to set a custom aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog aria-label should not set the aria-labelledby automatically if it has an aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog with a parent Dialog should close dialogs opened by a parent when calling closeAll on a child Dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog with a parent Dialog should close dialogs opened by a child when calling closeAll on a parent Dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog with a parent Dialog should not close the parent dialogs, when a child is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Dialog with a parent Dialog should close the top dialog via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FullscreenOverlayContainer should open an overlay inside a fullscreen element and move it to the body': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FullscreenOverlayContainer should open an overlay inside the body and move it to a fullscreen element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should track overlays in order as they are attached and detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should dispatch body keyboard events to the most recently attached overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should dispatch keyboard events when propagation is stopped': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should complete the keydown stream on dispose': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should stop emitting events to detached overlays': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should stop emitting events to disposed overlays': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should dispose of the global keyboard event handler correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should skip overlays that do not have keydown event subscriptions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayKeyboardDispatcher should not add the same overlay to the stack multiple times': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should attach the overlay based on the open property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should destroy the overlay when the directive is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should use a connected position strategy with a default set of positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should set and update the `dir` attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should close when pressing escape': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives should not depend on the order in which the `origin` and `open` are set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the height': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the min width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the min height': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should create the backdrop if designated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should not create the backdrop by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should be able to change hasBackdrop after the overlay has been initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the custom backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the custom panel class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the offsetX': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should set the offsetY': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should be able to update the origin after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should update the positions if they change after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should take the offset from the position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should be able to set the viewport margin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should allow for flexible positioning to be enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should allow for growing after open to be enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives inputs should allow for pushing to be enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives outputs should emit backdropClick appropriately': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives outputs should emit positionChange appropriately': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives outputs should emit attach and detach appropriately': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay directives outputs should emit the keydown events from the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should load a component into an overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should load a template portal into an overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should disable pointer events of the pane element if detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should open multiple overlays': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should ensure that the most-recently-attached overlay is on top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should take the default direction from the global Directionality': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should set the direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should emit when an overlay is attached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should emit the attachment event after everything is added to the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should emit when an overlay is detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should not emit to the detach stream if the overlay has not been attached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should not emit to the detach stream on dispose if the overlay was not attached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should emit the detachment event after the overlay is removed from the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should emit and complete the observables when an overlay is disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should complete the attachment observable before the detachment one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should default to the ltr direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should skip undefined values when applying the defaults': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should clear out all DOM element references on dispose': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should clear the backdrop timeout if the transition finishes first': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should be able to use the `Overlay` provider during app initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should keep the direction in sync with the passed in Directionality': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should add and remove the overlay host as the ref is being attached and detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay should be able to dispose an overlay on navigation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay positioning should apply the positioning strategy': {
    'error': 'Uncaught NotFoundError: Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node. thrown',
    'notes': 'Unknown',
  },
  'Overlay positioning should not apply the position if it detaches before the zone stabilizes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay positioning should be able to swap position strategies': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay positioning should not do anything when trying to swap a strategy with itself': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the width set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should support using other units if a string width is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the height set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should support using other units if a string height is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the min width set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the min height set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the max width set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should apply the max height set in the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should support zero widths and heights': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay size should be able to reset the various size properties': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should create and destroy an overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should complete the backdrop click stream once the overlay is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should apply the default overlay backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should apply a custom class to the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should apply multiple custom classes to the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should disable the pointer events of a backdrop that is being removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay backdrop should insert the backdrop before the overlay host in the DOM order': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay panelClass should apply a custom overlay pane class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay panelClass should be able to apply multiple classes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay panelClass should remove the custom panel class when the overlay is detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay panelClass should wait for the overlay to be detached before removing the panelClass': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay scroll strategy should attach the overlay ref to the scroll strategy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay scroll strategy should enable the scroll strategy when the overlay is attached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay scroll strategy should disable the scroll strategy once the overlay is detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Overlay scroll strategy should disable the scroll strategy when the overlay is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should position a panel below, left-aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should position to the right, center aligned vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should position to the left, below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should position above, right aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should position below, centered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should center the overlay on the origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when not near viewport edge, not scrolled should allow for the positions to be updated after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should position a panel below, left-aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should position to the right, center aligned vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should position to the left, below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should position above, right aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should position below, centered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should center the overlay on the origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when scrolled should allow for the positions to be updated after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the top of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the left of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the bottom of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the right of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should recalculate and set the last position with recalculateLastPosition()': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should default to the initial position, if no positions fit in the viewport': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should position a panel properly when rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should position a panel with the x offset provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should position a panel with the y offset provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body when near viewport edge should allow for the fallback positions to specify their own offsets': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body should emit onPositionChange event when position changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body should emit the onPositionChange event even if none of the positions fit': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body should complete the onPositionChange stream on dispose': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body should pick the fallback position that shows the largest area of the element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy with origin on document body should re-use the preferred position when re-applying while locked in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy onPositionChange with scrollable view properties should not have origin or overlay clipped or out of view without scroll': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate if origin is clipped if scrolled slightly down': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate if origin is out of view and overlay is clipped if scrolled enough': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate the overlay and origin are both out of the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties in ltr should use `left` when positioning an element at the start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties in ltr should use `right` when positioning an element at the end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties in rtl should use `right` when positioning an element at the start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties in rtl should use `left` when positioning an element at the end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties vertical should use `top` when positioning at element along the top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'ConnectedPositionStrategy positioning properties vertical should use `bottom` when positioning at element along the bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayContainer should remove the overlay container element from the DOM on destruction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'OverlayContainer should add and remove css classes from the container element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should toggle scroll blocking along the y axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should toggle scroll blocking along the x axis': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should toggle the `cdk-global-scrollblock` class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should restore any previously-set inline styles': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should\'t do anything if the page isn\'t scrollable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should keep the content width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'BlockScrollStrategy should not clobber user-defined scroll-behavior': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CloseScrollStrategy should detach the overlay as soon as the user scrolls': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CloseScrollStrategy should not attempt to detach the overlay after it has been detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CloseScrollStrategy should detach inside the NgZone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CloseScrollStrategy should be able to reposition the overlay up to a certain threshold before closing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CloseScrollStrategy should not close if the user starts scrolling away and comes back': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'RepositionScrollStrategy should update the overlay position when the page is scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'RepositionScrollStrategy should not be updating the position after the overlay is detached': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'RepositionScrollStrategy should not be updating the position after the overlay is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'RepositionScrollStrategy should be able to close the overlay once it is out of view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should position the element to the (top, left) with an offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should position the element to the (bottom, right) with an offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should overwrite previously applied positioning': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should center the element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should center the element with an offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should make the element position: static': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should wrap the element in a `cdk-global-overlay-wrapper`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should remove the parent wrapper from the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should set the element width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should set the element height': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should reset the horizontal position and offset when the width is 100%': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should reset the vertical position and offset when the height is 100%': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should not throw when attempting to apply after the overlay has been disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should take its width and height from the overlay config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should update the overlay size when setting it through the position strategy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should take the dimensions from the overlay config, when they are set both in the config and the strategy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should center the element in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should invert `justify-content` when using `left` in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should invert `justify-content` when using `right` in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'GlobalPositonStrategy should clean up after itself when it has been disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should open a bottom sheet with a component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should open a bottom sheet with a template': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should position the bottom sheet at the bottom center of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should emit when the bottom sheet opening animation is complete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should use the correct injector': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should open a bottom sheet with a component and no ViewContainerRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should apply the correct role to the container element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should close a bottom sheet via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should close when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should emit the backdropClick stream when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should emit the keyboardEvent stream when key events target the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should allow setting the layout direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should inject the correct direction in the instantiated component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should fall back to injecting the global direction if none is passed by the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should be able to set a custom panel class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should be able to set a custom aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should be able to get dismissed through the service': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should dismiss the bottom sheet when the service is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should open a new bottom sheet after dismissing a previous sheet': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should remove past bottom sheets when opening new ones': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should not throw when opening multiple bottom sheet in quick succession': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should remove bottom sheet if another is shown while its still animating open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should emit after being dismissed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should be able to pass a result back to the dismissed stream': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should close the bottom sheet when going forwards/backwards in history': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should close the bottom sheet when the location hash changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet should allow the consumer to disable closing a bottom sheet on navigation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet passing in data should be able to pass in data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet passing in data should default to null if no data is passed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet disableClose option should prevent closing via clicks on the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet disableClose option should prevent closing via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet hasBackdrop option should have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet hasBackdrop option should not have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet backdropClass option should have default backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet backdropClass option should have custom backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet focus management should focus the bottom sheet container by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet focus management should focus the first tabbable element of the bottom sheet on open whenautoFocus is enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet focus management should allow disabling focus of the first tabbable element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet focus management should re-focus trigger element when bottom sheet closes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet focus management should be able to disable focus restoration': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by parent when opening from child': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by child when opening from parent': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet with parent MatBottomSheet should not close parent bottom sheet when child is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet with default options should use the provided defaults': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatBottomSheet with default options should be overridable by open() options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should have the role of `alert` with an `assertive` politeness if no announcement message is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should have the role of `status` with an `assertive` politeness if an announcement message is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should have the role of `status` with a `polite` politeness': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should remove the role if the politeness is turned off': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should open and close a snackbar without a ViewContainerRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should open a simple message with a button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should open a simple message with no button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should dismiss the snack bar and remove itself from the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should default to the passed message for the announcement message': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should be able to specify a custom announcement message': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should be able to get dismissed through the service': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should clean itself up when the view container gets destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should set the animation state to visible on entry': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should set the animation state to complete on exit': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should set the old snack bar animation state to complete and the new snack bar animation\n      state to visible on entry of new snack bar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should open a new snackbar after dismissing a previous snackbar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should remove past snackbars when opening new snackbars': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should remove snackbar if another is shown while its still animating open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should dismiss the snackbar when the action is called, notifying of both action and dismiss': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should allow manually dismissing with an action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should indicate in `afterClosed` whether it was dismissed by an action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should complete the onAction stream when not closing via an action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should dismiss automatically after a specified timeout': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should clear the dismiss timeout when dismissed before timeout expiration': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should add extra classes to the container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should set the layout direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should be able to override the default config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar should dismiss the open snack bar on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with custom component should open a custom component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with custom component should inject the snack bar reference into the component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with custom component should be able to inject arbitrary user data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with custom component should allow manually dismissing with an action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with TemplateRef should be able to open a snack bar using a TemplateRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with TemplateRef should be able to pass in contextual data when opening with a TemplateRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with parent MatSnackBar should close snackBars opened by parent when opening from child': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with parent MatSnackBar should close snackBars opened by child when opening from parent': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar with parent MatSnackBar should not dismiss parent snack bar if child is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should default to bottom center': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the bottom left corner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the bottom right corner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the bottom center': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the top left corner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the top right corner': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should be in the top center': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should handle start based on direction (rtl)': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should handle start based on direction (ltr)': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should handle end based on direction (rtl)': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSnackBar Positioning should handle end based on direction (ltr)': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should show and hide the tooltip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be able to re-open a tooltip if it was closed by detaching the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should show with delay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be able to override the default show and hide delays': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should set a css class on the overlay panel element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should hide if disabled while visible': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should hide if the message is cleared while the tooltip is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show if hide is called before delay finishes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show tooltip if message is not present or empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not follow through with hide if show is called after': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be able to update the tooltip position while open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not throw when updating the position for a closed tooltip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be able to modify the tooltip message': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should allow extra classes to be set on the tooltip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be removed after parent destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should have an aria-described element with the tooltip message': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not try to dispose the tooltip when destroyed and done hiding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should consistently position before and after overlay origin in ltr and rtl dir': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should consistently position before and after overlay position in ltr and rtl dir': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should throw when trying to assign an invalid position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should pass the layout direction to the tooltip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should keep the overlay direction in sync with the trigger direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should be able to set the tooltip message as a number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should hide when clicking away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not hide immediately if a click fires while animating': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not throw when pressing ESCAPE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show the tooltip on progammatic focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show the tooltip on mouse focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not show the tooltip on touch focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip basic usage should not hide the tooltip when calling `show` twice in a row': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip fallback positions should set a fallback origin position by inverting the main origin position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip fallback positions should set a fallback overlay position by inverting the main overlay position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip scrollable usage should hide tooltip if clipped after changing positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip scrollable usage should execute the `hide` call, after scrolling away, inside the NgZone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip with OnPush should show and hide the tooltip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip with OnPush should have rendered the tooltip text on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip special cases should clear the `user-select` when a tooltip is set on a text field': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip special cases should clear the `-webkit-user-drag` on draggable elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip special cases should not open on `mouseenter` on iOS': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTooltip special cases should not open on `mouseenter` on Android': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy should throw when attempting to attach to multiple different overlays': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy should not throw when trying to apply after being disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy should not throw when trying to re-apply the last position after being disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy should for the virtual keyboard offset when positioning the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy should clean up after itself when disposed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should position a panel below, left-aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should position to the right, center aligned vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should position to the left, below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should position above, right aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should position below, centered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when not near viewport edge, not scrolled should center the overlay on the origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should position a panel below, left-aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should position to the right, center aligned vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should position to the left, below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should position above, right aligned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should position below, centered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when scrolled should center the overlay on the origin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the top of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the left of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the bottom of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the right of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should recalculate and set the last position with recalculateLastPosition()': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should default to the initial position, if no positions fit in the viewport': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should position a panel properly when rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should position a panel with the x offset provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should be able to set the default x offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should have the position offset x take precedence over the default offset x': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should position a panel with the y offset provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should be able to set the default y offset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should have the position offset y take precedence over the default offset y': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should allow for the fallback positions to specify their own offsets': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when aligning to start/bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when aligning to end/bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when centering vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when centering horizontally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when aligning to start/top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when aligning to start/bottom in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing with transform origin should set the proper transform-origin when aligning to end/bottom in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should account for the `offsetX` pushing the overlay out of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should account for the `offsetY` pushing the overlay out of the screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should emit onPositionChange event when the position changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should emit the onPositionChange event even if none of the positions fit': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should pick the fallback position that shows the largest area of the element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should re-use the preferred position when re-applying while locked in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy without flexible dimensions and pushing should not retain the last preferred position when overriding the positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should set a margin when pushing the overlay into the viewport horizontally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should set a margin when pushing the overlay into the viewport vertically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should not mess with the left offset when pushing from the top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should align to the trigger if the overlay is wider than the viewport, but the trigger is still within the viewport': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should push into the viewport if the overlay is wider than the viewport and the triggerout of the viewport': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should keep the element inside the viewport as the user is scrolling, with position locking disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with pushing should not continue pushing the overlay as the user scrolls, if position locking is enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should align the overlay to `flex-start` when the content is flowing to the right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should align the overlay to `flex-end` when the content is flowing to the left': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should align the overlay to `center` when the content is centered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should support offsets when centering': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should become scrollable when it hits the viewport edge with a flexible height': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should become scrollable when it hits the viewport edge with a flexible width': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should not collapse the height if the size is less than the minHeight': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should not collapse the width if the size is less than the minWidth': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should take `weight` into account when determining which position to pick': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should be able to opt-in to having the overlay grow after it was opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should calculate the `bottom` value correctly with upward-flowing content and a scrolled page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should set the proper styles when the `bottom` value is exactly zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should set the proper styles when the `top` value is exactly zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should set the proper styles when the `left` value is exactly zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should set the proper styles when the `right` value is exactly zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should calculate the bottom offset correctly with a viewport margin': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy with flexible dimensions should center flexible overlay with push on a scrolled page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy onPositionChange with scrollable view properties should not have origin or overlay clipped or out of view without scroll': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate if origin is clipped if scrolled slightly down': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate if origin is out of view and overlay is clipped if scrolled enough': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy onPositionChange with scrollable view properties should evaluate the overlay and origin are both out of the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties in ltr should use `left` when positioning an element at the start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties in ltr should use `right` when positioning an element at the end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties in rtl should use `right` when positioning an element at the start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties in rtl should use `left` when positioning an element at the end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties vertical should use `top` when positioning at element along the top': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy positioning properties vertical should use `bottom` when positioning at element along the bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy validations should throw when attaching without any positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy validations should throw when passing in something that is missing a connection point': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy validations should throw when passing in something that has an invalid X position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy validations should throw when passing in something that has an invalid Y position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy panel classes should be able to apply a class based on the position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy panel classes should be able to apply multiple classes based on the position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy panel classes should remove the panel class when detaching': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy panel classes should clear the previous classes when the position changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'FlexibleConnectedPositionStrategy panel classes should not clear the existing `panelClass` from the `OverlayRef`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should open a dialog with a component': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should open a dialog with a template': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should emit when dialog opening animation is complete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should use injector from viewContainerRef for DialogInjector': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should open a dialog with a component and no ViewContainerRef': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should apply the configured role to the dialog element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should apply the specified `aria-describedby`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close a dialog and get back a result': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should dispatch the beforeClose and afterClose events when the overlay is detached externally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close a dialog and get back a result before it is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close a dialog via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close from a ViewContainerRef with OnPush change detection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should emit the backdropClick stream when clicking on the overlay backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should emit the keyboardEvent stream when key events target the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should notify the observers if a dialog has been opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should notify the observers if all open dialogs have finished closing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should emit the afterAllClosed stream on subscribe if there are no open dialogs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the min-width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the max-width of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the min-height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the max-height of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the top offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the bottom offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the left offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should override the right offset of the overlay pane': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should allow for the position to be updated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should allow for the dimensions to be updated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should reset the overlay dimensions to their initial size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should allow setting the layout direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should inject the correct layout direction in the component instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should fall back to injecting the global direction if none is passed by the config': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close all of the dialogs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should set the proper animation states': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close all dialogs when the user goes forwards/backwards in history': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close all open dialogs when the location hash changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should close all of the dialogs when the injectable is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should complete open and close streams when the injectable is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should allow the consumer to disable closing a dialog on navigation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should have the componentInstance available in the afterClosed callback': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should be able to attach a custom scroll strategy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog passing in data should be able to pass in data': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog passing in data should default to null if no data is passed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should not keep a reference to the component after the dialog is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should assign a unique id to each dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should allow for the id to be overwritten': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should throw when trying to open a dialog with the same id as another dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should be able to find a dialog by id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should toggle `aria-hidden` on the overlay container siblings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should restore `aria-hidden` to the overlay container siblings on close': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog should not set `aria-hidden` on `aria-live` elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog disableClose option should prevent closing via clicks on the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog disableClose option should prevent closing via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog disableClose option should allow for the disableClose option to be updated while open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog hasBackdrop option should have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog hasBackdrop option should not have a backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog panelClass option should have custom panel class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog backdropClass option should have default backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog backdropClass option should have custom backdrop class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should focus the first tabbable element of the dialog on open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should allow disabling focus of the first tabbable element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should re-focus trigger element when dialog closes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should allow the consumer to shift focus in afterClosed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should move focus to the container if there are no focusable elements in the dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog focus management should be able to disable focus restoration': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should close the dialog when clicking on the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should not close if [mat-dialog-close] is applied on a non-button node': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should allow for a user-specified aria-label on the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should override the "type" attribute of the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should return the [mat-dialog-close] result when clicking the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside component dialog should set the aria-labelledby attribute to the id of the title': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should close the dialog when clicking on the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should not close if [mat-dialog-close] is applied on a non-button node': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should allow for a user-specified aria-label on the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should override the "type" attribute of the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should return the [mat-dialog-close] result when clicking the close button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog dialog content elements inside template portal should set the aria-labelledby attribute to the id of the title': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog aria-label should be able to set a custom aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog aria-label should not set the aria-labelledby automatically if it has an aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with a parent MatDialog should close dialogs opened by a parent when calling closeAll on a child MatDialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with a parent MatDialog should close dialogs opened by a child when calling closeAll on a parent MatDialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with a parent MatDialog should close the top dialog via the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with a parent MatDialog should not close the parent dialogs when a child is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with default options should use the provided defaults': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDialog with default options should be overridable by open() options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should open the menu as an idempotent operation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should close the menu when a click occurs outside the menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to remove the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to remove the backdrop on repeat openings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should restore focus to the trigger when the menu was opened by keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to set a custom class on the backdrop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should restore focus to the root trigger when the menu was opened by mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should restore focus to the root trigger when the menu was opened by touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should scroll the panel to the top on open, when it is scrollable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the proper focus origin when restoring focus after opening by keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the proper focus origin when restoring focus after opening by mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set proper focus origin when right clicking on trigger, before opening by keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the proper focus origin when restoring focus after opening by touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should close the menu when pressing ESCAPE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should open a custom menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the panel direction based on the trigger direction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should update the panel direction if the trigger direction changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should transfer any custom classes from the host to the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the "menu" role on the overlay panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the "menuitem" role on the items by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to set an alternate role on the menu items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should not throw an error on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to extract the menu item text': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should filter out non-text nodes when figuring out the label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the proper focus origin when opening by mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should set the proper focus origin when opening by touch': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should close the menu when using the CloseScrollStrategy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should switch to keyboard focus when using the keyboard after opening using the mouse': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should toggle the aria-expanded attribute on the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should throw the correct error if the menu is not defined after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu should be able to swap out a menu after the first time it is opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu lazy rendering should be able to render the menu content lazily': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu lazy rendering should detach the lazy content when the menu is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu lazy rendering should wait for the close animation to finish before considering the panel as closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu lazy rendering should focus the first menu item when opening a lazy menu via keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu lazy rendering should be able to open the same menu with a different context': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu positions should append mat-menu-before if the x position is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu positions should append mat-menu-above if the y position is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu positions should default to the "below" and "after" positions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu positions should be able to update the position after the first open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu fallback positions should fall back to "before" mode if "after" mode would not fit on screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu fallback positions should fall back to "above" mode if "below" mode would not fit on screen': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu fallback positions should re-position menu on both axes if both defaults would not fit': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu fallback positions should re-position a menu with custom position set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu overlapping trigger explicitly overlapping positions the overlay below the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu overlapping trigger not overlapping positions the overlay below the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu overlapping trigger not overlapping supports above position fall back': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu overlapping trigger not overlapping repositions the origin to be below, so the menu opens from the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu animations should enable ripples on items by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu animations should disable ripples on disabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu animations should disable ripples if disableRipple is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu close event should emit an event when a menu item is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu close event should emit a close event when the backdrop is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu close event should emit an event when pressing ESCAPE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu close event should complete the callback when the menu is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should set the `triggersSubmenu` flags on the triggers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should set the `parentMenu` on the sub-menu instances': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should pass the layout direction the nested menus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should emit an event when the hover state of the menu items changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should toggle a nested menu when its trigger is hovered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close all the open sub-menus when the hover state is changed at the root': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close submenu when hovering over disabled sibling item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should not open submenu when hovering over disabled trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should open a nested menu when its trigger is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should open and close a nested menu with arrow keys in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should open and close a nested menu with the arrow keys in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should not do anything with the arrow keys for a top-level menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close all of the menus when the backdrop is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should shift focus between the sub-menus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should position the sub-menu to the right edge of the trigger in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should fall back to aligning to the left edge of the trigger in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should position the sub-menu to the left edge of the trigger in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should fall back to aligning to the right edge of the trigger in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close all of the menus when an item is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close all of the menus when the user tabs away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should set a class on the menu items that trigger a sub-menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should increase the sub-menu elevation based on its depth': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should update the elevation when the same menu is opened at a different depth': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should not increase the elevation if the user specified a custom one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close all of the menus when the root is closed programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should toggle a nested menu when its trigger is added after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should prevent the default mousedown action if the menu item opens a sub-menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should handle the items being rendered in a repeater': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should be able to trigger the same nested menu from different triggers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should close the initial menu if the user moves away while animating': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should be able to open a submenu through an item that is not a direct descendant of the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should not close when hovering over a menu item inside a sub-menu panel that is declaredinside the root menu': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu nested menu should not re-focus a child menu trigger when hovering another trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatMenu default overrides should allow for the default menu options to be overridden': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should resize the textarea based on its content': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should set a min-height based on minRows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should set a max-height based on maxRows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should reduce textarea height when minHeight decreases': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should export the cdkAutosize reference': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should initially set the rows of a textarea to one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should calculate the proper height based on the specified amount of max rows': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should properly resize to content on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should resize when an associated form control value changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should resize when the textarea value is changed programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should trigger a resize when the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'CdkTextareaAutosize should not trigger a resize when it is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms using FormControl should toggle the disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms using FormControl should set the value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms using FormControl should register the on change callback': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should update the model before firing change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should set individual radio names based on the group name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should check the corresponding button toggle on a group value change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should have the correct FormControl state initially and after interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should update the ngModel value when selecting a button toggle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should show a ripple on label click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle with forms button toggle group with ngModel and change event should allow ripples to be disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should set individual button toggle names based on the group name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should disable click interactions when the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should set aria-disabled based on whether the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should disable the underlying button when the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should update the group value when one of the toggles changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should propagate the value change back up via a two-way binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should update the group and toggles when one of the button toggles is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should check a button toggle upon interaction with underlying native radio button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should change the vertical state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should emit a change event from button toggles': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should emit a change event from the button toggle group': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should update the group and button toggles when updating the group value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of an exclusive selection group should deselect all of the checkboxes when the group value is cleared': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with initial value and change event should not fire an initial change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should disable click interactions when the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should check a button toggle when clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should allow for multiple toggles to be selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should check a button toggle upon interaction with underlying native checkbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should change the vertical state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should deselect a button toggle when selected twice': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should emit a change event for state changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should throw when attempting to assign a non-array value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms inside of a multiple selection group should be able to query for the deprecated `MatButtonToggleGroupMultiple`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms as standalone should toggle when clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms as standalone should emit a change event for state changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms as standalone should focus on underlying input element when focus() is called': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms as standalone should not assign a name to the underlying input if one is not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms as standalone should have correct aria-pressed attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms aria-label handling  should not set the aria-label attribute if none is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms aria-label handling  should use the provided aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with provided aria-labelledby  should use the provided aria-labelledby': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with provided aria-labelledby  should not assign aria-labelledby if none is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with tabindex  should forward the tabindex to the underlying button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with tabindex  should clear the tabindex from the host element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms with tabindex  should forward focus to the underlying button when the host is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms should not throw on init when toggles are repeated and there is an initial value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms should maintain the selected state when the value and toggles are swapped out at the same time': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatButtonToggle without forms should select falsy button toggle value in multiple selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should add and remove the checked state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should expose the ripple instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should add and remove indeterminate state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should set indeterminate to false when input clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should not set indeterminate to false when checked is set programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should change native element checked when check programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should toggle checked state on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should change from indeterminate to checked on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should add and remove disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should not toggle `checked` state upon interation while disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should overwrite indeterminate state when clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should preserve the user-provided id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should generate a unique id for the checkbox input if no id is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should project the checkbox content into the label element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should make the host element a tab stop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should add a css class to position the label before the checkbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should not trigger the click event multiple times': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should trigger a change event when the native input does': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should not trigger the change event by changing the native value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should forward the required attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should focus on underlying input element when focus() is called': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should forward the value to input element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors should remove the SVG checkmark from the tab order': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors ripple elements should show ripples on label mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors ripple elements should not show ripples when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors ripple elements should remove ripple if matRippleDisabled input is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors color behaviour should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors color behaviour should not clear previous defined classes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should transition unchecked -> checked -> unchecked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should transition unchecked -> indeterminate -> unchecked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should transition indeterminate -> checked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should not apply transition classes when there is no state change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should not initially have any transition classes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors state transition css classes should not have transition classes when animation ends': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors when MAT_CHECKBOX_CLICK_ACTION is \'check\' should not set `indeterminate` to false on click if check is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors when MAT_CHECKBOX_CLICK_ACTION is \'noop\' should not change `indeterminate` on click if noop is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox basic behaviors when MAT_CHECKBOX_CLICK_ACTION is \'noop\' should not change \'checked\' or \'indeterminate\' on click if noop is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with change event and no initial value should emit the event to the change observable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with change event and no initial value should not emit a DOM event to the change output': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox aria-label  should use the provided aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox aria-label  should not set the aria-label attribute if no value is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with provided aria-labelledby  should use the provided aria-labelledby': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with provided aria-labelledby  should not assign aria-labelledby if none is provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with provided tabIndex should preserve any given tabIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with provided tabIndex should preserve given tabIndex when the checkbox is disabled then enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with native tabindex attribute should properly detect native tabindex attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with native tabindex attribute should clear the tabindex attribute from the host element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox using ViewChild should toggle checkbox disabledness correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox using ViewChild should toggle checkbox ripple disabledness correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with multiple checkboxes should assign a unique id to each checkbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with ngModel should be pristine, untouched, and valid initially': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with ngModel should have correct control states after interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with ngModel should not throw an error when disabling while focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with ngModel should toggle checked state on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with ngModel should validate with RequiredTrue validator': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with name attribute should forward name value to input element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox with form control should toggle the disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox without label should remove margin for checkbox without a label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox without label should not remove margin if initial label is set through binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox without label should re-add margin if label is added asynchronously': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox without label should not add the "name" attribute if it is not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox without label should not add the "value" attribute if it is not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCheckbox label margin should properly update margin if label content is projected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should set individual radio names based on the group name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should coerce the disabled binding on the radio group': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should disable click interaction when the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should set label position based on the group labelPosition': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should disable each individual radio when the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should set required to each radio button when the group is required': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should update the group value when one of the radios changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should update the group and radios when one of the radios is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should check a radio upon interaction with the underlying native radio button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should emit a change event from radio buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should not emit a change event from the radio group when change group value\n        programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should update the group and radios when updating the group value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should deselect all of the radios when the group value is cleared': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should not show ripples on disabled radio buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should not show ripples if matRippleDisabled input is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should update the group\'s selected radio to null when unchecking that radio\n        programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should not fire a change event from the group when a radio checked state changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should update checked status if changed value to radio group\'s value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio inside of a group should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should set individual radio names based on the group name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should check the corresponding radio button on group value change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should have the correct control state initially and after interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should write to the radio button based on ngModel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should update the ngModel value when selecting a radio button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with ngModel should update the model before firing change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group with FormControl should toggle the disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio disableable should toggle the disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should uniquely select radios by a name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should add required attribute to the underlying input element if defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should add aria-label attribute to the underlying input element if defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should not add aria-label attribute if not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should change aria-label attribute if property is changed at runtime': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should add aria-labelledby attribute to the underlying input element if defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should not add aria-labelledby attribute if not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should change aria-labelledby attribute if property is changed at runtime': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should add aria-describedby attribute to the underlying input element if defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should not add aria-describedby attribute if not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should change aria-describedby attribute if property is changed at runtime': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should focus on underlying input element when focus() is called': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio as standalone should not add the "name" attribute if it is not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio with tabindex should forward focus to native input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio with tabindex should allow specifying an explicit tabindex for a single radio-button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio with tabindex should remove the tabindex from the host element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatRadio group interspersed with other tags should initialize selection of radios based on model value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should apply class based on color attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should correctly update the disabled property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should correctly update the checked property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should set the toggle to checked on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should not trigger the click event multiple times': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should trigger the change event properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should not trigger the change event by changing the native value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should not trigger the change event on initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should add a suffix to the inputs id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should forward the tabIndex to the underlying input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should forward the specified name to the input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should forward the aria-label attribute to the input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should forward the aria-labelledby attribute to the input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should set the `for` attribute to the id of the input element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should emit the new values properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should support subscription on the change observable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should forward the required attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should focus on underlying input element when focus() is called': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should focus on underlying input element when the host is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should set a element class if labelPosition is set to before': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should show ripples on label mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms basic behavior should not show ripples when disableRipple is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms custom template should not trigger the change event on initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms custom template should be able to set the tabindex via the native attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms custom template should clear the tabindex from the host element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms custom action configuration should not change value on click when click action is noop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms custom action configuration should not change value on dragging when drag action is noop': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should drag from start to end': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should drag from start to end in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should drag from end to start': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should drag from end to start in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should not drag when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should emit a change event after drag': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should not emit a change event when the value did not change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should ignore clicks on the label element while dragging': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms with dragging should update the checked property of the input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms without label should remove margin for slide-toggle without a label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms without label should not remove margin if initial label is set through binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms without label should re-add margin if label is added asynchronously': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle without forms label margin should properly update margin if label content is projected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should be initially set to ng-pristine': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should update the model programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should have the correct control state initially and after interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should not throw an error when disabling while focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should not set the control to touched when changing the state programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should not set the control to touched when changing the model': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should update checked state on click if control is checked initially': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should be pristine if initial value is set from NgModel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms using ngModel should set the model value when toggling via the `toggle` method': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms with a FormControl should toggle the disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms with form element should prevent the form from submit when being required': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlideToggle with forms with model and change event should report changes to NgModel before emitting change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList basic behaviors should add the `mat-chip-list` class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList basic behaviors should not have the aria-selected attribute when is not selectable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList basic behaviors should toggle the chips disabled state based on whether it is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList with selected chips should not override chips selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList with selected chips should have role listbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList with selected chips should not have role when empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors should focus the first chip on focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors should watch for chip focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors should be able to become focused when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors should remove the tabindex from the list if it is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors on chip destroy should focus the next item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors on chip destroy should focus the previous item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors on chip destroy should not focus if chip list is not focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList focus behaviors on chip destroy should move focus to the last chip when the focused chip was deleted inside acomponent with animations': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior LTR (default) should focus previous item when press LEFT ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior LTR (default) should focus next item when press RIGHT ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior LTR (default) should not handle arrow key events from non-chip elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior LTR (default) should focus the first item when pressing HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior LTR (default) should focus the last item when pressing END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior RTL should focus previous item when press RIGHT ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior RTL should focus next item when press LEFT ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior RTL should allow focus to escape when tabbing away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior RTL should use user defined tabIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList StandardChipList keyboard behavior should account for the direction changing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList FormFieldChipList keyboard behavior should maintain focus if the active chip is deleted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList FormFieldChipList keyboard behavior when the input has focus should not focus the last chip when press DELETE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList FormFieldChipList keyboard behavior when the input has focus should focus the last chip when press BACKSPACE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList FormFieldChipList should complete the stateChanges stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList FormFieldChipList should point the label id to the chip input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList with chip remove should properly focus next item if chip is removed through click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList selection logic should float placeholder if chip is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList selection logic should remove selection if chip has been removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList selection logic should select an option that was added after initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList selection logic should not select disabled chips': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should take an initial view value with reactive forms': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should set the view value from the form': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should update the form value when the view changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should clear the selection when a nonexistent option value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should clear the selection when the control is reset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should set the control to touched when the chip list is touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should not set touched when a disabled chip list is touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should set the control to dirty when the chip list\'s value changes in the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should not set the control to dirty when the value changes programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should set an asterisk after the placeholder if the control is required': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should be able to programmatically select a falsy option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should not focus the active chip when the value is set programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration single selection should blur the form field when the active chip is blurred': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration multiple selection should take an initial view value with reactive forms': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration multiple selection should set the view value from the form': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration multiple selection should update the form value when the view changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration multiple selection should clear the selection when a nonexistent option value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList forms integration multiple selection should clear the selection when the control is reset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should take an initial view value with reactive forms': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should set the view value from the form': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should update the form value when the view changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should clear the selection when a nonexistent option value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should clear the selection when the control is reset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should set the control to touched when the chip list is touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should not set touched when a disabled chip list is touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should set the control to dirty when the chip list\'s value changes in the DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should not set the control to dirty when the value changes programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should set an asterisk after the placeholder if the control is required': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should keep focus on the input after adding the first chip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input should set aria-invalid if the form field is invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input keyboard behavior when the input has focus should not focus the last chip when press DELETE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList chip list with chip input keyboard behavior when the input has focus should focus the last chip when press BACKSPACE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages should not show any errors if the user has not interacted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages should display an error message when the list is touched and invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages should display an error message when the parent form is submitted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages should hide the errors and show the hints once the chip list becomes valid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages should set the proper role on the error messages': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipList error messages sets the aria-describedby to reference errors when in error state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput basic behavior emits the (chipEnd) on enter keyup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput basic behavior should have a default id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput basic behavior should allow binding to the `placeholder` input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput basic behavior should propagate the dynamic `placeholder` value to the form field': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput basic behavior should become disabled if the chip list is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [addOnBlur] allows (chipEnd) when true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [addOnBlur] disallows (chipEnd) when false': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [separatorKeyCodes] does not emit (chipEnd) when a non-separator key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [separatorKeyCodes] emits (chipEnd) when a custom separator keys is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [separatorKeyCodes] emits accepts the custom separator keys in a Set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [separatorKeyCodes] emits (chipEnd) when the separator keys are configured globally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatChipInput [separatorKeyCodes] should not emit the chipEnd event if a separator is pressed with a modifier key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should initialize with correct value shown in input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker open non-touch should open popup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker touch should open dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should not be able to open more than one dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should open datepicker if opened input is set to true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker open in disabled mode should not open the calendar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker disabled datepicker input should open the calendar if datepicker is enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker close should close popup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should close the popup when pressing ESCAPE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should set the proper role on the popup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker close should close dialog': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker setting selected via click should update input and close calendar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker setting selected via enter press should update input and close calendar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker clicking the currently selected date should close the calendar without firing selectedChanged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker pressing enter on the currently selected date should close the calendar without firing selectedChanged': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker startAt should fallback to input value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should attach popup to native input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker input should aria-owns calendar after opened in non-touch mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker input should aria-owns calendar after opened in touch mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should not throw when given wrong data type': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should clear out the backdrop subscriptions on close': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should reset the datepicker when it is closed externally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should close the datpeicker using ALT + UP_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should open the datepicker using ALT + DOWN_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule standard datepicker should not open for ALT + DOWN_ARROW on readonly input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with too many inputs should throw when multiple inputs registered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker that is assigned to input at a later point should not throw on ALT + DOWN_ARROW for input without datepicker': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker that is assigned to input at a later point should handle value changes when a datepicker is assigned after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with no inputs should not throw when accessing disabled property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with no inputs should throw when opened with no registered inputs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with startAt explicit startAt should override input value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with startView set to year should start at the specified view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with startView set to year should fire yearSelected when user selects calendar year in year view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with startView set to multiyear should start at the specified view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with startView set to multiyear should fire yearSelected when user selects calendar year in multiyear view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should update datepicker when model changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should update model when date is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input dirty after input event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input dirty after date selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should not mark dirty after model change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input touched on blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should reformat the input value on blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should not reformat invalid dates on blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input touched on calendar selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with formControl should update datepicker when formControl changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with formControl should update formControl when date is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with formControl should disable input when form control disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with formControl should disable toggle when form control disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set `aria-haspopup` on the toggle button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should open calendar when toggle clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if datepicker is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if input is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set the `button` type on the trigger to prevent form submissions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should remove the underlying SVG icon from the tab order': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should restore focus to the toggle after the calendar is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should re-render when the i18n labels change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should toggle the active state of the datepicker toggle': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with custom mat-datepicker-toggle icon should be able to override the mat-datepicker-toggle icon': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward the tabindex to the underlying button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should clear the tabindex from the mat-datepicker-toggle host': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward focus to the underlying button when the host is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should float the placeholder when an invalid value is entered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should pass the form field theme color to the overlay': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should prefer the datepicker color over the form field one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should use min and max dates specified by the input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is before min': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is after max': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals min': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals max': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value is between min and max': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with filter and validation should mark input invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with filter and validation should disable filtered calendar cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with change and input events should fire input and dateInput events when user types input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with change and input events should fire change and dateChange events when user commits typed input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with change and input events should fire dateChange and dateInput events when user selects calendar date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker with change and input events should not fire the dateInput event if the value has not changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule with ISO 8601 strings as input should coerce ISO strings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule with events should dispatch an event when a datepicker is opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule with events should dispatch an event when a datepicker is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker that opens on focus should not reopen if the browser fires the focus event asynchronously': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker directionality should pass along the directionality to the popup': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker directionality should update the popup direction if the directionality value changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with MatNativeDateModule datepicker directionality should pass along the directionality to the dialog in touch mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker with missing DateAdapter and MAT_DATE_FORMATS should throw when created': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker popup positioning should be below and to the right when there is plenty of space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker popup positioning should be above and to the right when there is no space below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker popup positioning should be below and to the left when there is no space on the right': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker popup positioning should be above and to the left when there is no space on the bottom': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker internationalization should have the correct input value even when inverted date format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker datepicker with custom header should instantiate a datepicker with a custom header': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker datepicker with custom header should find the standard header element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatDatepicker datepicker with custom header should find the custom element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should set the default values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should update the value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should not update when pressing the right mouse button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should update the value on a slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should set the value as min when sliding before the track': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should set the value as max when sliding past the track': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should update the track fill on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should update the track fill on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should add and remove the mat-slider-sliding class when sliding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should not change value without emitting a change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should reset active state upon blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should reset thumb gap when blurred on min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should have thumb gap when at min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should not have thumb gap when not at min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should have aria-orientation horizontal': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider standard slider should slide to the max value when the steps do not divide evenly into it': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should be disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should not change the value on mousedown when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should not change the value on slide when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should not emit change when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should not add the mat-slider-active class on mousedown when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should not add the mat-slider-sliding class on slide when disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should leave thumb gap': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider disabled slider should disable tabbing to the slider': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should set the default values from the attributes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should set the correct value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should set the correct value on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should snap the fill to the nearest value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should snap the fill to the nearest value on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should adjust fill and ticks on mouse enter when min changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max should adjust fill and ticks on mouse enter when max changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set value should set the default value from the attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set value should set the correct value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set value should set the correct value on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should set the correct step value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should snap the fill to a step on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should set the correct step value on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should snap the thumb and fill to a step on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should round the value inside the label based on the provided step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should not add decimals to the value if it is a whole number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should truncate long decimal values when using a decimal step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set step should truncate long decimal values when using a decimal step and the arrow keys': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with auto ticks should set the correct tick separation on mouse enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set tick interval should set the correct tick separation on mouse enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set tick interval should be able to reset the tick interval after it has been set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with thumb label should add the thumb label class to the slider container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with thumb label should update the thumb label text on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with thumb label should update the thumb label text on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with custom thumb label formatting should invoke the passed-in `displayWith` function with the value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with custom thumb label formatting should format the thumb label based on the passed-in `displayWith` function': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with value property binding should initialize based on bound value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with value property binding should update when bound value changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max and a value smaller than min should set the value smaller than the min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max and a value smaller than min should set the fill to the min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max and a value greater than max should set the value greater than the max value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with set min and max and a value greater than max should set the fill to the max value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with change handler should emit change on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with change handler should emit change on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with change handler should not emit multiple changes for same value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with change handler should dispatch events when changing back to previously emitted value after programmatically setting value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with input event should emit an input event while sliding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with input event should emit an input event when clicking': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should increment slider by 1 on up arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should increment slider by 1 on right arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should decrement slider by 1 on down arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should decrement slider by 1 on left arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should increment slider by 10 on page up pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should decrement slider by 10 on page down pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should set slider to max on end pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should set slider to min on home pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should take no action for presses of keys it doesn\'t care about': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider keyboard support should ignore events modifier keys': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert works in inverted mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert works in RTL languages': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert works in RTL languages in inverted mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should re-render slider with updated style upon directionality change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should increment inverted slider by 1 on right arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should decrement inverted slider by 1 on left arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should decrement RTL slider by 1 on right arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should increment RTL slider by 1 on left arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should decrement inverted RTL slider by 1 on right arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should increment inverted RTL slider by 1 on left arrow pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with direction and invert should hide last tick when inverted and at min value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider vertical slider updates value on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider vertical slider updates value on mousedown in inverted mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider vertical slider should update the track fill on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider vertical slider should update the track fill on mousedown in inverted mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider vertical slider should have aria-orientation vertical': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider tabindex should allow setting the tabIndex through binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider tabindex should detect the native tabindex attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with ngModel should update the model on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with ngModel should update the model on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with ngModel should update the model on keydown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with ngModel should be able to reset a slider by setting the model back to undefined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should not update the control when the value is updated': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should update the control on mousedown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should update the control on slide': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should update the value when the control is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should update the disabled state when control is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should update the disabled state when the control is enabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider as a custom form control should have the correct control state initially and after interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSlider slider with a two-way binding should sync the value binding in both directions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should default to the first step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should throw when a negative `selectedIndex` is assigned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should throw when an out-of-bounds `selectedIndex` is assigned': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should change selected index on header click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set the "tablist" role on stepper': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set aria-expanded of content correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should display the correct label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should go to next available step when the next button is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set the next stepper button type to "submit"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should go to previous available step when the previous button is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set the previous stepper button type to "button"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set the correct step position for animation': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should not set focus on header of selected step if header is not clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should focus next step header if focus is inside the stepper': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should only be able to return to a previous step if it is editable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set create icon if step is editable and completed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set done icon if step is not editable and is completed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should emit an event when the enter animation is done': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should set the correct aria-posinset and aria-setsize': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should adjust the index when removing a step before the current one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should not do anything when pressing the ENTER key with a modifier': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper should not do anything when pressing the SPACE key with a modifier': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper when attempting to set the selected step too early should not throw': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper basic stepper with i18n label change should re-render when the i18n labels change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper icon overrides should allow for the `edit` icon to be overridden': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper icon overrides should allow for the `done` icon to be overridden': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper icon overrides should allow for the `number` icon to be overridden with context': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper RTL should reverse animation in RTL mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should have true linear attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should not move to next step if current step is invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should not move to next step if current step is pending': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should be able to focus step header upon click if it is unable to be selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should be able to move to next step even when invalid if current step is optional': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should be able to reset the stepper to its initial state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should reset back to the first step when some of the steps are not editable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper should not clobber the `complete` binding when resetting': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper with a pre-defined selectedIndex should not throw': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper with no `stepControl` should not move to the next step if the current one is not completed ': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper with `stepControl` should have the `stepControl` take precedence when `completed` is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper vertical stepper should set the aria-orientation to "vertical"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper vertical stepper should support using the left/right arrows to move focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper vertical stepper should support using the up/down arrows to move focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper vertical stepper should reverse arrow key focus in RTL mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper horizontal stepper should set the aria-orientation to "horizontal"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper horizontal stepper should support using the left/right arrows to move focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper horizontal stepper should reverse arrow key focus in RTL mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper horizontal stepper should reverse arrow key focus when switching into RTL after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper with valid step must be visited if not optional': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper linear stepper with valid step can be skipped entirely if optional': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper aria labelling should set the aria-label attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper aria labelling should set the aria-labelledby attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper aria labelling should not be able to set both an aria-label and aria-labelledby': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper stepper with error state should show error state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper stepper with error state should respect a custom falsy hasError value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper stepper using Material UI Guideline logic should show done state when step is completed and its not the current step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatStepper stepper using Material UI Guideline logic should show edit state when step is editable and its the current step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chip Remove basic behavior should applies the `mat-chip-remove` CSS class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chip Remove basic behavior should emits (removed) on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatBasicChip adds the `mat-basic-chip` class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors adds the `mat-chip` class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors does not add the `mat-basic-chip` class': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors emits focus only once for multiple clicks': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors emits destroy on destruction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors allows color customization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors allows selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors allows removal': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should not prevent the default click action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should prevent the default click action when the chip is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should not dispatch `selectionChange` event when deselecting a non-selected chip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should not dispatch `selectionChange` event when selecting a selected chip': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should not dispatch `selectionChange` event when selecting a selected chip via user interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip basic behaviors should not dispatch `selectionChange` through setter if the value did not change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when selectable is true should selects/deselects the currently focused chip on SPACE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when selectable is true should have correct aria-selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when selectable is false SPACE ignores selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when selectable is false should not have the aria-selected attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when removable is true DELETE emits the (removed) event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when removable is true BACKSPACE emits the (removed) event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when removable is false DELETE does not emit the (removed) event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior when removable is false BACKSPACE does not emit the (removed) event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior should update the aria-label for disabled chips': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'Chips MatChip keyboard behavior should make disabled chips non-focusable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should be in month view with specified month active': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should toggle view when period clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should go to next and previous month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should go to previous and next year': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should go to previous and next multi-year range': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendarHeader standard calendar should go back to month view after selecting year and month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should update today\'s date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should be in month view with specified month active': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should select date in month view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should emit the selected month on cell clicked in year view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should emit the selected year on cell clicked in multiyear view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should re-render when the i18n labels have changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should set all buttons to be `type="button"`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar should complete the stateChanges stream': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body should initially set start date active': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body should make the calendar body focusable': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body should not move focus to the active cell on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body should move focus to the active cell when the view changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body year view should return to month view on enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body year view should return to month view on space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body multi-year view should go to year view on enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar standard calendar a11y calendar body multi-year view should go to year view on space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should clamp startAt value below min date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should clamp startAt value above max date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should not go back past min date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should not go forward past max date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the month view when the minDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the month view when the maxDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the year view when the minDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the year view when the maxDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the multi-year view when the minDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should re-render the multi-year view when the maxDate changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with min and max date should update the minDate in the child view if it changed after an interaction': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with date filter should disable and prevent selection of filtered dates': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with date filter a11y should not allow selection of disabled date in month view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatCalendar calendar with date filter a11y should allow entering month view at disabled month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should default to floating labels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should default to global floating label type': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not be treated as empty if type is date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should be treated as empty if type is date in Safari Desktop or IE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should treat text input type as empty at init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should treat password input type as empty at init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should treat number input type as empty at init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not be empty after input entered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should update the placeholder when input entered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not be empty when the value set before view init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should add id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should add aria-owns to the label for the associated control': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should add aria-required reflecting the required state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not overwrite existing id': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates there\'s only one hint label per side': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates there\'s only one hint label per side (attribute)': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates there\'s only one placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates that matInput child is present': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates that matInput child is present after initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms validates the type': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports hint labels attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets an id on hint labels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports hint labels elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets an id on the hint element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports placeholder attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports placeholder element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports placeholder required star': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should hide the required star if input is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should hide the required star from screen readers': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms hide placeholder required star when set to hide the required marker': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports the disabled attribute as binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports the disabled attribute as binding for select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should add a class to the form field if it has a native select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports the required attribute as binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports the required attribute as binding for select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports the type attribute as binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports textarea': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms supports select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets the aria-describedby when a hintLabel is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets the aria-describedby to the id of the mat-hint': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets the aria-describedby with multiple mat-hint instances': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms sets the aria-describedby when a hintLabel is set, in addition to a mat-hint': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should float when floatLabel is set to default and text is entered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should always float the label when floatLabel is set to true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should float labels when select has value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not float the label if the selectedIndex is negative': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not float labels when select has no value, no option label, no option innerHtml': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should floating labels when select has no value but has option label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should floating labels when select has no value but has option innerHTML': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not throw if a native select does not have options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should never float the label when floatLabel is set to false': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should be able to toggle the floating label programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not have prefix and suffix elements when none are specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should add prefix and suffix elements when specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should update empty class when value changes programmatically and OnPush': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should set the focused class when the input is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should remove the focused class if the input becomes disabled while focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should be able to animate the label up and lock it in position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not highlight when focusing a readonly input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should reset the highlight when a readonly input is blurred': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should only show the native placeholder, when there is a label, on focus': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should always show the native placeholder when floatLabel is set to "always"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not add the `placeholder` attribute if there is no placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not show the native placeholder when floatLabel is set to "never"': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should not add the native select class if the control is not a native select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput without forms should use the native input value when determining whether the element is empty with a custom accessor': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should not show any errors if the user has not interacted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should display an error message when the input is touched and invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should display an error message when the parent form is submitted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should display an error message when the parent form group is submitted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should hide the errors and show the hints once the input becomes valid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should not hide the hint if there are no error messages': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages should set the proper role on the error messages': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms error messages sets the aria-describedby to reference errors when in error state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms custom error behavior should display an error message when a custom error matcher returns true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms custom error behavior should display an error message when global error matcher returns true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms custom error behavior should display an error message when using ShowOnDirtyErrorStateMatcher': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms should update the value when using FormControl.setValue': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms should display disabled styles when using FormControl.disable()': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms should not treat the number 0 as empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with forms should update when the form field value is patched without emitting': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance legacy appearance should promote placeholder to label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance non-legacy appearances should not promote placeholder to label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance legacy appearance should respect float never': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance non-legacy appearances should not respect float never': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should recalculate gaps when switching to outline appearance after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should not set an outline gap if the label is empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should calculate the gaps if the default appearance is provided through DI': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should update the outline gap when the prefix/suffix is added or removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should calculate the outline gaps if the element starts off invisible': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with appearance should update the outline gap if the direction changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatFormField default options should be legacy appearance if no default options provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatFormField default options should be legacy appearance if empty default options provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatFormField default options should be custom default appearance if custom appearance specified in default options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with textarea autosize should not calculate wrong content height due to long placeholders': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with textarea autosize should work in a tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatInput with textarea autosize should work in a step': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get year': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get month': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get day of week': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get same day of week in a locale with a different first day of the week': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get long month names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get narrow month names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get month names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get date names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get date names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get long day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get short day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get narrow day of week names': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get day of week names in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get year name': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get year name in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get first day of week': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get first day of week in a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should create Moment date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should not create Moment date with month over/under-flow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should not create Moment date with date over/under-flow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should create Moment date with low year number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should not create Moment date in utc format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should get today\'s date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse string according to given format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse number': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse Date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse Moment date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse empty string as null': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should parse invalid value as invalid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should format date according to given format': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should format with a different locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should throw when attempting to format invalid date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should add years': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should respect leap years when adding years': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should add months': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should respect month length differences when adding months': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should add days': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should clone': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should compare dates': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should clamp date at lower bound': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should clamp date at upper bound': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should clamp date already within bounds': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should count today as a valid date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should count an invalid date as an invalid date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should count a string as not a date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should count a Date as not a date instance': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should create valid dates from valid ISO strings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should clone the date when deserializing a Moment date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should deserialize dates with the correct locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter setLocale should not modify global moment locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter returned Moments should have correct locale': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should not change locale of Moments passed as params': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter should create invalid date': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with MAT_DATE_LOCALE override should take the default locale id from the MAT_DATE_LOCALE injection token': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with LOCALE_ID override should take the default locale id from the LOCALE_ID injection token': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with MAT_MOMENT_DATE_ADAPTER_OPTIONS override use UTC should create Moment date in UTC': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with MAT_MOMENT_DATE_ADAPTER_OPTIONS override use UTC should create today in UTC': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with MAT_MOMENT_DATE_ADAPTER_OPTIONS override use UTC should parse dates to UTC': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MomentDateAdapter with MAT_MOMENT_DATE_ADAPTER_OPTIONS override use UTC should return UTC date when deserializing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should open the panel when the input is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not open the panel on focus if the input is readonly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not open using the arrow keys when the input is readonly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should open the panel programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should show the panel when the first open is after the initial zone stabilization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should close the panel when the user clicks away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should close the panel when the user taps away on a touch device': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should close the panel when an option is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should close the panel when a newly created option is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should close the panel programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not throw when attempting to close the panel of a destroyed autocomplete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should hide the panel when the options list is empty': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should keep the label floating until the panel closes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not open the panel when the `input` event is invoked on a non-focused input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not mess with label placement if set to never': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not mess with label placement if set to always': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should toggle the visibility when typing and closing the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should animate the label when the input is focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should provide the open state of the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should emit an event when the panel is opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not emit the `opened` event when no options are being shown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not emit the opened event multiple times while typing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should emit an event when the panel is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not emit the `closed` event when no options were shown': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should not be able to open the panel if the autocomplete is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel toggling should continue to update the model if the autocomplete is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should have the correct text direction in RTL': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should update the panel direction if it changes for the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should be able to set a custom value for the `autocomplete` attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should not throw when typing in an element with a null and disabled autocomplete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should update control value as user types with input value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should update control value when autofilling': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should update control value when option is selected with option value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should update the control back to a string if user types after an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should fill the text field with display value when an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should fill the text field with value if displayWith is not set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should fill the text field correctly if value is set to obj programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should clear the text field if value is reset programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should disable input in view when disabled programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should mark the autocomplete control as dirty as user types': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should mark the autocomplete control as dirty when an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should not mark the control dirty when the value is set programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should mark the autocomplete control as touched on blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete forms integration should disable the input when used with a value accessor and without `matInput`': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should not focus the option when DOWN key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should not close the panel when DOWN key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should set the active item to the first option when DOWN key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should set the active item to the last option when UP key is pressed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should set the active item properly after filtering': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should fill the text field when an option is selected with ENTER': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should prevent the default enter key action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should not prevent the default enter action for a closed panel after a user action': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should fill the text field, not select an option, when SPACE is entered': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should mark the control dirty when selecting an option from the keyboard': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should open the panel again when typing after making a selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should not open the panel if the `input` event was dispatched with changing the value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should scroll to active options below the fold': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should scroll to active options on UP arrow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should not scroll to active options that are fully in the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should scroll to active options that are above the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should close the panel when pressing escape': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should prevent the default action when pressing escape': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should close the panel when pressing ALT + UP_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should close the panel when tabbing away from a trigger without results': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should reset the active option when closing with the escape key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete keyboard events should reset the active option when closing by selecting with enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete option groups should scroll to active options below the fold': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete option groups should scroll to active options on UP arrow': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete option groups should scroll to active options that are above the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set role of input to combobox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set role of autocomplete panel to listbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set aria-autocomplete to list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set aria-activedescendant based on the active option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set aria-expanded based on whether the panel is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set aria-expanded properly when the panel is hidden': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should set aria-owns based on the attached autocomplete': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should not set aria-owns while the autocomplete is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should restore focus to the input when clicking to select a value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete aria should remove autocomplete-specific aria attributes when autocomplete is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should use below positioning by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should reposition the panel on scroll': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should fall back to above position if panel cannot fit below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should allow the panel to expand when the number of results increases': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should align panel properly when filtering in "above" position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should fall back to above position when requested if options are added while the panel is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Fallback positions should not throw if a panel reposition is requested while the panel is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should deselect any other selected option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should call deselect only on the previous selected option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should be able to preselect the first option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should remove aria-activedescendant when panel is closed with autoActiveFirstOption': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should be able to configure preselecting the first option globally': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should handle `optionSelections` being accessed too early': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete Option selection should reposition the panel when the amount of options changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel closing should emit panel close event when clicking away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel closing should emit panel close event when tabbing out': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel closing should not emit when tabbing away from a closed panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel closing should emit panel close event when selecting an option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete panel closing should close the panel when pressing escape': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete without matInput should not throw when clicking outside': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should allow basic use without any forms directives': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should display an empty input when the value is undefined with ngModel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should display the number when the selected option is the number zero': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should work when input is wrapped in ngIf': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should filter properly with ngIf after setting the active item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should throw if the user attempts to open the panel too early': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should not throw on init, even if the panel is not defined': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should hide the label with a preselected form control value and a disabled floating label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should transfer the mat-autocomplete classes to the panel element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should reset correctly when closed programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete misc should handle autocomplete being attached to number inputs': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should have correct width when opened': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should update the width while the panel is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should not reopen a closed autocomplete when returning to a blurred tab': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should update the panel width if the window is resized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should have panel width match host width by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should have panel width set to string value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should have panel width set to number value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should show the panel when the options are initialized later within a component with OnPush change detection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should emit an event when an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should emit an event when a newly-added option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should be able to set a custom panel connection element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatAutocomplete should be able to re-type the same value when it is reset while open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set the role of the select to listbox': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set the aria label of the select to the placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should support setting a custom aria-label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not set an aria-label if aria-labelledby is specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not have aria-labelledby in the DOM if it`s not specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set the tabindex of the select to 0 by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should be able to override the tabindex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-required for required selects': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set the mat-select-required class for required selects': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-invalid for selects that are invalid and touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-disabled for disabled selects': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set the tabindex of the select to -1 if disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set `aria-labelledby` to form field label if there is no placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not set `aria-labelledby` if there is a placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not set `aria-labelledby` if there is no form field label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should select options via the UP/DOWN arrow keys on a closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should select first/last options via the HOME/END keys on a closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should resume focus from selected item after selecting via click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should select options via LEFT/RIGHT arrow keys on a closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should announce changes via the keyboard on a closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should open a single-selection select using ALT + DOWN_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should open a single-selection select using ALT + UP_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should close when pressing ALT + DOWN_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should close when pressing ALT + UP_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should be able to select options by typing on a closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should open the panel when pressing a vertical arrow key on a closed multiple select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should open the panel when pressing a horizontal arrow key on closed multiple select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should do nothing when typing on a closed multi-select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should do nothing if the key manager did not change the active item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should continue from the selected option when the value is set programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not shift focus when the selected options are updated programmatically in a multi select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not cycle through the options if the control is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not wrap selection after reaching the end of the options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not open a multiple select when tabbing through': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should toggle the next option when pressing shift + DOWN_ARROW on a multi-select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should toggle the previous option when pressing shift + UP_ARROW on a multi-select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should prevent the default action when pressing space': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should prevent the default action when pressing enter': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not prevent the default actions on selection keys when pressing a modifier': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should consider the selection a result of a user action when closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should be able to focus the select trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-hidden on the trigger element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set `aria-multiselectable` to true on multi-select instances': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-multiselectable false on single-selection instances': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-activedescendant only while the panel is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should set aria-activedescendant based on the focused option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should not change the aria-activedescendant using the horizontal arrow keys': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for select should restore focus to the trigger after selecting an option in multi-select mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for options should set the role of mat-option to option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for options should set aria-selected on each option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for options should set the tabindex of each option according to disabled state': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for options should set aria-disabled for disabled options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for option groups should set the appropriate role': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for option groups should set the `aria-labelledby` attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core accessibility for option groups should set the `aria-disabled` attribute if the group is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should not throw when attempting to open too early': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should open the panel when trigger is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should close the panel when an item is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should close the panel when a click occurs outside the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should set the width of the overlay based on the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should not attempt to open a select that does not have any options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should close the panel when tabbing out': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should restore focus to the host before tabbing away': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should close when tabbing out from inside the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should focus the first option when pressing HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should focus the last option when pressing END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should be able to set extra classes on the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should update disableRipple properly on each option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should not show ripples if they were disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should be able to render options inside groups with an ng-container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core overlay panel should not consider itself as blurred if the trigger loses focus while the panel is still open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should not float label if no option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should focus the first option if no option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should select an option when it is clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should be able to select an option using the MatOption API': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should deselect other options when one is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should deselect other options when one is programmatically selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should remove selection if option has been removed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should display the selected option in the trigger': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should focus the selected option if an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should select an option that was added after initialization': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should update the trigger when the selected option label is changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should not select disabled options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should not select options inside a disabled group': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should not throw if triggerValue accessed with no selected value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should emit to `optionSelectionChanges` when an option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core selection logic should handle accessing `optionSelectionChanges` before the options are initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should take an initial view value with reactive forms': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should set the view value from the form': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should update the form value when the view changes': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should clear the selection when a nonexistent option value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should clear the selection when the control is reset': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should set the control to touched when the select is blurred': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should set the control to touched when the panel is closed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should not set touched when a disabled select is touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should set the control to dirty when the select value changes in DOM': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should not set the control to dirty when the value changes programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core forms integration should set an asterisk after the label if control is required': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core disabled behavior should disable itself when control is disabled programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core animations should float the label when the panel is open and unselected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should not scroll to options that are completely in the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should scroll down to the active option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should scroll up to the active option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should skip option group labels': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should scroll top the top when pressing HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should scroll to the bottom of the panel when pressing END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect core keyboard scrolling should scroll to the active option when typing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when initialized without options should select the proper option when option list is initialized later': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with a selectionChange event handler should emit an event when the selected option has changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with a selectionChange event handler should not emit multiple change events for the same option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with a selectionChange event handler should only emit one event when pressing arrow keys on closed select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel should disable itself when control is disabled using the property': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngIf should handle nesting in an ngIf': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple mat-select elements in one view should set aria-owns properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple mat-select elements in one view should remove aria-owns when the options are not visible': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple mat-select elements in one view should set the option id properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with floatLabel should be able to disable the floating label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with floatLabel should be able to always float the label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with floatLabel should default to global floating label type': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with a sibling component that throws an error should not crash the browser when a sibling throws an error on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with tabindex should be able to set the tabindex via the native attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect change events should complete the stateChanges stream on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when initially hidden should set the width of the overlay if the element was hidden initially': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with no placeholder should set the width of the overlay if there is no placeholder': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with theming should transfer the theme to the select panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when invalid inside a form should not throw SelectionModel errors in addition to ngModel errors': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by value should have a selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by value should update when making a new selection': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by reference should use the comparator': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by reference should initialize with no selection despite having a value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by reference should not update the selection if value is copied on change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with ngModel using compareWith comparing by reference should throw an error when using a non-function comparator': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when the select\'s value is accessed on initialization should not throw when trying to access the selected value on init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should not set the invalid class on a clean select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should appear as invalid if it becomes touched': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should not have the invalid class when the select becomes valid': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should appear as invalid when the parent form group is submitted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should render the error messages when the parent form is submitted': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should override error matching behavior via injection token': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect inside of a form group should notify that the state changed when the options have changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with custom error behavior should be able to override the error matching behavior via an @Input': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with preselected array values should be able to preselect an array value in single-selection mode': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with custom value accessor should support use inside a custom value accessor': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with a falsy value should be able to programmatically select a falsy option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with OnPush should set the trigger text based on the value when initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with OnPush should update the trigger based on the value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with custom trigger should allow the user to customize the label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should reset when an option with an undefined value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should reset when an option with a null value is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should reset when a blank option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should not mark the reset option as selected ': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should not reset when any other falsy option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect when reseting the value by setting null or undefined should not consider the reset values as selected when resetting the form control': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should set the value when options are clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should mark options as selected when the value is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should reset the label when a null value is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should reflect the preselected value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should be able to select multiple values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should restore focus to the host element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should not restore focus to the host element when clicking outside': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect without Angular forms should update the data binding before emitting the change event': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with option centering disabled should not align the active option with the trigger if centering is disabled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning ample space to open should align the first option with trigger text if no option is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning ample space to open should align a selected option too high to be centered with the trigger text': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning ample space to open should align a selected option in the middle with the trigger text': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning ample space to open should align a selected option at the scroll max with the trigger text': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning ample space to open should account for preceding label groups when aligning the option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open vertically should adjust position of centered option if there is little space above': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open vertically should adjust position of centered option if there is little space below': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open vertically should fall back to "above" positioning if scroll adjustment will not help': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open vertically should fall back to "below" positioning if scroll adjustment won\'t help': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the left in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the left in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the right in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the right in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning limited space to open horizontally should keep the position within the viewport on repeat openings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning when scrolled should align the first option properly when scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning when scrolled should align a centered option properly when scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning when scrolled should align a centered option properly when scrolling while the panel is open': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning when scrolled should fall back to "above" positioning properly when scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning when scrolled should fall back to "below" positioning properly when scrolled': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning should align the trigger and the selected option on the x-axis in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning should align the trigger and the selected option on the x-axis in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning in multi select mode should adjust for the checkbox in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning in multi select mode should adjust for the checkbox in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning with groups should adjust for the group padding in ltr': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning with groups should adjust for the group padding in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning with groups should not adjust if all options are within a group, except the selected one': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect positioning x-axis positioning with groups should align the first option to the trigger, if nothing is selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should be able to select multiple values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should be able to toggle an option on and off': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should update the label': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should be able to set the selected value by taking an array': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should override the previously-selected value when setting an array': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should not close the panel when clicking on options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should sort the selected options based on their order in the panel': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should sort the selected options in reverse in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should be able to customize the value sorting logic': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should sort the values that get set via the model based on the panel order': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should reverse sort the values, that get set via the model in rtl': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should throw an exception when trying to set a non-array value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should throw an exception when trying to change multiple mode after init': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should pass the `multiple` value to all of the option instances': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should update the active item index on click': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should be to select an option with a `null` value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should select all options when pressing ctrl + a': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should skip disabled options when using ctrl + a': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should select all options when pressing ctrl + a when some options are selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelect with multiple selection should deselect all options with ctrl + a if all options are selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator with the default internationalization provider should show the right range text': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator with the default internationalization provider should show right aria-labels for select and buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator with the default internationalization provider should re-render when the i18n labels change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when navigating with the next and previous buttons should be able to go to the next page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when navigating with the next and previous buttons should be able to go to the previous page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should be able to show the first/last buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should mark itself as initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should not allow a negative pageSize': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should not allow a negative pageIndex': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should be able to set the color of the form field': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when showing the first and last button should show right aria-labels for first/last buttons': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when showing the first and last button should be able to go to the last page via the last page button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when showing the first and last button should be able to go to the first page via the first page button': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when showing the first and last button should disable navigating to the next page if at last page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator when showing the first and last button should disable navigating to the previous page if at first page': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should mark for check when inputs are changed directly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should default the page size options to the page size if no options provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should default the page size to the first page size option if not provided': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should show a sorted list of page size options including the current page size': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should be able to change the page size while keeping the first item present': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should keep track of the right number of pages': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should show a select only if there are multiple options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should handle the number inputs being passed in as strings': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should be able to hide the page size select': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatPaginator should be able to disable all the controls in the paginator via the binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with basic data source should be able to create a table with the right content and without when row': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with basic data source should create a table with special when row': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with basic data source should create a table with multiTemplateDataRows true': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable should be able to render a table correctly with native elements': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable should render with MatTableDataSource and sort': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable should render with MatTableDataSource and pagination': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable should apply custom sticky CSS class to sticky cells': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable should not throw when a row definition is on an ng-container': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should create table and display data source contents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter changing data should update the table contents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should be able to filter the table contents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should not match concatenated words': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should be able to sort the table contents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort an empty string': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort undefined values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should sort zero correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should be able to page the table contents': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatTable with MatTableDataSource and sort/pagination/filter should sort strings with numbers larger than MAX_SAFE_INTEGER correctly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should not apply any additional class to a list without lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should apply mat-2-line class to lists with two lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should apply mat-3-line class to lists with three lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should apply mat-multi-line class to lists with more than 3 lines': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should apply a class to list items with avatars': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should not clear custom classes provided by user': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should update classes if number of lines change': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should add aria roles properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should not show ripples for non-nav lists': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should allow disabling ripples for specific nav-list items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should create an action list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should enable ripples for action lists by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should allow disabling ripples for specific action list items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should set default type attribute to button for action list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should not change type attribute if it is already specified': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should allow disabling ripples for the whole nav-list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatList should allow disabling ripples for the entire action list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to set a value on a list option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not emit a selectionChange event if an option changed programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should emit a selectionChange event if an option got clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to dispatch one selected item': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to dispatch multiple selected items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to deselect an option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not allow selection of disabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to un-disable disabled items': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to use keyboard select with SPACE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to select an item using ENTER': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not be able to toggle an item when pressing a modifier key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not be able to toggle a disabled option using SPACE': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should restore focus if active option is destroyed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not attempt to focus the next option when the destroyed option was not focused': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should focus previous item when press UP ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should focus and toggle the next item when pressing SHIFT + UP_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should focus next item when press DOWN ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should focus and toggle the next item when pressing SHIFT + DOWN_ARROW': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to focus the first item when pressing HOME': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not change focus when pressing HOME with a modifier key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should focus the last item when pressing END': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should not change focus when pressing END with a modifier key': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should select all items using ctrl + a': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should select all items using ctrl + a if some items are selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should deselect all with ctrl + a if all options are selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to jump focus down to an item by typing': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to select all options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should be able to deselect all options': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should update the list value when an item is selected programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should update the item selected state when it is selected via the model': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option should set aria-multiselectable to true on the selection list element': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list option selected should set its initial selected state in the selectedOptions': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with tabindex should properly handle native tabindex attribute': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with tabindex should support changing the tabIndex through binding': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with option disabled should disable ripples for disabled option': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with option disabled should apply the "mat-list-item-disabled" class properly': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list disabled should not allow selection on disabled selection-list': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list disabled should update state of options if list state has changed': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with checkbox position after should be able to customize checkbox position': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list item elements should add a class to reflect that it has an avatar': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList without forms with list item elements should add a class to reflect that it has an icon': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should update the model if an option got selected programmatically': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should update the model if an option got clicked': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should update the options if a model value is set': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should set the selection-list to touched on blur': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should be pristine by default': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should remove a selected option from the value on destroy': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should update the model if an option got selected via the model': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should not dispatch the model change event if nothing changed using selectAll': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and ngModel should be able to programmatically set an array with duplicate values': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and formControl should be able to disable options from the control': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and formControl should be able to update the disabled property after form control disabling': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and formControl should be able to set the value through the form control': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms and formControl should mark options as selected when the value is set before they are initialized': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms preselected values should add preselected options to the model value': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms preselected values should handle preselected option both through the model and the view': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms preselected values should show the item as selected when preselected inside OnPush parent': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
  'MatSelectionList with forms with custom compare function should use a custom comparator to determine which options are selected': {
    'error': 'TypeError: Cannot read property \'configurable\' of undefined',
    'notes': 'Unknown',
  },
};

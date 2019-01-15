/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Blacklist of unit tests from angular/material2 with ivy that are skipped when running on
 * angular/angular. As bugs are resolved, items should be removed from this blacklist.
 *
 * The `notes` section should be used to keep track of specific issues associated with the failures.
 */

// clang-format off
// tslint:disable

window.testBlacklist = {
  "Portals CdkPortalOutlet should load a template into the portal": {
    "error": "TypeError: Cannot read property 'createEmbeddedView' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should project template context bindings in the portal": {
    "error": "TypeError: Cannot read property 'createEmbeddedView' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should set the `portal` when attaching a component portal programmatically": {
    "error": "TypeError: Cannot read property 'attachComponentPortal' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should not clear programmatically-attached portals on init": {
    "error": "TypeError: Cannot read property 'attach' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should be considered attached when attaching using `attach`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should be considered attached when attaching using `attachComponentPortal`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should be considered attached when attaching using `attachTemplatePortal`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Portals CdkPortalOutlet should use the `ComponentFactoryResolver` from the portal, if available": {
    "error": "TypeError: Cannot read property 'attachComponentPortal' of undefined",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a component portal": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a component portal with a given injector": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a template portal with a binding": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should change the attached portal": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a component portal without a ViewContainerRef": {
    "error": "Error: Expected '<pizza-msg><p>Pizza</p><p>Chocolate</p></pizza-msg>' to be '', 'Expected the DomPortalOutlet to be empty after detach'.",
    "notes": "Unknown"
  },
  "AutofillMonitor should add monitored class and listener upon monitoring": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should not add multiple listeners to the same element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should remove monitored class and listener upon stop monitoring": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should stop monitoring all monitored elements upon destroy": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should emit and add filled class upon start animation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should emit and remove filled class upon end animation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should cleanup filled class if monitoring stopped in autofilled state": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should complete the stream when monitoring is stopped": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should emit on stream inside the NgZone": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AutofillMonitor should not emit on init if input is unfilled": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to create a message element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should not register empty strings": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should not register non-string values": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "AriaDescriber should not throw when trying to remove non-string value": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "AriaDescriber should de-dupe a message registered multiple times": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to register multiple messages": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to unregister messages": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to unregister messages while having others registered": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to append to an existing list of aria describedby": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should be able to handle multiple regisitrations of the same message to an element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "AriaDescriber should clear any pre-existing containers": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render initial state": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the data length": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the viewport size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered range": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content offset": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the scroll offset": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should measure range size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set a class based on the orientation": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set the vertical class if an invalid orientation is set": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set rendered range": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to top of content": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to bottom of content": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should output scrolled index": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls down": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls up": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the end when scrolled to the top": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start and end when scrolled to the middle": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start when scrolled to the bottom": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic buffer size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item array": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls right in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls left in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with an Observable": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with a DataSource": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy value by default": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy index when specified": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should recycle views when template cache is large enough to accommodate": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not recycle views when template cache is full": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render up to maxBufferPx when buffer dips below minBufferPx": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should register and degregister with ScrollDispatcher": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should emit on viewChange inside the Angular zone": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not throw when disposing of a view that will not fit in the cache": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should initially be scrolled all the way right and showing the first item in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should scroll through items as user scrolls to the left in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should interpret scrollToOffset amount as an offset from the right in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should scroll to the correct index in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should emit the scrolled to index in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should set total content size": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should set total content size in horizontal mode": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with no VirtualScrollStrategy should fail on construction": {
    "error": "Error: Expected function to throw an exception with message 'Error: cdk-virtual-scroll-viewport requires the \"itemSize\" property to be set.', but it threw an exception with message 'StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render initial state for uniform items": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render extra content if first item is smaller than average": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx": {
    "error": "Error: StaticInjectorError(Platform: core)[CdkVirtualScrollViewport]: ",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with a connected data source": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with a rendered header with the right number of header cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with rendered rows with right number of row cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with column class names provided to header and data row cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with the right accessibility roles": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should disconnect the data source when table is destroyed": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should re-render the rows when the data changes": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should clear the `mostRecentCellOutlet` on destroy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data is heterogeneous": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data contains multiple occurrences of the same object instance": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should clear the row view containers on destroy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should match the right table content with dynamic data": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should be able to dynamically change the columns for header and rows": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should render no rows when the data is null": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to render multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable should be able to render and change multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with different data inputs other than data source should render with data array input": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with different data inputs other than data source should render with data stream input": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with different data inputs other than data source should throw an error if the data source is not valid": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable missing row defs should be able to render without a header row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable missing row defs should be able to render without a data row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable missing row defs should be able to render without a footer row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should render correctly when using native HTML tags": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should render cells even if row data is falsy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to apply class-friendly css class names for the column cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should not clobber an existing table role": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should throw an error if two column definitions have the same name": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should throw an error if a column definition is requested but not defined": {
    "error": "Error: Expected function to throw an exception with message 'Could not find column with id \"column_a\".', but it threw an exception with message 'Cannot read property 'viewContainer' of undefined'.",
    "notes": "Unknown"
  },
  "CdkTable should throw an error if the row definitions are missing": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should not throw an error if columns are undefined on initialization": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to dynamically add/remove column definitions": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to register column, row, and header row definitions outside content": {
    "error": "TypeError: Cannot read property 'addColumnDef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate should be able to display different row templates based on the row data": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate should error if there is row data that does not have a matching row template": {
    "error": "Error: Expected function to throw an Error.",
    "notes": "Unknown"
  },
  "CdkTable using when predicate should fail when multiple rows match data without multiTemplateDataRows": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate with multiTemplateDataRows should be able to render multiple rows per data object": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies when data contains multiple instances of the same object instance": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick headers": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick footers": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick left columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick right columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should reverse directions for sticky columns in rtl": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick combination of sticky header, footer, and columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick headers": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick footers": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick tfoot when all rows are stuck": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick left columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick right columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick combination of sticky header, footer, and columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should add/remove/move rows with reference-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references without property-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references with property-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references with index-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should change row implicit data even when trackBy finds no changes": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should match the right table content with dynamic data source": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to apply classes to rows based on their context": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkTable should be able to apply classes to cells based on their row context": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "CdkAccordion should not register nested items to the same accordion": {
    "error": "TypeError: Cannot read property 'accordion' of undefined",
    "notes": "Unknown"
  },
  "ScrollDispatcher Basic usage should not register the same scrollable twice": {
    "error": "Error: Expected spy scroll spy not to have been called.",
    "notes": "Unknown"
  },
  "ScrollDispatcher Nested scrollables should be able to identify the containing scrollables of an element": {
    "error": "Error: Expected $.length = 4 to equal 2.",
    "notes": "Unknown"
  },
  "ScrollDispatcher Nested scrollables should emit when one of the ancestor scrollable containers is scrolled": {
    "error": "Error: Expected spy scroll spy to have been called once. It was called 2 times.",
    "notes": "Unknown"
  },
  "ScrollDispatcher lazy subscription should remove global listeners on unsubscribe, despite any other live scrollables": {
    "error": "Error: Expected 8 to be 4, 'Expected multiple scrollables'.",
    "notes": "Unknown"
  },
  "CdkDrag standalone draggable should enable native drag interactions when there is a drag handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should not be able to drag the entire element if it has a handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should be able to drag an element using its handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should not be able to drag the element if the handle is disabled": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should not be able to drag using the handle if the element is disabled": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should be able to use a handle that was added after init": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should be able to use more than one handle to drag the element": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should be able to drag with a handle that is not a direct descendant": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should disable the tap highlight while dragging via the handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag draggable with a handle should preserve any existing `webkitTapHighlightColor`": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should dispatch the `dropped` event when an item has been dropped": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should expose whether an item was dropped over a container": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should dispatch the `sorted` event as an item is being sorted": {
    "error": "TypeError: Cannot read property 'args' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not move items in a vertical list if the pointer is too far away": {
    "error": "Error: Expected $.previousIndex = -1 to equal 0.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not move the original element from its initial DOM position": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should dispatch the `dropped` event in a horizontal drop zone": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should dispatch the correct `dropped` event in RTL horizontal drop zone": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not move items in a horizontal list if pointer is too far away": {
    "error": "Error: Expected $.previousIndex = -1 to equal 0.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should remove the preview if its `transitionend` event timed out": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should emit the released event as soon as the item is released": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should reset immediately when failed drag happens after a successful one": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not wait for transition that are not on the `transform` property": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should pick out the `transform` duration if multiple properties are being transitioned": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted down": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted down on a scrolled page": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted up": {
    "error": "Error: Expected 3 to be 2.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted up on a scrolled page": {
    "error": "Error: Expected 3 to be 2.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted to the right": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should move the placeholder as an item is being sorted to the left": {
    "error": "Error: Expected 3 to be 2.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, if an element skips multiple positions when sorting vertically": {
    "error": "Error: Expected $[0] = 'Zero' to equal 'One'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, when swapping down with a taller element": {
    "error": "Error: Expected '' to be 'translate3d(0px, 25px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, when swapping up with a taller element": {
    "error": "Error: Expected '' to be 'translate3d(0px, -25px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out elements correctly, when swapping an item with margin": {
    "error": "Error: Expected '' to be 'translate3d(0px, 37px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, if an element skips multiple positions when sorting horizontally": {
    "error": "Error: Expected $[0] = 'Zero' to equal 'One'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, when swapping to the right with a wider element": {
    "error": "Error: Expected '' to be 'translate3d(75px, 0px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out the elements correctly, when swapping left with a wider element": {
    "error": "Error: Expected '' to be 'translate3d(-75px, 0px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lay out elements correctly, when horizontally swapping an item with margin": {
    "error": "Error: Expected '' to be 'translate3d(87px, 0px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not swap position for tiny pointer movements": {
    "error": "Error: Expected $[0] = 'Zero' to equal 'One'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should swap position for pointer movements in the opposite direction": {
    "error": "Error: Expected $[0] = 'Zero' to equal 'One'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should be able to customize the preview element": {
    "error": "Error: Expected cdk-drag cdk-drag-preview to contain 'custom-preview'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should position custom previews next to the pointer": {
    "error": "Error: Expected 'translate3d(8px, 3533px, 0px)' to be 'translate3d(50px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lock position inside a drop container along the x axis": {
    "error": "Error: Expected 'translate3d(58px, 3533px, 0px)' to be 'translate3d(100px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lock position inside a drop container along the y axis": {
    "error": "Error: Expected 'translate3d(8px, 3583px, 0px)' to be 'translate3d(50px, 100px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should inherit the position locking from the drop container": {
    "error": "Error: Expected 'translate3d(58px, 3533px, 0px)' to be 'translate3d(100px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should be able to customize the placeholder": {
    "error": "Error: Expected cdk-drag cdk-drag-placeholder to contain 'custom-placeholder'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should clear the `transform` value from siblings when item is dropped`": {
    "error": "Error: Expected '' to be truthy.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not move the item if the group is disabled": {
    "error": "Error: Expected $.length = 0 to equal 4.",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should dispatch the `dropped` event when an item has been dropped into a new container": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to move the element over a new container and return it": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to move the element over a new container and return it to the initial one, even if it no longer matches the enterPredicate": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should transfer the DOM element from one drop zone to another": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should not be able to transfer an item into a container that is not in `connectedTo`": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should not be able to transfer an item that does not match the `enterPredicate`": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should call the `enterPredicate` with the item and the container it is entering": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to start dragging after an item has been transferred": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to return the last item inside its initial container": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to connect two drop zones by id": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to connect two drop zones using the drop list group": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to pass a single id to `connectedTo`": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should return DOM element to its initial container after it is dropped, in a container with one draggable item": {
    "error": "Error: Expected $.container.element.nativeElement = <div cdkdroplist=\"\" class=\"cdk-drop-list\" ng-reflect-connected-to=\"[object Object]\" id=\"cdk-drop-list-86\">...</div> to equal <div cdkdroplist=\"\" class=\"cdk-drop-list\" ng-reflect-connected-to=\"[object Object]\" id=\"cdk-drop-list-87\">...</div>.",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should be able to return an element to its initial container in the same sequence, even if it is not connected to the current container": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should not be able to drop an element into a container that is under another element": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should set a class when a container can receive an item": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a connected drop container should toggle the `receiving` class when the item enters a new list": {
    "error": "TypeError: Cannot read property 'element' of undefined",
    "notes": "Unknown"
  },
  "CdkTree should clear out the `mostRecentTreeNode` on destroy": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "CdkTree flat tree should initialize with a connected data source": {
    "error": "TypeError: Cannot read property 'dataSource' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree with array data source with the right data": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "CdkTree flat tree with trackBy should add/remove/move nodes with reference-based trackBy": {
    "error": "TypeError: Cannot read property 'getAttribute' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree with trackBy should add/remove/move nodes with property-based trackBy": {
    "error": "TypeError: Cannot read property 'getAttribute' of undefined",
    "notes": "Unknown"
  },
  "CdkTree flat tree with trackBy should add/remove/move nodes with index-based trackBy": {
    "error": "TypeError: Cannot read property 'getAttribute' of undefined",
    "notes": "Unknown"
  },
  "CdkTree nested tree should initialize with a connected data source": {
    "error": "TypeError: Cannot read property 'dataSource' of undefined",
    "notes": "Unknown"
  },
  "CdkTree nested tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "CdkTree nested tree with toggle should expand/collapse the node multiple times": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "CdkTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "CdkTree nested tree with trackBy should add/remove/move children nodes with reference-based trackBy": {
    "error": "Error: Expected 0 to be 3.",
    "notes": "Unknown"
  },
  "CdkTree nested tree with trackBy should add/remove/move children nodes with property-based trackBy": {
    "error": "Error: Expected 0 to be 3.",
    "notes": "Unknown"
  },
  "CdkTree nested tree with trackBy should add/remove/move children nodes with index-based trackBy": {
    "error": "Error: Expected 0 to be 3.",
    "notes": "Unknown"
  },
  "CdkTree nested tree should throw an error when missing function in nested tree": {
    "error": "Error: Expected function to throw an exception with message 'Could not find functions for nested/flat tree in tree control.', but it threw an exception with message 'Cannot read property 'viewContainer' of undefined'.",
    "notes": "Unknown"
  },
  "CdkTree nested tree should throw an error when missing function in flat tree": {
    "error": "Error: Expected function to throw an exception with message 'Could not find functions for nested/flat tree in tree control.', but it threw an exception with message 'Cannot read property 'viewContainer' of undefined'.",
    "notes": "Unknown"
  },
  "CdkTree with depth should have correct depth for nested tree": {
    "error": "Error: Expected 0 to be 5.",
    "notes": "Unknown"
  },
  "MatButton should expose the ripple instance": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should initialize to the selected index": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should send focus change event": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should not set focus a disabled tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should move focus right and skip disabled tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should move focus left and skip disabled tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should support key down events to move and select focus": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should move focus to the first tab when pressing HOME": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should skip disabled items when moving focus using HOME": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should move focus to the last tab when pressing END": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader focusing should skip disabled items when moving focus using END": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination ltr should show width when tab list width exceeds container": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination ltr should scroll to show the focused tab label": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination ltr should show ripples for pagination buttons": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination ltr should allow disabling ripples for pagination buttons": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination rtl should scroll to show the focused tab label": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should re-align the ink bar when the direction changes": {
    "error": "TypeError: Cannot read property '_inkBar' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should re-align the ink bar when the window is resized": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should update arrows when the window is resized": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _checkPaginationEnabled()",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should update the pagination state if the content of the labels changes": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList basic behaviors should toggle the chips disabled state based on whether it is disabled": {
    "error": "Error: Expected true to be false.",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList with selected chips should have role listbox": {
    "error": "Error: Expected null to be 'listbox'.",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors should focus the first chip on focus": {
    "error": "Error: Expected -1 to be 0.",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors should watch for chip focus": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should focus the next item": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should focus the previous item": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should not focus if chip list is not focused": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should move focus to the last chip when the focused chip was deleted inside acomponent with animations": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus previous item when press LEFT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus next item when press RIGHT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus the first item when pressing HOME": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior RTL should focus previous item when press RIGHT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior RTL should focus next item when press LEFT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList keyboard behavior should account for the direction changing": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList FormFieldChipList keyboard behavior should maintain focus if the active chip is deleted": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatChipList FormFieldChipList keyboard behavior when the input has focus should not focus the last chip when press DELETE": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatChipList FormFieldChipList keyboard behavior when the input has focus should focus the last chip when press BACKSPACE": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatChipList FormFieldChipList should complete the stateChanges stream on destroy": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatChipList FormFieldChipList should point the label id to the chip input": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatChipList with chip remove should properly focus next item if chip is removed through click": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "Unknown"
  },
  "MatChipList selection logic should float placeholder if chip is selected": {
    "error": "Error: Expected false to be true, 'placeholder should be floating'.",
    "notes": "Unknown"
  },
  "MatChipList selection logic should select an option that was added after initialization": {
    "error": "Error: Expected undefined to contain 'potatoes-8', 'Expect value contain the value of the last option'.",
    "notes": "Unknown"
  },
  "MatChipList selection logic should not select disabled chips": {
    "error": "TypeError: Cannot read property 'selected' of undefined",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should take an initial view value with reactive forms": {
    "error": "Error: Expected false to be truthy 'Expect pizza-1 chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should set the view value from the form": {
    "error": "Error: Expected false to be truthy 'Expect chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should update the form value when the view changes": {
    "error": "Error: Expected null to equal 'steak-0'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should clear the selection when a nonexistent option value is selected": {
    "error": "Error: Expected false to be truthy 'Expected chip with the value to be selected.'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should set the control to dirty when the chip list's value changes in the DOM": {
    "error": "Error: Expected false to equal true.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should be able to programmatically select a falsy option": {
    "error": "Error: Expected false to be true, 'Expected first option to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration single selection should blur the form field when the active chip is blurred": {
    "error": "Error: Expected ng-tns-c10704-0 mat-primary mat-form-field mat-form-field-type-mat-chip-list mat-form-field-appearance-legacy mat-form-field-can-float mat-form-field-has-label mat-form-field-hide-placeholder ng-untouched ng-pristine ng-valid _mat-animation-noopable to contain 'mat-focused'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration multiple selection should take an initial view value with reactive forms": {
    "error": "Error: Expected false to be truthy 'Expect pizza-1 chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration multiple selection should set the view value from the form": {
    "error": "Error: Expected false to be truthy 'Expect chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList forms integration multiple selection should update the form value when the view changes": {
    "error": "Error: Expected null to equal [ 'steak-0' ].",
    "notes": "Unknown"
  },
  "MatChipList forms integration multiple selection should clear the selection when a nonexistent option value is selected": {
    "error": "Error: Expected false to be truthy 'Expected chip with the value to be selected.'.",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should take an initial view value with reactive forms": {
    "error": "Error: Expected false to be truthy 'Expect pizza-1 chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should set the view value from the form": {
    "error": "Error: Expected false to be truthy 'Expect chip to be selected'.",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should update the form value when the view changes": {
    "error": "Error: Expected null to equal [ 'steak-0' ].",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should clear the selection when a nonexistent option value is selected": {
    "error": "Error: Expected false to be truthy 'Expected chip with the value to be selected.'.",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should set the control to dirty when the chip list's value changes in the DOM": {
    "error": "Error: Expected false to equal true.",
    "notes": "Unknown"
  },
  "MatChipList chip list with chip input should set aria-invalid if the form field is invalid": {
    "error": "Error: Expected 'true' to be 'false'.",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should default to the first step": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should throw when a negative `selectedIndex` is assigned": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should throw when an out-of-bounds `selectedIndex` is assigned": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should change selected index on header click": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the \"tablist\" role on stepper": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set aria-expanded of content correctly": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should display the correct label": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should go to next available step when the next button is clicked": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the next stepper button type to \"submit\"": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should go to previous available step when the previous button is clicked": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the previous stepper button type to \"button\"": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the correct step position for animation": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should not set focus on header of selected step if header is not clicked": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should focus next step header if focus is inside the stepper": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should only be able to return to a previous step if it is editable": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set create icon if step is editable and completed": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set done icon if step is not editable and is completed": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should emit an event when the enter animation is done": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the correct aria-posinset and aria-setsize": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should adjust the index when removing a step before the current one": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should not do anything when pressing the ENTER key with a modifier": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should not do anything when pressing the SPACE key with a modifier": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper when attempting to set the selected step too early should not throw": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper basic stepper with i18n label change should re-render when the i18n labels change": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper icon overrides should allow for the `edit` icon to be overridden": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper icon overrides should allow for the `done` icon to be overridden": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper icon overrides should allow for the `number` icon to be overridden with context": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper RTL should reverse animation in RTL mode": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should have true linear attribute": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should not move to next step if current step is invalid": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should not move to next step if current step is pending": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should be able to focus step header upon click if it is unable to be selected": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should be able to move to next step even when invalid if current step is optional": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should be able to reset the stepper to its initial state": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should reset back to the first step when some of the steps are not editable": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should not clobber the `complete` binding when resetting": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper with a pre-defined selectedIndex should not throw": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper with no `stepControl` should not move to the next step if the current one is not completed ": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper with `stepControl` should have the `stepControl` take precedence when `completed` is set": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper vertical stepper should set the aria-orientation to \"vertical\"": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper vertical stepper should support using the left/right arrows to move focus": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper vertical stepper should support using the up/down arrows to move focus": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper vertical stepper should reverse arrow key focus in RTL mode": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper horizontal stepper should set the aria-orientation to \"horizontal\"": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper horizontal stepper should support using the left/right arrows to move focus": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper horizontal stepper should reverse arrow key focus in RTL mode": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper horizontal stepper should reverse arrow key focus when switching into RTL after init": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper with valid step must be visited if not optional": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper linear stepper with valid step can be skipped entirely if optional": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should set the aria-label attribute": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should set the aria-labelledby attribute": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should not be able to set both an aria-label and aria-labelledby": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper stepper with error state should show error state": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper stepper with error state should respect a custom falsy hasError value": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper stepper using Material UI Guideline logic should show done state when step is completed and its not the current step": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatStepper stepper using Material UI Guideline logic should show edit state when step is editable and its the current step": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatSlideToggle without forms custom action configuration should not change value on click when click action is noop": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatSlideToggle without forms custom action configuration should not change value on dragging when drag action is noop": {
    "error": "Error: Expected mat-slide-toggle-thumb-container to contain 'mat-dragging'.",
    "notes": "Unknown"
  },
  "MatSlider slider with set min and max should adjust fill and ticks on mouse enter when min changes": {
    "error": "Error: Expected '0% 2px' to be '75% 2px'.",
    "notes": "Unknown"
  },
  "MatSlider slider with set min and max should adjust fill and ticks on mouse enter when max changes": {
    "error": "Error: Expected '0% 2px' to be '50% 2px'.",
    "notes": "Unknown"
  },
  "MatSlider slider with auto ticks should set the correct tick separation on mouse enter": {
    "error": "Error: Expected '0% 2px' to be '30% 2px'.",
    "notes": "Unknown"
  },
  "MatSlider slider with set tick interval should set the correct tick separation on mouse enter": {
    "error": "Error: Expected '0% 2px' to be '18% 2px'.",
    "notes": "Unknown"
  },
  "MatButtonToggle without forms as standalone should have correct aria-pressed attribute": {
    "error": "Error: Expected 'false' to be 'true'.",
    "notes": "Unknown"
  },
  "MatDrawer methods should be able to open": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "MatDrawer methods should be able to close": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "MatDrawer methods should be able to close while the open animation is running": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "MatDrawer methods should close when pressing escape": {
    "error": "Error: Expected 0 to be 1, 'Expected one open event.'.",
    "notes": "Unknown"
  },
  "MatDrawer methods should fire the open event when open on init": {
    "error": "Error: Expected spy open callback to have been called once. It was called 0 times.",
    "notes": "Unknown"
  },
  "MatDrawer methods should restore focus on close if focus is inside drawer": {
    "error": "Error: Expected <button class=\"ng-tns-c21129-0\">...</button> to be <button class=\"open\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer methods should not restore focus on close if focus is outside drawer": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatDrawer attributes should bind 2-way bind on opened property": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"over\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c21424-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"push\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c21458-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should focus the drawer if there are no focusable elements": {
    "error": "Error: Expected <body style=\"\">...</body> to be <mat-drawer position=\"start\" mode=\"over\" class=\"ng-tns-c21526-1 mat-drawer ng-star-inserted ng-trigger ng-trigger-transform mat-drawer-over\" tabindex=\"-1\" style=\"transform: none; visibility: visible;\">...</mat-drawer>. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawerContainer should animate the content when a drawer is added at a later point": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if a drawer is destroyed": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if the drawer mode is changed": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if the direction has changed": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if a drawer changes size while open in autosize mode": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should not set a style property if it would be zero": {
    "error": "TypeError: Cannot read property 'style' of null",
    "notes": "Unknown"
  },
  "MatDrawerContainer should be able to explicitly enable the backdrop in `side` mode": {
    "error": "TypeError: Cannot set property 'mode' of undefined",
    "notes": "Unknown"
  },
  "MatDrawerContainer should expose a scrollable when the consumer has not specified drawer content": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should expose a scrollable when the consumer has specified drawer content": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatSidenav should be fixed position when in fixed mode": {
    "error": "Error: Expected ng-tns-c21976-0 mat-drawer ng-trigger ng-trigger-transform mat-drawer-over ng-star-inserted to contain 'mat-sidenav-fixed'.",
    "notes": "Unknown"
  },
  "MatSidenav should set fixed bottom and top when in fixed mode": {
    "error": "Error: Expected '' to be '20px'.",
    "notes": "Unknown"
  },
  "MatSort should use the column definition if used within a cdk table": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatSort should use the column definition if used within an mat table": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTree flat tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "MatTree flat tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "MatTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "MatTree flat tree with undefined or null children should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "MatTree nested tree with undefined or null children should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "MatTree nested tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "MatTree nested tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "MatTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "Unknown"
  },
  "MatAccordion should ensure only one item is expanded at a time": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should allow multiple items to be expanded simultaneously": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should expand or collapse all enabled items": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should not expand or collapse disabled items": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should not register nested panels to the same accordion": {
    "error": "Error: Export of name 'matExpansionPanel' not found!",
    "notes": "Unknown"
  },
  "MatAccordion should update the expansion panel if hideToggle changed": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should move focus to the next header when pressing the down arrow": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should move focus to the next header when pressing the up arrow": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should skip disabled items when moving focus with the keyboard": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should focus the first header when pressing the home key": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatAccordion should focus the last header when pressing the end key": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should expand and collapse the panel": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should be able to render panel content lazily": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should render the content for a lazy-loaded panel that is opened on init": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel emit correct events for change in panel expanded state": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should create a unique panel id for each panel": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should set `aria-labelledby` of the content to the header id": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should set the proper role on the content element": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should toggle the panel when pressing SPACE on the header": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should toggle the panel when pressing ENTER on the header": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should not toggle if a modifier key is pressed": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should not be able to focus content while closed": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should restore focus to header if focused element is inside panel on close": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should not override the panel margin if it is not inside an accordion": {
    "error": "TypeError: Cannot read property '_hasSpacing' of null",
    "notes": "Unknown"
  },
  "MatExpansionPanel should be able to hide the toggle": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should update the indicator rotation when the expanded state is toggled programmatically": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should make sure accordion item runs ngOnDestroy when expansion panel is destroyed": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should support two-way binding of the `expanded` property": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should emit events for body expanding and collapsing animations": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel should be able to set the default options through the injection token": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel disabled state should toggle the aria-disabled attribute on the header": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel disabled state should toggle the expansion indicator": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel disabled state should not be able to toggle the panel via a user action if disabled": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatExpansionPanel disabled state should be able to toggle a disabled expansion panel programmatically": {
    "error": "Error: NodeInjector: NOT_FOUND [MatExpansionPanel]",
    "notes": "Unknown"
  },
  "MatGridList should throw error if rowHeight ratio is invalid": {
    "error": "Error: mat-grid-list: invalid ratio given for row-height: \"4:3:2\"",
    "notes": "Unknown"
  },
  "MatInput without forms validates the type": {
    "error": "Error: Input type \"file\" isn't supported by matInput.",
    "notes": "Unknown"
  },
  "MatInput without forms should not highlight when focusing a readonly input": {
    "error": "Error: Expected true to be false.",
    "notes": "Unknown"
  },
  "MatInput with textarea autosize should work in a tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatInput with textarea autosize should work in a step": {
    "error": "Error: StaticInjectorError(Platform: core)[MatStepper]: ",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should change active index on click": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should add the active class if active": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should toggle aria-current based on active state": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should add the disabled class if disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should update aria-disabled if disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should disable the ripples on all tabs when they are disabled on the nav bar": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should have the `disableRipple` from the tab take precendence over the nav bar": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should update the tabindex if links are disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should make disabled links unclickable": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should show ripples for tab links": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should be able to disable ripples on a tab link": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the direction changes": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the tabs list change": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the tab labels change the width": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the window is resized": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should hide the ink bar when all the links are inactive": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should default to the first tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior will properly load content on first change detection pass": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should change selected index on click": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should support two-way binding for selectedIndex": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should set to correct tab on fast change": {
    "error": "Failed: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should change tabs based on selectedIndex": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should update tab positions when selected index is changed": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should clamp the selected index to the size of the number of tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should not crash when setting the selected index to NaN": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should show ripples for tab-group labels": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should allow disabling ripples for tab-group labels": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should set the isActive flag on each of the tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should fire animation done event": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should add the proper `aria-setsize` and `aria-posinset`": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should emit focusChange event on click": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should emit focusChange on arrow key navigation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup aria labelling should set the aria-label attribute": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup aria labelling should set the aria-labelledby attribute": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup aria labelling should not be able to set both an aria-label and aria-labelledby": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup disable tabs should have one disabled tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup disable tabs should set the disabled flag on tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should be able to add a new tab, select it, and have correct origin position": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should update selected index if the last tab removed while selected": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should maintain the selected tab if a new tab is added": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should maintain the selected tab if a tab is removed": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should be able to select a new tab after creation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup dynamic binding tabs should not fire `selectedTabChange` when the amount of tabs changes": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup async tabs should show tabs when they are available": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup with simple api should support a tab-group with the simple api": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup with simple api should support @ViewChild in the tab content": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup with simple api should only have the active tab in the DOM": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup with simple api should support setting the header position": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup lazy loaded tabs should lazy load the second tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup special cases should not throw an error when binding isActive to the view": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "nested MatTabGroup with enabled animations should not throw when creating a component with nested tab groups": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "Dialog should open a dialog with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should open a dialog with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should emit when dialog opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should use injector from viewContainerRef for DialogInjector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should open a dialog with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should apply the configured role to the dialog element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should apply the specified `aria-describedby`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close a dialog and get back a result": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should only emit the afterCloseEvent once when closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close a dialog and get back a result before it is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close a dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close from a ViewContainerRef with OnPush change detection": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should notify the observers if all open dialogs have finished closing": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the min-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the max-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the min-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the max-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the top offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the bottom offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the left offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should override the right offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should allow for the position to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should allow for the dimensions to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should inject the correct layout direction in the component instance": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close all of the dialogs": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close all dialogs when the user goes forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close all open dialogs when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should have the componentInstance available in the afterClosed callback": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should close all open dialogs on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should complete the various lifecycle streams on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "Dialog should not keep a reference to the component after the dialog is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should assign a unique id to each dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should allow for the id to be overwritten": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should throw when trying to open a dialog with the same id as another dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog should be able to find a dialog by id": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog disableClose option should allow for the disableClose option to be updated while open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog panelClass option should have custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog focus management should focus the first tabbable element of the dialog on open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog focus management should re-focus trigger element when dialog closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog focus management should allow the consumer to shift focus in afterClosed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog focus management should move focus to the container if there are no focusable elements in the dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog aria-label should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog aria-label should not set the aria-labelledby automatically if it has an aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog with a parent Dialog should close dialogs opened by a parent when calling closeAll on a child Dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog with a parent Dialog should close dialogs opened by a child when calling closeAll on a parent Dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog with a parent Dialog should not close the parent dialogs, when a child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "Dialog with a parent Dialog should close the top dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "FullscreenOverlayContainer should open an overlay inside a fullscreen element and move it to the body": {
    "error": "Error: Must provide a portal to attach",
    "notes": "Unknown"
  },
  "FullscreenOverlayContainer should open an overlay inside the body and move it to a fullscreen element": {
    "error": "Error: Must provide a portal to attach",
    "notes": "Unknown"
  },
  "OverlayContainer should remove the overlay container element from the DOM on destruction": {
    "error": "Error: Must provide a portal to attach",
    "notes": "Unknown"
  },
  "Overlay directives should attach the overlay based on the open property": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives should destroy the overlay when the directive is destroyed": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives should use a connected position strategy with a default set of positions": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives should set and update the `dir` attribute": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives should close when pressing escape": {
    "error": "Error: Expected 'Menu content' to be '', 'Expected overlay to have been detached.'.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the width": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the height": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the min width": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the min height": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should create the backdrop if designated": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should not create the backdrop by default": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should be able to change hasBackdrop after the overlay has been initialized": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the custom backdrop class": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the custom panel class": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the offsetX": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should set the offsetY": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should be able to update the origin after init": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should update the positions if they change after init": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives inputs should take the offset from the position": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives outputs should emit backdropClick appropriately": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives outputs should emit positionChange appropriately": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives outputs should emit attach and detach appropriately": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay directives outputs should emit the keydown events from the overlay": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should load a component into an overlay": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should load a template portal into an overlay": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should disable pointer events of the pane element if detached": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should open multiple overlays": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should ensure that the most-recently-attached overlay is on top": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should emit when an overlay is detached": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should emit the detachment event after the overlay is removed from the DOM": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should emit and complete the observables when an overlay is disposed": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should complete the attachment observable before the detachment one": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should clear out all DOM element references on dispose": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should clear the backdrop timeout if the transition finishes first": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should add and remove the overlay host as the ref is being attached and detached": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay should be able to dispose an overlay on navigation": {
    "error": "Error: Expected 1 to be 0.",
    "notes": "Unknown"
  },
  "Overlay positioning should apply the positioning strategy": {
    "error": "Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node. thrown",
    "notes": "Unknown"
  },
  "Overlay positioning should not apply the position if it detaches before the zone stabilizes": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay backdrop should complete the backdrop click stream once the overlay is destroyed": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay backdrop should disable the pointer events of a backdrop that is being removed": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay panelClass should remove the custom panel class when the overlay is detached": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay panelClass should wait for the overlay to be detached before removing the panelClass": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "Overlay scroll strategy should disable the scroll strategy once the overlay is detached": {
    "error": "Error: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    "notes": "Unknown"
  },
  "ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the left of the screen": {
    "error": "Error: Expected -3018 to be -3048.",
    "notes": "Unknown"
  },
  "ConnectedPositionStrategy with origin on document body when near viewport edge should reposition the overlay if it would go off the right of the screen": {
    "error": "Error: Expected -3048 to be -3018.",
    "notes": "Unknown"
  },
  "ConnectedPositionStrategy with origin on document body should pick the fallback position that shows the largest area of the element": {
    "error": "Error: Expected 969 to be 909.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the left of the screen": {
    "error": "Error: Expected -3018 to be -3048.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy without flexible dimensions and pushing when near viewport edge should reposition the overlay if it would go off the right of the screen": {
    "error": "Error: Expected -3048 to be -3018.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy without flexible dimensions and pushing should account for the `offsetX` pushing the overlay out of the screen": {
    "error": "Error: Expected -10 to be 130.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy without flexible dimensions and pushing should pick the fallback position that shows the largest area of the element": {
    "error": "Error: Expected 969 to be 909.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the right": {
    "error": "Error: Expected 994 to be 1009.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with pushing should be able to push an overlay into the viewport when it goes out on the bottom": {
    "error": "Error: Expected 834 to be 768.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with pushing should align to the trigger if the overlay is wider than the viewport, but the trigger is still within the viewport": {
    "error": "Error: Expected 0 to be 150.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with pushing should not continue pushing the overlay as the user scrolls, if position locking is enabled": {
    "error": "Error: Expected 0 to be less than 0, 'Expected overlay to no longer be completely inside the viewport.'.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should support offsets when centering": {
    "error": "Error: Expected 35 to be -3013.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should become scrollable when it hits the viewport edge with a flexible height": {
    "error": "Error: Expected 30 to be 20.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should become scrollable when it hits the viewport edge with a flexible width": {
    "error": "Error: Expected 994 to be 1009.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should take `weight` into account when determining which position to pick": {
    "error": "Error: Expected 30 to be -3048.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should be able to opt-in to having the overlay grow after it was opened": {
    "error": "Error: Expected 30 to be 20.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy with flexible dimensions should calculate the bottom offset correctly with a viewport margin": {
    "error": "Error: Expected -3263 to be 5.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy positioning properties in ltr should use `right` when positioning an element at the end": {
    "error": "Error: Expected '' to be truthy.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy positioning properties in rtl should use `right` when positioning an element at the start": {
    "error": "Error: Expected '' to be truthy.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy positioning properties vertical should use `bottom` when positioning at element along the bottom": {
    "error": "Error: Expected '' to be truthy.",
    "notes": "Unknown"
  },
  "FlexibleConnectedPositionStrategy panel classes should clear the previous classes when the position changes": {
    "error": "Error: Expected cdk-overlay-pane is-center is-in-the-middle not to contain 'is-center'.",
    "notes": "Unknown"
  },
  "BlockScrollStrategy should't do anything if the page isn't scrollable": {
    "error": "Error: Expected cdk-global-scrollblock not to contain 'cdk-global-scrollblock'.",
    "notes": "Unknown"
  },
  "MatBottomSheet should open a bottom sheet with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should open a bottom sheet with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should position the bottom sheet at the bottom center of the screen": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should emit when the bottom sheet opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should use the correct injector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should open a bottom sheet with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should apply the correct role to the container element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should close a bottom sheet via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should inject the correct direction in the instantiated component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should be able to set a custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should be able to get dismissed through the service": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should dismiss the bottom sheet when the service is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should open a new bottom sheet after dismissing a previous sheet": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should remove past bottom sheets when opening new ones": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should not throw when opening multiple bottom sheet in quick succession": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatBottomSheet should remove bottom sheet if another is shown while its still animating open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should emit after being dismissed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should be able to pass a result back to the dismissed stream": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should close the bottom sheet when going forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should close the bottom sheet when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet should allow the consumer to disable closing a bottom sheet on navigation": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatBottomSheet disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet focus management should focus the bottom sheet container by default": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet focus management should focus the first tabbable element of the bottom sheet on open whenautoFocus is enabled": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet focus management should re-focus trigger element when bottom sheet closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet focus management should be able to disable focus restoration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by parent when opening from child": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by child when opening from parent": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet with parent MatBottomSheet should not close parent bottom sheet when child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet with default options should use the provided defaults": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatBottomSheet with default options should be overridable by open() options": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatAutocomplete aria should set role of autocomplete panel to listbox": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatAutocomplete aria should set aria-owns based on the attached autocomplete": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "Unknown"
  },
  "MatAutocomplete Fallback positions should use below positioning by default": {
    "error": "Error: Expected 4074 to equal 3773.",
    "notes": "Unknown"
  },
  "MatAutocomplete Fallback positions should reposition the panel on scroll": {
    "error": "Error: Expected 4074 to equal 3773.",
    "notes": "Unknown"
  },
  "MatAutocomplete Option selection should handle `optionSelections` being accessed too early": {
    "error": "TypeError: Cannot read property 'autocomplete' of undefined",
    "notes": "Unknown"
  },
  "MatAutocomplete should be able to set a custom panel connection element": {
    "error": "Error: Expected 4000 to be 4162, 'Expected autocomplete panel to align with the bottom of the new origin.'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker open non-touch should open popup": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker touch should open dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should not be able to open more than one dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should open datepicker if opened input is set to true": {
    "error": "Error: Expected null not to be null.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker disabled datepicker input should open the calendar if datepicker is enabled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker close should close popup": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should close the popup when pressing ESCAPE": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should set the proper role on the popup": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker close should close dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker setting selected via click should update input and close calendar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker setting selected via enter press should update input and close calendar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker clicking the currently selected date should close the calendar without firing selectedChanged": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker pressing enter on the currently selected date should close the calendar without firing selectedChanged": {
    "error": "Error: ASSERTION ERROR: NgModule already destroyed",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker input should aria-owns calendar after opened in non-touch mode": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker input should aria-owns calendar after opened in touch mode": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should clear out the backdrop subscriptions on close": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should reset the datepicker when it is closed externally": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should close the datpeicker using ALT + UP_ARROW": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should open the datepicker using ALT + DOWN_ARROW": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with startView set to year should start at the specified view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with startView set to year should fire yearSelected when user selects calendar year in year view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with startView set to multiyear should start at the specified view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with startView set to multiyear should fire yearSelected when user selects calendar year in multiyear view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should update datepicker when model changes": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should update model when date is selected": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input dirty after input event": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input dirty after date selected": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should not mark dirty after model change": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input touched on blur": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should reformat the input value on blur": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should not reformat invalid dates on blur": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with ngModel should mark input touched on calendar selection": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should update datepicker when formControl changes": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should update formControl when date is selected": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should disable input when form control disabled": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should disable toggle when form control disabled": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set `aria-haspopup` on the toggle button": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should open calendar when toggle clicked": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if datepicker is disabled": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if input is disabled": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set the `button` type on the trigger to prevent form submissions": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should remove the underlying SVG icon from the tab order": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should restore focus to the toggle after the calendar is closed": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should re-render when the i18n labels change": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should toggle the active state of the datepicker toggle": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with custom mat-datepicker-toggle icon should be able to override the mat-datepicker-toggle icon": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward the tabindex to the underlying button": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should clear the tabindex from the mat-datepicker-toggle host": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward focus to the underlying button when the host is focused": {
    "error": "TypeError: Cannot read property 'disabled' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should pass the form field theme color to the overlay": {
    "error": "TypeError: Cannot read property 'classList' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should prefer the datepicker color over the form field one": {
    "error": "TypeError: Cannot read property 'classList' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should use min and max dates specified by the input": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is before min": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is after max": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals min": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals max": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value is between min and max": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with filter and validation should mark input invalid": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with filter and validation should disable filtered calendar cells": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with change and input events should fire dateChange and dateInput events when user selects calendar date": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule with ISO 8601 strings as input should coerce ISO strings": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule with events should dispatch an event when a datepicker is opened": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule with events should dispatch an event when a datepicker is closed": {
    "error": "Error: Cannot instantiate cyclic dependency! InjectionToken LocaleId",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker directionality should pass along the directionality to the popup": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker directionality should update the popup direction if the directionality value changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker directionality should pass along the directionality to the dialog in touch mode": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDatepicker popup positioning should be below and to the right when there is plenty of space": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker popup positioning should be above and to the right when there is no space below": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker popup positioning should be below and to the left when there is no space on the right": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker popup positioning should be above and to the left when there is no space on the bottom": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker datepicker with custom header should find the standard header element": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDatepicker datepicker with custom header should find the custom element": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatDialog should open a dialog with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should open a dialog with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should emit when dialog opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should use injector from viewContainerRef for DialogInjector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should open a dialog with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should apply the configured role to the dialog element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should apply the specified `aria-describedby`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close a dialog and get back a result": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should dispatch the beforeClose and afterClose events when the overlay is detached externally": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close a dialog and get back a result before it is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close a dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close from a ViewContainerRef with OnPush change detection": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should notify the observers if all open dialogs have finished closing": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the min-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the max-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the min-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the max-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the top offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the bottom offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the left offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should override the right offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should allow for the position to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should allow for the dimensions to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should reset the overlay dimensions to their initial size": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should inject the correct layout direction in the component instance": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close all of the dialogs": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close all dialogs when the user goes forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close all open dialogs when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should close all of the dialogs when the injectable is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should allow the consumer to disable closing a dialog on navigation": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should have the componentInstance available in the afterClosed callback": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should be able to attach a custom scroll strategy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatDialog should not keep a reference to the component after the dialog is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should assign a unique id to each dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should allow for the id to be overwritten": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should throw when trying to open a dialog with the same id as another dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should be able to find a dialog by id": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should toggle `aria-hidden` on the overlay container siblings": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should restore `aria-hidden` to the overlay container siblings on close": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog should not set `aria-hidden` on `aria-live` elements": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog disableClose option should allow for the disableClose option to be updated while open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog panelClass option should have custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should focus the first tabbable element of the dialog on open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should re-focus trigger element when dialog closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should allow the consumer to shift focus in afterClosed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should move focus to the container if there are no focusable elements in the dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog focus management should be able to disable focus restoration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should close the dialog when clicking on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should allow for a user-specified aria-label on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should override the \"type\" attribute of the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should return the [mat-dialog-close] result when clicking the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside component dialog should set the aria-labelledby attribute to the id of the title": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should close the dialog when clicking on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should allow for a user-specified aria-label on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should override the \"type\" attribute of the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should return the [mat-dialog-close] result when clicking the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog dialog content elements inside template portal should set the aria-labelledby attribute to the id of the title": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog aria-label should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog aria-label should not set the aria-labelledby automatically if it has an aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with a parent MatDialog should close dialogs opened by a parent when calling closeAll on a child MatDialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with a parent MatDialog should close dialogs opened by a child when calling closeAll on a parent MatDialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with a parent MatDialog should close the top dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with a parent MatDialog should not close the parent dialogs when a child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with default options should use the provided defaults": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatDialog with default options should be overridable by open() options": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatMenu should open the menu as an idempotent operation": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should be able to remove the backdrop": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should be able to remove the backdrop on repeat openings": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should be able to set a custom class on the backdrop": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should scroll the panel to the top on open, when it is scrollable": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should open a custom menu": {
    "error": "Error: Expected function not to throw an Error, but it threw TypeError.",
    "notes": "Unknown"
  },
  "MatMenu should set the panel direction based on the trigger direction": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should update the panel direction if the trigger direction changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should transfer any custom classes from the host to the overlay": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should set the \"menu\" role on the overlay panel": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should set the \"menuitem\" role on the items by default": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should be able to set an alternate role on the menu items": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should set the proper focus origin when opening by mouse": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should set the proper focus origin when opening by touch": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu should close the menu when using the CloseScrollStrategy": {
    "error": "TypeError: Cannot read property 'openMenu' of undefined",
    "notes": "Unknown"
  },
  "MatMenu should switch to keyboard focus when using the keyboard after opening using the mouse": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu lazy rendering should be able to render the menu content lazily": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu lazy rendering should focus the first menu item when opening a lazy menu via keyboard": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu lazy rendering should be able to open the same menu with a different context": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu positions should append mat-menu-before if the x position is changed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu positions should append mat-menu-above if the y position is changed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu positions should default to the \"below\" and \"after\" positions": {
    "error": "Error: Expected ng-tns-c56008-0 ng-trigger ng-trigger-transformMenu mat-menu-panel custom-one custom-two ng-star-inserted mat-elevation-z4 mat-menu-before mat-menu-above ng-animating to contain 'mat-menu-below'.",
    "notes": "Unknown"
  },
  "MatMenu positions should be able to update the position after the first open": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu fallback positions should fall back to \"before\" mode if \"after\" mode would not fit on screen": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu fallback positions should fall back to \"above\" mode if \"below\" mode would not fit on screen": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu fallback positions should re-position menu on both axes if both defaults would not fit": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu fallback positions should re-position a menu with custom position set": {
    "error": "Error: Expected 0 to be 8, 'Expected menu to open in \"after\" position if \"before\" position wouldn't fit.'.",
    "notes": "Unknown"
  },
  "MatMenu overlapping trigger explicitly overlapping positions the overlay below the trigger": {
    "error": "Error: Expected 704 to be 4050, 'Expected menu to open in default \"below\" position.'.",
    "notes": "Unknown"
  },
  "MatMenu overlapping trigger not overlapping positions the overlay below the trigger": {
    "error": "Error: Expected 704 to be 4071, 'Expected menu to open directly below the trigger.'.",
    "notes": "Unknown"
  },
  "MatMenu overlapping trigger not overlapping supports above position fall back": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu overlapping trigger not overlapping repositions the origin to be below, so the menu opens from the trigger": {
    "error": "Error: Expected ng-tns-c56245-0 ng-trigger ng-trigger-transformMenu mat-menu-panel ng-star-inserted mat-elevation-z4 mat-menu-before mat-menu-above ng-animating to contain 'mat-menu-below'.",
    "notes": "Unknown"
  },
  "MatMenu animations should enable ripples on items by default": {
    "error": "TypeError: Cannot read property 'query' of null",
    "notes": "Unknown"
  },
  "MatMenu animations should disable ripples on disabled items": {
    "error": "TypeError: Cannot read property 'query' of undefined",
    "notes": "Unknown"
  },
  "MatMenu animations should disable ripples if disableRipple is set": {
    "error": "TypeError: Cannot read property 'query' of undefined",
    "notes": "Unknown"
  },
  "MatMenu close event should complete the callback when the menu is destroyed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should set the `parentMenu` on the sub-menu instances": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should pass the layout direction the nested menus": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should emit an event when the hover state of the menu items changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should toggle a nested menu when its trigger is hovered": {
    "error": "Error: Expected mat-menu-item mat-menu-item-submenu-trigger ng-tns-c56564-0 cdk-focused cdk-program-focused to contain 'mat-menu-item-highlighted', 'Expected the trigger to be highlighted'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should close all the open sub-menus when the hover state is changed at the root": {
    "error": "TypeError: Cannot read property 'dispatchEvent' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should close submenu when hovering over disabled sibling item": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not open submenu when hovering over disabled trigger": {
    "error": "TypeError: Cannot read property 'componentInstance' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should open a nested menu when its trigger is clicked": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should open and close a nested menu with arrow keys in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should open and close a nested menu with the arrow keys in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not do anything with the arrow keys for a top-level menu": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should shift focus between the sub-menus": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should position the sub-menu to the right edge of the trigger in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should fall back to aligning to the left edge of the trigger in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should position the sub-menu to the left edge of the trigger in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should fall back to aligning to the right edge of the trigger in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should set a class on the menu items that trigger a sub-menu": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should increase the sub-menu elevation based on its depth": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should update the elevation when the same menu is opened at a different depth": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not increase the elevation if the user specified a custom one": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should toggle a nested menu when its trigger is added after init": {
    "error": "Error: Expected mat-menu-item mat-menu-item-submenu-trigger ng-star-inserted to contain 'mat-menu-item-highlighted', 'Expected the trigger to be highlighted'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should prevent the default mousedown action if the menu item opens a sub-menu": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should handle the items being rendered in a repeater": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should be able to trigger the same nested menu from different triggers": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should close the initial menu if the user moves away while animating": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should be able to open a submenu through an item that is not a direct descendant of the panel": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not close when hovering over a menu item inside a sub-menu panel that is declaredinside the root menu": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not re-focus a child menu trigger when hovering another trigger": {
    "error": "Error: Expected 1 to be 2, 'Expected two open menus'.",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should close when pressing ALT + DOWN_ARROW": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should close when pressing ALT + UP_ARROW": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should not shift focus when the selected options are updated programmatically in a multi select": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should toggle the next option when pressing shift + DOWN_ARROW on a multi-select": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should toggle the previous option when pressing shift + UP_ARROW on a multi-select": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should set aria-activedescendant based on the focused option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should not change the aria-activedescendant using the horizontal arrow keys": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for select should restore focus to the trigger after selecting an option in multi-select mode": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for options should set the role of mat-option to option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for options should set aria-selected on each option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for options should set the tabindex of each option according to disabled state": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for options should set aria-disabled for disabled options": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for option groups should set the appropriate role": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for option groups should set the `aria-labelledby` attribute": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core accessibility for option groups should set the `aria-disabled` attribute if the group is disabled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should not throw when attempting to open too early": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'open' of undefined.",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should open the panel when trigger is clicked": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should set the width of the overlay based on the trigger": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should focus the first option when pressing HOME": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should focus the last option when pressing END": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should be able to set extra classes on the panel": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should not show ripples if they were disabled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should be able to render options inside groups with an ng-container": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core overlay panel should not consider itself as blurred if the trigger loses focus while the panel is still open": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should focus the first option if no option is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should select an option when it is clicked": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should be able to select an option using the MatOption API": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should deselect other options when one is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should deselect other options when one is programmatically selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should remove selection if option has been removed": {
    "error": "TypeError: Cannot read property '1' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should focus the selected option if an option is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should not select disabled options": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should not select options inside a disabled group": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should handle accessing `optionSelectionChanges` before the options are initialized": {
    "error": "TypeError: Cannot read property 'options' of undefined",
    "notes": "Unknown"
  },
  "MatSelect core forms integration should take an initial view value with reactive forms": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core forms integration should set the view value from the form": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core forms integration should clear the selection when a nonexistent option value is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core forms integration should clear the selection when the control is reset": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core disabled behavior should disable itself when control is disabled programmatically": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should not scroll to options that are completely in the view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should scroll down to the active option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should scroll up to the active option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should skip option group labels": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should scroll top the top when pressing HOME": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should scroll to the bottom of the panel when pressing END": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should scroll to the active option when typing": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with a selectionChange event handler should emit an event when the selected option has changed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with a selectionChange event handler should not emit multiple change events for the same option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with ngModel should disable itself when control is disabled using the property": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with ngIf should handle nesting in an ngIf": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple mat-select elements in one view should set aria-owns properly": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple mat-select elements in one view should set the option id properly": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect when initially hidden should set the width of the overlay if the element was hidden initially": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with no placeholder should set the width of the overlay if there is no placeholder": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with theming should transfer the theme to the select panel": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect when the select's value is accessed on initialization should not throw when trying to access the selected value on init": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'selected' of undefined.",
    "notes": "Unknown"
  },
  "MatSelect inside of a form group should notify that the state changed when the options have changed": {
    "error": "TypeError: Cannot read property '1' of null",
    "notes": "Unknown"
  },
  "MatSelect with custom value accessor should support use inside a custom value accessor": {
    "error": "Error: <spyOn> : could not find an object to spy upon for writeValue()",
    "notes": "Unknown"
  },
  "MatSelect with a falsy value should be able to programmatically select a falsy option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with custom trigger should allow the user to customize the label": {
    "error": "TypeError: Cannot read property 'selected' of undefined",
    "notes": "Unknown"
  },
  "MatSelect when reseting the value by setting null or undefined should not mark the reset option as selected ": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect without Angular forms should mark options as selected when the value is set": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect without Angular forms should reflect the preselected value": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect without Angular forms should be able to select multiple values": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with option centering disabled should not align the active option with the trigger if centering is disabled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning ample space to open should align the first option with trigger text if no option is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning ample space to open should align a selected option too high to be centered with the trigger text": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning ample space to open should align a selected option in the middle with the trigger text": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning ample space to open should align a selected option at the scroll max with the trigger text": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning ample space to open should account for preceding label groups when aligning the option": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open vertically should adjust position of centered option if there is little space above": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open vertically should adjust position of centered option if there is little space below": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open vertically should fall back to \"above\" positioning if scroll adjustment will not help": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open vertically should fall back to \"below\" positioning if scroll adjustment won't help": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the left in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the left in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the right in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open horizontally should stay within the viewport when overflowing on the right in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning limited space to open horizontally should keep the position within the viewport on repeat openings": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning when scrolled should align the first option properly when scrolled": {
    "error": "Error: Expected false to be true, 'Expected trigger to align with option 0.'.",
    "notes": "Unknown"
  },
  "MatSelect positioning when scrolled should align a centered option properly when scrolled": {
    "error": "Error: Expected false to be true, 'Expected trigger to align with option 4.'.",
    "notes": "Unknown"
  },
  "MatSelect positioning when scrolled should align a centered option properly when scrolling while the panel is open": {
    "error": "Error: Expected false to be true, 'Expected trigger to align with option 4.'.",
    "notes": "Unknown"
  },
  "MatSelect positioning when scrolled should fall back to \"above\" positioning properly when scrolled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning when scrolled should fall back to \"below\" positioning properly when scrolled": {
    "error": "Error: Expected 5832 to equal 6070.",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning should align the trigger and the selected option on the x-axis in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning should align the trigger and the selected option on the x-axis in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning in multi select mode should adjust for the checkbox in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning in multi select mode should adjust for the checkbox in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning with groups should adjust for the group padding in ltr": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning with groups should adjust for the group padding in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning with groups should not adjust if all options are within a group, except the selected one": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect positioning x-axis positioning with groups should align the first option to the trigger, if nothing is selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should be able to select multiple values": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should be able to toggle an option on and off": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should update the label": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should be able to set the selected value by taking an array": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should override the previously-selected value when setting an array": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should not close the panel when clicking on options": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should sort the selected options based on their order in the panel": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should sort the selected options in reverse in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should be able to customize the value sorting logic": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should sort the values that get set via the model based on the panel order": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should reverse sort the values, that get set via the model in rtl": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should pass the `multiple` value to all of the option instances": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should update the active item index on click": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should be to select an option with a `null` value": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should select all options when pressing ctrl + a": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should skip disabled options when using ctrl + a": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should select all options when pressing ctrl + a when some options are selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSelect with multiple selection should deselect all options with ctrl + a if all options are selected": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatSnackBar should have the role of `alert` with an `assertive` politeness if no announcement message is provided": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should have the role of `status` with an `assertive` politeness if an announcement message is provided": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should have the role of `status` with a `polite` politeness": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should remove the role if the politeness is turned off": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should open and close a snackbar without a ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should open a simple message with a button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should open a simple message with no button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should dismiss the snack bar and remove itself from the view": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should default to the passed message for the announcement message": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should be able to specify a custom announcement message": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should be able to get dismissed through the service": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should clean itself up when the view container gets destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should set the animation state to visible on entry": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should set the animation state to complete on exit": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should set the old snack bar animation state to complete and the new snack bar animation\n      state to visible on entry of new snack bar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should open a new snackbar after dismissing a previous snackbar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should remove past snackbars when opening new snackbars": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should remove snackbar if another is shown while its still animating open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should dismiss the snackbar when the action is called, notifying of both action and dismiss": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should allow manually dismissing with an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should indicate in `afterClosed` whether it was dismissed by an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should complete the onAction stream when not closing via an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should dismiss automatically after a specified timeout": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should clear the dismiss timeout when dismissed before timeout expiration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should add extra classes to the container": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should set the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should be able to override the default config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should dismiss the open snack bar on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with custom component should open a custom component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with custom component should inject the snack bar reference into the component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with custom component should be able to inject arbitrary user data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with custom component should allow manually dismissing with an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with TemplateRef should be able to open a snack bar using a TemplateRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with TemplateRef should be able to pass in contextual data when opening with a TemplateRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with parent MatSnackBar should close snackBars opened by parent when opening from child": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with parent MatSnackBar should close snackBars opened by child when opening from parent": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar with parent MatSnackBar should not dismiss parent snack bar if child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should default to bottom center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the bottom left corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the bottom right corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the bottom center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the top left corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the top right corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should be in the top center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should handle start based on direction (rtl)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should handle start based on direction (ltr)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should handle end based on direction (rtl)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar Positioning should handle end based on direction (ltr)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should be able to re-open a tooltip if it was closed by detaching the overlay": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should show with delay": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should be able to override the default show and hide delays": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should set a css class on the overlay panel element": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not show if disabled": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should hide if disabled while visible": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should hide if the message is cleared while the tooltip is open": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not show if hide is called before delay finishes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not follow through with hide if show is called after": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should be able to update the tooltip position while open": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should be able to modify the tooltip message": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should allow extra classes to be set on the tooltip": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should be removed after parent destroyed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not try to dispose the tooltip when destroyed and done hiding": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should pass the layout direction to the tooltip": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should keep the overlay direction in sync with the trigger direction": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not hide immediately if a click fires while animating": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip basic usage should not hide the tooltip when calling `show` twice in a row": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip scrollable usage should execute the `hide` call, after scrolling away, inside the NgZone": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatTooltip with OnPush should show and hide the tooltip": {
    "error": "Error: Expected '' to be 'scale(1)'.",
    "notes": "Unknown"
  },
  "MatTooltip with OnPush should have rendered the tooltip text on init": {
    "error": "Error: Expected '' to contain 'initial tooltip message'.",
    "notes": "Unknown"
  },
  "MatTooltip special cases should clear the `user-select` when a tooltip is set on a text field": {
    "error": "Error: Expected 'none' to be falsy.",
    "notes": "Unknown"
  },
  "MatTooltip special cases should clear the `-webkit-user-drag` on draggable elements": {
    "error": "Error: Expected 'none' to be falsy.",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should be in month view with specified month active": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should toggle view when period clicked": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should go to next and previous month": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should go to previous and next year": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should go to previous and next multi-year range": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendarHeader standard calendar should go back to month view after selecting year and month": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should update today's date": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should be in month view with specified month active": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should select date in month view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should emit the selected month on cell clicked in year view": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should emit the selected year on cell clicked in multiyear view": {
    "error": "TypeError: Cannot read property 'getFullYear' of undefined",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should re-render when the i18n labels have changed": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should set all buttons to be `type=\"button\"`": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar should complete the stateChanges stream": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body should initially set start date active": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body should make the calendar body focusable": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body should not move focus to the active cell on init": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body should move focus to the active cell when the view changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body year view should return to month view on enter": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body year view should return to month view on space": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body multi-year view should go to year view on enter": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar standard calendar a11y calendar body multi-year view should go to year view on space": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should clamp startAt value below min date": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should clamp startAt value above max date": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should not go back past min date": {
    "error": "Error: Expected false to be true, 'previous button should be disabled'.",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should not go forward past max date": {
    "error": "Error: Expected false to be true, 'next button should be disabled'.",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the month view when the minDate changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the month view when the maxDate changes": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the year view when the minDate changes": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _init()",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the year view when the maxDate changes": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _init()",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the multi-year view when the minDate changes": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _init()",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should re-render the multi-year view when the maxDate changes": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _init()",
    "notes": "Unknown"
  },
  "MatCalendar calendar with min and max date should update the minDate in the child view if it changed after an interaction": {
    "error": "Error: This PortalOutlet has already been disposed",
    "notes": "Unknown"
  },
  "MatCalendar calendar with date filter should disable and prevent selection of filtered dates": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with date filter a11y should not allow selection of disabled date in month view": {
    "error": "TypeError: Cannot read property '0' of null",
    "notes": "Unknown"
  },
  "MatCalendar calendar with date filter a11y should allow entering month view at disabled month": {
    "error": "Error: Expected 'multi-year' to be 'year'.",
    "notes": "Unknown"
  },
  "MatPaginator when navigating with the next and previous buttons should be able to go to the next page": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator when navigating with the next and previous buttons should be able to go to the previous page": {
    "error": "TypeError: Cannot set property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should mark itself as initialized": {
    "error": "TypeError: Cannot read property 'initialized' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should not allow a negative pageSize": {
    "error": "TypeError: Cannot set property 'pageSize' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should not allow a negative pageIndex": {
    "error": "TypeError: Cannot set property 'pageSize' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator when showing the first and last button should be able to go to the last page via the last page button": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator when showing the first and last button should be able to go to the first page via the first page button": {
    "error": "TypeError: Cannot set property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator when showing the first and last button should disable navigating to the next page if at last page": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator when showing the first and last button should disable navigating to the previous page if at first page": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should mark for check when inputs are changed directly": {
    "error": "TypeError: Cannot set property 'length' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should show a sorted list of page size options including the current page size": {
    "error": "TypeError: Cannot read property '_displayedPageSizeOptions' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should be able to change the page size while keeping the first item present": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should keep track of the right number of pages": {
    "error": "TypeError: Cannot read property 'getNumberOfPages' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should show a select only if there are multiple options": {
    "error": "TypeError: Cannot read property '_displayedPageSizeOptions' of undefined",
    "notes": "Unknown"
  },
  "MatPaginator should handle the number inputs being passed in as strings": {
    "error": "TypeError: Cannot read property 'pageIndex' of undefined",
    "notes": "Unknown"
  },
  "MatTable with basic data source should be able to create a table with the right content and without when row": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with basic data source should create a table with special when row": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with basic data source should create a table with multiTemplateDataRows true": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable should be able to render a table correctly with native elements": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "MatTable should render with MatTableDataSource and sort": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable should render with MatTableDataSource and pagination": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable should apply custom sticky CSS class to sticky cells": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "MatTable should not throw when a row definition is on an ng-container": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'viewContainer' of undefined.",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should create table and display data source contents": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter changing data should update the table contents": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to filter the table contents": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should not match concatenated words": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to sort the table contents": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort an empty string": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort undefined values": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort zero correctly": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to page the table contents": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort strings with numbers larger than MAX_SAFE_INTEGER correctly": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should restore focus if active option is destroyed": {
    "error": "Error: Expected -1 to be 3.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should not attempt to focus the next option when the destroyed option was not focused": {
    "error": "Error: Expected -1 to be 3.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should focus and toggle the next item when pressing SHIFT + UP_ARROW": {
    "error": "Error: Expected -1 to be 3.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should focus next item when press DOWN ARROW": {
    "error": "Error: Expected 0 to equal 3.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should focus the last item when pressing END": {
    "error": "Error: Expected 2 to be 3.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should select all items using ctrl + a": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should select all items using ctrl + a if some items are selected": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatSelectionList without forms with list option should be able to jump focus down to an item by typing": {
    "error": "Error: Expected 1 to be 3.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should update the model if an option got selected programmatically": {
    "error": "Error: Expected 0 to be 1, 'Expected first list option to be selected'.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should update the model if an option got clicked": {
    "error": "Error: Expected 0 to be 1, 'Expected first list option to be selected'.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should remove a selected option from the value on destroy": {
    "error": "Error: Expected $.length = 0 to equal 2.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should update the model if an option got selected via the model": {
    "error": "Error: Expected $.length = 0 to equal 1.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should be able to programmatically set an array with duplicate values": {
    "error": "Error: Expected $[0] = false to equal true.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms preselected values should show the item as selected when preselected inside OnPush parent": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms with custom compare function should use a custom comparator to determine which options are selected": {
    "error": "Error: Expected spy comparator to have been called.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should revert the element back to its parent after dragging with a custom preview has stopped": {
    "error": "TypeError: Cannot read property 'clientRect' of undefined",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should not throw if the `touches` array is empty": {
    "error": "Error: 1 timer(s) still in the queue.",
    "notes": "Unknown"
  },
  "MatSelectionList with forms and ngModel should not dispatch the model change event if nothing changed using selectAll": {
    "error": "Error: Expected spy model change spy to have been called once. It was called 0 times.",
    "notes": "Unknown",
  }
};
// clang-format on

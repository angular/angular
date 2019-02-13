/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Blocklist of unit tests from angular/material2 with ivy that are skipped when running on
 * angular/angular. As bugs are resolved, items should be removed from this blocklist.
 *
 * The `notes` section should be used to keep track of specific issues associated with the failures.
 */

// clang-format off
// tslint:disable

window.testBlocklist = {
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Portals CdkPortalOutlet should be considered attached when attaching using `attachComponentPortal`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Portals CdkPortalOutlet should be considered attached when attaching using `attachTemplatePortal`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Portals CdkPortalOutlet should use the `ComponentFactoryResolver` from the portal, if available": {
    "error": "TypeError: Cannot read property 'attachComponentPortal' of undefined",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a component portal without a ViewContainerRef": {
    "error": "Error: Expected '<pizza-msg><p>Pizza</p><p>Chocolate</p></pizza-msg>' to be '', 'Expected the DomPortalOutlet to be empty after detach'.",
    "notes": "Unknown"
  },
  "AutofillMonitor should add monitored class and listener upon monitoring": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should not add multiple listeners to the same element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should remove monitored class and listener upon stop monitoring": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should stop monitoring all monitored elements upon destroy": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should emit and add filled class upon start animation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should emit and remove filled class upon end animation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should cleanup filled class if monitoring stopped in autofilled state": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should complete the stream when monitoring is stopped": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should emit on stream inside the NgZone": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AutofillMonitor should not emit on init if input is unfilled": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to create a message element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should not register empty strings": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to register multiple messages": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to unregister messages": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to unregister messages while having others registered": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to append to an existing list of aria describedby": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should be able to handle multiple regisitrations of the same message to an element": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "AriaDescriber should clear any pre-existing containers": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render initial state": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the data length": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the viewport size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered range": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content offset": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the scroll offset": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should get the rendered content size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should measure range size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set total content size in horizontal mode": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set a class based on the orientation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set the vertical class if an invalid orientation is set": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set rendered range": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to top of content": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should set content offset to bottom of content": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to offset in horizontal mode": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should scroll to index in horizontal mode": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should output scrolled index": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls down": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls up": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the end when scrolled to the top": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start and end when scrolled to the middle": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render buffer element at the start when scrolled to the bottom": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic buffer size": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should handle dynamic item array": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls right in horizontal mode": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should update viewport as user scrolls left in horizontal mode": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with an Observable": {
    "error": "TypeError: Cannot read property 'getRenderedRange' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should work with a DataSource": {
    "error": "TypeError: Cannot read property 'getRenderedRange' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy value by default": {
    "error": "Error: <spyOn> : could not find an object to spy upon for detach()",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should trackBy index when specified": {
    "error": "Error: <spyOn> : could not find an object to spy upon for detach()",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should recycle views when template cache is large enough to accommodate": {
    "error": "Error: <spyOn> : could not find an object to spy upon for createEmbeddedView()",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not recycle views when template cache is full": {
    "error": "Error: <spyOn> : could not find an object to spy upon for createEmbeddedView()",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should render up to maxBufferPx when buffer dips below minBufferPx": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx": {
    "error": "Error: Uncaught (in promise): TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should register and degregister with ScrollDispatcher": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should emit on viewChange inside the Angular zone": {
    "error": "TypeError: Cannot read property 'viewChange' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with FixedSizeVirtualScrollStrategy should not throw when disposing of a view that will not fit in the cache": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should initially be scrolled all the way right and showing the first item in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should scroll through items as user scrolls to the left in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should interpret scrollToOffset amount as an offset from the right in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should scroll to the correct index in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should emit the scrolled to index in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should set total content size": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with RTL direction should set total content size in horizontal mode": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render initial state for uniform items": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should render extra content if first item is smaller than average": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkVirtualScrollViewport with AutoSizeVirtualScrollStrategy should throw if maxBufferPx is less than minBufferPx": {
    "error": "Error: Uncaught (in promise): TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "CdkAccordion should not register nested items to the same accordion": {
    "error": "TypeError: Cannot read property 'accordion' of undefined",
    "notes": "Unknown"
  },
  "CdkTable in a typical simple use case should initialize with a connected data source": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should initialize with a rendered header with the right number of header cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should initialize with rendered rows with right number of row cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should initialize with column class names provided to header and data row cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should initialize with the right accessibility roles": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should disconnect the data source when table is destroyed": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should re-render the rows when the data changes": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should clear the `mostRecentCellOutlet` on destroy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data is heterogeneous": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should correctly use the differ to add/remove/move rows when the data contains multiple occurrences of the same object instance": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should clear the row view containers on destroy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should match the right table content with dynamic data": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable in a typical simple use case should be able to dynamically change the columns for header and rows": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should render no rows when the data is null": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to render multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Attempting to access content children before view is initialized"
  },
  "CdkTable should be able to render and change multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Attempting to access content children before view is initialized"
  },
  "CdkTable with different data inputs other than data source should render with data array input": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with different data inputs other than data source should render with data stream input": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with different data inputs other than data source should throw an error if the data source is not valid": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable missing row defs should be able to render without a header row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable missing row defs should be able to render without a data row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable missing row defs should be able to render without a footer row def": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should render correctly when using native HTML tags": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable should render cells even if row data is falsy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to apply class-friendly css class names for the column cells": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should not clobber an existing table role": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should throw an error if two column definitions have the same name": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should throw an error if a column definition is requested but not defined": {
    "error": "Error: Expected function to throw an exception with message 'Could not find column with id \"column_a\".', but it threw an exception with message 'Cannot read property 'viewContainer' of undefined'.",
    "notes": "Unknown"
  },
  "CdkTable should throw an error if the row definitions are missing": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should not throw an error if columns are undefined on initialization": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to dynamically add/remove column definitions": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to register column, row, and header row definitions outside content": {
    "error": "TypeError: Cannot read property 'addColumnDef' of undefined",
    "notes": "Unknown"
  },
  "CdkTable using when predicate should be able to display different row templates based on the row data": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable using when predicate should error if there is row data that does not have a matching row template": {
    "error": "Error: Expected function to throw an Error.",
    "notes": "Unknown"
  },
  "CdkTable using when predicate should fail when multiple rows match data without multiTemplateDataRows": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable using when predicate with multiTemplateDataRows should be able to render multiple rows per data object": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable using when predicate with multiTemplateDataRows should have the correct data and row indicies when data contains multiple instances of the same object instance": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick headers": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick footers": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick left columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick right columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should reverse directions for sticky columns in rtl": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on \"display: flex\" table style should stick and unstick combination of sticky header, footer, and columns": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick headers": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick footers": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with sticky positioning on native table layout should stick tfoot when all rows are stuck": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick left columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick right columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick combination of sticky header, footer, and columns": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "CdkTable with trackBy should add/remove/move rows with reference-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references without property-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references with property-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with trackBy should add/remove/move rows with changed references with index-based trackBy": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable with trackBy should change row implicit data even when trackBy finds no changes": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should match the right table content with dynamic data source": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to apply classes to rows based on their context": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTable should be able to apply classes to cells based on their row context": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkDrag standalone draggable should enable native drag interactions when there is a drag handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should not be able to drag the entire element if it has a handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should be able to drag an element using its handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should not be able to drag the element if the handle is disabled": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should not be able to drag using the handle if the element is disabled": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should be able to use a handle that was added after init": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should be able to use more than one handle to drag the element": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should be able to drag with a handle that is not a direct descendant": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should disable the tap highlight while dragging via the handle": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag draggable with a handle should preserve any existing `webkitTapHighlightColor`": {
    "error": "TypeError: Cannot read property 'removeEventListener' of null",
    "notes": "FW-1010: onDestroy hook is called twice for directives that are also used in a provider"
  },
  "CdkDrag in a drop container should be able to customize the preview element": {
    "error": "Error: Expected cdk-drag cdk-drag-preview to contain 'custom-preview'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should position custom previews next to the pointer": {
    "error": "Error: Expected 'translate3d(8px, 33px, 0px)' to be 'translate3d(50px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lock position inside a drop container along the x axis": {
    "error": "Error: Expected 'translate3d(58px, 33px, 0px)' to be 'translate3d(100px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should lock position inside a drop container along the y axis": {
    "error": "Error: Expected 'translate3d(8px, 83px, 0px)' to be 'translate3d(50px, 100px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should inherit the position locking from the drop container": {
    "error": "Error: Expected 'translate3d(58px, 33px, 0px)' to be 'translate3d(100px, 50px, 0px)'.",
    "notes": "Unknown"
  },
  "CdkDrag in a drop container should be able to customize the placeholder": {
    "error": "Error: Expected cdk-drag cdk-drag-placeholder to contain 'custom-placeholder'.",
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "CdkTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
  "MatButton should apply class based on color attribute": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "Unknown"
  },
  "MatButton should expose the ripple instance": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatButton should not clear previous defined classes": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button[mat-fab] should have accent palette by default": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button[mat-mini-fab] should have accent palette by default": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button[mat-button] should not increment if disabled": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button[mat-button] should disable the native button element": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton a[mat-button] should not redirect if disabled": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton a[mat-button] should remove tabindex if disabled": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton a[mat-button] should add aria-disabled attribute if disabled": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton a[mat-button] should not add aria-disabled attribute if disabled is false": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton a[mat-button] should be able to set a custom tabindex": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button ripples should disable the ripple if matRippleDisabled input is set": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatButton button ripples should disable the ripple when the button is disabled": {
    "error": "Error: Template error: Can't bind to 'disabled' since it isn't a known property of 'a'.",
    "notes": "FW-1037: Host bindings for host objects in metadata are inherited"
  },
  "MatTabHeader focusing should initialize to the selected index": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should send focus change event": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should not set focus a disabled tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should move focus right and skip disabled tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should move focus left and skip disabled tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should support key down events to move and select focus": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should move focus to the first tab when pressing HOME": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should skip disabled items when moving focus using HOME": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should move focus to the last tab when pressing END": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader focusing should skip disabled items when moving focus using END": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination ltr should show width when tab list width exceeds container": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination ltr should scroll to show the focused tab label": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination ltr should show ripples for pagination buttons": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination ltr should allow disabling ripples for pagination buttons": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination rtl should scroll to show the focused tab label": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination should re-align the ink bar when the direction changes": {
    "error": "TypeError: Cannot read property '_inkBar' of undefined",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should re-align the ink bar when the window is resized": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabHeader pagination should update arrows when the window is resized": {
    "error": "Error: <spyOn> : could not find an object to spy upon for _checkPaginationEnabled()",
    "notes": "Unknown"
  },
  "MatTabHeader pagination should update the pagination state if the content of the labels changes": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatChipList StandardChipList basic behaviors should toggle the chips disabled state based on whether it is disabled": {
    "error": "Error: Expected true to be false.",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors should focus the first chip on focus": {
    "error": "Error: Expected -1 to be 0.",
    "notes": "Unknown"
  },
  "MatChipList StandardChipList focus behaviors should watch for chip focus": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should focus the next item": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should focus the previous item": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList focus behaviors on chip destroy should not focus if chip list is not focused": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus previous item when press LEFT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus next item when press RIGHT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior LTR (default) should focus the first item when pressing HOME": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior RTL should focus previous item when press RIGHT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior RTL should focus next item when press LEFT ARROW": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatChipList StandardChipList keyboard behavior should account for the direction changing": {
    "error": "TypeError: Cannot read property 'focus' of undefined",
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
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
    "notes": "MatChipList does not find MatChip content children because descendants is not true anymore. TODO: Fix spec so that it does not have the wrapping div"
  },
  "MatStepper basic stepper should go to next available step when the next button is clicked": {
    "error": "Error: Expected 2 to be 1.",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should go to previous available step when the previous button is clicked": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should not set focus on header of selected step if header is not clicked": {
    "error": "Error: Expected 2 to be 1.",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should focus next step header if focus is inside the stepper": {
    "error": "Error: Expected 2 to be 1.",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should only be able to return to a previous step if it is editable": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should set the correct aria-posinset and aria-setsize": {
    "error": "Error: Expected $.length = 0 to equal 3.",
    "notes": "Unknown"
  },
  "MatStepper basic stepper should adjust the index when removing a step before the current one": {
    "error": "Error: Expected 2 to be 1.",
    "notes": "Unknown"
  },
  "MatStepper linear stepper should not move to next step if current step is pending": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in": {
    "error": "TypeError: Cannot read property 'hasAttribute' of null",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should set the aria-label attribute": {
    "error": "TypeError: Cannot read property 'getAttribute' of null",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should set the aria-labelledby attribute": {
    "error": "TypeError: Cannot read property 'getAttribute' of null",
    "notes": "Unknown"
  },
  "MatStepper aria labelling should not be able to set both an aria-label and aria-labelledby": {
    "error": "TypeError: Cannot read property 'getAttribute' of null",
    "notes": "Unknown"
  },
  "MatStepper stepper with error state should show error state": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatStepper stepper with error state should respect a custom falsy hasError value": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatStepper stepper using Material UI Guideline logic should show done state when step is completed and its not the current step": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatSlideToggle without forms custom action configuration should not change value on dragging when drag action is noop": {
    "error": "Error: Expected mat-slide-toggle-thumb-container to contain 'mat-dragging'.",
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
    "error": "Error: Expected <button class=\"ng-tns-c21113-0\">...</button> to be <button class=\"open\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer methods should not restore focus on close if focus is outside drawer": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDrawer attributes should bind 2-way bind on opened property": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"over\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c21408-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"push\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c21442-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should focus the drawer if there are no focusable elements": {
    "error": "Error: Expected <body style=\"\">...</body> to be <mat-drawer position=\"start\" mode=\"over\" class=\"ng-tns-c21510-1 mat-drawer ng-star-inserted ng-trigger ng-trigger-transform mat-drawer-over\" tabindex=\"-1\" style=\"transform: none; visibility: visible;\">...</mat-drawer>. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawerContainer should animate the content when a drawer is added at a later point": {
    "error": "Error: Expected NaN to be greater than 0.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if a drawer is destroyed": {
    "error": "Error: Expected NaN to be greater than 0.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if the drawer mode is changed": {
    "error": "Error: Expected NaN to be greater than 0.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if the direction has changed": {
    "error": "Error: Expected NaN to be greater than 0.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should recalculate the margin if a drawer changes size while open in autosize mode": {
    "error": "Error: Expected NaN to be greater than 0.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should not set a style property if it would be zero": {
    "error": "Error: Expected '' not to be '', 'Margin should be present when drawer is open'.",
    "notes": "Unknown"
  },
  "MatDrawerContainer should be able to explicitly enable the backdrop in `side` mode": {
    "error": "TypeError: Cannot set property 'mode' of undefined",
    "notes": "Unknown"
  },
  "MatSidenav should be fixed position when in fixed mode": {
    "error": "Error: Expected ng-tns-c21960-0 mat-drawer ng-trigger ng-trigger-transform mat-drawer-over ng-star-inserted to contain 'mat-sidenav-fixed'.",
    "notes": "Unknown"
  },
  "MatSidenav should set fixed bottom and top when in fixed mode": {
    "error": "Error: Expected '' to be '20px'.",
    "notes": "Unknown"
  },
  "MatSort should use the column definition if used within a cdk table": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSort should use the column definition if used within an mat table": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "Unknown"
  },
  "MatAccordion should ensure only one item is expanded at a time": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatAccordion should allow multiple items to be expanded simultaneously": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatAccordion should expand or collapse all enabled items": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatAccordion should not expand or collapse disabled items": {
    "error": "Error: Expected undefined to be truthy.",
    "notes": "Unknown"
  },
  "MatAccordion should not register nested panels to the same accordion": {
    "error": "TypeError: Cannot read property 'accordion' of undefined",
    "notes": "Unknown"
  },
  "MatExpansionPanel should toggle the panel when pressing SPACE on the header": {
    "error": "Error: <spyOn> : could not find an object to spy upon for toggle()",
    "notes": "Unknown"
  },
  "MatExpansionPanel should toggle the panel when pressing ENTER on the header": {
    "error": "Error: <spyOn> : could not find an object to spy upon for toggle()",
    "notes": "Unknown"
  },
  "MatExpansionPanel should not toggle if a modifier key is pressed": {
    "error": "Error: <spyOn> : could not find an object to spy upon for toggle()",
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatInput with textarea autosize should work in a step": {
    "error": "TypeError: Cannot read property 'getBoundingClientRect' of null",
    "notes": "Unknown"
  },
  "MatTabNavBar basic behavior should change active index on click": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should add the active class if active": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should toggle aria-current based on active state": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should add the disabled class if disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should update aria-disabled if disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should disable the ripples on all tabs when they are disabled on the nav bar": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should have the `disableRipple` from the tab take precendence over the nav bar": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should update the tabindex if links are disabled": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should make disabled links unclickable": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should show ripples for tab links": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should be able to disable ripples on a tab link": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the direction changes": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the tabs list change": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the tab labels change the width": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should re-align the ink bar when the window is resized": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabNavBar basic behavior should hide the ink bar when all the links are inactive": {
    "error": "TypeError: Cannot read property 'show' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should default to the first tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior will properly load content on first change detection pass": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should change selected index on click": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should support two-way binding for selectedIndex": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should set to correct tab on fast change": {
    "error": "Failed: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should change tabs based on selectedIndex": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should update tab positions when selected index is changed": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should clamp the selected index to the size of the number of tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should not crash when setting the selected index to NaN": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should show ripples for tab-group labels": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should allow disabling ripples for tab-group labels": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should set the isActive flag on each of the tabs": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should fire animation done event": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should add the proper `aria-setsize` and `aria-posinset`": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should emit focusChange event on click": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup basic behavior should emit focusChange on arrow key navigation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup aria labelling should not set aria-label or aria-labelledby attributes if they are not passed in": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup aria labelling should set the aria-label attribute": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup aria labelling should set the aria-labelledby attribute": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup aria labelling should not be able to set both an aria-label and aria-labelledby": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup disable tabs should have one disabled tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup disable tabs should set the disabled flag on tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should be able to add a new tab, select it, and have correct origin position": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should update selected index if the last tab removed while selected": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should maintain the selected tab if a new tab is added": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should maintain the selected tab if a tab is removed": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should be able to select a new tab after creation": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup dynamic binding tabs should not fire `selectedTabChange` when the amount of tabs changes": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup async tabs should show tabs when they are available": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup with simple api should support a tab-group with the simple api": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup with simple api should support @ViewChild in the tab content": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup with simple api should only have the active tab in the DOM": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup with simple api should support setting the header position": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup lazy loaded tabs should lazy load the second tab": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTabGroup special cases should not throw an error when binding isActive to the view": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "nested MatTabGroup with enabled animations should not throw when creating a component with nested tab groups": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'nativeElement' of undefined.",
    "notes": "Unknown"
  },
  "MatTree flat tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "Unknown"
  },
  "MatTree flat tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatGridList should throw error if rowHeight ratio is invalid": {
    "error": "Error: mat-grid-list: invalid ratio given for row-height: \"4:3:2\"",
    "notes": "Unknown"
  },
  "Dialog should open a dialog with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should open a dialog with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should emit when dialog opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should use injector from viewContainerRef for DialogInjector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should open a dialog with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should apply the configured role to the dialog element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should apply the specified `aria-describedby`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close a dialog and get back a result": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should only emit the afterCloseEvent once when closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close a dialog and get back a result before it is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close a dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close from a ViewContainerRef with OnPush change detection": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should notify the observers if all open dialogs have finished closing": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the min-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the max-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the min-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the max-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the top offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the bottom offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the left offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should override the right offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should allow for the position to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should allow for the dimensions to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should inject the correct layout direction in the component instance": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close all of the dialogs": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close all dialogs when the user goes forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close all open dialogs when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should have the componentInstance available in the afterClosed callback": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should close all open dialogs on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should complete the various lifecycle streams on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "Dialog should not keep a reference to the component after the dialog is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should assign a unique id to each dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should allow for the id to be overwritten": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should throw when trying to open a dialog with the same id as another dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog should be able to find a dialog by id": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog disableClose option should allow for the disableClose option to be updated while open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog panelClass option should have custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog focus management should focus the first tabbable element of the dialog on open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog focus management should re-focus trigger element when dialog closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog focus management should allow the consumer to shift focus in afterClosed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog focus management should move focus to the container if there are no focusable elements in the dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog aria-label should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog aria-label should not set the aria-labelledby automatically if it has an aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog with a parent Dialog should close dialogs opened by a parent when calling closeAll on a child Dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog with a parent Dialog should close dialogs opened by a child when calling closeAll on a parent Dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog with a parent Dialog should not close the parent dialogs, when a child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "Dialog with a parent Dialog should close the top dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
  "MatAutocomplete aria should set role of autocomplete panel to listbox": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "FW-1059: DebugNode.query should query nodes in the logical tree"
  },
  "MatAutocomplete aria should set aria-owns based on the attached autocomplete": {
    "error": "TypeError: Cannot read property 'nativeElement' of null",
    "notes": "FW-1059: DebugNode.query should query nodes in the logical tree"
  },
  "MatAutocomplete Option selection should handle `optionSelections` being accessed too early": {
    "error": "TypeError: Cannot read property 'autocomplete' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should open a bottom sheet with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should open a bottom sheet with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should position the bottom sheet at the bottom center of the screen": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should emit when the bottom sheet opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should use the correct injector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should open a bottom sheet with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should apply the correct role to the container element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should close a bottom sheet via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should inject the correct direction in the instantiated component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should be able to set a custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should be able to get dismissed through the service": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should dismiss the bottom sheet when the service is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should open a new bottom sheet after dismissing a previous sheet": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should remove past bottom sheets when opening new ones": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should not throw when opening multiple bottom sheet in quick succession": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatBottomSheet should remove bottom sheet if another is shown while its still animating open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should emit after being dismissed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should be able to pass a result back to the dismissed stream": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should close the bottom sheet when going forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should close the bottom sheet when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet should allow the consumer to disable closing a bottom sheet on navigation": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatBottomSheet disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet focus management should focus the bottom sheet container by default": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet focus management should focus the first tabbable element of the bottom sheet on open whenautoFocus is enabled": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet focus management should re-focus trigger element when bottom sheet closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet focus management should be able to disable focus restoration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by parent when opening from child": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet with parent MatBottomSheet should close bottom sheets opened by child when opening from parent": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet with parent MatBottomSheet should not close parent bottom sheet when child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet with default options should use the provided defaults": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatBottomSheet with default options should be overridable by open() options": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker touch should open dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should not be able to open more than one dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker should open datepicker if opened input is set to true": {
    "error": "Error: Expected null not to be null.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker close should close dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker setting selected via click should update input and close calendar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker setting selected via enter press should update input and close calendar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule standard datepicker input should aria-owns calendar after opened in touch mode": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should update datepicker when formControl changes": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should update formControl when date is selected": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should disable input when form control disabled": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with formControl should disable toggle when form control disabled": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set `aria-haspopup` on the toggle button": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should open calendar when toggle clicked": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if datepicker is disabled": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should not open calendar when toggle clicked if input is disabled": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should set the `button` type on the trigger to prevent form submissions": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should remove the underlying SVG icon from the tab order": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should restore focus to the toggle after the calendar is closed": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should re-render when the i18n labels change": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should toggle the active state of the datepicker toggle": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with custom mat-datepicker-toggle icon should be able to override the mat-datepicker-toggle icon": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward the tabindex to the underlying button": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should clear the tabindex from the mat-datepicker-toggle host": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with tabindex on mat-datepicker-toggle should forward focus to the underlying button when the host is focused": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
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
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is before min": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should mark invalid when value is after max": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals min": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value equals max": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with min and max dates and validation should not mark invalid when value is between min and max": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with filter and validation should mark input invalid": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with filter and validation should disable filtered calendar cells": {
    "error": "Error: Template error: Can't bind to 'htmlFor' since it isn't a known property of 'mat-datepicker-toggle'.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with change and input events should fire dateChange and dateInput events when user selects calendar date": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule datepicker directionality should pass along the directionality to the dialog in touch mode": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should open a dialog with a component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should open a dialog with a template": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should emit when dialog opening animation is complete": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should use injector from viewContainerRef for DialogInjector": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should open a dialog with a component and no ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should apply the configured role to the dialog element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should apply the specified `aria-describedby`": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close a dialog and get back a result": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should dispatch the beforeClose and afterClose events when the overlay is detached externally": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close a dialog and get back a result before it is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close a dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close from a ViewContainerRef with OnPush change detection": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should emit the backdropClick stream when clicking on the overlay backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should emit the keyboardEvent stream when key events target the overlay": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should notify the observers if all open dialogs have finished closing": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the min-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the max-width of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the min-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the max-height of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the top offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the bottom offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the left offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should override the right offset of the overlay pane": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should allow for the position to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should allow for the dimensions to be updated": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should reset the overlay dimensions to their initial size": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should allow setting the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should inject the correct layout direction in the component instance": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should fall back to injecting the global direction if none is passed by the config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close all of the dialogs": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close all dialogs when the user goes forwards/backwards in history": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close all open dialogs when the location hash changes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should close all of the dialogs when the injectable is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should allow the consumer to disable closing a dialog on navigation": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should have the componentInstance available in the afterClosed callback": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should be able to attach a custom scroll strategy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog passing in data should be able to pass in data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog passing in data should default to null if no data is passed": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'hasAttached' of undefined.",
    "notes": "Unknown"
  },
  "MatDialog should not keep a reference to the component after the dialog is closed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should assign a unique id to each dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should allow for the id to be overwritten": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should throw when trying to open a dialog with the same id as another dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should be able to find a dialog by id": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should toggle `aria-hidden` on the overlay container siblings": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should restore `aria-hidden` to the overlay container siblings on close": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should not set `aria-hidden` on `aria-live` elements": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog disableClose option should prevent closing via clicks on the backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog disableClose option should prevent closing via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog disableClose option should allow for the disableClose option to be updated while open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog hasBackdrop option should have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog hasBackdrop option should not have a backdrop": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog panelClass option should have custom panel class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog backdropClass option should have default backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog backdropClass option should have custom backdrop class": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should focus the first tabbable element of the dialog on open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should allow disabling focus of the first tabbable element": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should re-focus trigger element when dialog closes": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should allow the consumer to shift focus in afterClosed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should move focus to the container if there are no focusable elements in the dialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog focus management should be able to disable focus restoration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should close the dialog when clicking on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should allow for a user-specified aria-label on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should override the \"type\" attribute of the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should return the [mat-dialog-close] result when clicking the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside component dialog should set the aria-labelledby attribute to the id of the title": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should close the dialog when clicking on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should allow for a user-specified aria-label on the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should override the \"type\" attribute of the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should return the [mat-dialog-close] result when clicking the close button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog dialog content elements inside template portal should set the aria-labelledby attribute to the id of the title": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog aria-label should be able to set a custom aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog aria-label should not set the aria-labelledby automatically if it has an aria-label": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with a parent MatDialog should close dialogs opened by a parent when calling closeAll on a child MatDialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with a parent MatDialog should close dialogs opened by a child when calling closeAll on a parent MatDialog": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with a parent MatDialog should close the top dialog via the escape key": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with a parent MatDialog should not close the parent dialogs when a child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with default options should use the provided defaults": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog with default options should be overridable by open() options": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatMenu should open a custom menu": {
    "error": "Error: Expected function not to throw an Error, but it threw TypeError.",
    "notes": "Unknown"
  },
  "MatMenu should close the menu when using the CloseScrollStrategy": {
    "error": "TypeError: Cannot read property 'openMenu' of undefined",
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
  "MatMenu nested menu should toggle a nested menu when its trigger is hovered": {
    "error": "Error: Expected mat-menu-item mat-menu-item-submenu-trigger ng-tns-c56347-0 cdk-focused cdk-program-focused to contain 'mat-menu-item-highlighted', 'Expected the trigger to be highlighted'.",
    "notes": "Unknown"
  },
  "MatMenu nested menu should close all the open sub-menus when the hover state is changed at the root": {
    "error": "TypeError: Cannot read property 'dispatchEvent' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should close submenu when hovering over disabled sibling item": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatMenu nested menu should not open submenu when hovering over disabled trigger": {
    "error": "TypeError: Cannot read property 'componentInstance' of null",
    "notes": "Unknown"
  },
  "MatMenu nested menu should toggle a nested menu when its trigger is added after init": {
    "error": "Error: Expected mat-menu-item mat-menu-item-submenu-trigger ng-star-inserted to contain 'mat-menu-item-highlighted', 'Expected the trigger to be highlighted'.",
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
  "MatSelect core overlay panel should not throw when attempting to open too early": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'open' of undefined.",
    "notes": "Unknown"
  },
  "MatSelect core selection logic should handle accessing `optionSelectionChanges` before the options are initialized": {
    "error": "TypeError: Cannot read property 'options' of undefined",
    "notes": "Unknown"
  },
  "MatSelect core keyboard scrolling should skip option group labels": {
    "error": "ObjectUnsubscribedError: object unsubscribed",
    "notes": "Unknown"
  },
  "MatSelect when the select's value is accessed on initialization should not throw when trying to access the selected value on init": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'selected' of undefined.",
    "notes": "Unknown"
  },
  "MatSelect with custom value accessor should support use inside a custom value accessor": {
    "error": "Error: <spyOn> : could not find an object to spy upon for writeValue()",
    "notes": "Unknown"
  },
  "MatSelect with custom trigger should allow the user to customize the label": {
    "error": "TypeError: Cannot read property 'selected' of undefined",
    "notes": "Unknown"
  },
  "MatSnackBar should have the role of `alert` with an `assertive` politeness if no announcement message is provided": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should have the role of `status` with an `assertive` politeness if an announcement message is provided": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should have the role of `status` with a `polite` politeness": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should remove the role if the politeness is turned off": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should open and close a snackbar without a ViewContainerRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should open a simple message with a button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should open a simple message with no button": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should dismiss the snack bar and remove itself from the view": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should default to the passed message for the announcement message": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should be able to specify a custom announcement message": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should be able to get dismissed through the service": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should clean itself up when the view container gets destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should set the animation state to visible on entry": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should set the animation state to complete on exit": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should set the old snack bar animation state to complete and the new snack bar animation\n      state to visible on entry of new snack bar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should open a new snackbar after dismissing a previous snackbar": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should remove past snackbars when opening new snackbars": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should remove snackbar if another is shown while its still animating open": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should dismiss the snackbar when the action is called, notifying of both action and dismiss": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should allow manually dismissing with an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should indicate in `afterClosed` whether it was dismissed by an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should complete the onAction stream when not closing via an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should dismiss automatically after a specified timeout": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should clear the dismiss timeout when dismissed before timeout expiration": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should add extra classes to the container": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should set the layout direction": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should be able to override the default config": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar should dismiss the open snack bar on destroy": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with custom component should open a custom component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with custom component should inject the snack bar reference into the component": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with custom component should be able to inject arbitrary user data": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with custom component should allow manually dismissing with an action": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with TemplateRef should be able to open a snack bar using a TemplateRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with TemplateRef should be able to pass in contextual data when opening with a TemplateRef": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with parent MatSnackBar should close snackBars opened by parent when opening from child": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with parent MatSnackBar should close snackBars opened by child when opening from parent": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar with parent MatSnackBar should not dismiss parent snack bar if child is destroyed": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should default to bottom center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the bottom left corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the bottom right corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the bottom center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the top left corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the top right corner": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should be in the top center": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should handle start based on direction (rtl)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should handle start based on direction (ltr)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should handle end based on direction (rtl)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatSnackBar Positioning should handle end based on direction (ltr)": {
    "error": "TypeError: Cannot read property 'hasAttached' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
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
  "MatCalendar standard calendar should emit the selected year on cell clicked in multiyear view": {
    "error": "TypeError: Cannot read property 'getFullYear' of undefined",
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
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with basic data source should create a table with special when row": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with basic data source should create a table with multiTemplateDataRows true": {
    "error": "TypeError: Cannot read property 'viewContainer' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable should be able to render a table correctly with native elements": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "MatTable should render with MatTableDataSource and sort": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable should render with MatTableDataSource and pagination": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable should apply custom sticky CSS class to sticky cells": {
    "error": "TypeError: Cannot read property 'elementRef' of undefined",
    "notes": "FW-856: Attempting to access content children before view is initialized"
  },
  "MatTable should not throw when a row definition is on an ng-container": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'diff' of undefined.",
    "notes": "Unknown"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should create table and display data source contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter changing data should update the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to filter the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should not match concatenated words": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to sort the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort an empty string": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort undefined values": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort zero correctly": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to page the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort strings with numbers larger than MAX_SAFE_INTEGER correctly": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1019: Design new API to replace static queries"
  }
};
// clang-format on
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
  "Portals CdkPortalOutlet should not clear programmatically-attached portals on init": {
    "error": "ObjectUnsubscribedError: object unsubscribed",
    "notes": "Unknown"
  },
  "Portals DomPortalOutlet should attach and detach a component portal without a ViewContainerRef": {
    "error": "Error: Expected '<pizza-msg><p>Pizza</p><p>Chocolate</p></pizza-msg>' to be '', 'Expected the DomPortalOutlet to be empty after detach'.",
    "notes": "Unknown"
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
  "CdkTable should be able to render multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Attempting to access content children before view is initialized"
  },
  "CdkTable should be able to render and change multiple header and footer rows": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Attempting to access content children before view is initialized"
  },
  "CdkTable should render correctly when using native HTML tags": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick headers": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick footers": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick tfoot when all rows are stuck": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick left columns": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick right columns": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with sticky positioning on native table layout should stick and unstick combination of sticky header, footer, and columns": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "CdkTable with trackBy should change row implicit data even when trackBy finds no changes": {
    "error": "Error: Expected 'a_1 b_1' to be 'a_2 b_2'.",
    "notes": "Unknown"
  },
  "CdkTable should be able to apply classes to rows based on their context": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "CdkTable should be able to apply classes to cells based on their row context": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "CdkTree flat tree should initialize should be able to use units different from px for the indentation": {
    "error": "Error: Failed: Expected node level to be 15rem but was 28px",
    "notes": "Unknown"
  },
  "CdkTree flat tree should initialize should default to px if no unit is set for string value indentation": {
    "error": "Error: Failed: Expected node level to be 17px but was 28px",
    "notes": "Unknown"
  },
  "CdkTree flat tree with toggle should expand/collapse the node": {
    "error": "Error: Failed: Expected node level to be 40px but was ",
    "notes": "Unknown"
  },
  "CdkTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "Error: Failed: Expected node level to be 40px but was ",
    "notes": "Unknown"
  },
  "CdkTree flat tree with trackBy should add/remove/move nodes with property-based trackBy": {
    "error": "Error: Expected null to be '1'.",
    "notes": "Unknown"
  },
  "CdkTree flat tree with trackBy should add/remove/move nodes with index-based trackBy": {
    "error": "Error: Expected null to be '0'.",
    "notes": "Unknown"
  },
  "CdkTree nested tree with toggle should expand/collapse the node multiple times": {
    "error": "Error: Expected 3 to be 1, 'Expect node expanded'.",
    "notes": "Unknown"
  },
  "CdkTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "Error: Failed: Expected node descendant num to be 2 but was 0",
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
    "error": "Error: Expected <button class=\"ng-tns-c22565-0\">...</button> to be <button class=\"open\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer attributes should bind 2-way bind on opened property": {
    "error": "Error: Expected false to be true.",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"over\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c22860-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should trap focus when opened in \"push\" mode": {
    "error": "Error: Expected <input type=\"text\" class=\"input2\"> to be <input type=\"text\" class=\"input1 ng-tns-c22894-0\">. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
    "notes": "Unknown"
  },
  "MatDrawer focus trapping behavior should focus the drawer if there are no focusable elements": {
    "error": "Error: Expected <body style=\"\">...</body> to be <mat-drawer position=\"start\" mode=\"over\" class=\"ng-tns-c22962-1 mat-drawer ng-star-inserted ng-trigger ng-trigger-transform mat-drawer-over\" tabindex=\"-1\" style=\"transform: none; visibility: visible;\">...</mat-drawer>. Tip: To check for deep equality, use .toEqual() instead of .toBe().",
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
    "error": "Error: Expected ng-tns-c23412-0 mat-drawer ng-trigger ng-trigger-transform mat-drawer-over ng-star-inserted to contain 'mat-sidenav-fixed'.",
    "notes": "Unknown"
  },
  "MatSidenav should set fixed bottom and top when in fixed mode": {
    "error": "Error: Expected '' to be '20px'.",
    "notes": "Unknown"
  },
  "MatSort should use the column definition if used within an mat table": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTree flat tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree flat tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree flat tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree flat tree with undefined or null children should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree nested tree with undefined or null children should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree nested tree should initialize with rendered dataNodes": {
    "error": "TypeError: Cannot read property 'classList' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree nested tree with toggle should expand/collapse the node": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatTree nested tree with toggle should expand/collapse the node recursively": {
    "error": "TypeError: Cannot read property 'click' of undefined",
    "notes": "FW-1081: Static host classes don't work if component has superclass with host classes"
  },
  "MatGridList should throw error if rowHeight ratio is invalid": {
    "error": "Error: mat-grid-list: invalid ratio given for row-height: \"4:3:2\"",
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
  "MatAccordion should not register nested panels to the same accordion": {
    "error": "TypeError: Cannot read property 'accordion' of undefined",
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
  "MatInput with textarea autosize should work in a step": {
    "error": "TypeError: Cannot read property 'getBoundingClientRect' of null",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should change selected index on click": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should support two-way binding for selectedIndex": {
    "error": "TypeError: ctx_r16151._handleClick is not a function",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should fire animation done event": {
    "error": "TypeError: ctx_r16547._handleClick is not a function",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should emit focusChange event on click": {
    "error": "Error: Expected spy handleFocus to have been called once. It was called 0 times.",
    "notes": "Unknown"
  },
  "MatTabGroup basic behavior should emit focusChange on arrow key navigation": {
    "error": "Error: Expected spy handleFocus to have been called once. It was called 0 times.",
    "notes": "Unknown"
  },
  "MatTabGroup lazy loaded tabs should lazy load the second tab": {
    "error": "TypeError: ctx_r17471._handleClick is not a function",
    "notes": "Unknown"
  },
  "Dialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'componentInstance' of null",
    "notes": "FW-1059: DebugNode.query should query nodes in the logical tree"
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
  "MatBottomSheet should position the bottom sheet at the bottom center of the screen": {
    "error": "Error: Expected 511 to be 512.",
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
  "MatDatepicker with MatNativeDateModule standard datepicker should open datepicker if opened input is set to true": {
    "error": "Error: Expected null not to be null.",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with mat-datepicker-toggle should toggle the active state of the datepicker toggle": {
    "error": "Error: this._portalOutlet is undefined.",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should pass the form field theme color to the overlay": {
    "error": "TypeError: Cannot read property 'classList' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker inside mat-form-field should prefer the datepicker color over the form field one": {
    "error": "TypeError: Cannot read property 'classList' of null",
    "notes": "Unknown"
  },
  "MatDatepicker with MatNativeDateModule datepicker with filter and validation should disable filtered calendar cells": {
    "error": "Error: this._portalOutlet is undefined.",
    "notes": "FW-1019: Design new API to replace static queries"
  },
  "MatDialog should set the proper animation states": {
    "error": "TypeError: Cannot read property 'componentInstance' of null",
    "notes": "FW-1059: DebugNode.query should query nodes in the logical tree"
  },
  "MatDialog dialog content elements inside component dialog should close the dialog when clicking on the close button": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
  },
  "MatDialog dialog content elements inside component dialog should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
  },
  "MatDialog dialog content elements inside template portal should close the dialog when clicking on the close button": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
  },
  "MatDialog dialog content elements inside template portal should not close if [mat-dialog-close] is applied on a non-button node": {
    "error": "Error: Expected 0 to be 1.",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
  },
  "MatDialog dialog content elements inside template portal should return the [mat-dialog-close] result when clicking the close button": {
    "error": "Uncaught TypeError: Cannot read property 'close' of null thrown",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
  },
  "MatDialog dialog content elements inside template portal should set the aria-labelledby attribute to the id of the title": {
    "error": "Error: Expected null to be 'mat-dialog-title-12', 'Expected the aria-labelledby to match the title id.'.",
    "notes": "FW-1097: Static host classes and styles don't work on root component"
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
  "MatMenu nested menu should close submenu when hovering over disabled sibling item": {
    "error": "TypeError: Cannot read property 'nativeElement' of undefined",
    "notes": "Unknown"
  },
  "MatMenu nested menu should not open submenu when hovering over disabled trigger": {
    "error": "TypeError: Cannot read property 'componentInstance' of null",
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
  "MatSnackBar with TemplateRef should be able to open a snack bar using a TemplateRef": {
    "error": "Error: Expected ' Fries Pizza  ' to contain 'Pasta'.",
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
  "MatCalendar calendar with min and max date should update the minDate in the child view if it changed after an interaction": {
    "error": "Error: This PortalOutlet has already been disposed",
    "notes": "Unknown"
  },
  "MatTable with basic data source should be able to create a table with the right content and without when row": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with basic data source should create a table with special when row": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with basic data source should create a table with multiTemplateDataRows true": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable should be able to render a table correctly with native elements": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "MatTable should render with MatTableDataSource and sort": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable should render with MatTableDataSource and pagination": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable should apply custom sticky CSS class to sticky cells": {
    "error": "Error: Missing definitions for header, footer, and row; cannot determine which columns should be rendered.",
    "notes": "Unknown"
  },
  "MatTable should not throw when a row definition is on an ng-container": {
    "error": "Error: Expected function not to throw, but it threw TypeError: Cannot read property 'diff' of undefined.",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should create table and display data source contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter changing data should update the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to filter the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should not match concatenated words": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to sort the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort an empty string": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should by default correctly sort undefined values": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort zero correctly": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should be able to page the table contents": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  },
  "MatTable with MatTableDataSource and sort/pagination/filter should sort strings with numbers larger than MAX_SAFE_INTEGER correctly": {
    "error": "TypeError: Cannot read property 'diff' of undefined",
    "notes": "FW-1082: ngOnChanges hooks aren't inherited from grand-superclasses"
  }
};
// clang-format on

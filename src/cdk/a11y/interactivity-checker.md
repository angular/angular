### InteractivityChecker
`InteractivityChecker` is used to check the interactivity of an element, capturing disabled,
visible, tabbable, and focusable states for accessibility purposes.

#### Methods

##### `isDisabled(element: HTMLElement): boolean` 
Whether the given element is disabled.

##### `isVisible(element: HTMLElement): boolean` 
Whether the given element is visible. 

This will capture states like `display: none` and `visibility: hidden`,
but not things like being clipped by an `overflow: hidden` parent or being outside the viewport.

##### `isFocusable(element: HTMLElement): boolean` 
Gets whether an element can be focused by the user.

##### `isTabbable(element: HTMLElement): boolean` 
Gets whether an element can be reached via Tab key. 
Assumes that the element has already been checked with isFocusable.

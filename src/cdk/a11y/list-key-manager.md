### ListKeyManager
`ListKeyManager` manages the focus in a list of items based on keyboard interaction. Intended to be
used with components that correspond to a `role="menu"` or `role="listbox"` pattern.

#### Properties

##### `activeItemIndex`
Index of the currently active item

##### `activeItem`
The active item

#### `tabOut`
Observable that emits any time the <kbd>Tab</kbd> key is pressed, so components can react when
focus is shifted off of the list.

#### Methods

##### `withWrap(): this`
Turns on wrapping mode, which ensures that the active item will wrap to
the other end of list when there are no more items in the given direction.

##### `setActiveItem(index: number): void` 
Sets the active item to the item at the index specified.

##### `onKeydown(event: KeyboardEvent): void` 
Sets the active item depending on the key event passed in.

##### `setFirstItemActive(): void` 
Sets the active item to the first enabled item in the list.

##### `setLastItemActive(): void` 
Sets the active item to the last enabled item in the list.

##### `setNextItemActive(): void` 
Sets the active item to the next enabled item in the list.

##### `setPreviousItemActive(): void` 
Sets the active item to a previous enabled item in the list.


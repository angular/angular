# md-button

`md-button` is an HTML `<button>` or `<a>` tag enhanced with styling and animation to match the
[Material Design button spec](https://www.google.com/design/spec/components/buttons.html).

Users should employ a button element (`<button>`) when clicking triggers some action in the current
view *without navigating*. An anchor element (`<a>`) should be used when clicking *navigates*
the user to another URL. Depending on which element is used, the component will either be an
instance of `MdButton` or `MdAnchor`. Visually, the two are identical.


### Button types

There are five types of buttons:
 1. Flat buttons - `md-button`
    * Rectangular button
    * Defaults to white background
    * No box shadow
 2. Raised buttons - `md-raised-button`
    * Rectangular button
    * Defaults to white background
    * Box shadow applied
 3. Icon buttons - `md-icon-button`
    * Circular button
    * Transparent background
    * 40 by 40 px
 4. Floating Action Buttons (FABs) - `md-fab`
    * Circular button
    * Defaults background to "accent" palette defined in theme
    * Box shadow applied
    * 56 by 56 px
 5. Mini Floating Action Buttons (Mini FABs) - `md-mini-fab`
    * Circular button
    * Defaults background to "accent" palette defined in theme
    * Box shadow applied
    * 40 by 40 px

Each is an attribute directive that you can add to a `button` or `a` tag.  You can provide custom content to the button by inserting it
between the tags, as you would with a normal button.

Example:

 ```html
<button md-button>FLAT</button>
<button md-raised-button>RAISED</button>
<button md-icon-button>
    <md-icon class="md-24">favorite</md-icon>
</button>
<button md-fab>
    <md-icon class="md-24">add</md-icon>
</button>
<button md-mini-fab>
    <md-icon class="md-24">add</md-icon>
</button>
 ```

Output:

<img src="https://material.angularjs.org/material2_assets/buttons/basic-buttons.png">

### Theming

All button types can be themed to match your "primary" palette, your "accent" palette, or your "warn" palette using the `color` attribute.
Simply pass in the palette name.

In flat buttons, the palette chosen will affect the text color, while in other buttons, it affects the background.

Example:

 ```html
<button md-raised-button color="primary">PRIMARY</button>
<button md-raised-button color="accent">ACCENT</button>
<button md-raised-button color="warn">WARN</button>
 ```

Output:

<img src="https://material.angularjs.org/material2_assets/buttons/colored-buttons.png">

### Disabling

You can disable any button type through the native `disabled` property.  You can add it directly, or bind it to a property on your
component class by adding `[disabled]="isDisabled"` given that the `isDisabled`
property exists.

```html
<button md-button disabled>OFF</button>
<button md-raised-button [disabled]="isDisabled">OFF</button>
<button md-mini-fab [disabled]="isDisabled"><md-icon>check</md-icon></button>
```

Output:

<img src="https://material.angularjs.org/material2_assets/buttons/disabled-buttons.png">

### Accessibility

 * In high contrast mode, a strong border is added to the button to make it easier to see.
 * Button focus events originating from the keyboard will retain focus styles, while button focus events from the mouse will not.
 * As `md-button` is added to an existing `button` or `a` tag, it enjoys all the accessibility natively built into these elements.


### Upcoming work

We will also be adding ink ripples to buttons in an upcoming milestone.

### API Summary

Properties:

| Name | Type | Description |
| --- | --- | --- |
| `color` | `"primary"|"accent"|"warn"` | The color palette of the button
| `disabled` | boolean | Whether or not the button is disabled
| `disableRipple` | boolean | Whether the ripple effect when the button is clicked should be disabled

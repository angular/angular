Angular Material buttons are native `<button>` or `<a>` elements enhanced with Material Design
styling and ink ripples.

<!-- example(button-overview) -->

Native `<button>` and `<a>` elements are always used in order to provide the most straightforward
and accessible experience for users. A `<button>` element should be used whenever some _action_
is performed. An `<a>` element should be used whenever the user will _navigate_ to another view.


There are five button variants, each applied as an attribute:

| Attribute          | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `mat-button`        | Rectangular button w/ no elevation.                                         |
| `mat-raised-button` | Rectangular button w/ elevation                                             |
| `mat-icon-button`   | Circular button with a transparent background, meant to contain an icon     |
| `mat-fab`           | Circular button w/ elevation, defaults to theme's accent color              |
| `mat-mini-fab`      | Same as `mat-fab` but smaller                                                |


### Theming
Buttons can be colored in terms of the current theme using the `color` property to set the
background color to `primary`, `accent`, or `warn`. By default, only FABs (Floating Action Button) 
are colored; the default background color for `mat-button` and `mat-raised-button` matches the theme's 
background color.

### Capitalization
According to the Material design spec button text has to be capitalized, however we have opted not
to capitalize buttons automatically via `text-transform: uppercase`, because it can cause issues in
certain locales. It is also worth noting that using ALL CAPS in the text itself causes issues for
screen-readers, which will read the text character-by-character. We leave the decision of how to
approach this to the consuming app.

### Accessibility
Angular Material uses native `<button>` and `<a>` elements to ensure an accessible experience by
default. The `<button>` element should be used for any interaction that _performs an action on the
current page_. The `<a>` element should be used for any interaction that _navigates to another
view_.

Buttons or links containing only icons (such as `mat-fab`, `mat-mini-fab`, and `mat-icon-button`) should
be given a meaningful label via `aria-label` or `aria-labelledby`.

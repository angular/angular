# Customizing Angular Material component styles

Angular Material supports customizing component styles via Sass API as described in the [theming
guide][]. This document provides guidance on defining custom CSS rules that directly style
Angular Material components.

[theming guide]: https://material.angular.io/guide/theming

## Targeting custom styles

### Component host elements

For any Angular Material component, you can safely define custom CSS for a component's host element
that affect the positioning or layout of that component, such as `margin`, `position`, `top`,
`left`, `transform`, and `z-index`. You should apply such styles by defining a custom CSS
class and applying that class to the component's host element.

Avoid defining custom styles that would affect the size or internal layout of the component, such as
`padding`, `height`, `width`, or `overflow`. You can specify `display: none` to hide a component,
but avoid specifying any other `display` value. Overriding these properties can break components
in unexpected ways as the internal styles change between releases.

### Internal component elements

Avoid any custom styles or overrides on internal elements within a Angular Material components.
The DOM structure and CSS classes applied for each component may change at any time, causing custom
styles to break.

## Applying styles to Angular Material components

While Angular Material does not support defining custom styles or CSS overrides on components'
internal elements, you might choose to do this anyway. There are three points to consider while
customizing styles for Angular Material components: view encapsulation, CSS specificity, and
rendering location.

### View encapsulation

By default, Angular scopes component styles to exclusively affect that component's view. This means
that the styles you author affect only the elements directly within your component template.
Encapsulated styles do *not* affect elements that are children of other components within your
template. You can read more about view encapsulation in the
[Angular documentation](https://angular.io/guide/component-styles#view-encapsulation). You may
also wish to review
[_The State of CSS in Angular_](https://blog.angular.io/the-state-of-css-in-angular-4a52d4bd2700)
on the Angular blog.

#### Bypassing encapsulation

Angular Material disables style encapsulation for all components in the library. However, the
default style encapsulation in your own components still prevents custom styles from leaking into
Angular Material components.

If your component enables view encapsulation, your component styles will only
affect the elements explicitly defined in your template. To affect descendants of components used
in your template, you can use one of the following approaches:

1. Define custom styles in a global stylesheet declared in the `styles` array of your `angular.json`
configuration file.
2. Disable view encapsulation for your component. This approach effectively turns your component
styles into global CSS.
3. Apply the deprecated `::ng-deep` pseudo-class to a CSS rule. Any CSS rule with `::ng-deep`
becomes a global style. [See the Angular documentation for more on `::ng-deep`][ng-deep].

All of these approaches involve creating global CSS that isn't affected by style encapsulation.
Global CSS affects all elements in your application. Global CSS class names may collide with class
names defined by components. Global CSS is often a source of hard-to-diagnose bugs and is generally
difficult to maintain.

[ng-deep]: https://angular.io/guide/component-styles#deprecated-deep--and-ng-deep

### CSS specificity

Each CSS declaration has a level of *specificity* based on the type and number of selectors used.
More specific styles take precedence over less specific styles. Angular Material generally attempts
to use the least specific selectors possible. However, Angular Material may change component style
specificity at any time, making custom overrides brittle and prone to breaking.

You can read more about specificity and how it is calculated on the
[MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity).

### Rendering location

Some Angular Material components render elements that are not direct DOM descendants of the
component's host element. In particular, overlay-based components such as `MatDialog`, `MatMenu`,
`MatTooltip`, etc. render into an overlay container element directly on the document body. Because
these components render elements outside of your application's components, component-specific styles
will not apply to these elements. You can define styles for these elements as global styles.

#### Styling overlay components

Overlay-based components have a `panelClass` property, or similar, that let you target the
overlay pane. The following example shows how to add an `outline` style with `MatDialog`.

```scss
// Add this to your global stylesheet after including theme mixins.
.my-outlined-dialog {
  outline: 2px solid purple;
}
```

```ts
this.dialog.open(MyDialogComponent, {panelClass: 'my-outlined-dialog'})
```

You should always apply an application-specific prefix to global CSS classes to avoid naming
collisions.

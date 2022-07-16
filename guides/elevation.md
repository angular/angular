# Applying Elevation

[The Material Design specification][material-elevation] gives guidance on expressing elevation on
UI elements by adding shadows. Angular Material provides CSS classes and Sass mixins for adding
these shadows.

[material-elevation]: https://material.io/design/environment/elevation.html

## Elevation CSS classes

The `core-theme` Sass mixin, described in the [theming guide][theming-guide], emits CSS classes for applying
elevation. These classes follow the pattern `mat-elevation-z#`, where `#` is the elevation number
you want, from 0 to 24. These predefined classes use the CSS `box-shadow` settings defined by the
Material Design specification.

You can dynamically change elevation on an element by swapping elevation CSS classes.

```html
<div [class.mat-elevation-z2]="!isActive" [class.mat-elevation-z8]="isActive"></div>
```

<!-- example(elevation-overview) -->

[theming-guide]: https://material.angular.io/guide/theming#applying-a-theme-to-components

## Elevation Sass mixins

In addition to the predefined CSS classes, you can apply elevation styles using the `elevation`
Sass mixin. This mixin accepts a `$zValue` and an optional `$color`. The `$zValue` is a number from
0 to 24, representing the semantic elevation of the element, that controls the intensity of the
box-shadow. You can use the `$color` parameter to further customize the shadow appearance.

```scss
@use '@angular/material' as mat;

.my-class-with-default-shadow {
  // Adds a shadow for elevation level 2 with default color and full opacity:
  @include mat.elevation(2);
}

.my-class-with-custom-shadow {
  // Adds a shadow for elevation level 2 with color #e91e63 and 80% of the default opacity:
  @include mat.elevation(2, #e91e63, 0.8);
}
```

### Overridable elevation

When authoring a component, you may want to specify a default elevation that the component consumer
can override. You can accomplish this by using the `overridable-elevation` Sass mixin. This behaves
identically to the `elevation` mixin, except that the styles only apply when the element does not
have a CSS class matching the pattern `mat-elevation-z#`, as described in
[Elevation CSS classes](#elevation-css-classes) above.

### Animating elevation

You can use the `elevation-transition` mixin to add a transition when elevation changes.

```scss
@use '@angular/material' as mat;

.my-class {
  @include mat.elevation-transition();
  @include mat.elevation(2);

  &:active {
    @include mat.elevation(8);
  }
}
```

Angular Material's elevation classes and mixins allow you to add separation between elements along
the z-axis. All material design elements have resting elevations. In addition, some elements may
change their elevation in response to user interaction. The
[Material Design spec](https://material.io/design/environment/elevation.html)
explains how to best use elevation.

Angular Material provides two ways to control the elevation of elements: predefined CSS classes
and mixins.

### Predefined CSS classes

The easiest way to add elevation to an element is to simply add one of the predefined CSS classes
`mat-elevation-z#` where `#` is the elevation number you want, 0-24. Dynamic elevation can be
achieved by switching elevation classes:

```html
<div [class.mat-elevation-z2]="!isActive" [class.mat-elevation-z8]="isActive"></div>
```

<!-- example(elevation-overview) -->

### Mixins

Elevations can also be added in CSS via the `mat-elevation` mixin, which takes a number 0-24
indicating the elevation of the element as well as optional arguments for the elevation shadow's
color tone and opacity.

Since an elevation shadow consists of multiple shadow components of varying opacities, the
`$opacity` argument of the mixin is considered a factor by which to scale these initial values
rather than an absolute value.

In order to use the mixin, you must import `~@angular/material/theming`:

```scss
@import '~@angular/material/theming';

.my-class-with-default-shadow {
  // Adds a shadow for elevation level 2 with default color and full opacity:
  @include mat-elevation(2);
}

.my-class-with-custom-shadow {
  // Adds a shadow for elevation level 2 with color #e91e63 and 80% of the default opacity:
  @include mat-elevation(2, #e91e63, 0.8);
}
```

For convenience, you can use the `mat-elevation-transition` mixin to add a transition when the
elevation changes:

```scss
@import '~@angular/material/theming';

.my-class {
  @include mat-elevation-transition;
  @include mat-elevation(2);

  &:active {
    @include mat-elevation(8);
  }
}
```

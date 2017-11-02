Angular Material's elevation classes and mixins allow you to add separation between elements along
the z-axis. All material design elements have resting elevations. In addition, some elements may
change their elevation in response to user interaction. The
[Material Design spec](https://material.io/guidelines/material-design/elevation-shadows.html)
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
indicating the elevation of the element. In order to use the mixin, you must import
`~@angular/material/theming`:

```scss
@import '~@angular/material/theming';

.my-class {
  @include mat-elevation(2);
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

# Avoiding duplicated theming styles

As explained in the [theming guide](./theming.md), a theme in Angular Material consists of
configurations for the `color`, `density` and `typography` systems. As some of these individual
systems have default configurations, some usage patterns may cause duplication in the CSS output.

Below are examples of patterns that generate duplicative theme styles:

**Example #1**

```scss
@use '@angular/material' as mat;

$light-theme: mat.define-light-theme((color: ...));
$dark-theme: mat.define-dark-theme((color: ...));

// Generates styles for all systems configured in the theme. In this case, color styles
// and default density styles are generated. Density is in themes by default.
@include mat.all-component-themes($light-theme);

.dark-theme {
  // Generates styles for all systems configured in the theme. In this case, color styles
  // and the default density styles are generated. **Note** that this is a problem because it
  // means that density styles are generated *again*, even though only the color should change.
  @include mat.all-component-themes($dark-theme);
}
```

To fix this, you can use the dedicated mixin for color styles for the `.dark-theme`
selector. Replace the `all-component-themes` mixin and include the dark theme using the
`all-component-colors` mixin. For example:

```scss
@use '@angular/material' as mat;

...
@include mat.all-component-themes($light-theme);

.dark-theme {
  // This mixin only generates the color styles now.
  @include mat.all-component-colors($dark-theme);
}
```

Typography can also be configured via Sass mixin; see `all-component-typographies`.

**Example #2**

Theme styles could also be duplicated if individual theme mixins are used. For example:

```scss
@use '@angular/material' as mat;

@include mat.all-component-themes($my-theme);

.my-custom-dark-button {
  // This will also generate the default density styles again.
  @include mat.button-theme($my-theme);
}
```

To avoid this duplication of styles, use the dedicated mixin for the color system and
extract the configuration for the color system from the theme.

```scss
@use '@angular/material' as mat;

.my-custom-dark-button {
  // This will only generate the color styles for `mat-button`.
  @include mat.button-color($my-theme);
}
```

## Disabling duplication warnings

If your application intentionally duplicates styles, a global Sass variable can be
set to disable duplication warnings from Angular Material. For example:

```scss
@use '@angular/material' as mat;

mat.$theme-ignore-duplication-warnings: true;

// Include themes as usual.
@include mat.all-component-themes($light-theme);

...
```

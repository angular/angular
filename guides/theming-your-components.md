### Theming your custom component with Angular Material's theming system
In order to style your own components with Angular Material's tooling, the component's styles must
be defined with Sass.

#### 1. Define all color and typography styles in a "theme file" for the component
First, create a Sass mixin that accepts an Angular Material color configuration and
outputs the color-specific styles for the component. A color configuration is a Sass map.

For example, if building a custom carousel component:
```scss
// Import library functions for theme creation.
@import '~@angular/material/theming';

@mixin candy-carousel-color($config) {
  // Extract the palettes you need from the theme definition.
  $primary: map-get($config, primary);
  $accent: map-get($config, accent);
  
  // Define any styles affected by the theme.
  .candy-carousel {
    // Use mat-color to extract individual colors from a palette.
    background-color: mat-color($config);
    border-color: mat-color($config, A400);
  }
}
```

Second, create another Sass mixin that accepts an Angular Material typography configuration
and outputs typographic styles. For example:

```scss
@mixin candy-carousel-typography($config) {
  .candy-carousel {
    font: {
      family: mat-font-family($config, body-1);
      size: mat-font-size($config, body-1);
      weight: mat-font-weight($config, body-1);
    }
  }
}
```

Finally, create a mixin that accepts an Angular Material theme, and delegates to the individual
theming system mixins based on the configurations. A theme consists of configurations for
individual theming systems (`color` and `typography`).

```scss
@mixin candy-carousel-theme($theme) {
  // Extracts the color and typography configurations from the theme.
  $color: mat-get-color-config($theme);
  $typography: mat-get-typography-config($theme);

  // Do not generate styles if configurations for individual theming
  // systems have been explicitly set to `null`.
  @if $color != null {
    @include candy-carousel-color($color); 
  }
  @if $typography != null {
    @include candy-carousel-typography($typography);
  }
}
```

See the [typography guide](https://material.angular.io/guide/typography) for more information on
typographic customization.

#### 2. Define all remaining styles in a normal component stylesheet.
Define all styles unaffected by the theme in a separate file referenced directly in the component's
`styleUrl`.  This generally includes everything except for color and typography styles.


#### 3. Include the theme mixin in your application
Use the Sass `@include` keyword to include a component's theme mixin wherever you're already
including Angular Material's built-in theme mixins. 

```scss
// Import library functions for theme creation.
@import '~@angular/material/theming';

// Include non-theme styles for core.
@include mat-core();

// Define your application's custom theme.
$primary: mat-palette($mat-indigo);
$accent:  mat-palette($mat-pink, A200, A100, A400);
$theme: mat-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
  )
));

// Include theme styles for Angular Material components.
@include angular-material-theme($theme);

// Include theme styles for your custom components.
@include candy-carousel-theme($theme);
```


#### Note: using the `mat-color` function to extract colors from a palette
You can consume the theming functions and Material Design color palettes from
`@angular/material/theming`. The `mat-color` Sass function extracts a specific color from a palette.
For example:

```scss
// Import theming functions
@import '~@angular/material/theming';

.candy-carousel {
  // Get the default hue for a palette.
  color: mat-color($primary);
  
  // Get a specific hue for a palette. 
  // See https://material.io/archive/guidelines/style/color.html#color-color-palette for hues.
  background-color: mat-color($accent, 300);
  
  // Get a relative color for a hue ('lighter' or 'darker')
  outline-color: mat-color($accent, lighter);

  // Get a contrast color for a hue by adding `-contrast` to any other key.
  border-color: mat-color($primary, '100-contrast');
}
```

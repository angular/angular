# Theming your custom components
In order to style your own components with Angular Material's tooling, the component's styles must be defined with Sass.

## Using `@mixin` to automatically apply a theme

### Why using `@mixin`
The advantage of using a `@mixin` function is that when you change your theme, every file that uses it will be updated automatically.
Calling it with a different theme argument allow multiple themes within the app or component.

### How to use `@mixin`
We can better theming our custom components adding a `@mixin` function to its theme file and then calling this function to apply a theme.

All you need is to create a `@mixin` function in the custom-component-theme.scss

```scss
// Import all the tools needed to customize the theme and extract parts of it
@import '~@angular/material/core/theming/all-theme';

// Define a mixin that accepts a theme and outputs the color styles for the component.
@mixin candy-carousel-theme($theme) {
  // Extract whichever individual palettes you need from the theme.
  $primary: map-get($theme, primary);
  $accent: map-get($theme, accent);

  // Use mat-color to extract individual colors from a palette as necessary.
  .candy-carousel {
    background-color: mat-color($primary);
    border-color: mat-color($accent, A400);
  }
}
```
Now you just have to call the `@mixin` function to apply the theme:

```scss
// Import a pre-built theme
@import '~@angular/material/core/theming/prebuilt/deeppurple-amber';
// Import your custom input theme file so you can call the custom-input-theme function
@import 'app/candy-carousel/candy-carousel-theme.scss';

// Using the $theme variable from the pre-built theme you can call the theming function
@include candy-carousel-theme($theme);
```

For more details about the theming functions, see the comments in the
[source](https://github.com/angular/material2/blob/master/src/lib/core/theming/_theming.scss).

### Best practices using `@mixin`
When using `@mixin`, the theme file should only contain the definitions that are affected by the passed-in theme.

All styles that are not affected by the theme should be placed in a `candy-carousel.scss` file. This file should contain everything that is not affected by the theme like sizes, transitions...

Styles that are affected by the theme should be placed in a separated theming file as `_candy-carousel-theme.scss` and the file should have a `_` before the name. This file should contain the `@mixin` function responsible for applying the theme to the component.


## Using colors from a palette
You can consume the theming functions from the `@angular/material/core/theming/theming` and Material palette vars from `@angular/material/core/theming/palette`. You can use the `mat-color` function to extract a specific color from a palette. For example:

```scss
// Import theming functions
@import '~@angular/material/core/theming/theming';
// Import your custom theme
@import 'src/unicorn-app-theme.scss';

// Use mat-color to extract individual colors from a palette as necessary.
.candy-carousel {
  background-color: mat-color($candy-app-primary);
  border-color: mat-color($candy-app-accent, A400);
}
```

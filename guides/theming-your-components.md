# Theme your own components with Angular Material's theming system

You can use Angular Material's Sass-based theming system for your own custom components.

## Reading style values from a theme

As described in the [theming guide][theme-map], a theme is a Sass map that contains style values to
customize components. Angular Material provides APIs for reading values from this data structure.

[theme-map]: https://material.angular.io/guide/theming#themes

### Reading color values

To read color values from a theme, you can use the `get-color-config` Sass function. This function
returns a Sass map containing the theme's primary, accent, and warn palettes, as well as a flag
indicating whether dark mode is set.

```scss
@use 'sass:map';
@use '@angular/material' as mat;

$color-config:    mat.get-color-config($theme);
$primary-palette: map.get($color-config, 'primary');
$accent-palette:  map.get($color-config, 'accent');
$warn-palette:    map.get($color-config, 'warn');
$is-dark-theme:   map.get($color-config, 'is-dark');
```

See the [theming guide][theme-read-hues] for more information on reading hues from palettes.

[theme-read-hues]: https://material.angular.io/guide/theming#reading-hues-from-palettes

### Reading typography values

To read typography values from a theme, you can use the `get-typography-config` Sass function. See
the [Typography guide][typography-config] for more information about the typography config data
structure and for APIs for reading values from this config.

[typography-config]: https://material.angular.io/guide/typography#typography-config

```scss
@use '@angular/material' as mat;

$typography-config: mat.get-typography-config($theme);
$my-font-family: mat.font-family($typography-config);
```

## Separating theme styles

Angular Material components each have a Sass file that defines mixins for customizing
that component's color and typography. For example, `MatButton` has mixins for `button-color` and
`button-typography`. Each mixin emits all color and typography styles for that component,
respectively.

You can mirror this structure in your components by defining your own mixins. These mixins
should accept an Angular Material theme, from which they can read color and typography values. You
can then include these mixins in your application along with Angular Material's own mixins.

## Step-by-step example

To illustrate participation in Angular Material's theming system, we can look at an example of a
custom carousel component. The carousel starts with a single file, `carousel.scss`, that contains
structural, color, and typography styles. This file is included in the `styleUrls` of the component.

```scss
// carousel.scss

.my-carousel {
  display: flex;
  font-family: serif;
}

.my-carousel-button {
  border-radius: 50%;
  color: blue;
}
```

### Step 1: Extract theme-based styles to a separate file

To change this file to participate in Angular Material's theming system, we split the styles into
two files, with the color and typography styles moved into mixins. By convention, the new file
name ends with `-theme`. Additionally, the file starts with an underscore (`_`), indicating that
this is a Sass partial file. See the [Sass documentation][sass-partials] for more information about
partial files.

[sass-partials]: https://sass-lang.com/guide#topic-4

```scss
// carousel.scss

.my-carousel {
  display: flex;
}

.my-carousel-button {
  border-radius: 50%;
}
```

```scss
// _carousel-theme.scss

@mixin color($theme) {
  .my-carousel-button {
    color: blue;
  }
}

@mixin typography($theme) {
  .my-carousel {
    font-family: serif;
  }
}
```

### Step 2: Use values from the theme

Now that theme theme-based styles reside in mixins, we can extract the values we need from the
theme passed into the mixins.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  // Get the color config from the theme.
  $color-config: mat.get-color-config($theme);

  // Get the primary color palette from the color-config.
  $primary-palette: map.get($color-config, 'primary');

  .my-carousel-button {
    // Read the 500 hue from the primary color palette.
    color: mat.get-color-from-palette($primary-palette, 500);
  }
}

@mixin typography($theme) {
  // Get the typography config from the theme.
  $typography-config: mat.get-typography-config($theme);

  .my-carousel {
    font-family: mat.font-family($typography-config);
  }
}
```

### Step 3: Add a theme mixin

For convenience, we can add a `theme` mixin that includes both color and typography.
This theme mixin should only emit the styles for each color and typography, respectively, if they
have a config specified.

```scss
// _carousel-theme.scss

@use 'sass:map';
@use '@angular/material' as mat;

@mixin color($theme) {
  // Get the color config from the theme.
  $color-config: mat.get-color-config($theme);

  // Get the primary color palette from the color-config.
  $primary-palette: map.get($color-config, 'primary');

  .my-carousel-button {
    // Read the 500 hue from the primary color palette.
    color: mat.get-color-from-palette($primary-palette, 500);
  }
}

@mixin typography($theme) {
  // Get the typography config from the theme.
  $typography-config: mat.get-typography-config($theme);

  .my-carousel {
    font-family: mat.font-family($typography-config);
  }
}

@mixin theme($theme) {
  $color-config: mat.get-color-config($theme);
  @if $color-config != null {
    @include color($theme);
  }

  $typography-config: mat.get-typography-config($theme);
  @if $typography-config != null {
    @include typography($theme);
  }
}
```

### Step 4: Include the theme mixin in your application

Now that you've defined the carousel component's theme mixin, you can include this mixin along with
the other theme mixins in your application.

```scss
@use '@angular/material' as mat;
@use './path/to/carousel-theme' as carousel;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
 typography: mat.define-typography-config(
    $font-family: serif,
  );
));

@include mat.all-component-themes($my-theme);
@include carousel.theme($my-theme);
```

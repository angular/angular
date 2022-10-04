# Theming Angular Material

## What is theming?

Angular Material's theming system lets you customize color and typography styles for components
in your application. The theming system is based on Google's
[Material Design][material-design-theming] specification.

This document describes the concepts and APIs for customizing colors. For typography customization,
see [Angular Material Typography][mat-typography]. For guidance on building components to be
customizable with this system, see [Theming your own components][theme-your-own].

[material-design-theming]: https://material.io/design/material-theming/overview.html
[mat-typography]: https://material.angular.io/guide/typography
[theme-your-own]: https://material.angular.io/guide/theming-your-components

### Sass

Angular Material's theming APIs are built with [Sass](https://sass-lang.com). This document assumes
familiarity with CSS and Sass basics, including variables, functions, and mixins.

You can use Angular Material without Sass by using a pre-built theme, described in
[Using a pre-built theme](#using-a-pre-built-theme) below. However, using the library's Sass API
directly gives you the most control over the styles in your application.

## Palettes

A **palette** is a collection of colors representing a portion of color space. Each value in this
collection is called a **hue**. In Material Design, each hues in a palette has an identifier number.
These identifier numbers include 50, and then each 100 value between 100 and 900. The numbers order
hues within a palette from lightest to darkest.

Angular Material represents a palette as a [Sass map][sass-maps]. This map contains the
palette's hues and another nested map of contrast colors for each of the hues. The contrast colors
serve as text color when using a hue as a background color. The example below demonstrates the
structure of a palette. [See the Material Design color system for more background.][spec-colors]

```scss
$indigo-palette: (
 50: #e8eaf6,
 100: #c5cae9,
 200: #9fa8da,
 300: #7986cb,
 // ... continues to 900
 contrast: (
   50: rgba(black, 0.87),
   100: rgba(black, 0.87),
   200: rgba(black, 0.87),
   300: white,
   // ... continues to 900
 )
);
```

[sass-maps]: https://sass-lang.com/documentation/values/maps
[spec-colors]: https://material.io/design/color/the-color-system.html

### Create your own palette

You can create your own palette by defining a Sass map that matches the structure described in the
[Palettes](#palettes) section above. The map must define hues for 50 and each hundred between 100
and 900. The map must also define a `contrast` map with contrast colors for each hue.

You can use [the Material Design palette tool][palette-tool] to help choose the hues in your
palette.

[palette-tool]: https://material.io/design/color/the-color-system.html#tools-for-picking-colors

### Predefined palettes

Angular Material offers predefined palettes based on the 2014 version of the Material Design
spec. See the [Material Design 2014 color palettes][2014-palettes] for a full list.

In addition to hues numbered from zero to 900, the 2014 Material Design palettes each include
distinct _accent_ hues numbered as `A100`, `A200`, `A400`, and `A700`. Angular Material does not
require these hues, but you can use these hues when defining a theme as described in
[Defining a theme](#defining-a-theme) below.

```scss
@use '@angular/material' as mat;

$my-palette: mat.$indigo-palette;
```

[2014-palettes]: https://material.io/archive/guidelines/style/color.html#color-color-palette

## Themes

A **theme** is a collection of color and typography options. Each theme includes three palettes that
determine component colors:

* A **primary** palette for the color that appears most frequently throughout your application
* An **accent**, or _secondary_, palette used to selectively highlight key parts of your UI
* A **warn**, or _error_, palette used for warnings and error states

You can include the CSS styles for a theme in your application in one of two ways: by defining a
custom theme with Sass, or by importing a pre-built theme CSS file.

### Custom themes with Sass

A **theme file** is a Sass file that calls Angular Material Sass mixins to output color and
typography CSS styles.

#### The `core` mixin

Angular Material defines a mixin named `core` that includes prerequisite styles for common
features used by multiple components, such as ripples. The `core` mixin must be included exactly
once for your application, even if you define multiple themes. Including the `core` mixin multiple
times will result in duplicate CSS in your application.

```scss
@use '@angular/material' as mat;

@include mat.core();
```

#### Defining a theme

Angular Material represents a theme as a Sass map that contains your color and typography
choices. For more about typography customization, see [Angular Material Typography][mat-typography].

Constructing the theme first requires defining your primary and accent palettes, with an optional
warn palette. The `define-palette` Sass function accepts a color palette, described in the
[Palettes](#palettes) section above, as well as four optional hue numbers. These four hues
represent, in order: the "default" hue, a "lighter" hue, a "darker" hue, and a "text" hue.
Components use these hues to choose the most appropriate color for different parts of
themselves.

```scss
@use '@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.define-palette(mat.$red-palette);
```

You can construct a theme by calling either `define-light-theme` or `define-dark-theme` with
the result from `define-palette`. The choice of a light versus a dark theme determines the
background and foreground colors used throughout the components.

```scss
@use '@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
   warn: $my-warn,
 )
));
```

#### Applying a theme to components

The `core-theme` Sass mixin emits prerequisite styles for common features used by multiple
components, such as ripples. This mixin must be included once per theme.

Each Angular Material component has a "color" mixin that emits the component's color styles and
a "typography" mixin that emits the component's typography styles.

Additionally, each component has a "theme" mixin that emits styles for both color and typography.
This theme mixin will only emit color or typography styles if you provided a corresponding
configuration to `define-light-theme` or `define-dark-theme`.

Apply the styles for each of the components used in your application by including each of their
theme Sass mixins.

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

// Emit theme-dependent styles for common features used across multiple components.
@include mat.core-theme($my-theme);

// Emit styles for MatButton based on `$my-theme`. Because the configuration
// passed to `define-light-theme` omits typography, `button-theme` will not
// emit any typography styles.
@include mat.button-theme($my-theme);

// Include the theme mixins for other components you use here.
```

As an alternative to listing every component that your application uses, Angular Material offers
Sass mixins that includes styles for all components in the library: `all-component-colors`,
`all-component-typographies`, and `all-component-themes`. These mixins behave the same as individual
component mixins, except they emit styles for `core-theme` and _all_ 35+ components in Angular
Material. Unless your application uses every single component, this will produce unnecessary CSS.

```scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

@include mat.all-component-themes($my-theme);
```

To include the emitted styles in your application, [add your theme file to the `styles` array of
your project's `angular.json` file][adding-styles].

[adding-styles]: https://angular.io/guide/workspace-config#styles-and-scripts-configuration

### Using a pre-built theme

Angular Material includes four pre-built theme CSS files, each with different palettes selected.
You can use one of these pre-built themes if you don't want to define a custom theme with Sass.

| Theme                  | Light or dark? | Palettes (primary, accent, warn) |
|------------------------|----------------|----------------------------------|
| `deeppurple-amber.css` | Light          | deep-purple, amber, red          |
| `indigo-pink.css`      | Light          | indigo, pink, red                |
| `pink-bluegrey.css`    | Dark           | pink, bluegrey, red              |
| `purple-green.css`     | Dark           | purple, green, red               |

These files include the CSS for every component in the library. To include only the CSS for a subset
of components, you must use the Sass API detailed in [Defining a theme](#defining-a-theme) above.
You can [reference the source code for these pre-built themes][prebuilt] to see examples of complete
theme definitions.

You can find the pre-built theme files in the "prebuilt-themes" directory of Angular Material's
npm package (`@angular/material/prebuilt-themes`). To include the pre-built theme in your
application, [add your chosen CSS file to the `styles` array of your project's `angular.json`
file][adding-styles].

[prebuilt]: https://github.com/angular/components/blob/main/src/material/core/theming/prebuilt

### Defining multiple themes

Using the Sass API described in [Defining a theme](#defining-a-theme), you can also define
_multiple_ themes by repeating the API calls multiple times. You can do this either in the same
theme file or in separate theme files.

#### Multiple themes in one file

Defining multiple themes in a single file allows you to support multiple themes without having to
manage loading of multiple CSS assets. The downside, however, is that your CSS will include more
styles than necessary.

To control which theme applies when, `@include` the mixins only within a context specified via
CSS rule declaration. See the [documentation for Sass mixins][sass-mixins] for further background.

[sass-mixins]: https://sass-lang.com/documentation/at-rules/mixin

```scss
@use '@angular/material' as mat;

@include mat.core();

// Define a light theme
$light-primary: mat.define-palette(mat.$indigo-palette);
$light-accent: mat.define-palette(mat.$pink-palette);
$light-theme: mat.define-light-theme((
 color: (
   primary: $light-primary,
   accent: $light-accent,
 )
));

// Define a dark theme
$dark-primary: mat.define-palette(mat.$pink-palette);
$dark-accent: mat.define-palette(mat.$blue-grey-palette);
$dark-theme: mat.define-dark-theme((
 color: (
   primary: $dark-primary,
   accent: $dark-accent,
 )
));

// Apply the dark theme by default
@include mat.core-theme($dark-theme);
@include mat.button-theme($dark-theme);

// Apply the light theme only when the `.my-light-theme` CSS class is applied
// to an ancestor element of the components (such as `body`).
.my-light-theme {
 @include mat.core-color($light-theme);
 @include mat.button-color($light-theme);
}
```

#### Multiple themes across separate files

You can define multiple themes in separate files by creating multiple theme files per
[Defining a theme](#defining-a-theme), adding each of the files to the `styles` of your
`angular.json`. However, you must additionally set the `inject` option for each of these files to
`false` in order to prevent all the theme files from being loaded at the same time. When setting
this property to `false`, your application becomes responsible for manually loading the desired
file. The approach for this loading depends on your application.

### Application background color

By default, Angular Material does not apply any styles to your DOM outside
of its own components. If you want to set your application's background color
to match the components' theme, you can either:
1. Put your application's main content inside `mat-sidenav-container`, assuming you're using `MatSidenav`, or
2. Apply the `mat-app-background` CSS class to your main content root element (typically `body`).

### Scoping style customizations

You can use Angular Material's Sass mixins to customize component styles within a specific scope
in your application. The CSS rule declaration in which you include a Sass mixin determines its scope.
The example below shows how to customize the color of all buttons inside elements marked with the
`.my-special-section` CSS class.

```scss
@use '@angular/material' as mat;

.my-special-section {
 $special-primary: mat.define-palette(mat.$orange-palette);
 $special-accent: mat.define-palette(mat.$brown-palette);
 $special-theme: mat.define-dark-theme((
   color: (primary: $special-primary, accent: $special-accent),
 ));

 @include mat.button-color($special-theme);
}
```

### Reading hues from palettes

You can use the `get-color-from-palette` function to get specific hues from a palette by their
number identifier. You can also access the contrast color for a particular hue by suffixing the
hue's number identifier with `-contrast`.

```scss
@use '@angular/material' as mat;

$my-palette: mat.define-palette(mat.$indigo-palette);

.my-custom-style {
 background: mat.get-color-from-palette($my-palette, 500);
 color: mat.get-color-from-palette($my-palette, '500-contrast');
}
```

You can also reference colors using the `"default"`, `"lighter"`, `"darker"`, and `"text"` colors
passed to `define-palette`.

```scss
@use '@angular/material' as mat;

$my-palette: mat.define-palette(mat.$indigo-palette);

.my-custom-darker-style {
 background: mat.get-color-from-palette($my-palette, 'darker');
 color: mat.get-color-from-palette($my-palette, 'darker-contrast');
}
```

## Strong focus indicators

By default, most components indicate browser focus by changing their background color as described
by the Material Design specification. This behavior, however, can fall short of accessibility
requirements, such as [WCAG][], which require a stronger indication of browser focus.

Angular Material supports rendering highly visible outlines on focused elements. Applications can
enable these strong focus indicators via two Sass mixins:
`strong-focus-indicators` and `strong-focus-indicators-theme`.

The `strong-focus-indicators` mixin emits structural indicator styles for all components. This mixin
should be included exactly once in an application, similar to the `core` mixin described above.

The `strong-focus-indicators-theme` mixin emits only the indicator's color styles. This mixin should
be included once per theme, similar to the theme mixins described above. Additionally, you can use
this mixin to change the color of the focus indicators in situations in which the default color
would not contrast sufficiently with the background color.

The following example includes strong focus indicator styles in an application alongside the rest of
the custom theme API.

```scss
@use '@angular/material' as mat;

@include mat.core();
@include mat.strong-focus-indicators();

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

@include mat.all-component-themes($my-theme);
@include mat.strong-focus-indicators-theme($my-theme);
```

### Customizing strong focus indicators

You can pass a configuration map to `strong-focus-indicators` to customize the appearance of the
indicators. This configuration includes `border-style`, `border-width`, and `border-radius`.

You also can customize the color of indicators with `strong-focus-indicators-theme`. This mixin
accepts either a theme, as described earlier in this guide, or a CSS color value. When providing a
theme, the indicators will use the default hue of the primary palette.

The following example includes strong focus indicator styles with custom settings alongside the rest
of the custom theme API.

```scss
@use '@angular/material' as mat;

@include mat.core();
@include mat.strong-focus-indicators((
  border-style: dotted,
  border-width: 4px,
  border-radius: 2px,
));

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 )
));

@include mat.all-component-themes($my-theme);
@include mat.strong-focus-indicators-theme(purple);
```

[WCAG]: https://www.w3.org/WAI/standards-guidelines/wcag/glance/

## Theming and style encapsulation

Angular Material assumes that, by default, all theme styles are loaded as global CSS. If you want
to use [Shadow DOM][shadow-dom] in your application, you must load the theme styles within each
shadow root that contains an Angular Material component. You can accomplish this by manually loading
the CSS in each shadow root, or by using [Constructable Stylesheets][constructable-css].

[shadow-dom]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
[constructable-css]: https://developers.google.com/web/updates/2019/02/constructable-stylesheets

## Style customization outside the theming system

Angular Material supports customizing color and typography as outlined in this document. Angular
strongly discourages, and does not directly support, overriding component CSS outside the theming
APIs described above. Component DOM structure and CSS classes are considered private implementation
details that may change at any time.


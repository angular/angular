# Theming your Angular Material app


### What is a theme?
A **theme** is the set of colors that will be applied to the Angular Material components. The
library's approach to theming is based on the guidance from the [Material Design spec][1].

In Angular Material, a theme is created by composing multiple palettes. In particular,
a theme consists of:
* A primary palette: colors most widely used across all screens and components.
* An accent palette: colors used for the floating action button and interactive elements.
* A warn palette: colors used to convey error state.
* A foreground palette: colors for text and icons.
* A background palette: colors used for element backgrounds.

In Angular Material, all theme styles are generated _statically_ at build-time so that your
app doesn't have to spend cycles generating theme styles on startup.

[1]: https://material.google.com/style/color.html#color-color-palette

### Using a pre-built theme
Angular Material comes prepackaged with several pre-built theme css files. These theme files also
include all of the styles for core (styles common to all components), so you only have to include a
single css file for Angular Material in your app.

You can include a theme file directly into your application from
`@angular/material/prebuilt-themes`

Available pre-built themes:
* `deeppurple-amber.css`
* `indigo-pink.css`
* `pink-bluegrey.css`
* `purple-green.css`

If you're using Angular CLI, this is as simple as including one line
in your `styles.css`  file:
```css
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';
```

Alternatively, you can just reference the file directly. This would look something like:
```html
<link href="node_modules/@angular/material/prebuilt-themes/indigo-pink.css" rel="stylesheet">
```
The actual path will depend on your server setup.

You can also concatenate the file with the rest of your application's css.

Finally, if your app's content **is not** placed inside of a `mat-sidenav-container` element, you
need to add the `mat-app-background` class to your wrapper element (for example the `body`). This
ensures that the proper theme background is applied to your page.

### Defining a custom theme
When you want more customization than a pre-built theme offers, you can create your own theme file.

A custom theme file does two things:
1. Imports the `mat-core()` sass mixin. This includes all common styles that are used by multiple
components. **This should only be included once in your application.** If this mixin is included
multiple times, your application will end up with multiple copies of these common styles.
2. Defines a **theme** data structure as the composition of multiple palettes. This object can be
created with either the `mat-light-theme` function or the `mat-dark-theme` function. The output of
this function is then passed to the  `angular-material-theme` mixin, which will output all of the
corresponding styles for the theme.


A typical theme file will look something like this:
```scss
@import '~@angular/material/theming';
// Plus imports for other components in your app.

// Include the common styles for Angular Material. We include this here so that you only
// have to load a single css file for Angular Material in your app.
// Be sure that you only ever include this mixin once!
@include mat-core();

// Define the palettes for your theme using the Material Design palettes available in palette.scss
// (imported above). For each palette, you can optionally specify a default, lighter, and darker
// hue.
$candy-app-primary: mat-palette($mat-indigo);
$candy-app-accent:  mat-palette($mat-pink, A200, A100, A400);

// The warn palette is optional (defaults to red).
$candy-app-warn:    mat-palette($mat-red);

// Create the theme object (a Sass map containing all of the palettes).
$candy-app-theme: mat-light-theme($candy-app-primary, $candy-app-accent, $candy-app-warn);

// Include theme styles for core and each component used in your app.
// Alternatively, you can import and @include the theme mixins for each component
// that you are using.
@include angular-material-theme($candy-app-theme);
```

You only need this single Sass file; you do not need to use Sass to style the rest of your app.

If you are using the Angular CLI, support for compiling Sass to css is built-in; you only have to
add a new entry to the `"styles"` list in `angular-cli.json` pointing to the theme
file (e.g., `unicorn-app-theme.scss`).

If you're not using the Angular CLI, you can use any existing Sass tooling to build the file (such
as gulp-sass or grunt-sass). The simplest approach is to use the `node-sass` CLI; you simply run:
```
node-sass src/unicorn-app-theme.scss dist/unicorn-app-theme.css
```
and then include the output file in your index.html.

The theme file **should not** be imported into other SCSS files. This will cause duplicate styles
to be written into your CSS output. If you want to consume the theme definition object
(e.g., `$candy-app-theme`) in other SCSS files, then the definition of the theme object should be
broken into its own file, separate from the inclusion of the `mat-core` and
`angular-material-theme` mixins.

The theme file can be concatenated and minified with the rest of the application's css.

Note that if you include the generated theme file in the `styleUrls` of an Angular component, those
styles will be subject to that component's [view encapsulation](https://angular.io/docs/ts/latest/guide/component-styles.html#!#view-encapsulation).

#### Multiple themes
You can create multiple themes for your application by including the `angular-material-theme` mixin
multiple times, where each inclusion is gated by an additional CSS class.

Remember to only ever include the `@mat-core` mixin only once; it should not be included for each
theme.

##### Example of defining multiple themes:
```scss
@import '~@angular/material/theming';
// Plus imports for other components in your app.

// Include the common styles for Angular Material. We include this here so that you only
// have to load a single css file for Angular Material in your app.
// **Be sure that you only ever include this mixin once!**
@include mat-core();

// Define the default theme (same as the example above).
$candy-app-primary: mat-palette($mat-indigo);
$candy-app-accent:  mat-palette($mat-pink, A200, A100, A400);
$candy-app-theme:   mat-light-theme($candy-app-primary, $candy-app-accent);

// Include the default theme styles.
@include angular-material-theme($candy-app-theme);


// Define an alternate dark theme.
$dark-primary: mat-palette($mat-blue-grey);
$dark-accent:  mat-palette($mat-amber, A200, A100, A400);
$dark-warn:    mat-palette($mat-deep-orange);
$dark-theme:   mat-dark-theme($dark-primary, $dark-accent, $dark-warn);

// Include the alternative theme styles inside of a block with a CSS class. You can make this
// CSS class whatever you want. In this example, any component inside of an element with
// `.unicorn-dark-theme` will be affected by this alternate dark theme instead of the default theme.
.unicorn-dark-theme {
  @include angular-material-theme($dark-theme);
}
```

In the above example, any component inside of a parent with the `unicorn-dark-theme` class will use
the dark theme, while other components will fall back to the default `$candy-app-theme`.

You can include as many themes as you like in this manner. You can also `@include` the
`angular-material-theme` in separate files and then lazily load them based on an end-user
interaction (how to lazily load the CSS assets will vary based on your application).

It's important to remember, however, that the `mat-core` mixin should only ever be included _once_.

##### Multiple themes and overlay-based components
Since certain components (e.g. menu, select, dialog, etc.) are inside of a global overlay container,
an additional step is required for those components to be affected by the theme's css class selector
(`.unicorn-dark-theme` in the example above).

To do this, you can add the appropriate class to the global overlay container. For the example above,
this would look like:
```ts
import {OverlayContainer} from '@angular/material';

@NgModule({
  // ...
})
export class UnicornCandyAppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
  }
}
```

#### Theming only certain components
The `angular-material-theme` mixin will output styles for [all components in the library](https://github.com/angular/material2/blob/master/src/lib/core/theming/_all-theme.scss).
If you are only using a subset of the components (or if you want to change the theme for specific
components), you can include component-specific theme mixins. You also will need to include
the `mat-core-theme` mixin as well, which contains theme-specific styles for common behaviors
(such as ripples).

 ```scss
@import '~@angular/material/theming';
// Plus imports for other components in your app.

// Include the common styles for Angular Material. We include this here so that you only
// have to load a single css file for Angular Material in your app.
// **Be sure that you only ever include this mixin once!**
@include mat-core();

// Define the theme.
$candy-app-primary: mat-palette($mat-indigo);
$candy-app-accent:  mat-palette($mat-pink, A200, A100, A400);
$candy-app-theme:   mat-light-theme($candy-app-primary, $candy-app-accent);

// Include the theme styles for only specified components.
@include mat-core-theme($candy-app-theme);
@include mat-button-theme($candy-app-theme);
@include mat-checkbox-theme($candy-app-theme);
```

### Theming your own components
For more details about theming your own components,
see [theming-your-components.md](./theming-your-components.md).

### Future work
* Once CSS variables (custom properties) are available in all the browsers we support,
  we will explore how to take advantage of them to make theming even simpler.
* More prebuilt themes will be added as development continues.

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
`@angular/material/core/theming/prebuilt`

If you're using Angular CLI, this is as simple as including one line
in your `styles.css`  file:
```css
@import '~@angular/material/core/theming/prebuilt/deeppurple-amber.css';
```

Alternatively, you can just reference the file directly. This would look something like:
```html
<link href="node_modules/@angular/material/core/theming/prebuilt/indigo-pink.css" rel="stylesheet">
```
The actual path will depend on your server setup.

You can also concatenate the file with the rest of your application's css.

Finally, if your app's content **is not** placed inside of a `md-sidenav-container` element, you
need to add the `mat-app-background` class to your wrapper element (for example the `body`). This
ensures that the proper theme background is applied to your page.

#### Theming overlay-based components
Since certain components (e.g. `dialog`) are inside of a global overlay container, your theme may
not be applied to them. In order to define the theme that will be used for overlay components, you
have to specify it on the global `OverlayContainer` instance:

```ts
import {OverlayContainer} from '@angular/material';

@NgModule({
  // misc config goes here
})
export class YourAppModule {
  constructor(overlayContainer: OverlayContainer) {
    overlayContainer.themeClass = 'your-theme';
  }
}
```

### Defining a custom theme
When you want more customization than a pre-built theme offers, you can create your own theme file.

A theme file is a simple Sass file that defines your palettes and passes them to mixins that output
the corresponding styles. A typical theme file will look something like this:
```scss
@import '~@angular/material/core/theming/all-theme';
// Plus imports for other components in your app.

// Include the base styles for Angular Material core. We include this here so that you only
// have to load a single css file for Angular Material in your app.
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
and then include the output file in your application.

The theme file can be concatenated and minified with the rest of the application's css.

#### Multiple themes
You can extend the example above to define a second (or third or fourth) theme that is gated by
some selector. For example, we could append the following to the example above to define a
secondary dark theme:
```scss
.unicorn-dark-theme {
  $dark-primary: mat-palette($mat-blue-grey);
  $dark-accent:  mat-palette($mat-amber, A200, A100, A400);
  $dark-warn:    mat-palette($mat-deep-orange);

  $dark-theme: mat-dark-theme($dark-primary, $dark-accent, $dark-warn);

  @include angular-material-theme($dark-theme);
}
```

With this, any element inside of a parent with the `unicorn-dark-theme` class will use this
dark theme.

### Theming your own components
For more details about theming your own components, see [theming-your-components.md](https://github.com/angular/material2/blob/master/guides/theming-your-components.md)

### Future work
* Once CSS variables (custom properties) are available in all the browsers we support,
  we will explore how to take advantage of them to make theming even simpler.

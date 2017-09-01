# Angular Material typography

### What is typography?
Typography is a way of arranging type to make text legible, readable, and appealing when displayed.
Angular Material's typography is based on the guidelines from the [Material Design spec][1] and is
arranged into typography levels. Each level has a `font-size`, `line-height` and `font-weight`. The
available levels are:

* `display-4`, `display-3`, `display-2` and `display-1` - Large, one-off headers, usually
at the top of the page (e.g. a hero header).
* `headline` - Section heading corresponding to the `<h1>` tag.
* `title` - Section heading corresponding to the `<h2>` tag.
* `subheading-2` - Section heading corresponding to the `<h3>` tag.
* `subheading-1` - Section heading corresponding to the `<h4>` tag.
* `body-1` - Base body text.
* `body-2` - Bolder body text.
* `caption` - Smaller body and hint text.
* `button` - Buttons and anchors.

The typography levels are collected into a typography config which is used to generate the CSS.

### Usage
To get started, you first include the `Roboto` font with the 300, 400 and 500 weights.
You can host it yourself or include it from [Google Fonts][2]:

```html
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
```

Now you can add the appropriate CSS classes to the elements that you want to style:

```html
<h1 class="mat-display-1">Jackdaws love my big sphinx of quartz.</h1>
<h2 class="mat-h2">The quick brown fox jumps over the lazy dog.</h2>
```

By default, Angular Material doesn't apply any global CSS. To apply the library's typographic styles
more broadly, you can take advantage of the `mat-typography` CSS class. This class will style all
descendant native elements.

```html
<!-- By default, Angular Material applies no global styles to native elements. -->
<h1>This header is unstyled</h1>

<!-- Applying the mat-tyography class adds styles for native elements. -->
<section class="mat-typography">
  <h1>This header will be styled</h1>
</section>
```

### Customization
Typography customization is an extension of Angular Material's SASS-based theming. Similar to
creating a custom theme, you can create a custom **typography configuration**.

```scss
@import '~@angular/material/theming';

// Define a custom typography config that overrides the font-family as well as the
// `headlines` and `body-1` levels.
$custom-typography: mat-typography-config(
  $font-family: 'Roboto, monospace',
  $headline: mat-typography-level(32px, 48px, 700),
  $body-1: mat-typography-level(16px, 24px, 500)
);
```

As the above example demonstrates, a typography configuration is created by using the
`mat-typography-config` function, which is given both the font-family and the set of typographic
levels described earlier. Each typographic level is defined by the `mat-typography-level` function,
which requires a `font-size`, `line-height`, and `font-weight`. **Note** that the `font-family`
has to be in quotes.


Once the custom typography definition is created, it can be consumed to generate styles via
different SASS mixins.

```scss
// Override typography CSS classes (e.g., mat-h1, mat-display-1, mat-typography, etc.).
@include mat-base-typography($custom-typography);

// Override typography for a specific Angular Material components.
@include mat-checkbox-typography($custom-typography);

// Override typography for all Angular Material, including mat-base-typography and all components.
@include angular-material-typography($custom-typography);
```

If you're using Material's theming, you can also pass in your typography config to the
`mat-core` mixin:

```scss
// Override the typography in the core CSS.
@include mat-core($custom-typography);
```

For more details about the typography functions and default config, see the
[source](https://github.com/angular/material2/blob/master/src/lib/core/typography/_typography.scss).


### Material typography in your custom CSS
Angular Material includes typography utility mixins and functions that you can use to customize your
own components:

* `mat-font-size($config, $level)` - Gets the `font-size`, based on the provided config and level.
* `mat-font-family($config)` - Gets the `font-family`, based on the provided config.
* `mat-line-height($config, $level)` - Gets the `line-height`, based on the provided
config and level.
* `mat-font-weight($config, $level)` - Gets the `font-weight`, based on the provided
config and level.
* `mat-typography-level-to-styles($config, $level)` - Mixin that takes in a configuration object
and a typography level, and outputs a short-hand CSS `font` declaration.

```scss
@import '~@angular/material/theming';

// Create a config with the default typography levels.
$config: mat-typography-config();

// Custom header that uses only the Material `font-size` and `font-family`.
.unicorn-header {
  font-size: mat-font-size($config, headline);
  font-family: mat-font-family($config);
}

// Custom title that uses all of the typography styles from the `title` level.
.unicorn-title {
  @include mat-typography-level-to-styles($config, title);
}
```


[1]: https://material.io/guidelines/style/typography.html
[2]: https://fonts.google.com/

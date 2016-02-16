# Theming components with SCSS
ng-material comes packaged with the [color palettes in the Material Design spec](https://www.google.com/design/spec/style/color.html#color-color-palette).
The palettes are in `_palette.scss`.
Each will be a SCSS map:
$md-indigo: (
  50: #e8eaf6,
  100: #c5cae9,
  200: #9fa8da,
  ...
);

A theme, then, is a _set_ of palettes defined in terms of these (or custom) color palettes:

```scss
/** A typical theme definition file. */  

$md-is-dark-theme: false;

$md-primary:    md-palette($md-indigo, 500, 100, 700, $md-contrast-palettes);
$md-accent:     md-palette($md-red, A200, A100, A400, $md-contrast-palettes);
$md-warn:       md-palette($md-red, 500, 300, 800, $md-contrast-palettes);
$md-foreground: if($md-is-dark-theme, $md-dark-theme-foreground, $md-light-theme-foreground);
$md-background: if($md-is-dark-theme, $md-dark-theme-background, $md-light-theme-background);
```

The md-palette function creates a theme palette that contains all the colors of the original color 
palette plus contrast colors and semantic shortcuts for the specified hues.


Once that is defined, an individual component is styled in terms of the theme palettes:
```scss
my-comp {
  color: md-color($md-foreground, text); 
  background-color: md-color($md-background, lighter); // Use one of the configured hue by semantic name.
  &.md-primary {
    color: md-color($md-primary, 300-contrast); 
    background-color: md-color($md-primary, 300, 0.7); // Use a specific hue and opacity
  }
}
```

The md-color function lets the user reference a specific color from the theme palette, 
either by a semantic name (e.g., "primary, lighter"), or directly by numbered hue 
(e.g., "accent, A700"). For each hue, a "-contrast" version is also present in the theme palette. 
The function also allows the user to specify an opacity.

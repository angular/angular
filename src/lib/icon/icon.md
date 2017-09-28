`mat-icon` makes it easier to use _vector-based_ icons in your app.  This directive supports both
icon fonts and SVG icons, but not bitmap-based formats (png, jpg, etc.).

<!-- example(icon-overview) -->

### Registering icons

`MatIconRegistry` is an injectable service that allows you to associate icon names with SVG URLs and
define aliases for CSS font classes. Its methods are discussed below and listed in the API summary.

### Font icons with ligatures

Some fonts are designed to show icons by using
[ligatures](https://en.wikipedia.org/wiki/Typographic_ligature), for example by rendering the text
"home" as a home image. To use a ligature icon, put its text in the content of the `mat-icon`
component.

By default, `<mat-icon>` expects the
[Material icons font](http://google.github.io/material-design-icons/#icon-font-for-the-web).
(You will still need to include the HTML to load the font and its CSS, as described in the link).
You can specify a different font by setting the `fontSet` input to either the CSS class to apply to
use the desired font, or to an alias previously registered with
`MatIconRegistry.registerFontClassAlias`.

### Font icons with CSS

Fonts can also display icons by defining a CSS class for each icon glyph, which typically uses a
`:before` selector to cause the icon to appear.
[FontAwesome](https://fortawesome.github.io/Font-Awesome/examples/) uses this approach to display
its icons. To use such a font, set the `fontSet` input to the font's CSS class (either the class
itself or an alias registered with `MatIconRegistry.registerFontClassAlias`), and set the `fontIcon`
input to the class for the specific icon to show.

For both types of font icons, you can specify the default font class to use when `fontSet` is not
explicitly set by calling `MatIconRegistry.setDefaultFontSetClass`.

### SVG icons

When an `mat-icon` component displays an SVG icon, it does so by directly inlining the SVG content
into the page as a child of the component. (Rather than using an <img> tag or a div background
image). This makes it easier to apply CSS styles to SVG icons. For example, the default color of the
SVG content is the CSS 
[currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentColor_keyword) 
value. This makes SVG icons by default have the same color as surrounding text, and allows you to 
change the color by setting the "color" style on the `mat-icon` element.

In order to prevent XSS vulnerabilities, any SVG URLs passed to the `MatIconRegistry` must be 
marked as trusted resource URLs by using Angular's `DomSanitizer` service.

Also note that all SVG icons are fetched via XmlHttpRequest, and due to the same-origin policy, 
their URLs must be on the same domain as the containing page, or their servers must be configured 
to allow cross-domain access.

#### Named icons

To associate a name with an icon URL, use the `addSvgIcon` or `addSvgIconInNamespace` methods of
`MatIconRegistry`. After registering an icon, it can be displayed by setting the `svgIcon` input.
For an icon in the default namespace, use the name directly. For a non-default namespace, use the
format `[namespace]:[name]`.

#### Icon sets

Icon sets allow grouping multiple icons into a single SVG file. This is done by creating a single
root `<svg>` tag that contains multiple nested `<svg>` tags in its `<defs>` section. Each of these
nested tags is identified with an `id` attribute. This `id` is used as the name of the icon.

Icon sets are registered using the `addSvgIconSet` or `addSvgIconSetInNamespace` methods of
`MatIconRegistry`. After an icon set is registered, each of its embedded icons can be accessed by
their `id` attributes. To display an icon from an icon set, use the `svgIcon` input in the same way
as for individually registered icons.

Multiple icon sets can be registered in the same namespace. Requesting an icon whose id appears in
more than one icon set, the icon from the most recently registered set will be used.

### Theming

By default, icons will use the current font color (`currentColor`). this color can be changed to 
match the current theme's colors using the `color` attribute. This can be changed to 
`'primary'`, `'accent'`, or `'warn'`.

### Accessibility

Similar to an `<img>` element, an icon alone does not convey any useful information for a
screen-reader user. The user of `<mat-icon>` must provide additional information pertaining to how
the icon is used. Based on the use-cases described below, `mat-icon` is marked as
`aria-hidden="true"` by default, but this can be overriden by adding `aria-hidden="false"` to the
element.

In thinking about accessibility, it is useful to place icon use into one of three categories:
1. **Decorative**: the icon conveys no real semantic meaning and is purely cosmetic.
2. **Interactive**: a user will click or otherwise interact with the icon to perform some action.
3. **Indicator**: the icon is not interactive, but it conveys some information, such as a status.

#### Decorative icons
When the icon is puely cosmetic and conveys no real semantic meaning, the `<mat-icon>` element
should be marked with `aria-hidden="true"`.

#### Interactive icons
Icons alone are not interactive elements for screen-reader users; when the user would interact with
some icon on the page, a more appropriate  element should "own" the interaction:
* The `<mat-icon>` element should be a child of a `<button>` or `<a>` element.
* The `<mat-icon>` element should be marked with `aria-hidden="true"`.
* The parent `<button>` or `<a>` should either have a meaningful label provided either through
direct text content, `aria-label`, or `aria-labelledby`.

#### Indicator icons
When the presence of an icon communicates some information to the user, that information must also
be made available to screen-readers. The most straightforward way to do this is to
1. Mark the `<mat-icon>` as `aria-hidden="true"`
2. Add a `<span>` as an adjacent sibling to the `<mat-icon>` element with text that conveys the same
information as the icon.
3. Add the `cdk-visually-hidden` class to the `<span>`. This will make the message invisible
on-screen but still available to screen-reader users.

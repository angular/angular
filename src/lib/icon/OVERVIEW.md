`md-icon` makes it easier to use _vector-based_ icons in your app.  This directive supports both
icon fonts and SVG icons, but not bitmap-based formats (png, jpg, etc.).

<!-- example(icon-overview) -->

### Registering icons

`MdIconRegistry` is an injectable service that allows you to associate icon names with SVG URLs and
define aliases for CSS font classes. Its methods are discussed below and listed in the API summary.

### Font icons with ligatures

Some fonts are designed to show icons by using
[ligatures](https://en.wikipedia.org/wiki/Typographic_ligature), for example by rendering the text
"home" as a home image. To use a ligature icon, put its text in the content of the `md-icon`
component.

By default the
[Material icons font](http://google.github.io/material-design-icons/#icon-font-for-the-web) is used.
(You will still need to include the HTML to load the font and its CSS, as described in the link).
You can specify a different font by setting the `fontSet` input to either the CSS class to apply to
use the desired font, or to an alias previously registered with
`MdIconRegistry.registerFontClassAlias`.

### Font icons with CSS

Fonts can also display icons by defining a CSS class for each icon glyph, which typically uses a
`:before` selector to cause the icon to appear.
[FontAwesome](https://fortawesome.github.io/Font-Awesome/examples/) uses this approach to display
its icons. To use such a font, set the `fontSet` input to the font's CSS class (either the class
itself or an alias registered with `MdIconRegistry.registerFontClassAlias`), and set the `fontIcon`
input to the class for the specific icon to show.

For both types of font icons, you can specify the default font class to use when `fontSet` is not
explicitly set by calling `MdIconRegistry.setDefaultFontSetClass`.

### SVG icons

When an `md-icon` component displays an SVG icon, it does so by directly inlining the SVG content
into the page as a child of the component. (Rather than using an <img> tag or a div background
image). This makes it easier to apply CSS styles to SVG icons. For example, the default color of the
SVG content is the CSS 
[currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentColor_keyword) 
value. This makes SVG icons by default have the same color as surrounding text, and allows you to 
change the color by setting the "color" style on the `md-icon` element.

In order to prevent XSS vulnerabilities, any SVG URLs passed to the `MdIconRegistry` must be 
marked as trusted resource URLs by using Angular's `DomSanitizer` service.

Also note that all SVG icons are fetched via XmlHttpRequest, and due to the same-origin policy, 
their URLs must be on the same domain as the containing page, or their servers must be configured 
to allow cross-domain access.

#### Named icons

To associate a name with an icon URL, use the `addSvgIcon` or `addSvgIconInNamespace` methods of
`MdIconRegistry`. After registering an icon, it can be displayed by setting the `svgIcon` input.
For an icon in the default namespace, use the name directly. For a non-default namespace, use the
format `[namespace]:[name]`.

#### Icon sets

Icon sets allow grouping multiple icons into a single SVG file. This is done by creating a single
root `<svg>` tag that contains multiple nested `<svg>` tags in its `<defs>` section. Each of these
nested tags is identified with an `id` attribute. This `id` is used as the name of the icon.

Icon sets are registered using the `addSvgIconSet` or `addSvgIconSetInNamespace` methods of
`MdIconRegistry`. After an icon set is registered, each of its embedded icons can be accessed by
their `id` attributes. To display an icon from an icon set, use the `svgIcon` input in the same way
as for individually registered icons.

Multiple icon sets can be registered in the same namespace. Requesting an icon whose id appears in
more than one icon set, the icon from the most recently registered set will be used.

### Theming

By default, icons will use the current font color (`currentColor`). this color can be changed to 
match the current theme's colors using the `color` attribute. This can be changed to 
`'primary'`, `'accent'`, or `'warn'`.

### Accessibility

If an `aria-label` attribute is set on the `md-icon` element, its value will be used as-is. If not,
the md-icon component will attempt to set the aria-label value from one of these sources:
* The `alt` attribute
* The `fontIcon` input
* The name of the icon from the `svgIcon` input (not including any namespace)
* The text content of the component (for ligature icons)

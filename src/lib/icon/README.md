# md-icon

`md-icon` is a component that displays an icon, which can be a font glyph or an SVG image.

## MdIconRegistry

`MdIconRegistry` is an injectable service that allows you to associate icon names with SVG URLs and define aliases for CSS font classes. Its methods are discussed below and listed in the API summary.

## Font icons

### Ligatures

Some fonts are designed to show icons by using [ligatures](https://en.wikipedia.org/wiki/Typographic_ligature), for example by rendering the text "home" as a home image. To use a ligature icon, put its text in the content of the `md-icon` component, for example:
```html
<md-icon>home</md-icon>
```

By default the [Material icons font](http://google.github.io/material-design-icons/#icon-font-for-the-web) is used. (You will still need to include the HTML to load the font and its CSS, as described in the link). You can specify a different font by setting the `fontSet` input to either the CSS class to apply to use the desired font, or to an alias previously registered with `MdIconRegistry.registerFontClassAlias`, for example:
```javascript
mdIconRegistry.registerFontClassAlias('myfont', 'my-icon-font-class');
```

```html
<md-icon fontSet="myfont">help</md-icon>
```

### Font icons via CSS

Fonts can also display icons by defining a CSS class for each icon glyph, which typically uses a :before selector to cause the icon to appear. [FontAwesome](https://fortawesome.github.io/Font-Awesome/examples/) uses this approach to display its icons. To use such a font, set the `fontSet` input to the font's CSS class (either the class itself or an alias registered with `MdIconRegistry.registerFontClassAlias`), and set the `fontIcon` input to the class for the specific icon to show. Example:

```html
<md-icon fontSet="fa" fontIcon="fa-square"></md-icon>
```

For both types of font icons, you can specify the default font class to use when `fontSet` is not explicitly set by calling `MdIconRegistry.setDefaultFontSetClass`.

## SVG icons

When an `md-icon` component displays an SVG icon, it does so by directly inlining the SVG content into the page as a child of the component. (Rather than using an <img> tag or a div background image). This makes it easier to apply CSS styles to SVG icons. For example, the default color of the SVG content is the CSS [currentColor](http://www.quirksmode.org/css/color/currentcolor.html) value. This makes SVG icons by default have the same color as surrounding text, and allows you to change the color by setting the "color" style on the `md-icon` element.

### Icons from URLs

SVG icons can be used either by directly specifying the icon's URL, or by associating an icon name with a URL and then referring to the name. To use a URL directly, set the `svgSrc` input:
```html
<md-icon svgSrc="/assets/sun.svg"></md-icon>
```

### Named icons

To associate a name with an icon URL, use the `addSvgIcon` or `addSvgIconInNamespace` methods of `MdIconRegistry`. After registering an icon, it can be displayed by setting the `svgIcon` input. For an icon in the default namespace, use the name directly. For a non-default namespace, use the format `[namespace]:[name]`. Examples:
```javascript
mdIconRegistry.addSvgIcon('moon', '/assets/moon.svg');
mdIconRegistry.addSvgIconInNamespace('animals', 'cat', '/assets/cat.svg');
```

```html
<md-icon svgIcon="moon"></md-icon>
<md-icon svgIcon="animals:cat"></md-icon>
```

### Icon sets

Icon sets allow grouping multiple icons into a single SVG file. The content of an icon set file looks like this, where each nested `<svg>` tag defines an individual icon, and is identified with a unique "id" attribute.
```
<svg>
  <defs>
    <svg id="mercury">...</svg>
    <svg id="venus">...</svg>
    <svg id="earth">...</svg>
    <svg id="mars">...</svg>
  </defs>
</svg>
```

Icon sets are registered using the `addSvgIconSet` or `addSvgIconSetInNamespace` methods of `MdIconRegistry`. After an icon set is registered, each of its embedded icons can be accessed by their "id" attributes. To display an icon from an icon set, use the `svgIcon` input in the same way as for individually registered icons. Example:
```javascript
mdIconRegistry.addSvgIconSetInNamespace('planets', '/assets/planets.svg');
```

```html
<md-icon svgIcon="planets:venus"></md-icon>
```

Multiple icon sets can be registered in the same namespace. If you request an icon whose id appears in more than one icon set, the icon from the most recently registered set will be used.

Note that all SVG icons are fetched via XmlHttpRequest, and due to the same-origin policy their URLs must be on the same domain as the containing page, or their servers must be configured to allow cross-domain access.

### Theming

Icons can be themed to match your "primary" palette, your "accent" palette, or your "warn" palette using the `color` attribute.
Simply pass in the palette name.

Example:

 ```html
<md-icon color="primary">home</md-icon>
<md-icon color="accent">home</md-icon>
<md-icon color="warn">home</md-icon>
```

### Accessibility

If you set an "aria-label" attribute on the md-icon element, its value will be used as-is. If you do not, the md-icon component will attempt to set the aria-label value from one of these sources:
* The `alt` attribute
* The `fontIcon` input
* The name of the icon from the `svgIcon` input (not including any namespace)
* The text content of the component (for ligature icons)

### API Summary

md-icon Properties:

| Name         | Type     | Description |
| ---          | ---      | --- |
| `svgSrc`     | string   | The URL of the SVG icon to display |
| `svgIcon`    | string   | The name (and possibly namespace) of an icon previously registered with `MdIconRegistry.addSvgIcon` or `MdIconRegistry.addSvgIconInNamespace` |
| `fontSet`    | string   | The font to use to display an icon glyph. The value can be either a CSS class name, or an alias previously defined with `MdIconRegistry.registerFontClassAlias` |
| `fontIcon`   | string   | The CSS class that identifies the specific icon to use from an icon font |

MdIconRegistry methods (all methods return `this` for chaining):

| Signature   | Description |
| ---         | --- |
| addSvgIcon(name: string, url: string): MdIconProvider | Associates an icon name with a URL in the default namespace. When an `md-icon` component has its `svgIcon` input set to this name, the icon will be loaded from this URL. |
| addSvgIconInNamespace(namespace: string, iconName: string, url: string): MdIconProvider | Associates an icon name with a URL in the specified namespace. |
| addSvgIconSet(url: string): MdIconProvider | Makes the icons contained in the icon set from a URL available in the default namespace. |
| addSvgIconSetInNamespace(namespace: string, url: string): MdIconProvider | Makes the icons contained in the icon set from a URL available in the specified namespace. |
| registerFontClassAlias(alias: string, className: string): MdIconProvider | Associates a font alias with a CSS class. When an `md-icon` component has its `fontSet` input set to the alias, the CSS class will be added to the component's element. It is assumed that the user has defined a corresponding CSS rule to set the desired font. |
| setDefaultFontSetClass(className: string): MdIconProvider | Sets the default CSS class to apply to font icons when mdFontSet is not set. |

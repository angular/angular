# Styling directives

Directives can optionally include CSS styles that apply to the host element where the directive is applied.

```angular-ts {highlight:[4-8]}
@Directive({
  selector: '[appHighlight]',
  styles: `
    :host {
      background-color: yellow;
      display: inline-block;
    }
  `,
})
export class HighlightDirective {}
```

You can also write directive styles in separate stylesheet files:

```angular-ts {highlight:[3]}
@Directive({
  selector: '[appHighlight]',
  styleUrl: './highlight.directive.css',
})
export class HighlightDirective {}
```

## Style scoping

Like components, directives support a `encapsulation` property that defines how Angular scopes the directive's styling.

Directives support two `ViewEncapsulation` modes:

| Mode                                   | Description                                                               |
| :------------------------------------- | :------------------------------------------------------------------------ |
| `ViewEncapsulation.Emulated` (default) | Scopes styles strictly to the host element using a unique host attribute. |
| `ViewEncapsulation.None`               | Applies styles globally without any scoping.                              |

IMPORTANT: Directives do **not** support `ViewEncapsulation.ShadowDom`. Specifying `ShadowDom` on a directive results in a compilation error.

### ViewEncapsulation.Emulated

By default, Angular uses emulated encapsulation on directives. Because directives do not have their own templates, style rules in a directive are **scoped strictly to the host element**.

During compilation, Angular generates a unique host attribute (such as `_nghost-c123`) for the directive, attaches this attribute to the host element in the DOM, and transforms every selector in your styles to target that host attribute.

#### How selectors are transformed

Because directives only target the host element, all selectors match against the host rather than child elements inside the template:

| Selector in directive styles | Compiled CSS output                 | Matches                                                                          |
| :--------------------------- | :---------------------------------- | :------------------------------------------------------------------------------- |
| `:host`                      | `[_nghost-c123]`                    | The host element                                                                 |
| `div` or `:host(div)`        | `div[_nghost-c123]`                 | The host element, only if it is a `<div>`                                        |
| `.badge` or `:host(.badge)`  | `.badge[_nghost-c123]`              | The host element, only if it has class `.badge`                                  |
| `button:hover`               | `button[_nghost-c123]:hover`        | The host element on hover, only if it is a `<button>`                            |
| `:host span`                 | `[_nghost-c123] span[_nghost-c123]` | A child `<span>` element **only** if the same directive is applied to that child |

IMPORTANT: Unlike component styles, selectors like `span` in a directive will **not** match `<span>` child elements inside the host. Directives do not apply content attributes (`_ngcontent-cXXX`) to child elements. Because of this, descendant selectors like `:host span` will only match if the child element also receives the host attribute (which only happens if you apply the directive to the child as well).

### ViewEncapsulation.None

When you set `encapsulation: ViewEncapsulation.None`, Angular does not scope the styles to the host element. The styles are injected into the document as global CSS rules, and Angular does not add any host attributes to the element.

```angular-ts {highlight:[4]}
@Directive({
  selector: '[appGlobalTooltip]',
  styles: `.tooltip-popup { position: absolute; z-index: 1000; }`,
  encapsulation: ViewEncapsulation.None,
})
export class GlobalTooltipDirective {}
```

## Applying multiple styled directives

You can apply a component and multiple styled directives to the same host element. Each directive configured with `ViewEncapsulation.Emulated` adds its own unique host attribute to the element:

```angular-html
<button appHighlight appTooltip>Click me</button>
```

Rendered HTML:

```html
<button appHighlight appTooltip _nghost-c1 _nghost-c2>Click me</button>
```

Each directive's styles apply independently through its respective host attribute.

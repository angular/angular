The `<ng-content>` element specifies where to project content inside a component template.

## Attributes 

| Attribute     | Description                                                             |
|---------------|-------------------------------------------------------------------------|
| `select`      | CSS selector. Matching elements are projected into this `<ng-content>`. |

Only select elements from the projected content that match the given CSS `selector`.

Angular supports [selectors](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) for any
combination of tag name, attribute, CSS class, and the `:not` pseudo-class.

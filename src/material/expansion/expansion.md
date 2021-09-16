`<mat-expansion-panel>` provides an expandable details-summary view.

<!-- example(expansion-overview) -->

### Expansion-panel content

#### Header

The `<mat-expansion-panel-header>` shows a summary of the panel content and acts
as the control for expanding and collapsing. This header may optionally contain an
`<mat-panel-title>` and an `<mat-panel-description>`, which format the content of the
header to align with Material Design specifications.

<!-- example({"example": "expansion-overview",
              "file": "expansion-overview-example.html", 
              "region": "basic-panel"}) -->
              
By default, the expansion-panel header includes a toggle icon at the end of the
header to indicate the expansion state. This icon can be hidden via the
`hideToggle` property.

<!-- example({"example": "expansion-overview",
              "file": "expansion-overview-example.html", 
              "region": "hide-toggle"}) -->         

#### Action bar

Actions may optionally be included at the bottom of the panel, visible only when the expansion
is in its expanded state.

<!-- example({"example": "expansion-steps",
              "file": "expansion-steps-example.html", 
              "region": "action-bar"}) -->
#### Disabling a panel

Expansion panels can be disabled using the `disabled` attribute. A disabled expansion panel can't
be toggled by the user, but can still be manipulated programmatically.

<!-- example({"example": "expansion-expand-collapse-all",
              "file": "expansion-expand-collapse-all-example.html", 
              "region": "disabled"}) -->

### Accordion

Multiple expansion-panels can be combined into an accordion. The `multi="true"` input allows the
expansions state to be set independently of each other. When `multi="false"` (default) just one
panel can be expanded at a given time:

<!-- example({"example": "expansion-expand-collapse-all",
              "file": "expansion-expand-collapse-all-example.html", 
              "region": "multi"}) -->

### Lazy rendering
By default, the expansion panel content will be initialized even when the panel is closed.
To instead defer initialization until the panel is open, the content should be provided as
an `ng-template`:
```html
<mat-expansion-panel>
  <mat-expansion-panel-header>
    This is the expansion title
  </mat-expansion-panel-header>

  <ng-template matExpansionPanelContent>
    Some deferred content
  </ng-template>
</mat-expansion-panel>
```

### Accessibility

`MatExpansionPanel` imitates the experience of the native `<details>` and `<summary>` elements.
The expansion panel header applies `role="button"` and the `aria-controls` attribute with the
content element's ID.

Because expansion panel headers are buttons, avoid adding interactive controls as children
of `<mat-expansion-panel-header>`, including buttons and anchors.

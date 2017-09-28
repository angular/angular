`<mat-expansion-panel>` provides an expandable details-summary view.

<!-- example(expansion-overview) -->

### Expansion-panel content

Each expansion-panel must include a header and may optionally include an action bar.

#### Header

The `<mat-expansion-panel-header>` shows a summary of the panel content and acts
as the control for expanding and collapsing. This header may optionally contain an
`<mat-panel-title>` and an `<mat-panel-description>`, which format the content of the
header to align with Material Design specifications.

By default, the expansion-panel header includes a toggle icon at the end of the
header to indicate the expansion state. This icon can be hidden via the
`hideToggle` property.

```html
<mat-expansion-panel>
  <mat-expansion-panel-header>
    <mat-panel-title>
      This is the expansion title
    </mat-panel-title>
    <mat-panel-description>
      This is a summary of the content
    </mat-panel-description>
  </mat-expansion-panel-header>

  <p>This is the primary content of the panel.</p>

</mat-expansion-panel>
```

#### Action bar

Actions may optionally be included at the bottom of the panel, visible only when the expansion
is in its expanded state.

```html
<mat-expansion-panel>
  <mat-expansion-panel-header>
    This is the expansion title
  </mat-expansion-panel-header>

  <p>This is the primary content of the panel.</p>

  <mat-action-row>
    <button mat-button>Click me</button>
  </mat-action-row>
</mat-expansion-panel>
```

#### Disabling a panel

Expansion panels can be disabled using the `disabled` attribute. A disabled expansion panel can't
be toggled by the user, but can still be manipulated using programmatically.

```html
<mat-expansion-panel [disabled]="isDisabled">
  <mat-expansion-panel-header>
    This is the expansion title
  </mat-expansion-panel-header>
  <mat-panel-description>
    This is a summary of the content
  </mat-panel-description>
</mat-expansion-panel>
```


### Accordion

Multiple expansion-panels can be combined into an accordion. The `multi="true"` input allows the
expansions state to be set independently of each other. When `multi="false"` (default) just one
panel can be expanded at a given time:

```html
<mat-accordion>

  <mat-expansion-panel>
    <mat-expansion-panel-header>
      This is the expansion 1 title
    </mat-expansion-panel-header>

    This the expansion 1 content

  </mat-expansion-panel>

  <mat-expansion-panel>
    <mat-expansion-panel-header>
      This is the expansion 2 title
    </mat-expansion-panel-header>

    This the expansion 2 content

  </mat-expansion-panel>

</mat-accordion>
```

### Accessibility
The expansion-panel aims to mimic the experience of the native `<details>` and `<summary>` elements.
The expansion panel header has `role="button"`. The expansion panel header has attribute
`aria-controls` with the expansion panel's id as value.

The expansion panel headers are buttons. Users can use the keyboard to activate the expansion panel
header to switch between expanded state and collapsed state. Because the header acts as a button,
additional interactive elements should not be put inside of the header.

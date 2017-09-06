`<md-expansion-panel>` provides an expandable details-summary view.

<!-- example(expansion-overview) -->

### Expansion-panel content

Each expansion-panel must include a header and may optionally include an action bar.

#### Header

The `<md-expansion-panel-header>` shows a summary of the panel content and acts
as the control for expanding and collapsing. This header may optionally contain an
`<md-panel-title>` and an `<md-panel-description>`, which format the content of the
header to align with Material Design specifications.

By default, the expansion-panel header includes a toggle icon at the end of the
header to indicate the expansion state. This icon can be hidden via the
`hideToggle` property.

```html
<md-expansion-panel>
  <md-expansion-panel-header>
    <md-panel-title>
      This is the expansion title
    </md-panel-title>
    <md-panel-description>
      This is a summary of the content
    </md-panel-description>
  </md-expansion-panel-header>

  <p>This is the primary content of the panel.</p>

</md-expansion-panel>
```

#### Action bar

Actions may optionally be included at the bottom of the panel, visible only when the expansion
is in its expanded state.

```html
<md-expansion-panel>
  <md-expansion-panel-header>
    This is the expansion title
  </md-expansion-panel-header>

  <p>This is the primary content of the panel.</p>

  <md-action-row>
    <button md-button>Click me</button>
  </md-action-row>
</md-expansion-panel>
```

#### Disabling a panel

Expansion panels can be disabled using the `disabled` attribute. A disabled expansion panel can't
be toggled by the user, but can still be manipulated using programmatically.

```html
<md-expansion-panel [disabled]="isDisabled">
  <md-expansion-panel-header>
    This is the expansion title
  </md-expansion-panel-header>
  <md-panel-description>
    This is a summary of the content
  </md-panel-description>
</md-expansion-panel>
```


### Accordion

Multiple expansion-panels can be combined into an accordion. The `multi="true"` input allows the
expansions state to be set independently of each other. When `multi="false"` (default) just one
panel can be expanded at a given time:

```html
<md-accordion>

  <md-expansion-panel>
    <md-expansion-panel-header>
      This is the expansion 1 title
    </md-expansion-panel-header>

    This the expansion 1 content

  </md-expansion-panel>

  <md-expansion-panel>
    <md-expansion-panel-header>
      This is the expansion 2 title
    </md-expansion-panel-header>

    This the expansion 2 content

  </md-expansion-panel>

</md-accordion>
```

### Accessibility
The expansion-panel aims to mimic the experience of the native `<details>` and `<summary>` elements.
The expansion panel header has `role="button"`. The expansion panel header has attribute
`aria-controls` with the expansion panel's id as value.

The expansion panel headers are buttons. Users can use the keyboard to activate the expansion panel
header to switch between expanded state and collapsed state. Because the header acts as a button,
additional interactive elements should not be put inside of the header.

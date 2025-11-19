<docs-decorative-header title="Accordion">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/accordion/" title="Accordion ARIA pattern"/>
  <docs-pill href="/api?query=accordion#angular_aria_accordion" title="Accordion API Reference"/>
</docs-pill-row>

## Overview

An accordion organizes related content into expandable and collapsible sections, reducing page scrolling and helping users focus on relevant information. Each section has a trigger button and a content panel. Clicking a trigger toggles the visibility of its associated panel.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css"/>
</docs-code-multifile>

## Usage

Accordions work well for organizing content into logical groups where users typically need to view one section at a time.

**Use accordions when:**

- Displaying FAQs with multiple questions and answers
- Organizing long forms into manageable sections
- Reducing scrolling on content-heavy pages
- Progressively disclosing related information

**Avoid accordions when:**

- Building navigation menus (use the [Menu](guide/aria/menu) component instead)
- Creating tabbed interfaces (use the [Tabs](guide/aria/tabs) component instead)
- Showing a single collapsible section (use a disclosure pattern instead)
- Users need to see multiple sections simultaneously (consider a different layout)

## Features

- **Expansion modes** - Control whether one or multiple panels can be open at the same time
- **Keyboard navigation** - Navigate between triggers using arrow keys, Home, and End
- **Lazy rendering** - Content is only created when a panel first expands, improving initial load performance
- **Disabled states** - Disable the entire group or individual triggers
- **Focus management** - Control whether disabled items can receive keyboard focus
- **Programmatic control** - Expand, collapse, or toggle panels from your component code
- **RTL support** - Automatic support for right-to-left languages

## Examples

### Single expansion mode

Set `[multiExpandable]="false"` to allow only one panel to be open at a time. Opening a new panel automatically closes any previously open panel.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/single-expansion/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

This mode works well for FAQs or situations where you want users to focus on one answer at a time.

### Multiple expansion mode

Set `[multiExpandable]="true"` to allow multiple panels to be open simultaneously. Users can expand as many panels as needed without closing others.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/multi-expansion/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

This mode is useful for form sections or when users need to compare content across multiple panels.

NOTE: The `multiExpandable` input defaults to `true`. Set it to `false` explicitly if you want single expansion behavior.

### Disabled accordion items

Disable specific triggers using the `disabled` input. Control how disabled items behave during keyboard navigation using the `softDisabled` input on the accordion group.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/accordion/src/disabled-focusable/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

When `[softDisabled]="true"` (the default), disabled items can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled items are skipped entirely during keyboard navigation.

### Lazy content rendering

Use the `ngAccordionContent` directive on an `ng-template` to defer rendering content until the panel first expands. This improves performance for accordions with heavy content like images, charts, or complex components.

```angular-html
<div ngAccordionGroup>
  <div>
    <button ngAccordionTrigger panelId="item-1">
      Trigger Text
    </button>
    <div ngAccordionPanel panelId="item-1">
      <ng-template ngAccordionContent>
        <!-- This content only renders when the panel first opens -->
        <img src="large-image.jpg" alt="Description">
        <app-expensive-component />
      </ng-template>
    </div>
  </div>
</div>
```

By default, content remains in the DOM after the panel collapses. Set `[preserveContent]="false"` to remove the content from the DOM when the panel closes.

## APIs

### AccordionGroup

The container directive that manages keyboard navigation and expansion behavior for a group of accordion items.

#### Inputs

| Property          | Type      | Default | Description                                                               |
| ----------------- | --------- | ------- | ------------------------------------------------------------------------- |
| `disabled`        | `boolean` | `false` | Disables all triggers in the group                                        |
| `multiExpandable` | `boolean` | `true`  | Whether multiple panels can be expanded simultaneously                    |
| `softDisabled`    | `boolean` | `true`  | When `true`, disabled items are focusable. When `false`, they are skipped |
| `wrap`            | `boolean` | `false` | Whether keyboard navigation wraps from last to first item and vice versa  |

#### Methods

| Method        | Parameters | Description                                                      |
| ------------- | ---------- | ---------------------------------------------------------------- |
| `expandAll`   | none       | Expands all panels (only works when `multiExpandable` is `true`) |
| `collapseAll` | none       | Collapses all panels                                             |

### AccordionTrigger

The directive applied to the button element that toggles panel visibility.

#### Inputs

| Property   | Type      | Default | Description                                                    |
| ---------- | --------- | ------- | -------------------------------------------------------------- |
| `id`       | `string`  | auto    | Unique identifier for the trigger                              |
| `panelId`  | `string`  | —       | **Required.** Must match the `panelId` of the associated panel |
| `disabled` | `boolean` | `false` | Disables this trigger                                          |
| `expanded` | `boolean` | `false` | Whether the panel is expanded (supports two-way binding)       |

#### Signals

| Property | Type              | Description                             |
| -------- | ----------------- | --------------------------------------- |
| `active` | `Signal<boolean>` | Whether the trigger currently has focus |

#### Methods

| Method     | Parameters | Description                       |
| ---------- | ---------- | --------------------------------- |
| `expand`   | none       | Expands the associated panel      |
| `collapse` | none       | Collapses the associated panel    |
| `toggle`   | none       | Toggles the panel expansion state |

### AccordionPanel

The directive applied to the element containing the collapsible content.

#### Inputs

| Property          | Type      | Default | Description                                                      |
| ----------------- | --------- | ------- | ---------------------------------------------------------------- |
| `id`              | `string`  | auto    | Unique identifier for the panel                                  |
| `panelId`         | `string`  | —       | **Required.** Must match the `panelId` of the associated trigger |
| `preserveContent` | `boolean` | `true`  | Whether to keep content in DOM after panel collapses             |

#### Signals

| Property  | Type              | Description                             |
| --------- | ----------------- | --------------------------------------- |
| `visible` | `Signal<boolean>` | Whether the panel is currently expanded |

#### Methods

| Method     | Parameters | Description                 |
| ---------- | ---------- | --------------------------- |
| `expand`   | none       | Expands this panel          |
| `collapse` | none       | Collapses this panel        |
| `toggle`   | none       | Toggles the expansion state |

### AccordionContent

The structural directive applied to an `ng-template` inside an accordion panel to enable lazy rendering.

This directive has no inputs, outputs, or methods. Apply it to an `ng-template` element:

```angular-html
<div ngAccordionPanel panelId="item-1">
  <ng-template ngAccordionContent>
    <!-- Content here is lazily rendered -->
  </ng-template>
</div>
```

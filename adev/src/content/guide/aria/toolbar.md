<docs-decorative-header title="Toolbar">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Toolbar ARIA pattern"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Toolbar API Reference"/>
</docs-pill-row>

## Overview

A container for grouping related controls and actions with keyboard navigation, commonly used for text formatting, toolbars, and command panels.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

Toolbar works best for grouping related controls that users access frequently. Consider using toolbar when:

- **Multiple related actions** - You have several controls that perform related functions (like text formatting buttons)
- **Keyboard efficiency matters** - Users benefit from quick keyboard navigation through arrow keys
- **Grouped controls** - You need to organize controls into logical sections with separators
- **Frequent access** - Controls are used repeatedly within a workflow

Avoid toolbar when:

- A simple button group is sufficient - For just 2-3 unrelated actions, individual buttons work better
- Controls aren't related - Toolbar implies a logical grouping; unrelated controls confuse users
- Complex nested navigation - Deep hierarchies are better served by menus or navigation components

## Features

Angular's toolbar provides a fully accessible toolbar implementation with:

- **Keyboard Navigation** - Navigate widgets with arrow keys, activate with Enter or Space
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Widget Groups** - Organize related widgets like radio button groups or toggle button groups
- **Flexible Orientation** - Horizontal or vertical layouts with automatic keyboard navigation
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages
- **Configurable Focus** - Choose between wrapping navigation or hard stops at edges

## Examples

### Basic horizontal toolbar

Horizontal toolbars organize controls from left to right, matching the common pattern in text editors and design tools. Arrow keys navigate between widgets, maintaining focus within the toolbar until users press Tab to move to the next page element.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Vertical toolbar

Vertical toolbars stack controls top to bottom, useful for side panels or vertical command palettes. Up and down arrow keys navigate between widgets.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/vertical/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Widget groups

Widget groups contain related controls that work together, like text alignment options or list formatting choices. Groups maintain their own internal state while participating in toolbar navigation.

In the examples above, the alignment buttons are wrapped in `ngToolbarWidgetGroup` with `role="radiogroup"` to create a mutually exclusive selection group.

The `multi` input controls whether multiple widgets within a group can be selected simultaneously:

```html {highlight: [15]}
<!-- Single selection (radio group) -->
<div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
  <button ngToolbarWidget value="left">Left</button>
  <button ngToolbarWidget value="center">Center</button>
  <button ngToolbarWidget value="right">Right</button>
</div>

<!-- Multiple selection (toggle group) -->
<div ngToolbarWidgetGroup [multi]="true" aria-label="Formatting">
  <button ngToolbarWidget value="bold">Bold</button>
  <button ngToolbarWidget value="italic">Italic</button>
  <button ngToolbarWidget value="underline">Underline</button>
</div>
```

### Disabled widgets

Toolbars support two disabled modes:

1. **Soft-disabled** widgets remain focusable but visually indicate they're unavailable
2. **Hard-disabled** widgets are completely removed from keyboard navigation.

By default, `softDisabled` is `true`, which allows disabled widgets to still receive focus. If you want to enable hard-disabled mode, set `[softDisabled]="false"` on the toolbar.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Right-to-left (RTL) support

Toolbars automatically support right-to-left languages. Wrap the toolbar in a container with `dir="rtl"` to reverse the layout and keyboard navigation direction. Arrow key navigation adjusts automatically: left arrow moves to the next widget, right arrow to the previous.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/rtl/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## APIs

### Toolbar Directive

The `ngToolbar` directive provides the container for toolbar functionality.

#### Inputs

| Property       | Type                           | Default        | Description                                            |
| -------------- | ------------------------------ | -------------- | ------------------------------------------------------ |
| `orientation`  | `'vertical'` \| `'horizontal'` | `'horizontal'` | Whether toolbar is vertically or horizontally oriented |
| `disabled`     | `boolean`                      | `false`        | Disables the entire toolbar                            |
| `softDisabled` | `boolean`                      | `true`         | Whether disabled items can receive focus               |
| `wrap`         | `boolean`                      | `true`         | Whether focus should wrap at the edges                 |

### ToolbarWidget Directive

The `ngToolbarWidget` directive marks an element as a navigable widget within the toolbar.

#### Inputs

| Property   | Type      | Default | Description                                     |
| ---------- | --------- | ------- | ----------------------------------------------- |
| `id`       | `string`  | auto    | Unique identifier for the widget                |
| `disabled` | `boolean` | `false` | Disables the widget                             |
| `value`    | `V`       | -       | The value associated with the widget (required) |

#### Signals

| Property   | Type              | Description                                 |
| ---------- | ----------------- | ------------------------------------------- |
| `active`   | `Signal<boolean>` | Whether the widget is currently focused     |
| `selected` | `Signal<boolean>` | Whether the widget is selected (in a group) |

### ToolbarWidgetGroup Directive

The `ngToolbarWidgetGroup` directive groups related widgets together.

#### Inputs

| Property   | Type      | Default | Description                              |
| ---------- | --------- | ------- | ---------------------------------------- |
| `disabled` | `boolean` | `false` | Disables all widgets in the group        |
| `multi`    | `boolean` | `false` | Whether multiple widgets can be selected |

### Related components

Toolbar can contain various widget types including buttons, trees, and comboboxes. See individual component documentation for specific widget implementations.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/" title="Toolbar ARIA pattern"/>
  <docs-pill href="/api/aria/toolbar/Toolbar" title="Toolbar API Reference"/>
</docs-pill-row>

<docs-decorative-header title="Select">
</docs-decorative-header>

## Overview

A pattern that combines readonly combobox with listbox to create single-selection dropdowns with keyboard navigation and screen reader support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

The select pattern works best when users need to choose a single value from a familiar set of options.

Consider using this pattern when:

- **The option list is fixed** (fewer than 20 items) - Users can scan and choose without filtering
- **Options are familiar** - Users recognize the choices without needing to search
- **Forms need standard fields** - Country, state, category, or status selection
- **Settings and configuration** - Dropdown menus for preferences or options
- **Clear option labels** - Each choice has a distinct, scannable name

Avoid this pattern when:

- **The list has more than 20 items** - Use the [Autocomplete pattern](guide/aria/autocomplete) for better filtering
- **Users need to search options** - [Autocomplete](guide/aria/autocomplete) provides text input and filtering
- **Multiple selection is needed** - Use the [Multiselect pattern](guide/aria/multiselect) instead
- **Very few options exist (2-3)** - Radio buttons provide better visibility of all choices

## Features

The select pattern combines [Combobox](guide/aria/combobox) and [Listbox](guide/aria/listbox) directives to provide a fully accessible dropdown with:

- **Keyboard Navigation** - Navigate options with arrow keys, select with Enter, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Custom Display** - Show selected values with icons, formatting, or rich content
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Smart Positioning** - CDK Overlay handles viewport edges and scrolling
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages

## Examples

### Basic select

Users need a standard dropdown to choose from a list of values. A readonly combobox paired with a listbox provides the familiar select experience with full accessibility support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

The `readonly` attribute on `ngCombobox` prevents text input while preserving keyboard navigation. Users interact with the dropdown using arrow keys and Enter, just like a native select element.

### Select with custom display

Options often need visual indicators like icons or badges to help users identify choices quickly. Custom templates within options allow rich formatting while maintaining accessibility.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Each option displays an icon alongside the label. The selected value updates to show the chosen option's icon and text, providing clear visual feedback.

### Disabled select

Selects can be disabled to prevent user interaction when certain form conditions aren't met. The disabled state provides visual feedback and prevents keyboard interaction.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

When disabled, the select shows a disabled visual state and blocks all user interaction. Screen readers announce the disabled state to assistive technology users.

## APIs

The select pattern uses the following directives from Angular's Aria library. See the full API documentation in the linked guides.

### Combobox Directives

The select pattern uses `ngCombobox` with the `readonly` attribute to prevent text input while preserving keyboard navigation.

#### Inputs

| Property   | Type      | Default | Description                               |
| ---------- | --------- | ------- | ----------------------------------------- |
| `readonly` | `boolean` | `false` | Set to `true` to create dropdown behavior |
| `disabled` | `boolean` | `false` | Disables the entire select                |

See the [Combobox API documentation](guide/aria/combobox#apis) for complete details on all available inputs and signals.

### Listbox Directives

The select pattern uses `ngListbox` for the dropdown list and `ngOption` for each selectable item.

#### Model

| Property | Type    | Description                                                                  |
| -------- | ------- | ---------------------------------------------------------------------------- |
| `values` | `any[]` | Two-way bindable array of selected values (contains single value for select) |

See the [Listbox API documentation](guide/aria/listbox#apis) for complete details on listbox configuration, selection modes, and option properties.

### Positioning

The select pattern integrates with [CDK Overlay](api/cdk/overlay/CdkConnectedOverlay) for smart positioning. Use `cdkConnectedOverlay` to handle viewport edges and scrolling automatically.

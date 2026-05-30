<docs-decorative-header title="Select">
</docs-decorative-header>

## Overview

A pattern that combines a combobox with a listbox to create single-selection dropdowns with keyboard navigation and screen reader support.

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

Users need a standard dropdown to choose from a list of values. A combobox paired with a listbox provides the familiar select experience with full accessibility support.

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

Text input is prevented by applying the `ngCombobox` directive directly onto a non-interactive host element (such as a `div` or a `button`) instead of an `<input>`. Users interact with the dropdown using arrow keys and Enter, just like a native select element.

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

The select pattern applies `ngCombobox` directly onto a non-interactive host element (such as a `div` or a `button`) to prevent text input while preserving keyboard navigation.

#### Inputs

| Property   | Type                   | Default | Description                |
| ---------- | ---------------------- | ------- | -------------------------- |
| `disabled` | `boolean`              | `false` | Disables the entire select |
| `expanded` | `ModelSignal<boolean>` | `false` | Expanded state of select   |

See the [Combobox API documentation](guide/aria/combobox#apis) for complete details on all available inputs and signals.

#### Popup Directives

The structural `ngComboboxPopup` directive marks the overlay template and requires a reference to the parent combobox:

| Property   | Type       | Description                                 |
| ---------- | ---------- | ------------------------------------------- |
| `combobox` | `Combobox` | Required reference to the parent `Combobox` |

#### ComboboxWidget Directive

The `ngComboboxWidget` directive bridges the listbox with the combobox trigger to support active-descendant focus tracking.

| Property           | Type                  | Description                                                                                                                                  |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeDescendant` | `string \| undefined` | The ID of the currently active option (bound to `listbox.activeDescendant()`) to update the `aria-activedescendant` attribute on the trigger |

### Listbox Directives

The select pattern uses `ngListbox` for the dropdown list and `ngOption` for each selectable item.

#### Inputs

| Property        | Type                               | Default      | Description                                                                                                                     |
| --------------- | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `selectionMode` | `'follow'` \| `'explicit'`         | `'explicit'` | Set to `'explicit'` so options are toggled explicitly via click/Enter instead of following active focus                         |
| `focusMode`     | `'roving'` \| `'activedescendant'` | `'roving'`   | The focus strategy used by the listbox. Set to `'activedescendant'` so browser focus remains on the combobox trigger.           |
| `tabIndex`      | `number`                           | `0`          | The tabindex of the listbox. Set to `-1` to prevent keyboard focus from entering the popup container in active-descendant mode. |

#### Model

| Property | Type                 | Description                                                                  |
| -------- | -------------------- | ---------------------------------------------------------------------------- |
| `value`  | `ModelSignal<any[]>` | Two-way bindable array of selected values (contains single value for select) |

### Positioning

The select pattern integrates with [CDK Overlay](https://material.angular.io/cdk/overlay/overview) for smart positioning. Use `cdkConnectedOverlay` to handle viewport edges and scrolling automatically.

<docs-decorative-header title="Combobox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/" title="Combobox ARIA pattern"/>
  <docs-pill href="/api?query=combobox#angular_aria_combobox" title="Combobox API Reference"/>
</docs-pill-row>

## Overview

A directive that coordinates a text input with a popup, providing the primitive directive for autocomplete, select, and multiselect patterns.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

Combobox is the primitive directive that coordinates a text input with a popup. It provides the foundation for autocomplete, select, and multiselect patterns. Consider using combobox directly when:

- **Building custom autocomplete patterns** - Creating specialized filtering or suggestion behavior
- **Creating custom selection components** - Developing dropdowns with unique requirements
- **Coordinating input with popup** - Pairing text input with listbox, tree, or dialog content
- **Implementing specific filter modes** - Using manual, auto-select, or highlight behaviors

Use documented patterns instead when:

- Standard autocomplete with filtering is needed - See the [Autocomplete pattern](guide/aria/autocomplete) for ready-to-use examples
- Single-selection dropdowns are needed - See the [Select pattern](guide/aria/select) for complete dropdown implementation
- Multiple-selection dropdowns are needed - See the [Multiselect pattern](guide/aria/multiselect) for multi-select with compact display

Note: The [Autocomplete](guide/aria/autocomplete), [Select](guide/aria/select), and [Multiselect](guide/aria/multiselect) guides show documented patterns that combine this directive with [Listbox](guide/aria/listbox) for specific use cases.

## Features

Angular's combobox provides a fully accessible input-popup coordination system with:

- **Text Input with Popup** - Coordinates input field with popup content
- **Three Filter Modes** - Manual, auto-select, or highlight behaviors
- **Keyboard Navigation** - Arrow keys, Enter, Escape handling
- **Screen Reader Support** - Built-in ARIA attributes including role="combobox" and aria-expanded
- **Popup Management** - Automatic show/hide based on user interaction
- **Signal-Based Reactivity** - Reactive state management using Angular signals

## Examples

### Autocomplete

An accessible input field that filters and suggests options as users type, helping them find and select values from a list.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

The `filterMode="manual"` setting gives complete control over filtering and selection. The input updates a signal that filters the options list. Users navigate with arrow keys and select with Enter or click. This mode provides the most flexibility for custom filtering logic. See the [Autocomplete guide](guide/aria/autocomplete) for complete filtering patterns and examples.

### Readonly mode

A pattern that combines a readonly combobox with listbox to create single-selection dropdowns with keyboard navigation and screen reader support.

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

The `readonly` attribute prevents typing in the input field. The popup opens on click or arrow keys. Users navigate options with keyboard and select with Enter or click.

This configuration provides the foundation for the [Select](guide/aria/select) and [Multiselect](guide/aria/multiselect) patterns. See those guides for complete dropdown implementations with triggers and overlay positioning.

### Dialog popup

Popups sometimes need modal behavior with a backdrop and focus trap. The combobox dialog directive provides this pattern for specialized use cases.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

The `ngComboboxDialog` directive creates a modal popup using the native dialog element. This provides backdrop behavior and focus trapping. Use dialog popups when the selection interface requires modal interaction or when the popup content is complex enough to warrant full-screen focus.

## APIs

### Combobox Directive

The `ngCombobox` directive coordinates a text input with a popup.

#### Inputs

| Property         | Type                                           | Default    | Description                                      |
| ---------------- | ---------------------------------------------- | ---------- | ------------------------------------------------ |
| `filterMode`     | `'manual'` \| `'auto-select'` \| `'highlight'` | `'manual'` | Controls selection behavior                      |
| `disabled`       | `boolean`                                      | `false`    | Disables the combobox                            |
| `readonly`       | `boolean`                                      | `false`    | Makes combobox readonly (for Select/Multiselect) |
| `firstMatch`     | `V`                                            | -          | Value of first matching item for auto-select     |
| `alwaysExpanded` | `boolean`                                      | `false`    | Keeps popup always open                          |

**Filter Modes:**

- **`'manual'`** - User controls filtering and selection explicitly. The popup shows options based on your filtering logic. Users select with Enter or click. This mode provides the most flexibility.
- **`'auto-select'`** - Input value automatically updates to the first matching option as users type. Requires the `firstMatch` input for coordination. See the [Autocomplete guide](guide/aria/autocomplete#auto-select-mode) for examples.
- **`'highlight'`** - Highlights matching text without changing the input value. Users navigate with arrow keys and select with Enter.

#### Signals

| Property   | Type              | Description                     |
| ---------- | ----------------- | ------------------------------- |
| `expanded` | `Signal<boolean>` | Whether popup is currently open |

#### Methods

| Method     | Parameters | Description            |
| ---------- | ---------- | ---------------------- |
| `open`     | none       | Opens the combobox     |
| `close`    | none       | Closes the combobox    |
| `expand`   | none       | Expands the combobox   |
| `collapse` | none       | Collapses the combobox |

### ComboboxInput Directive

The `ngComboboxInput` directive connects an input element to the combobox.

#### Model

| Property | Type     | Description                              |
| -------- | -------- | ---------------------------------------- |
| `value`  | `string` | Two-way bindable value using `[(value)]` |

The input element receives keyboard handling and ARIA attributes automatically.

### ComboboxPopup Directive

The `ngComboboxPopup` directive (host directive) manages popup visibility and coordination. Typically used with `ngComboboxPopupContainer` in an `ng-template` or with CDK Overlay.

### ComboboxPopupContainer Directive

The `ngComboboxPopupContainer` directive marks an `ng-template` as the popup content.

```html
<ng-template ngComboboxPopupContainer>
  <div ngListbox>...</div>
</ng-template>
```

Used with Popover API or CDK Overlay for positioning.

### ComboboxDialog Directive

The `ngComboboxDialog` directive creates a modal combobox popup.

```html
<dialog ngComboboxDialog>
  <div ngListbox>...</div>
</dialog>
```

Use for modal popup behavior with backdrop and focus trap.

### Related patterns and directives

Combobox is the primitive directive for these documented patterns:

- **[Autocomplete](guide/aria/autocomplete)** - Filtering and suggestions pattern (uses Combobox with filter modes)
- **[Select](guide/aria/select)** - Single selection dropdown pattern (uses Combobox with `readonly`)
- **[Multiselect](guide/aria/multiselect)** - Multiple selection pattern (uses Combobox with `readonly` + multi-enabled Listbox)

Combobox typically combines with:

- **[Listbox](guide/aria/listbox)** - Most common popup content
- **[Tree](guide/aria/tree)** - Hierarchical popup content (see Tree guide for examples)

<docs-decorative-header title="Multiselect">
</docs-decorative-header>

## Overview

A pattern that combines readonly combobox with multi-enabled listbox to create multiple-selection dropdowns with keyboard navigation and screen reader support.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.css"/>
</docs-code-multifile>

## Usage

The multiselect pattern works best when users need to choose multiple related items from a familiar set of options.

Consider using this pattern when:

- **Users need multiple selections** - Tags, categories, filters, or labels where multiple choices apply
- **The option list is fixed** (fewer than 20 items) - Users can scan options without search
- **Filtering content** - Multiple criteria can be active simultaneously
- **Assigning attributes** - Labels, permissions, or features where multiple values make sense
- **Related choices** - Options that logically work together (such as selecting multiple team members)

Avoid this pattern when:

- **Only single selection is needed** - Use the [Select pattern](guide/aria/select) for simpler single-choice dropdowns
- **The list has more than 20 items with search needed** - Use the [Autocomplete pattern](guide/aria/autocomplete) with multiselect capability
- **Most or all options will be selected** - A checklist pattern provides better visibility
- **Choices are independent binary options** - Individual checkboxes communicate the choices more clearly

## Features

The multiselect pattern combines [Combobox](guide/aria/combobox) and [Listbox](guide/aria/listbox) directives to provide a fully accessible dropdown with:

- **Keyboard Navigation** - Navigate options with arrow keys, toggle with Space, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes including aria-multiselectable
- **Selection Count Display** - Shows compact "Item + 2 more" pattern for multiple selections
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Smart Positioning** - CDK Overlay handles viewport edges and scrolling
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages
- **Persistent Selection** - Selected options remain visible with checkmarks after selection

## Examples

### Basic multiselect

Users need to select multiple items from a list of options. A readonly combobox paired with a multi-enabled listbox provides familiar multiselect functionality with full accessibility support.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.html" />
</docs-code-multifile>

The `multi` attribute on `ngListbox` enables multiple selection. Press Space to toggle options, and the popup remains open for additional selections. The display shows the first selected item plus a count of remaining selections.

### Multiselect with custom display

Options often need visual indicators like icons or colors to help users identify choices. Custom templates within options allow rich formatting while the display value shows a compact summary.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.html" />
</docs-code-multifile>

Each option displays an icon alongside its label. The display value updates to show the first selection's icon and text, followed by a count of additional selections. Selected options show a checkmark for clear visual feedback.

### Multiselect with chips

When users benefit from seeing all selected items at a glance, chips provide a visual representation of each selection with the ability to remove individual items.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/chips/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/chips/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/chips/app/app.html" />
</docs-code-multifile>

Chips appear in the trigger area showing all selected items. Each chip includes a remove button that deselects the item when clicked. This pattern works best when the number of selections remains manageable (typically fewer than 5 items).

### Controlled selection

Forms sometimes need to limit the number of selections or validate user choices. Programmatic control over selection enables these constraints while maintaining accessibility.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.html" />
</docs-code-multifile>

This example limits selections to three items. When the limit is reached, unselected options become disabled, preventing additional selections. A message informs users about the constraint.

### Right-to-left (RTL) support

Multiselect automatically supports right-to-left languages. Wrap the multiselect in a container with `dir="rtl"` to reverse the layout. Arrow key navigation adjusts automatically.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/rtl/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/rtl/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/rtl/app/app.html" highlight="[1]"/>
  <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/rtl/app/app.css"/>
</docs-code-multifile>

The direction attribute automatically reverses the visual layout and keyboard navigation direction while maintaining logical selection order.

## Showcase

TBD

## APIs

The multiselect pattern uses the following directives from Angular's Aria library. See the full API documentation in the linked guides.

### Combobox Directives

The multiselect pattern uses `ngCombobox` with the `readonly` attribute to prevent text input while preserving keyboard navigation.

#### Inputs

| Property   | Type      | Default | Description                               |
| ---------- | --------- | ------- | ----------------------------------------- |
| `readonly` | `boolean` | `false` | Set to `true` to create dropdown behavior |
| `disabled` | `boolean` | `false` | Disables the entire multiselect           |

See the [Combobox API documentation](guide/aria/combobox#apis) for complete details on all available inputs and signals.

### Listbox Directives

The multiselect pattern uses `ngListbox` with the `multi` attribute for multiple selection and `ngOption` for each selectable item.

#### Inputs

| Property | Type      | Default | Description                                |
| -------- | --------- | ------- | ------------------------------------------ |
| `multi`  | `boolean` | `false` | Set to `true` to enable multiple selection |

#### Model

| Property | Type    | Description                               |
| -------- | ------- | ----------------------------------------- |
| `values` | `any[]` | Two-way bindable array of selected values |

When `multi` is true, users can select multiple options using Space to toggle selection. The popup remains open after selection, allowing additional choices.

See the [Listbox API documentation](guide/aria/listbox#apis) for complete details on listbox configuration, selection modes, and option properties.

### Positioning

The multiselect pattern integrates with [CDK Overlay](api/cdk/overlay/CdkConnectedOverlay) for smart positioning. Use `cdkConnectedOverlay` to handle viewport edges and scrolling automatically.

## Styling

The directives used in the multiselect pattern don't include default styles. This allows full customization to match your design system. Apply styles through standard CSS classes or style bindings.

### Styling the multiselect trigger

```css
.multiselect-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  min-height: 40px;
  gap: 8px;
}

.multiselect-trigger:focus-within {
  outline: 2px solid blue;
  border-color: blue;
}

.selection-count {
  color: #666;
  font-size: 0.875rem;
}
```

### Styling chips

```css
.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #e0e0e0;
  border-radius: 16px;
  gap: 4px;
  margin: 2px;
  font-size: 0.875rem;
}

.chip-remove {
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

.chip-remove:hover {
  color: #333;
}
```

### Styling selected options

```css
[ngOption][aria-selected="true"] {
  background: #e3f2fd;
}

.option-check {
  visibility: hidden;
  color: #1976d2;
}

[ngOption][aria-selected="true"] .option-check {
  visibility: visible;
}
```

See the [Listbox styling guide](guide/aria/listbox#styling) for detailed customization patterns including hover states and disabled styles.

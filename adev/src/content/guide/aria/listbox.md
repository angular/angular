<docs-decorative-header title="Listbox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Listbox pattern"/>
  <docs-pill href="/api?query=listbox#angular_aria_listbox" title="Listbox API Reference"/>
</docs-pill-row>

## Overview

A directive that displays a list of options for users to select from, supporting keyboard navigation, single or multiple selection, and screen reader support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

Listbox is a foundational directive used by the [Select](guide/aria/select), [Multiselect](guide/aria/multiselect), and [Autocomplete](guide/aria/autocomplete) patterns. For most dropdown needs, use those documented patterns instead.

Consider using listbox directly when:

- **Building custom selection components** - Creating specialized interfaces with specific behavior
- **Visible selection lists** - Displaying selectable items directly on the page (not in dropdowns)
- **Custom integration patterns** - Integrating with unique popup or layout requirements

Avoid listbox when:

- **Navigation menus are needed** - Use the [Menu](guide/aria/menu) directive for actions and commands

## Features

Angular's listbox provides a fully accessible list implementation with:

- **Keyboard Navigation** - Navigate options with arrow keys, select with Enter or Space
- **Screen Reader Support** - Built-in ARIA attributes including role="listbox"
- **Single or Multiple Selection** - `multi` attribute controls selection mode
- **Horizontal or Vertical** - `orientation` attribute for layout direction
- **Type-ahead Search** - Type characters to jump to matching options
- **Signal-Based Reactivity** - Reactive state management using Angular signals

## Examples

### Basic listbox

Applications sometimes need selectable lists visible directly on the page rather than hidden in a dropdown. A standalone listbox provides keyboard navigation and selection for these visible list interfaces.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/basic/app/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/basic/app/app.html" />
</docs-code-multifile>

The `values` model signal provides two-way binding to the selected items. With `selectionMode="explicit"`, users press Space or Enter to select options. For dropdown patterns that combine listbox with combobox and overlay positioning, see the [Select](guide/aria/select) pattern.

### Horizontal listbox

Lists sometimes work better horizontally, such as toolbar-like interfaces or tab-style selections. The `orientation` attribute changes both the layout and keyboard navigation direction.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/listbox/src/horizontal/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

With `orientation="horizontal"`, left and right arrow keys navigate between options instead of up and down. The listbox automatically handles right-to-left (RTL) languages by reversing navigation direction.

### Selection modes

Listbox supports two selection modes that control when items become selected.

The `'follow'` mode automatically selects the focused item, providing faster interaction when selection changes frequently. The `'explicit'` mode requires Space or Enter to confirm selection, preventing accidental changes while navigating. Dropdown patterns typically use `'follow'` mode for single selection.

#### Explicit

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/explicit/app.html" />
</docs-code-multifile>

#### Follow

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.ts" />
  <docs-code header="app.html" path="adev/src/content/examples/aria/listbox/src/modes/app/follow/app.html" />
</docs-code-multifile>

| Mode         | Description                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `'follow'`   | Automatically selects the focused item, providing faster interaction when selection changes frequently |
| `'explicit'` | Requires Space or Enter to confirm selection, preventing accidental changes while navigating           |

TIP: Dropdown patterns typically use `'follow'` mode for single selection.

## APIs

### Listbox Directive

The `ngListbox` directive creates an accessible list of selectable options.

#### Inputs

| Property         | Type                               | Default      | Description                                  |
| ---------------- | ---------------------------------- | ------------ | -------------------------------------------- |
| `id`             | `string`                           | auto         | Unique identifier for the listbox            |
| `multi`          | `boolean`                          | `false`      | Enables multiple selection                   |
| `orientation`    | `'vertical'` \| `'horizontal'`     | `'vertical'` | Layout direction of the list                 |
| `wrap`           | `boolean`                          | `true`       | Whether focus wraps at list edges            |
| `selectionMode`  | `'follow'` \| `'explicit'`         | `'follow'`   | How selection is triggered                   |
| `focusMode`      | `'roving'` \| `'activedescendant'` | `'roving'`   | Focus management strategy                    |
| `softDisabled`   | `boolean`                          | `true`       | Whether disabled items are focusable         |
| `disabled`       | `boolean`                          | `false`      | Disables the entire listbox                  |
| `readonly`       | `boolean`                          | `false`      | Makes listbox readonly                       |
| `typeaheadDelay` | `number`                           | `500`        | Milliseconds before type-ahead search resets |

#### Model

| Property | Type  | Description                               |
| -------- | ----- | ----------------------------------------- |
| `values` | `V[]` | Two-way bindable array of selected values |

#### Signals

| Property | Type          | Description                           |
| -------- | ------------- | ------------------------------------- |
| `values` | `Signal<V[]>` | Currently selected values as a signal |

#### Methods

| Method                     | Parameters                        | Description                                |
| -------------------------- | --------------------------------- | ------------------------------------------ |
| `scrollActiveItemIntoView` | `options?: ScrollIntoViewOptions` | Scrolls the active item into view          |
| `gotoFirst`                | none                              | Navigates to the first item in the listbox |

### Option Directive

The `ngOption` directive marks an item within a listbox.

#### Inputs

| Property   | Type      | Default | Description                                      |
| ---------- | --------- | ------- | ------------------------------------------------ |
| `id`       | `string`  | auto    | Unique identifier for the option                 |
| `value`    | `V`       | -       | The value associated with this option (required) |
| `label`    | `string`  | -       | Optional label for screen readers                |
| `disabled` | `boolean` | `false` | Whether this option is disabled                  |

#### Signals

| Property   | Type              | Description                     |
| ---------- | ----------------- | ------------------------------- |
| `selected` | `Signal<boolean>` | Whether this option is selected |
| `active`   | `Signal<boolean>` | Whether this option has focus   |

### Related patterns

Listbox is used by these documented dropdown patterns:

- **[Select](guide/aria/select)** - Single-selection dropdown pattern using readonly combobox + listbox
- **[Multiselect](guide/aria/multiselect)** - Multiple-selection dropdown pattern using readonly combobox + listbox with `multi`
- **[Autocomplete](guide/aria/autocomplete)** - Filterable dropdown pattern using combobox + listbox

For complete dropdown patterns with trigger, popup, and overlay positioning, see those pattern guides instead of using listbox alone.

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" title="Listbox ARIA pattern"/>
  <docs-pill href="/api/aria/listbox/Listbox" title="Listbox API Reference"/>
</docs-pill-row>

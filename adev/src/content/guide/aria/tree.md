<docs-decorative-header title="Tree">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/treeview/" title="Tree ARIA pattern"/>
  <docs-pill href="/api/aria/tree/Tree" title="Tree API Reference"/>
</docs-pill-row>

## Overview

A tree displays hierarchical data where items can expand to reveal children or collapse to hide them. Users navigate with arrow keys, expand and collapse nodes, and optionally select items for navigation or data selection scenarios.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css"/>
</docs-code-multifile>

## Usage

Trees work well for displaying hierarchical data where users need to navigate through nested structures.

**Use trees when:**

- Building file system navigation
- Showing folder and document hierarchies
- Creating nested menu structures
- Displaying organization charts
- Browsing hierarchical data
- Implementing site navigation with nested sections

**Avoid trees when:**

- Displaying flat lists (use [Listbox](guide/aria/listbox) instead)
- Showing data tables (use [Grid](guide/aria/grid) instead)
- Creating simple dropdowns (use [Select](guide/aria/select) instead)
- Building breadcrumb navigation (use breadcrumb patterns)

## Features

- **Hierarchical navigation** - Nested tree structure with expand and collapse functionality
- **Selection modes** - Single or multi-selection with explicit or follow-focus behavior
- **Selection follows focus** - Optional automatic selection when focus changes
- **Keyboard navigation** - Arrow keys, Home, End, and type-ahead search
- **Expand/collapse** - Right/Left arrows or Enter to toggle parent nodes
- **Disabled items** - Disable specific nodes with focus management
- **Focus modes** - Roving tabindex or activedescendant focus strategies
- **RTL support** - Right-to-left language navigation

## Examples

### Navigation tree

Use a tree for navigation where clicking items triggers actions rather than selecting them.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/nav/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Set `[nav]="true"` to enable navigation mode. This uses `aria-current` to indicate the current page instead of selection.

### Single selection

Enable single selection for scenarios where users choose one item from the tree.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Leave `[multi]="false"` (the default) for single selection. Users press Space to select the focused item.

### Multi-selection

Allow users to select multiple items from the tree.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/multi-select/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/multi-select/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Set `[multi]="true"` on the tree. Users select items individually with Space or select ranges with Shift+Arrow keys.

### Selection follows focus

When selection follows focus, the focused item is automatically selected. This simplifies interaction for navigation scenarios.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/single-select-follow-focus/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Set `[selectionMode]="'follow'"` on the tree. Selection automatically updates as users navigate with arrow keys.

### Disabled tree items

Disable specific tree nodes to prevent interaction. Control whether disabled items can receive focus.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/tree/src/disabled-focusable/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

When `[softDisabled]="true"` on the tree, disabled items can receive focus but cannot be activated or selected. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

## APIs

### Tree

The container directive that manages hierarchical navigation and selection.

#### Inputs

| Property        | Type                             | Default      | Description                                                   |
| --------------- | -------------------------------- | ------------ | ------------------------------------------------------------- |
| `disabled`      | `boolean`                        | `false`      | Disables the entire tree                                      |
| `softDisabled`  | `boolean`                        | `true`       | When `true`, disabled items are focusable but not interactive |
| `multi`         | `boolean`                        | `false`      | Whether multiple items can be selected                        |
| `selectionMode` | `'explicit' \| 'follow'`         | `'explicit'` | Whether selection requires explicit action or follows focus   |
| `nav`           | `boolean`                        | `false`      | Whether the tree is in navigation mode (uses `aria-current`)  |
| `wrap`          | `boolean`                        | `true`       | Whether keyboard navigation wraps from last to first item     |
| `focusMode`     | `'roving' \| 'activedescendant'` | `'roving'`   | Focus strategy used by the tree                               |
| `values`        | `any[]`                          | `[]`         | Selected item values (supports two-way binding)               |

#### Methods

| Method           | Parameters | Description                                   |
| ---------------- | ---------- | --------------------------------------------- |
| `expandAll`      | none       | Expands all tree nodes                        |
| `collapseAll`    | none       | Collapses all tree nodes                      |
| `selectAll`      | none       | Selects all items (only in multi-select mode) |
| `clearSelection` | none       | Clears all selection                          |

### TreeItem

An individual node in the tree that can contain child nodes.

#### Inputs

| Property   | Type      | Default | Description                                             |
| ---------- | --------- | ------- | ------------------------------------------------------- |
| `value`    | `any`     | —       | **Required.** Unique value for this tree item           |
| `disabled` | `boolean` | `false` | Disables this item                                      |
| `expanded` | `boolean` | `false` | Whether the node is expanded (supports two-way binding) |

#### Signals

| Property      | Type              | Description                          |
| ------------- | ----------------- | ------------------------------------ |
| `selected`    | `Signal<boolean>` | Whether the item is selected         |
| `active`      | `Signal<boolean>` | Whether the item currently has focus |
| `hasChildren` | `Signal<boolean>` | Whether the item has child nodes     |

#### Methods

| Method     | Parameters | Description                 |
| ---------- | ---------- | --------------------------- |
| `expand`   | none       | Expands this node           |
| `collapse` | none       | Collapses this node         |
| `toggle`   | none       | Toggles the expansion state |

### TreeGroup

A container for child tree items.

This directive has no inputs, outputs, or methods. It serves as a container to organize child `ngTreeItem` elements:

```angular-html
<li ngTreeItem value="parent">
  Parent Item
  <ul ngTreeGroup>
    <li ngTreeItem value="child1">Child 1</li>
    <li ngTreeItem value="child2">Child 2</li>
  </ul>
</li>
```

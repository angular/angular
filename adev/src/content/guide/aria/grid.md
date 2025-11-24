<docs-decorative-header title="Grid">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/grid/" title="Grid ARIA pattern"/>
  <docs-pill href="/api?query=grid#angular_aria_grid" title="Grid API Reference"/>
</docs-pill-row>

## Overview

A grid enables users to navigate two-dimensional data or interactive elements using directional arrow keys, Home, End, and Page Up/Down. Grids work for data tables, calendars, spreadsheets, and layout patterns that group related interactive elements.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts">
  <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.ts"/>
  <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.html"/>
  <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/overview/basic/app/app.css"/>
</docs-code-multifile>

## Usage

Grids work well for data or interactive elements organized in rows and columns where users need keyboard navigation in multiple directions.

**Use grids when:**

- Building interactive data tables with editable or selectable cells
- Creating calendars or date pickers
- Implementing spreadsheet-like interfaces
- Grouping interactive elements (buttons, checkboxes) to reduce tab stops on a page
- Building interfaces requiring two-dimensional keyboard navigation

**Avoid grids when:**

- Displaying simple read-only tables (use semantic HTML `<table>` instead)
- Showing single-column lists (use [Listbox](guide/aria/listbox) instead)
- Displaying hierarchical data (use [Tree](guide/aria/tree) instead)
- Building forms without tabular layout (use standard form controls)

## Features

- **Two-dimensional navigation** - Arrow keys move between cells in all directions
- **Focus modes** - Choose between roving tabindex or activedescendant focus strategies
- **Selection support** - Optional cell selection with single or multi-select modes
- **Wrapping behavior** - Configure how navigation wraps at grid edges (continuous, loop, or nowrap)
- **Range selection** - Select multiple cells with modifier keys or dragging
- **Disabled states** - Disable the entire grid or individual cells
- **RTL support** - Automatic right-to-left language navigation

## Examples

### Data table grid

Use a grid for interactive tables where users need to navigate between cells using arrow keys. This example shows a basic data table with keyboard navigation.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/table/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/table/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/table/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/table/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Apply the `ngGrid` directive to the table element, `ngGridRow` to each row, and `ngGridCell` to each cell.

### Calendar grid

Calendars are a common use case for grids. This example shows a month view where users navigate dates using arrow keys.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/calendar/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Users can activate a date by pressing Enter or Space when focused on a cell.

### Layout grid

Use a layout grid to group interactive elements and reduce tab stops. This example shows a grid of pill buttons.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts">
      <docs-code header="TS" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.ts"/>
      <docs-code header="HTML" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.html"/>
      <docs-code header="CSS" path="adev/src/content/examples/aria/grid/src/pill-list/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Instead of tabbing through each button, users navigate with arrow keys and only one button receives tab focus.

### Selection and focus modes

Enable selection with `[enableSelection]="true"` and configure how focus and selection interact.

```angular-html
<table ngGrid
       [enableSelection]="true"
       [selectionMode]="'explicit'"
       [multi]="true"
       [focusMode]="'roving'">
  <tr ngGridRow>
    <td ngGridCell>Cell 1</td>
    <td ngGridCell>Cell 2</td>
  </tr>
</table>
```

**Selection modes:**

- `follow`: Focused cell is automatically selected
- `explicit`: Users select cells with Space or click

**Focus modes:**

- `roving`: Focus moves to cells using `tabindex` (better for simple grids)
- `activedescendant`: Focus stays on grid container, `aria-activedescendant` indicates active cell (better for virtual scrolling)

## APIs

### Grid

The container directive that provides keyboard navigation and focus management for rows and cells.

#### Inputs

| Property               | Type                                 | Default    | Description                                                   |
| ---------------------- | ------------------------------------ | ---------- | ------------------------------------------------------------- |
| `enableSelection`      | `boolean`                            | `false`    | Whether selection is enabled for the grid                     |
| `disabled`             | `boolean`                            | `false`    | Disables the entire grid                                      |
| `softDisabled`         | `boolean`                            | `true`     | When `true`, disabled cells are focusable but not interactive |
| `focusMode`            | `'roving' \| 'activedescendant'`     | `'roving'` | Focus strategy used by the grid                               |
| `rowWrap`              | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'`   | Navigation wrapping behavior along rows                       |
| `colWrap`              | `'continuous' \| 'loop' \| 'nowrap'` | `'loop'`   | Navigation wrapping behavior along columns                    |
| `multi`                | `boolean`                            | `false`    | Whether multiple cells can be selected                        |
| `selectionMode`        | `'follow' \| 'explicit'`             | `'follow'` | Whether selection follows focus or requires explicit action   |
| `enableRangeSelection` | `boolean`                            | `false`    | Enable range selections with modifier keys or dragging        |

### GridRow

Represents a row within a grid and serves as a container for grid cells.

#### Inputs

| Property   | Type     | Default | Description                           |
| ---------- | -------- | ------- | ------------------------------------- |
| `rowIndex` | `number` | auto    | The index of this row within the grid |

### GridCell

Represents an individual cell within a grid row.

#### Inputs

| Property      | Type                         | Default        | Description                                             |
| ------------- | ---------------------------- | -------------- | ------------------------------------------------------- |
| `id`          | `string`                     | auto           | Unique identifier for the cell                          |
| `role`        | `string`                     | `'gridcell'`   | Cell role: `gridcell`, `columnheader`, or `rowheader`   |
| `disabled`    | `boolean`                    | `false`        | Disables this cell                                      |
| `selected`    | `boolean`                    | `false`        | Whether the cell is selected (supports two-way binding) |
| `selectable`  | `boolean`                    | `true`         | Whether the cell can be selected                        |
| `rowSpan`     | `number`                     | —              | Number of rows the cell spans                           |
| `colSpan`     | `number`                     | —              | Number of columns the cell spans                        |
| `rowIndex`    | `number`                     | —              | Row index of the cell                                   |
| `colIndex`    | `number`                     | —              | Column index of the cell                                |
| `orientation` | `'vertical' \| 'horizontal'` | `'horizontal'` | Orientation for widgets within the cell                 |
| `wrap`        | `boolean`                    | `true`         | Whether widget navigation wraps within the cell         |

#### Signals

| Property | Type              | Description                          |
| -------- | ----------------- | ------------------------------------ |
| `active` | `Signal<boolean>` | Whether the cell currently has focus |

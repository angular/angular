---
name: angular-aria
description: Build headless accessible components using the @angular/aria package. Use for implementing WAI-ARIA patterns like Accordion, Listbox, Select, Combobox, Menu, Menubar, Toolbar, Tabs, Tree, and Grid with full keyboard navigation, screen reader support, and focus management. Triggers on requests for accessible components, headless UI, ARIA patterns, or @angular/aria usage. Do not use for general accessibility guidance (WCAG audits, AXE checks) or Angular Material components.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Aria


Angular Aria (`@angular/aria`) is a collection of headless, accessible directives that implement common WAI-ARIA patterns. The directives handle keyboard interactions, ARIA attributes, focus management, and screen reader support. All you have to do is provide the HTML structure, CSS styling, and business logic.

**CRITICAL**: Before using this package, it must be installed via the package manager. Confirm that it has been installed in the project. Use `npm install @angular/aria` to install if necessary.

## When to Use Angular Aria

- **Custom design systems** — your team maintains a component library with specific visual standards
- **Enterprise component libraries** — reusable components for multiple applications
- **Custom brand requirements** — precise design specifications that pre-styled libraries cannot accommodate

## When NOT to Use Angular Aria

- **Pre-styled components needed** — use Angular Material instead
- **Simple forms** — native HTML controls (`<button>`, `<input type="radio">`) provide built-in accessibility
- **Rapid prototyping** — pre-styled component libraries reduce initial development time

## Styling Headless Components

Because Angular Aria components are headless, they do not come with default styles. You **must** use CSS to style different states based on the ARIA attributes the directives automatically apply.

Common ARIA attributes to target in CSS:
- `[aria-expanded="true"]` / `[aria-expanded="false"]`
- `[aria-selected="true"]`
- `[aria-disabled="true"]`
- `[aria-pressed="true"]`
- `[aria-checked="true"]`
- `[aria-current="page"]` (for navigation)

## Available Components

### 1. Accordion

Organizes related content into expandable/collapsible sections. Use for FAQs, long forms, or progressive disclosure.

**Import:** `import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';`

```typescript
@Component({
  imports: [AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger],
  template: `
    <div ngAccordionGroup [multiExpandable]="false">
      <div class="accordion-item">
        <button ngAccordionTrigger panelId="panel-1" class="accordion-header">
          Section 1
          <span class="icon">▼</span>
        </button>
        <div ngAccordionPanel panelId="panel-1" class="accordion-panel">
          <ng-template ngAccordionContent>
            <p>Lazy loaded content here.</p>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class MyAccordion {}
```

```css
.accordion-header[aria-expanded='true'] .icon {
  transform: rotate(180deg);
}
.accordion-panel {
  padding: 1rem;
  border-top: 1px solid #ccc;
}
```

### 2. Listbox

Single or multi-select option lists with keyboard navigation.

**Import:** `import { Listbox, Option } from '@angular/aria/listbox';`

```html
<ul ngListbox [(values)]="selectedItems" orientation="horizontal" [multi]="true">
  <li ngOption value="apple" class="option">Apple</li>
  <li ngOption value="banana" class="option">Banana</li>
</ul>
```

```css
.option[aria-selected='true'] {
  background: #e0f7fa;
  font-weight: bold;
}
.option:focus-visible {
  outline: 2px solid blue;
}
```

### 3. Combobox, Select, and Multiselect

Combine `ngCombobox` with `ngListbox` for dropdown patterns.

- **Combobox**: Text input + popup (autocomplete)
- **Select**: Readonly Combobox + single-select Listbox
- **Multiselect**: Readonly Combobox + multi-select Listbox

**Import:** `import { Combobox, ComboboxInput, ComboboxPopupContainer } from '@angular/aria/combobox';` and `import { Listbox, Option } from '@angular/aria/listbox';`

```html
<!-- Standard Select -->
<div ngCombobox [readonly]="true">
  <button ngComboboxInput class="select-trigger">
    {{ selectedValue() || 'Choose an option' }}
  </button>
  <ng-template ngComboboxPopupContainer>
    <ul ngListbox [(values)]="selectedValue" class="dropdown-menu">
      <li ngOption value="option1">Option 1</li>
      <li ngOption value="option2">Option 2</li>
    </ul>
  </ng-template>
</div>
```

### 4. Menu and Menubar

For actions, commands, and context menus (not for form selection).

**Import:** `import { MenuBar, Menu, MenuContent, MenuItem } from '@angular/aria/menu';`

```html
<ul ngMenuBar class="menubar">
  <li ngMenuItem value="file">
    <button ngMenuTrigger [menu]="fileMenu">File</button>
  </li>
</ul>

<ul ngMenu #fileMenu="ngMenu" class="menu">
  <li ngMenuItem value="new">New</li>
  <li ngMenuItem value="open">Open</li>
</ul>
```

### 5. Tabs

Tabbed interfaces with automatic or manual activation modes.

**Import:** `import { Tab, Tabs, TabList, TabPanel, TabContent } from '@angular/aria/tabs';`

```html
<div ngTabs>
  <ul ngTabList class="tab-list">
    <li ngTab value="profile" class="tab-btn">Profile</li>
    <li ngTab value="security" class="tab-btn">Security</li>
  </ul>

  <div ngTabPanel value="profile" class="tab-panel">
    <ng-template ngTabContent>Profile Settings</ng-template>
  </div>
  <div ngTabPanel value="security" class="tab-panel">
    <ng-template ngTabContent>Security Settings</ng-template>
  </div>
</div>
```

```css
.tab-btn[aria-selected='true'] {
  border-bottom: 2px solid blue;
  font-weight: bold;
}
```

### 6. Toolbar

Groups related controls with keyboard navigation.

**Import:** `import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';`

```html
<div ngToolbar class="toolbar">
  <div ngToolbarWidgetGroup [multi]="true" role="group" aria-label="Formatting">
    <button ngToolbarWidget value="bold" class="tool-btn">B</button>
    <button ngToolbarWidget value="italic" class="tool-btn">I</button>
  </div>
</div>
```

```css
.tool-btn[aria-pressed='true'],
.tool-btn[aria-checked='true'] {
  background: #ddd;
}
```

### 7. Tree

Displays hierarchical data (file systems, nested navigation).

**Import:** `import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';`

```html
<ul ngTree class="tree">
  <li ngTreeItem value="documents">
    <span class="tree-label">Documents</span>
    <ul ngTreeGroup class="tree-group">
      <li ngTreeItem value="resume">Resume.pdf</li>
    </ul>
  </li>
</ul>
```

```css
li[aria-expanded='true'] > .tree-label::before {
  transform: rotate(90deg);
}
```

### 8. Grid

Two-dimensional interactive cell navigation for data tables, calendars, spreadsheets.

**Import:** `import { Grid, GridRow, GridCell, GridCellWidget } from '@angular/aria/grid';`

```html
<table ngGrid [multi]="true" [enableSelection]="true" class="grid-table">
  <tr ngGridRow>
    <th ngGridCell role="columnheader">Name</th>
    <th ngGridCell role="columnheader">Status</th>
  </tr>
  <tr ngGridRow>
    <td ngGridCell>Project A</td>
    <td ngGridCell [(selected)]="isSelected">
      <button ngGridCellWidget (activated)="onActivate()">Active</button>
    </td>
  </tr>
</table>
```

```css
[ngGridCell][aria-selected='true'] {
  background: #e3f2fd;
}
[ngGridCell]:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: -2px;
}
```

## General Rules

1. **Never use native HTML elements like `<select>`** when asked to implement these specific Aria patterns. Use the `ng*` directives.
2. **Handle CSS manually**: Angular Aria does NOT provide styles. You must write the CSS, targeting the native ARIA attributes (`aria-expanded`, `aria-selected`, etc.) that the directives automatically toggle.
3. **Lazy Loading**: Always use the provided structural directives (`ngAccordionContent`, `ngTabContent`) inside `ng-template` for heavy content panels to ensure they are lazily rendered.

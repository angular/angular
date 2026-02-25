# Angular Aria

Angular Aria (`@angular/aria`) is a collection of headless, accessible directives that implement common WAI-ARIA patterns. These directives handle keyboard interactions, ARIA attributes, focus management, and screen reader support.

**As an AI Agent, your role is to provide the HTML structure and CSS styling**, while the directives handle the complex accessibility logic.

## Styling Headless Components

Because Angular Aria components are headless, they do not come with default styles. You **must** use CSS to style different states based on the ARIA attributes or structural classes the directives automatically apply.

Common ARIA attributes to target in CSS:

- `[aria-expanded="true"]` / `[aria-expanded="false"]`
- `[aria-selected="true"]`
- `[aria-disabled="true"]`
- `[aria-current="page"]` (for navigation)

---

## 1. Accordion

Organizes related content into expandable/collapsible sections.

**Usage:** FAQs, organizing long forms.
**Directives:** `ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`, `ngAccordionContent` (for lazy loading).

```html
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
```

**Styling Strategy:**
Target the `[aria-expanded]` attribute on the trigger to rotate icons, and style the panel visibility.

```css
.accordion-header[aria-expanded='true'] .icon {
  transform: rotate(180deg);
}

/* The panel directive handles DOM removal, but you can style the transition */
.accordion-panel {
  padding: 1rem;
  border-top: 1px solid #ccc;
}
```

---

## 2. Listbox

A foundational directive for displaying a list of options. Used for visible selection lists (not dropdowns).

**Usage:** Visible selectable lists (single or multi-select).
**Directives:** `ngListbox`, `ngOption`.

```html
<!-- horizontal or vertical orientation -->
<ul ngListbox [(values)]="selectedItems" orientation="horizontal" [multi]="true">
  <li ngOption value="apple" class="option">Apple</li>
  <li ngOption value="banana" class="option">Banana</li>
</ul>
```

**Styling Strategy:**
Target `[aria-selected="true"]` for selected state and `:focus-visible` or `[data-active]` for the focused item (Angular Aria uses roving tabindex or activedescendant).

```css
.option {
  padding: 8px;
  cursor: pointer;
}
.option[aria-selected='true'] {
  background: #e0f7fa;
  font-weight: bold;
}
/* Focus state managed by aria */
.option:focus-visible {
  outline: 2px solid blue;
}
```

---

## 3. Combobox, Select, and Multiselect

These patterns combine `ngCombobox` with a popup containing an `ngListbox`.

- **Combobox**: Text input + popup (used for Autocomplete).
- **Select**: Readonly Combobox + single-select Listbox.
- **Multiselect**: Readonly Combobox + multi-select Listbox.

**Directives:** `ngCombobox`, `ngComboboxInput`, `ngComboboxPopupContainer`, `ngListbox`, `ngOption`.

```html
<!-- Example: Standard Select -->
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

**Styling Strategy:**
Style the popup container to look like a dropdown floating above content (often paired with CDK Overlay).

```css
.select-trigger {
  width: 200px;
  padding: 8px;
  text-align: left;
}
.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## 4. Menu and Menubar

For actions, commands, and context menus (not for form selection).

**Directives:** `ngMenuBar`, `ngMenu`, `ngMenuItem`, `ngMenuTrigger`.

```html
<!-- Menubar Example -->
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

**Styling Strategy:**
Use flexbox for the menubar. Hide/show submenus based on the trigger's state.

```css
.menubar {
  display: flex;
  gap: 10px;
  list-style: none;
  padding: 0;
}
.menu {
  background: white;
  border: 1px solid #ccc;
  padding: 5px 0;
}
.menu li {
  padding: 5px 15px;
  cursor: pointer;
}
```

---

## 5. Tabs

Layered content sections where only one panel is visible.

**Directives:** `ngTabs`, `ngTabList`, `ngTab`, `ngTabPanel`, `ngTabContent`.

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

**Styling Strategy:**
Target `[aria-selected="true"]` on the tab buttons.

```css
.tab-list {
  display: flex;
  border-bottom: 2px solid #ccc;
  list-style: none;
  padding: 0;
}
.tab-btn {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab-btn[aria-selected='true'] {
  border-bottom-color: blue;
  font-weight: bold;
}
.tab-panel {
  padding: 20px;
}
```

---

## 6. Toolbar

Groups related controls (like text formatting).

**Directives:** `ngToolbar`, `ngToolbarWidget`, `ngToolbarWidgetGroup`.

```html
<div ngToolbar class="toolbar">
  <div ngToolbarWidgetGroup [multi]="true" role="group" aria-label="Formatting">
    <button ngToolbarWidget value="bold" class="tool-btn">B</button>
    <button ngToolbarWidget value="italic" class="tool-btn">I</button>
  </div>
</div>
```

**Styling Strategy:**
Target `[aria-pressed="true"]` (for toggle buttons) or `[aria-checked="true"]` (for radio groups) within the toolbar.

```css
.toolbar {
  display: flex;
  gap: 5px;
  padding: 8px;
  background: #f5f5f5;
}
.tool-btn {
  padding: 5px 10px;
  border: 1px solid #ccc;
}
.tool-btn[aria-pressed='true'],
.tool-btn[aria-checked='true'] {
  background: #ddd;
}
```

---

## 7. Tree

Displays hierarchical data (file systems, nested nav).

**Directives:** `ngTree`, `ngTreeItem`, `ngTreeGroup`.

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

**Styling Strategy:**
Target `[aria-expanded]` to show/hide children or rotate chevron icons. Use `padding-left` on nested groups to show hierarchy.

```css
.tree,
.tree-group {
  list-style: none;
  padding-left: 20px;
}
.tree-label::before {
  content: '▶ ';
  display: inline-block;
  transition: transform 0.2s;
}
li[aria-expanded='true'] > .tree-label::before {
  transform: rotate(90deg);
}
```

## General Rules for Agents

1. **Never use native HTML elements like `<select>`** when asked to implement these specific Aria patterns. Use the `ng*` directives.
2. **Handle CSS manually**: Remember that `Angular Aria` does NOT provide styles. You must write the CSS, targeting the native ARIA attributes (`aria-expanded`, `aria-selected`, etc.) that the directives automatically toggle.
3. **Lazy Loading**: Always use the provided structural directives (`ngAccordionContent`, `ngTabContent`) inside `ng-template` for heavy content panels to ensure they are lazily rendered.

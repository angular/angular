<docs-decorative-header title="Menu">
</docs-decorative-header>

## Overview

A menu offers a list of actions or options to users, typically appearing in response to a button click or right-click. Menus support keyboard navigation with arrow keys, submenus, checkboxes, radio buttons, and disabled items.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.css"/>
</docs-code-multifile>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="ARIA pattern"/>
  <docs-pill href="api/aria/menu" title="API Reference"/>
</docs-pill-row>

## Usage

Menus work well for presenting lists of actions or commands that users can choose from.

**Use menus when:**

- Building application command menus (File, Edit, View)
- Creating context menus (right-click actions)
- Showing dropdown action lists
- Implementing toolbar dropdowns
- Organizing settings or options

**Avoid menus when:**

- Building site navigation (use navigation landmarks instead)
- Creating form selects (use the [Select](guide/aria/select) component)
- Switching between content panels (use [Tabs](guide/aria/tabs))
- Showing collapsible content (use [Accordion](guide/aria/accordion))

## Features

- **Keyboard navigation** - Arrow keys, Home/End, and character search for efficient navigation
- **Submenus** - Nested menu support with automatic positioning
- **Menu types** - Standalone menus, triggered menus, and menubars
- **Checkboxes and radios** - Toggle and selection menu items
- **Disabled items** - Soft or hard disabled states with focus management
- **Auto-close behavior** - Configurable close on selection
- **RTL support** - Right-to-left language navigation

## Examples

### Menu with trigger

Create a dropdown menu by pairing a trigger button with a menu. The trigger opens and closes the menu.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger/app/app.html"/>
</docs-code-multifile>

The menu automatically closes when a user selects an item or presses Escape.

### Menubar

A menubar provides persistent access to multiple menus, commonly used in application toolbars.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-bar/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-bar/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-bar/app/app.html"/>
</docs-code-multifile>

Users navigate between top-level menus with arrow keys and open menus with Enter or by hovering.

### Context menu

Context menus appear at the cursor position when users right-click an element.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-context/app/app.html"/>
</docs-code-multifile>

Position the menu using the `contextmenu` event coordinates.

### Standalone menu

A standalone menu doesn't require a trigger and remains visible in the interface.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-standalone/app/app.html"/>
</docs-code-multifile>

Standalone menus work well for always-visible action lists or navigation.

### Disabled menu items

Disable specific menu items using the `disabled` input. Control focus behavior with `softDisabled`.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/menu/src/menu-trigger-disabled/app/app.html"/>
</docs-code-multifile>

When `[softDisabled]="true"`, disabled items can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

## Showcase

TBD

## APIs

### Menu

The container directive for menu items.

#### Inputs

| Property       | Type      | Default | Description                                                   |
| -------------- | --------- | ------- | ------------------------------------------------------------- |
| `disabled`     | `boolean` | `false` | Disables all items in the menu                                |
| `wrap`         | `boolean` | `true`  | Whether keyboard navigation wraps at edges                    |
| `softDisabled` | `boolean` | `true`  | When `true`, disabled items are focusable but not interactive |

#### Methods

| Method           | Parameters | Description                        |
| ---------------- | ---------- | ---------------------------------- |
| `close`          | none       | Closes the menu                    |
| `focusFirstItem` | none       | Moves focus to the first menu item |

### MenuBar

A horizontal container for multiple menus.

#### Inputs

| Property       | Type      | Default | Description                                                   |
| -------------- | --------- | ------- | ------------------------------------------------------------- |
| `disabled`     | `boolean` | `false` | Disables the entire menubar                                   |
| `wrap`         | `boolean` | `true`  | Whether keyboard navigation wraps at edges                    |
| `softDisabled` | `boolean` | `true`  | When `true`, disabled items are focusable but not interactive |

### MenuItem

An individual item within a menu.

#### Inputs

| Property     | Type      | Default | Description                                          |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| `value`      | `any`     | —       | **Required.** Value for this item                    |
| `disabled`   | `boolean` | `false` | Disables this menu item                              |
| `submenu`    | `Menu`    | —       | Reference to a submenu                               |
| `searchTerm` | `string`  | `''`    | Search term for typeahead (supports two-way binding) |

#### Signals

| Property   | Type              | Description                                |
| ---------- | ----------------- | ------------------------------------------ |
| `active`   | `Signal<boolean>` | Whether the item currently has focus       |
| `expanded` | `Signal<boolean>` | Whether the submenu is expanded            |
| `hasPopup` | `Signal<boolean>` | Whether the item has an associated submenu |

NOTE: MenuItem does not expose public methods. Use the `submenu` input to associate submenus with menu items.

### MenuTrigger

A button or element that opens a menu.

#### Inputs

| Property       | Type      | Default | Description                                |
| -------------- | --------- | ------- | ------------------------------------------ |
| `menu`         | `Menu`    | —       | **Required.** The menu to trigger          |
| `disabled`     | `boolean` | `false` | Disables the trigger                       |
| `softDisabled` | `boolean` | `true`  | When `true`, disabled trigger is focusable |

#### Signals

| Property   | Type              | Description                                |
| ---------- | ----------------- | ------------------------------------------ |
| `expanded` | `Signal<boolean>` | Whether the menu is currently open         |
| `hasPopup` | `Signal<boolean>` | Whether the trigger has an associated menu |

#### Methods

| Method   | Parameters | Description                  |
| -------- | ---------- | ---------------------------- |
| `open`   | none       | Opens the menu               |
| `close`  | none       | Closes the menu              |
| `toggle` | none       | Toggles the menu open/closed |

## Styling

Angular automatically applies attributes to menu elements that you can use in your CSS selectors.

The menu container receives the `ng-menu` attribute:

```css
[ng-menu] {
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 200px;
}
```

Menu items receive the `ng-menu-item` attribute and a `data-active` attribute when focused:

```css
[ng-menu-item] {
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

[ng-menu-item][data-active] {
  background: var(--hover-background);
}

[ng-menu-item][aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Style menu items with submenus using the `aria-haspopup` attribute:

```css
[ng-menu-item][aria-haspopup="menu"]::after {
  content: '▶';
  margin-left: auto;
}
```

Menubars receive the `ng-menu-bar` attribute:

```css
[ng-menu-bar] {
  display: flex;
  gap: 0.5rem;
  background: var(--toolbar-background);
  padding: 0.5rem;
}
```

TIP: Use `[data-active]` to style focused menu items and `[aria-expanded="true"]` to style open menu triggers.

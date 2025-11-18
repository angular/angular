<docs-decorative-header title="Menubar">
</docs-decorative-header>

## Overview

The manubar is a horizontal navigation bar that provides persistent access to application menus. Menubars organize commands into logical categories like File, Edit, and View, helping users discover and execute application features through keyboard or mouse interaction.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

Menubars work well for organizing application commands into persistent, discoverable navigation.

**Use menubars when:**

- Building application command bars (such as File, Edit, View, Insert, Format)
- Creating persistent navigation that stays visible across the interface
- Organizing commands into logical top-level categories
- Need horizontal menu navigation with keyboard support
- Building desktop-style application interfaces

**Avoid menubars when:**

- Building dropdown menus for individual actions (use [Menu with trigger](guide/aria/menu) instead)
- Creating context menus (use [Menu](guide/aria/menu) guide pattern)
- Simple standalone action lists (use [Menu](guide/aria/menu) instead)
- Mobile interfaces where horizontal space is limited
- Navigation belongs in a sidebar or header navigation pattern

## Features

- **Horizontal navigation** - Left/Right arrow keys move between top-level categories
- **Persistent visibility** - Always visible, not modal or dismissable
- **Hover-to-open** - Submenus open on hover after first keyboard or click interaction
- **Nested submenus** - Support multiple levels of menu depth
- **Keyboard navigation** - Arrow keys, Enter/Space, Escape, and typeahead search
- **Disabled states** - Disable entire menubar or individual items
- **RTL support** - Automatic right-to-left language navigation

## Examples

### Basic menubar

A menubar provides persistent access to application commands organized into top-level categories. Users navigate between categories with Left/Right arrows and open menus with Enter or Down arrow.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Press Right arrow to move between File, Edit, and View. Press Enter or Down arrow to open a menu and navigate submenu items with Up/Down arrows.

### Disabled menubar items

Disable specific menu items or the entire menubar to prevent interaction. Control whether disabled items can receive keyboard focus with the `softDisabled` input.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/disabled/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

When `[softDisabled]="true"` on the menubar, disabled items can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled items are skipped during keyboard navigation.

### RTL support

Menubars automatically adapt to right-to-left (RTL) languages. Arrow key navigation reverses direction, and submenus position on the left side.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/menubar/src/rtl/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

The `dir="rtl"` attribute enables RTL mode. Left arrow moves right, Right arrow moves left, maintaining natural navigation for RTL language users.

## Showcase

TBD

## APIs

The menubar pattern uses directives from Angular's Aria library. See the [Menu guide](guide/aria/menu) for complete API documentation.

### MenuBar

The horizontal container for top-level menu items.

#### Inputs

| Property       | Type      | Default | Description                                                   |
| -------------- | --------- | ------- | ------------------------------------------------------------- |
| `disabled`     | `boolean` | `false` | Disables the entire menubar                                   |
| `wrap`         | `boolean` | `true`  | Whether keyboard navigation wraps from last to first item     |
| `softDisabled` | `boolean` | `true`  | When `true`, disabled items are focusable but not interactive |

See the [Menu API documentation](guide/aria/menu#apis) for complete details on all available inputs and signals.

### MenuItem

Individual items within the menubar. Same API as Menu - see [MenuItem](guide/aria/menu#menuitem).

**Menubar-specific behavior:**

- Left/Right arrows navigate between menubar items (vs Up/Down in vertical menus)
- First keyboard interaction or click enables hover-to-open for submenus
- Enter or Down arrow opens the submenu and focuses the first item
- `aria-haspopup="menu"` indicates items with submenus

### MenuTrigger

Not typically used in menubars - MenuItem handles trigger behavior directly when it has an associated submenu. See [MenuTrigger](guide/aria/menu#menutrigger) for standalone menu trigger patterns.

## Styling

Angular automatically applies attributes to menubar elements that you can use in your CSS selectors.

The menubar receives the `ng-menu-bar` attribute:

```css
[ng-menu-bar] {
  display: flex;
  gap: 0.5rem;
  background: var(--toolbar-background);
  padding: 0.5rem;
}
```

Menu items in the menubar receive the `ng-menu-item` attribute and `data-active` when focused:

```css
[ng-menu-bar] [ng-menu-item] {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

[ng-menu-bar] [ng-menu-item][data-active] {
  background: var(--hover-background);
}

[ng-menu-bar] [ng-menu-item][aria-expanded="true"] {
  background: var(--active-background);
}
```

Submenus use the same styling as standalone menus. See the [Menu styling guide](guide/aria/menu#styling) for submenu customization patterns.

TIP: Use `[data-active]` to style focused menubar items and `[aria-expanded="true"]` to style items with open submenus.

## References

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/menubar/" title="ARIA pattern"/>
  <docs-pill href="api/aria/menu" title="API Reference"/>
</docs-pill-row>

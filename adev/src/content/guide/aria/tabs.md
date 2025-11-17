<docs-decorative-header title="Tabs">
</docs-decorative-header>

## Overview

Tabs display layered content sections where only one panel is visible at a time. Users switch between panels by clicking tab buttons or using arrow keys to navigate the tab list.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.css"/>
</docs-code-multifile>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" title="ARIA pattern"/>
  <docs-pill href="api/aria/tabs" title="API Reference"/>
</docs-pill-row>

## Usage

Tabs work well for organizing related content into distinct sections where users switch between different views or categories.

**Use tabs when:**

- Organizing related content into distinct sections
- Creating settings panels with multiple categories
- Building documentation with multiple topics
- Implementing dashboards with different views
- Showing content where users need to switch contexts

**Avoid tabs when:**

- Building sequential forms or wizards (use a stepper pattern)
- Navigating between pages (use router navigation)
- Showing single content sections (no need for tabs)
- Having more than 7-8 tabs (consider a different layout)

## Features

- **Selection modes** - Tabs activate automatically on focus or require manual activation
- **Keyboard navigation** - Arrow keys, Home, and End for efficient tab navigation
- **Orientation** - Horizontal or vertical tab list layouts
- **Lazy content** - Tab panels render only when first activated
- **Disabled tabs** - Disable individual tabs with focus management
- **Focus modes** - Roving tabindex or activedescendant focus strategies
- **RTL support** - Right-to-left language navigation

## Examples

### Selection follows focus

When selection follows focus, tabs activate immediately as you navigate with arrow keys. This provides instant feedback and works well for lightweight content.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/selection-follows-focus/app/app.html"/>
</docs-code-multifile>

Set `[selectionMode]="'follow'"` on the tab list to enable this behavior.

### Manual activation

With manual activation, arrow keys move focus between tabs without changing the selected tab. Users press Space or Enter to activate the focused tab.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/explicit-selection/app/app.html"/>
</docs-code-multifile>

Use `[selectionMode]="'explicit'"` for heavy content panels to avoid unnecessary rendering.

### Vertical tabs

Arrange tabs vertically for interfaces like settings panels or navigation sidebars.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/vertical-orientation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/vertical-orientation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/vertical-orientation/app/app.html"/>
</docs-code-multifile>

Set `[orientation]="'vertical'"` on the tab list. Navigation changes to Up/Down arrow keys.

### Lazy content rendering

Use the `ngTabContent` directive on an `ng-template` to defer rendering tab panels until they're first shown.

```angular-html
<div ngTabs>
  <ul ngTabList [(selectedTab)]="selectedTab">
    <li ngTab value="tab1">Tab 1</li>
    <li ngTab value="tab2">Tab 2</li>
  </ul>

  <div ngTabPanel value="tab1">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 1 is first shown -->
      <app-heavy-component />
    </ng-template>
  </div>

  <div ngTabPanel value="tab2">
    <ng-template ngTabContent>
      <!-- This content only renders when Tab 2 is first shown -->
      <app-another-component />
    </ng-template>
  </div>
</div>
```

By default, content remains in the DOM after the panel is hidden. Set `[preserveContent]="false"` to remove content when the panel is deactivated.

### Disabled tabs

Disable specific tabs to prevent user interaction. Control whether disabled tabs can receive keyboard focus.

<docs-code-multifile preview hideCode path="adev/src/content/examples/aria/tabs/src/disabled-focusable/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/aria/tabs/src/disabled-focusable/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/aria/tabs/src/disabled-focusable/app/app.html"/>
</docs-code-multifile>

When `[softDisabled]="true"` on the tab list, disabled tabs can receive focus but cannot be activated. When `[softDisabled]="false"`, disabled tabs are skipped during keyboard navigation.

## Showcase

TBD

## APIs

### Tabs

The container directive that coordinates tab lists and panels.

This directive has no inputs or outputs. It serves as the root container for `ngTabList`, `ngTab`, and `ngTabPanel` directives.

### TabList

The container for tab buttons that manages selection and keyboard navigation.

#### Inputs

| Property        | Type                         | Default        | Description                                                        |
| --------------- | ---------------------------- | -------------- | ------------------------------------------------------------------ |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab list layout direction                                          |
| `wrap`          | `boolean`                    | `false`        | Whether keyboard navigation wraps from last to first tab           |
| `softDisabled`  | `boolean`                    | `true`         | When `true`, disabled tabs are focusable but not activatable       |
| `selectionMode` | `'follow' \| 'explicit'`     | `'follow'`     | Whether tabs activate on focus or require explicit activation      |
| `selectedTab`   | `any`                        | —              | The value of the currently selected tab (supports two-way binding) |

### Tab

An individual tab button.

#### Inputs

| Property   | Type      | Default | Description                             |
| ---------- | --------- | ------- | --------------------------------------- |
| `value`    | `any`     | —       | **Required.** Unique value for this tab |
| `disabled` | `boolean` | `false` | Disables this tab                       |

#### Signals

| Property   | Type              | Description                           |
| ---------- | ----------------- | ------------------------------------- |
| `selected` | `Signal<boolean>` | Whether the tab is currently selected |
| `active`   | `Signal<boolean>` | Whether the tab currently has focus   |

### TabPanel

The content panel associated with a tab.

#### Inputs

| Property          | Type      | Default | Description                                                |
| ----------------- | --------- | ------- | ---------------------------------------------------------- |
| `value`           | `any`     | —       | **Required.** Must match the `value` of the associated tab |
| `preserveContent` | `boolean` | `true`  | Whether to keep panel content in DOM after deactivation    |

#### Signals

| Property  | Type              | Description                            |
| --------- | ----------------- | -------------------------------------- |
| `visible` | `Signal<boolean>` | Whether the panel is currently visible |

### TabContent

A structural directive for lazy rendering tab panel content.

This directive has no inputs, outputs, or methods. Apply it to an `ng-template` element inside a tab panel:

```angular-html
<div ngTabPanel value="tab1">
  <ng-template ngTabContent>
    <!-- Content here is lazily rendered -->
  </ng-template>
</div>
```

## Styling

Angular automatically applies attributes to tab elements that you can use in your CSS selectors.

The tab list receives the `ng-tab-list` attribute:

```css
[ng-tab-list] {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #ddd;
}

[ng-tab-list][aria-orientation="vertical"] {
  flex-direction: column;
  border-bottom: none;
  border-right: 2px solid #ddd;
}
```

Tabs receive the `ng-tab` attribute with `data-active` when focused and `aria-selected` when selected:

```css
[ng-tab] {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
}

[ng-tab][data-active] {
  outline: 2px solid var(--focus-color);
}

[ng-tab][aria-selected="true"] {
  border-color: var(--primary-color);
  border-bottom-color: white;
  background: white;
  font-weight: 600;
}
```

Tab panels receive the `ng-tab-panel` attribute:

```css
[ng-tab-panel] {
  padding: 1.5rem;
}

[ng-tab-panel][hidden] {
  display: none;
}
```

TIP: Use `[data-active]` to style the focused tab and `[aria-selected="true"]` to style the selected tab. These are often the same tab but can differ in manual activation mode.

<docs-decorative-header title="Angular Aria">
</docs-decorative-header>

## What is Angular Aria?

Building accessible components seems straightforward, but implementing them according to the W3C Accessibility Guidelines requires significant effort and accessibility expertise.

Angular Aria is a collection of headless, accessible directives that implement common WAI-ARIA patterns. The directives handle keyboard interactions, ARIA attributes, focus management, and screen reader support. All you have to do is provide the HTML structure, CSS styling, and business logic!

## Installation

```shell
npm install @angular/aria
```

## Showcase

For example, let's take a toolbar menu. While it may appear to be a "simple" row of buttons tied with specific logic, keyboard navigation and screen readers add a lot of unexpected complexity to those unfamiliar with accessibility.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/toolbar/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

In this one scenario, developers need to consider:

- **Keyboard navigation**. Users need to open the menu with Enter or Space, navigate options with arrow keys, select with Enter, and close with Escape.
- **Screen readers** need to announce the menu's state, the number of options, and which option has focus.
- **Focus management** needs to move logically between the trigger and menu items.
- **Right-to-left languages** require the ability to navigate in reverse.

## What's included?

Angular Aria includes directives with comprehensive documentation, working examples and API references for common interactive patterns:

### Search and selection

| Component                               | Description                                                    |
| --------------------------------------- | -------------------------------------------------------------- |
| [Autocomplete](guide/aria/autocomplete) | Text input with filtered suggestions that appear as users type |
| [Listbox](guide/aria/listbox)           | Single or multi-select option lists with keyboard navigation   |
| [Select](guide/aria/select)             | Single-selection dropdown pattern with keyboard navigation     |
| [Multiselect](guide/aria/multiselect)   | Multiple-selection dropdown pattern with compact display       |
| [Combobox](guide/aria/combobox)         | Primitive directive that coordinates a text input with a popup |

### Navigation and call to actions

| Component                     | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| [Menu](guide/aria/menu)       | Dropdown menus with nested submenus and keyboard shortcuts |
| [Menubar](guide/aria/menubar) | Horizontal navigation bar for persistent application menus |
| [Toolbar](guide/aria/toolbar) | Grouped sets of controls with logical keyboard navigation  |

### Content organization

| Component                         | Description                                                            |
| --------------------------------- | ---------------------------------------------------------------------- |
| [Accordion](guide/aria/accordion) | Collapsible content panels that can expand individually or exclusively |
| [Tabs](guide/aria/tabs)           | Tabbed interfaces with automatic or manual activation modes            |
| [Tree](guide/aria/tree)           | Hierarchical lists with expand/collapse functionality                  |
| [Grid](guide/aria/grid)           | Two-dimensional data display with cell-by-cell keyboard navigation     |

## When to use Angular Aria

Angular Aria works well when you need accessible interactive components that are WCAG compliant with custom styling. Examples include:

- **Building a design system** - Your team maintains a component library with specific visual standards that need accessible implementations
- **Enterprise component libraries** - You're creating reusable components for multiple applications within an organization
- **Custom brand requirements** - The interface needs to match precise design specifications that pre-styled component libraries cannot easily accommodate

## When not to use Angular Aria

Angular Aria might not fit every scenario:

- **Pre-styled components** - If you need components that look complete without custom styling, use Angular Material instead
- **Simple forms** - Native HTML form controls like `<button>` and `<input type="radio">` provide built-in accessibility for straightforward use cases
- **Rapid prototyping** - When validating concepts quickly, pre-styled component libraries reduce initial development time

## Next steps

Check out a component from the side nav or [list above](#whats-included), or start with [Toolbar](guide/aria/toolbar) to see a complete example of how Angular Aria directives work!

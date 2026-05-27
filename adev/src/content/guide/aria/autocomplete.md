<docs-decorative-header title="Autocomplete">
</docs-decorative-header>

## Overview

An accessible input field that filters and suggests options as users type, helping them find and select values from a list.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

Autocomplete works best when users need to select from a large set of options where typing is faster than scrolling. Consider using autocomplete when:

- **The option list is long** (more than 20 items) - Typing narrows down choices faster than scrolling through a dropdown
- **Users know what they're looking for** - They can type part of the expected value (like a state name, product, or username)
- **Options follow predictable patterns** - Users can guess partial matches (like country codes, email domains, or categories)
- **Speed matters** - Forms benefit from quick selection without extensive navigation

Avoid autocomplete when:

- The list has fewer than 10 options - A regular dropdown or radio group provides better visibility
- Users need to browse options - If discovery is important, show all options upfront
- Options are unfamiliar - Users can't type what they don't know exists in the list

## Features

Angular's autocomplete provides a fully accessible combobox implementation with:

- **Keyboard Navigation** - Navigate options with arrow keys, select with Enter, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Dynamic Highlight Behavior** - Built-in support for inline selection suggestions
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Popover API Integration** - Leverages the native HTML Popover API for optimal positioning
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages

## Examples

### Auto-select mode

Users typing partial text expect immediate confirmation that their input matches an available option. Auto-select mode updates the input value to match the first filtered option as users type, reducing the number of keystrokes needed and providing instant feedback that their search is on the right track.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Manual selection mode

Manual selection mode keeps the typed text unchanged while users navigate the suggestion list, preventing confusion from automatic updates. The input only changes when users explicitly confirm their choice with Enter or a click.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/manual/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Highlight mode

Highlight mode allows the user to navigate options with arrow keys without changing the input value as they browse until they explicitly select a new option with Enter or click.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/autocomplete/src/highlight/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## APIs

### Combobox Directive

The `ngCombobox` directive is applied directly onto the editable text `<input>` or `<textarea>` to manage keyboard triggers and popover states.

#### Inputs

| Property           | Type                  | Default     | Description                                                     |
| ------------------ | --------------------- | ----------- | --------------------------------------------------------------- |
| `disabled`         | `boolean`             | `false`     | Disables the combobox                                           |
| `softDisabled`     | `boolean`             | `true`      | Focusable when disabled                                         |
| `inlineSuggestion` | `string \| undefined` | `undefined` | Displays an inline completion suggestion for autocomplete modes |

#### Models

| Property   | Type                   | Default | Description                                                       |
| ---------- | ---------------------- | ------- | ----------------------------------------------------------------- |
| `value`    | `ModelSignal<string>`  | `''`    | Two-way bindable value of the input using `[(value)]`             |
| `expanded` | `ModelSignal<boolean>` | `false` | Two-way bindable expanded state of the popup using `[(expanded)]` |

---

### ComboboxPopup Directive

A structural directive applied to `<ng-template>` to mark the container used as the popup.

#### Inputs

| Property   | Type       | Description                                 |
| ---------- | ---------- | ------------------------------------------- |
| `combobox` | `Combobox` | Required reference to the parent `Combobox` |

---

### ComboboxWidget Directive

Applied to the popup content container to bridge active-descendant focus changes to the input trigger.

#### Inputs

| Property           | Type                  | Description                                                                       |
| ------------------ | --------------------- | --------------------------------------------------------------------------------- |
| `activeDescendant` | `string \| undefined` | The ID of the currently active descendant (bound to `listbox.activeDescendant()`) |

---

### Listbox Directives

Autocomplete suggestion lists use the standard standalone listbox directives.

#### Inputs

| Property        | Type                               | Default    | Description                                                                                          |
| --------------- | ---------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `selectionMode` | `'follow'` \| `'explicit'`         | `'follow'` | In manual/explicit mode, updates are committed explicitly on click/Enter rather than following focus |
| `focusMode`     | `'roving'` \| `'activedescendant'` | `'roving'` | Set to `'activedescendant'` so browser focus stays on the trigger input                              |
| `tabIndex`      | `number`                           | `0`        | Set to `-1` to prevent keyboard tab focus from entering the popup listbox container                  |

#### Models

| Property | Type                 | Description                                                 |
| -------- | -------------------- | ----------------------------------------------------------- |
| `value`  | `ModelSignal<any[]>` | Two-way bindable array of selected values using `[(value)]` |

---

### Related components

Autocomplete uses standard standalone [Listbox](/api/aria/listbox/Listbox) and [Option](/api/aria/listbox/Option) directives. See the [Listbox documentation](/guide/aria/listbox) for advanced options.

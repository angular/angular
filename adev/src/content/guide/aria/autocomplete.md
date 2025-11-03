<docs-decorative-header title="Autocomplete">
    An accessible input field that filters and suggests options as users type, helping them find and select values from a predefined list.
</docs-decorative-header>

Autocomplete combines a text input with a dynamic suggestion list that narrows down options based on user input. Users can type to filter options, navigate suggestions with keyboard arrows, and select values from the list. This pattern is particularly useful for forms with many predefined options, such as state selection, product search, or user lookup.

<docs-code-multifile preview path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.ts">
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.ts"/>
  <docs-code header="app/app.component.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.html"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.css"/>
</docs-code-multifile>

## Features

Angular's autocomplete provides a fully accessible combobox implementation with:

- **Keyboard Navigation** - Navigate options with arrow keys, select with Enter, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes for assistive technologies
- **Three Filter Modes** - Choose between auto-select, manual selection, or highlighting behavior
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Popover API Integration** - Uses the native HTML Popover API for optimal positioning
- **Bidirectional Text Support** - Automatically handles right-to-left (RTL) languages

## Usage

Autocomplete works best when users need to select from a large set of predefined options where typing is faster than scrolling. Consider using autocomplete when:

- **The option list is long** (more than 20 items) - Typing narrows down choices faster than scrolling through a dropdown
- **Users know what they're looking for** - They can type part of the expected value (like a state name, product, or username)
- **Options follow predictable patterns** - Users can guess partial matches (like country codes, email domains, or categories)
- **Speed matters** - Forms benefit from quick selection without extensive navigation

Avoid autocomplete when:

- The list has fewer than 10 options - A regular dropdown or radio group provides better visibility
- Users need to browse options - If discovery is important, show all options upfront
- Options are unfamiliar - Users can't type what they don't know exists in the list

## Examples

### Auto-Select Mode

Users typing partial text expect immediate confirmation that their input matches an available option. Auto-select mode updates the input value to match the first filtered option as users type, reducing the number of keystrokes needed and providing instant feedback that their search is on the right track.

<docs-code-multifile preview path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.ts">
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.ts" visibleLines="[1,7,33,40]"/>
  <docs-code header="app/app.component.html" path="adev/src/content/examples/aria/autocomplete/src/basic/app/app.component.html"/>
</docs-code-multifile>

### Manual Selection Mode

Users exploring unfamiliar options need time to browse without their input changing unexpectedly. Manual mode keeps the typed text unchanged while users navigate the suggestion list, preventing confusion from automatic updates. The input only changes when users explicitly confirm their choice with Enter or a click.

<docs-code-multifile preview path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/aria/autocomplete/src/manual/app/app.component.html" visibleLines="[1]"/>
</docs-code-multifile>

### Highlight Mode

Users navigating with arrow keys need to see which option will be selected, but don't want their input value changing as they browse. Highlight mode provides visual feedback by highlighting the focused option while preserving the original typed text until users explicitly select with Enter or click.

<docs-code-multifile preview path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/aria/autocomplete/src/highlight/app/app.component.html" visibleLines="[1]"/>
</docs-code-multifile>

## Showcase

## APIs

### Combobox Directive

The `ngCombobox` directive provides the container for autocomplete functionality.

**Inputs:**

- `filterMode` - Controls selection behavior: `'auto-select'` | `'manual'` | `'highlight'` (default: `'manual'`)
- `disabled` - Disables the combobox when `true`
- `readonly` - Makes the combobox read-only when `true`
- `firstMatch` - The value of the first matching item in the popup

**Outputs:**

- `expanded` - Signal indicating whether the popup is currently open

### ComboboxInput Directive

The `ngComboboxInput` directive connects an input element to the combobox.

**Model:**

- `value` - Two-way bindable string value of the input using `[(value)]`

### ComboboxPopupContainer Directive

The `ngComboboxPopupContainer` directive wraps the popup content and manages its display.

Must be used with `<ng-template>` inside a popover element.

### Related Components

Autocomplete uses [Listbox](https://angular.dev/api/aria/listbox/Listbox) and [Option](https://angular.dev/api/aria/listbox/Option) directives to render the suggestion list. See the [Listbox documentation](https://angular.dev/guide/aria/listbox) for additional customization options.

## Styling

The autocomplete components don't include default styles, allowing full customization to match your design system. Apply styles through standard CSS classes or style bindings.

### Styling the Input

```css
input[ngComboboxInput] {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[ngComboboxInput]:focus {
  outline: 2px solid blue;
  border-color: blue;
}
```

### Styling the Popup

```css
[popover] {
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}
```

### Styling Options

Options use the listbox styling. See the [Listbox styling guide](https://angular.dev/guide/aria/listbox#styling) for detailed customization patterns.

<docs-decorative-header title="Combobox">
</docs-decorative-header>

<docs-pill-row>
  <docs-pill href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/" title="Combobox ARIA pattern"/>
  <docs-pill href="/api?query=combobox#angular_aria_combobox" title="Combobox API Reference"/>
</docs-pill-row>

## Overview

A directive that coordinates a trigger element (such as a text input, button, or `div`) with a popup, providing the primitive directive for autocomplete, select, and multiselect patterns.

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

## Usage

Combobox is the primitive directive that coordinates an interactive trigger element (such as a text input, button, or `div`) with a popup. It provides the foundation for autocomplete, select, and multiselect patterns. Consider using combobox directly when:

- **Building custom autocomplete patterns** - Creating specialized filtering or suggestion behavior
- **Creating custom selection components** - Developing dropdowns with unique requirements
- **Coordinating input with popup** - Pairing text input with listbox, tree, or dialog content
- **Implementing custom filtering** - Filtering and orchestrating matching options in user space

Use documented patterns instead when:

- Standard autocomplete with filtering is needed - See the [Autocomplete pattern](guide/aria/autocomplete) for ready-to-use examples
- Single-selection dropdowns are needed - See the [Select pattern](guide/aria/select) for complete dropdown implementation
- Multiple-selection dropdowns are needed - See the [Multiselect pattern](guide/aria/multiselect) for multi-select with compact display

NOTE: The [Autocomplete](guide/aria/autocomplete), [Select](guide/aria/select), and [Multiselect](guide/aria/multiselect) guides show documented patterns that combine this directive with [Listbox](guide/aria/listbox) for specific use cases.

## Features

Angular's combobox provides a fully accessible input-popup coordination system with:

- **Trigger Element with Popup** - Coordinates trigger element with popup content
- **Flexible Coordination** - Integrates seamlessly with standard layouts (listbox, tree, grid, or dialog)
- **Keyboard Navigation** - Arrow keys, Enter, Escape handling
- **Screen Reader Support** - Built-in ARIA attributes including role="combobox" and aria-expanded
- **Popup Management** - Automatic show/hide based on user interaction
- **Signal-Based Reactivity** - Reactive state management using Angular signals

## Examples

### Autocomplete

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

Filtering is managed in user space by updating a signal that reactively filters the options list. Users navigate with arrow keys and select with Enter or click. This provides complete control and maximum flexibility for custom selection logic. See the [Autocomplete guide](guide/aria/autocomplete) for complete filtering patterns and examples.

### Readonly mode

A pattern that combines a readonly combobox with listbox to create single-selection dropdowns with keyboard navigation and screen reader support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/select/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Triggering a dropdown without text input can be achieved using a button as the host trigger, or applying the native HTML `readonly` attribute to the input trigger. The popup opens on click or arrow keys.

This configuration provides the foundation for the [Select](guide/aria/select) and [Multiselect](guide/aria/multiselect) patterns. See those guides for complete dropdown implementations with triggers and overlay positioning.

### Datepicker grid

Combobox can coordinate with a two-dimensional grid to create accessible datepickers. Users navigate dates inside the calendar grid table using directional arrow keys and confirm selection with click, Enter, or Spacebar.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/datepicker/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

### Dialog popup

Dialog popups combine the combobox trigger with standard dialog layouts and focus traps (such as CDK's `cdkTrapFocus`). Use dialog popups when the overlay requires modal behavior or backdrop interaction.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/combobox/src/dialog/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Testing

Angular Aria provides a `ComboboxHarness` for testing combobox components.
Here is an example of how to use the harness in a component test:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {MyComboboxComponent} from './my-combobox'; // Your component

describe('MyComboboxComponent', () => {
  let fixture: ComponentFixture<MyComboboxComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyComboboxComponent],
    });

    fixture = TestBed.createComponent(MyComboboxComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow opening and closing the popup', async () => {
    const combobox = await loader.getHarness(ComboboxHarness);

    // Verify initial state
    expect(await combobox.isOpen()).toBe(false);

    // Open the popup
    await combobox.open();
    expect(await combobox.isOpen()).toBe(true);

    // Close the popup
    await combobox.close();
    expect(await combobox.isOpen()).toBe(false);
  });
});
```

## APIs

### Combobox Directive

Coordinates an interactive trigger element (such as a text input, button, or div) with a popup container.

#### Inputs / Model

| Property           | Type                   | Default | Description                                                         |
| ------------------ | ---------------------- | ------- | ------------------------------------------------------------------- |
| `value`            | `ModelSignal<string>`  | `''`    | Two-way bindable text value of the combobox                         |
| `expanded`         | `ModelSignal<boolean>` | `false` | Two-way bindable open/closed expanded state of the popup            |
| `disabled`         | `boolean`              | `false` | Disables the combobox trigger element                               |
| `softDisabled`     | `boolean`              | `true`  | Disables interaction while keeping the element keyboard focusable   |
| `alwaysExpanded`   | `boolean`              | `false` | Forces the popup to always remain open                              |
| `inlineSuggestion` | `string \| undefined`  | -       | Sets an inline suggestion to be highlighted at the end of the input |
| `tabIndex`         | `number \| undefined`  | -       | Tabindex of the combobox element (aliased to `tabindex`)            |

All keyboard events, focus coordination, and ARIA state properties (including `role="combobox"`, `aria-autocomplete`, and `aria-expanded`) are handled automatically on the host element.

---

### ComboboxPopup Directive

Marks an `<ng-template>` as the popup container for the combobox.

#### Inputs

| Property    | Type                                        | Default     | Description                                    |
| ----------- | ------------------------------------------- | ----------- | ---------------------------------------------- |
| `combobox`  | `Combobox`                                  | (Required)  | Reference to the parent `Combobox` directive   |
| `popupType` | `'listbox' \| 'tree' \| 'grid' \| 'dialog'` | `'listbox'` | Specifies the layout/role profile of the popup |

---

### ComboboxWidget Directive

Connects the popup contents (such as a listbox or grid) with the parent combobox trigger.

#### Inputs

| Property           | Type                  | Description                                                                         |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------- |
| `activeDescendant` | `string \| undefined` | The ID of the currently active option (bound to the active option ID in the widget) |

---

### Related patterns and directives

Combobox is the primitive directive for these documented patterns:

- **[Autocomplete](guide/aria/autocomplete)** - Filtering and suggestions pattern (coordinates input typing with options list)
- **[Select](guide/aria/select)** - Single selection dropdown pattern (applied directly on non-editable button triggers)
- **[Multiselect](guide/aria/multiselect)** - Multiple selection pattern (applied on non-editable triggers with multi-enabled Listbox)

Combobox typically combines with:

- **[Listbox](guide/aria/listbox)** - Most common popup content
- **[Tree](guide/aria/tree)** - Hierarchical popup content (see Tree guide for examples)

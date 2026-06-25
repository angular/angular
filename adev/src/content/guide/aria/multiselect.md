<docs-decorative-header title="Multiselect">
</docs-decorative-header>

## Overview

The multiselect pattern combines a read-only combobox trigger with a multi-select listbox popup to create highly accessible multiple-selection dropdowns with keyboard navigation and screen reader support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

## Usage

The multiselect pattern works best when users need to choose multiple related items from a familiar set of options.

Consider using this pattern when:

- **Users need multiple selections** - Tags, categories, filters, or labels where multiple choices apply
- **The option list is fixed** (fewer than 20 items) - Users can scan options without search
- **Filtering content** - Multiple criteria can be active simultaneously
- **Assigning attributes** - Labels, permissions, or features where multiple values make sense
- **Related choices** - Options that logically work together (such as selecting multiple team members)

Avoid this pattern when:

- **Only single selection is needed** - Use the [Select pattern](guide/aria/select) for simpler single-choice dropdowns
- **The list has more than 20 items with search needed** - Use the [Autocomplete pattern](guide/aria/autocomplete) with multiselect capability
- **Most or all options will be selected** - A checklist pattern provides better visibility
- **Choices are independent binary options** - Individual checkboxes communicate the choices more clearly

## Features

The multiselect pattern combines [Combobox](guide/aria/combobox) and [Listbox](guide/aria/listbox) directives to provide a fully accessible dropdown with:

- **Keyboard Navigation** - Navigate options with arrow keys, toggle with Space, close with Escape
- **Screen Reader Support** - Built-in ARIA attributes including aria-multiselectable
- **Selection Count Display** - Shows compact "Item + 2 more" pattern for multiple selections
- **Signal-Based Reactivity** - Reactive state management using Angular signals
- **Smart Positioning** - CDK Overlay handles viewport edges and scrolling
- **Persistent Selection** - Selected options remain visible with checkmarks after selection

## Examples

### Basic multiselect

Users need to select multiple items from a list of options. A readonly combobox paired with a multi-enabled listbox provides familiar multiselect functionality with full accessibility support.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/basic/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

The `multi` attribute on `ngListbox` enables multiple selection. Press Space to toggle options, and the popup remains open for additional selections. The display shows the first selected item plus a count of remaining selections.

### Multiselect with custom display

Options often need visual indicators like icons or colors to help users identify choices. Custom templates within options allow rich formatting while the display value shows a compact summary.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/icons/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

Each option displays an icon alongside its label. The display value updates to show the first selection's icon and text, followed by a count of additional selections. Selected options show a checkmark for clear visual feedback.

### Controlled selection

Forms sometimes need to limit the number of selections or validate user choices. Programmatic control over selection enables these constraints while maintaining accessibility.

<docs-tab-group>
  <docs-tab label="Basic">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Material">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/material/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>

  <docs-tab label="Retro">
    <docs-code-multifile preview hideCode path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.ts">
      <docs-code header="app.ts" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.ts"/>
      <docs-code header="app.html" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.html"/>
      <docs-code header="app.css" path="adev/src/content/examples/aria/multiselect/src/limited/retro/app/app.css"/>
    </docs-code-multifile>
  </docs-tab>
</docs-tab-group>

This example limits selections to two items. When the limit is reached, unselected options are disabled to prevent further selections, and the combobox display updates to reflect the choices.

## Testing

The multiselect pattern can be tested using a combination of `ComboboxHarness` and `ListboxHarness` from `@angular/aria/combobox/testing` and `@angular/aria/listbox/testing`.
Here is an example of how to use the harnesses to test a multiselect component:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComboboxHarness} from '@angular/aria/combobox/testing';
import {ListboxHarness} from '@angular/aria/listbox/testing';
import {MyMultiselectComponent} from './my-multiselect'; // Your component

describe('MyMultiselectComponent', () => {
  let fixture: ComponentFixture<MyMultiselectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MyMultiselectComponent],
    });

    fixture = TestBed.createComponent(MyMultiselectComponent);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should allow selecting multiple options', async () => {
    const select = await loader.getHarness(ComboboxHarness);

    // Open the dropdown
    await select.open();

    // Get the listbox harness from the popup
    const listbox = await select.getPopupWidget(ListboxHarness);
    expect(await listbox.isMulti()).toBe(true);

    const options = await listbox.getOptions();

    // Select first and second options
    await options[0].click();
    await options[1].click();

    // Verify both options are selected
    expect(await options[0].isSelected()).toBe(true);
    expect(await options[1].isSelected()).toBe(true);

    // Close the dropdown
    await select.close();

    // Verify value is updated (e.g., comma separated list or count)
    expect(await (await select.host()).text()).toContain('Option 1, Option 2');
  });
});
```

## APIs

The multiselect pattern uses the following directives from Angular's Aria library. See the full API documentation in the linked guides.

### Combobox directives

The multiselect pattern uses `ngCombobox` directly on the trigger element (such as a `div` or `button`) to create a select-like multiselect dropdown.

#### Inputs

| Property   | Type      | Default | Description                     |
| ---------- | --------- | ------- | ------------------------------- |
| `disabled` | `boolean` | `false` | Disables the entire multiselect |

See the [Combobox API documentation](guide/aria/combobox#apis) for complete details on all available inputs and signals.

#### Popup directives

The structural `ngComboboxPopup` directive marks the overlay template and requires a reference to the parent combobox:

| Property   | Type       | Description                                 |
| ---------- | ---------- | ------------------------------------------- |
| `combobox` | `Combobox` | Required reference to the parent `Combobox` |

#### ComboboxWidget directive

The `ngComboboxWidget` directive bridges the listbox with the combobox trigger to support active-descendant focus tracking.

| Property           | Type                  | Description                                                                                                                                  |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeDescendant` | `string \| undefined` | The ID of the currently active option (bound to `listbox.activeDescendant()`) to update the `aria-activedescendant` attribute on the trigger |

### Listbox directives

The multiselect pattern uses `ngListbox` with the `multi` attribute for multiple selection and `ngOption` for each selectable item.

#### Inputs

| Property        | Type                               | Default    | Description                                                                                                                     |
| --------------- | ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `multi`         | `boolean`                          | `false`    | Set to `true` to enable multiple selection                                                                                      |
| `selectionMode` | `'follow'` \| `'explicit'`         | `'follow'` | Set to `'explicit'` so options are toggled explicitly via click/Space instead of following active focus                         |
| `focusMode`     | `'roving'` \| `'activedescendant'` | `'roving'` | The focus strategy used by the listbox. Set to `'activedescendant'` so browser focus remains on the combobox trigger.           |
| `tabIndex`      | `number`                           | `0`        | The tabindex of the listbox. Set to `-1` to prevent keyboard focus from entering the popup container in active-descendant mode. |

#### Model

| Property | Type                 | Description                               |
| -------- | -------------------- | ----------------------------------------- |
| `value`  | `ModelSignal<any[]>` | Two-way bindable array of selected values |

When `multi` is true, users can select multiple options using Space to toggle selection. The popup remains open after selection, allowing additional choices.

See the [Listbox API documentation](guide/aria/listbox#apis) for complete details on listbox configuration, selection modes, and option properties.

### Positioning

The multiselect pattern integrates with [CDK Overlay](https://material.angular.io/cdk/overlay/overview) for smart positioning. Use `cdkConnectedOverlay` to handle viewport edges and scrolling automatically.

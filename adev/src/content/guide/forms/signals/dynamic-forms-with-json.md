# Dynamic Forms with JSON

Some forms can't define their structure at compile time. Server-driven forms, admin panels, multi-tenant applications, and CMS-managed content all need to render fields from configuration delivered at runtime, typically as JSON from a backend, an admin tool, or per-tenant settings.

This guide shows how to build forms whose model, schema, validation, and rendering are all derived from a single runtime configuration.

## When to use JSON-driven forms

This pattern is a good choice when:

- A backend defines which fields appear based on user role, feature flags, or business rules
- Non-developers configure form structure through an admin panel or CMS
- Each tenant in a multi-tenant application has its own form structure stored as configuration
- Forms need to evolve without redeploying the frontend

Use a static form (with fields defined directly in your component) when the structure is known at build time. Static forms get full TypeScript checking on every field, plus straightforward testing and tooling support.

## Defining a typed field config

When you want to render fields from runtime configuration, start with a TypeScript type that captures the shape of each field. A discriminated union by `kind` lets each variant declare its own validation options:

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean}
  | {kind: 'number'; name: string; label: string; required?: boolean; min?: number; max?: number};
```

Every variant has a name, label, and optional `required` flag. Number fields additionally accept `min` and `max` bounds. Add new variants by adding new `kind` branches.

A concrete config might look like this:

```ts
const profileConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
  {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
];
```

In practice this `FieldConfig[]` typically arrives from your backend, an admin panel, or a CMS. For brevity, the examples below use an in-component literal.

## Building the model from config

The form's model needs one entry per field with a default value matching the field's kind. A small helper handles this:

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null> {
  const initial: Record<string, string | number | null> = {};
  for (const config of configs) {
    initial[config.name] = config.kind === 'number' ? null : '';
  }
  return initial;
}
```

The model uses `Record<string, string | number | null>` because the keys are not known ahead of time.

In addition, numeric fields initialize to `null` rather than `0` so an empty field reads as empty. With `0`, [`required()`](api/forms/signals/required) would treat the field as already filled, and any [`min()`](api/forms/signals/min) constraint above zero would flag the field invalid before the user enters anything.

## Building the schema from config

The schema is also derived from the config. You can loop through each entry and apply the validators that match its kind:

```ts
import {required, min, max, SchemaFn} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (path) => {
    for (const config of configs) {
      const fieldPath = path[config.name];

      if (config.required) {
        required(fieldPath);
      }

      if (config.kind === 'number') {
        if (config.min !== undefined) min(fieldPath, config.min);
        if (config.max !== undefined) max(fieldPath, config.max);
      }
    }
  };
}
```

The discriminated union narrows `config` inside each branch, so `config.min` and `config.max` are typed correctly when `config.kind === 'number'`.

## Expressing conditional rules in config

Some validation rules only make sense under certain conditions. For example, US state codes need validating only when the country is the US. Express these dependencies in the config by adding a `when` discriminator that names another field and the value it must equal:

```ts
type WhenCondition = {field: string; equals: string | number};

type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    };
```

Update `buildSchema()` to translate `when` into an [`applyWhen()`](api/forms/signals/applyWhen) call. Shared rule application logic moves into a small closure so the conditional and unconditional branches both call the same function:

```ts
import {applyWhen, required, min, max, SchemaFn} from '@angular/forms/signals';

function buildSchema(configs: FieldConfig[]): SchemaFn<Record<string, string | number | null>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];
        if (config.required) required(fieldPath);
        if (config.kind === 'number') {
          if (config.min !== undefined) min(fieldPath, config.min);
          if (config.max !== undefined) max(fieldPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

When `applyWhen()`'s condition is true, the rules inside activate. When the condition becomes false, the rules deactivate and the field's validation state clears. Because the condition function reads through `valueOf(rootPath[field])`, the form re-evaluates the gate every time the referenced field changes.

A config that uses `when` looks like this:

```ts
const addressConfig: FieldConfig[] = [
  {kind: 'text', name: 'country', label: 'Country', required: true},
  {
    kind: 'text',
    name: 'stateCode',
    label: 'State',
    required: true,
    when: {field: 'country', equals: 'US'},
  },
];
```

The `stateCode` field only requires a value when `country` is `'US'`. Users entering any other country can leave `stateCode` blank without blocking submission.

For more complex conditions (multiple fields, ranges, or non-equality checks), extend `WhenCondition` with additional discriminators (such as `in: string[]` or `notEquals: string | number`) and translate each variant inside `buildSchema()`. The principle is the same: the config carries the data, `buildSchema()` translates it to `applyWhen()` calls.

To gate visibility instead of validation, follow the same pattern using [`hidden()`](api/forms/signals/hidden) on the field path. See [Configuring `hidden()` state on fields](guide/forms/signals/form-logic#configuring-hidden-state-on-fields) for details.

## Expressing repeating fields in config

Some configurations need fields that grow and shrink at runtime, like a list of phone numbers, tags, or invoice line items. Add an `array` kind to the config and translate it to [`applyEach()`](api/forms/signals/applyEach) so per-item rules apply uniformly as items come and go.

Extend `FieldConfig` with an `array` variant. This example uses arrays of strings; the same approach scales to arrays of objects by replacing the item shape with a record:

```ts
type FieldConfig =
  | {kind: 'text'; name: string; label: string; required?: boolean; when?: WhenCondition}
  | {
      kind: 'number';
      name: string;
      label: string;
      required?: boolean;
      min?: number;
      max?: number;
      when?: WhenCondition;
    }
  | {kind: 'array'; name: string; label: string; itemRequired?: boolean; when?: WhenCondition};
```

Update `buildModel()` to initialize array fields with an empty array. The model widens to include `string[]`:

```ts
function buildModel(configs: FieldConfig[]): Record<string, string | number | null | string[]> {
  const initial: Record<string, string | number | null | string[]> = {};
  for (const config of configs) {
    if (config.kind === 'number') initial[config.name] = null;
    else if (config.kind === 'array') initial[config.name] = [];
    else initial[config.name] = '';
  }
  return initial;
}
```

Update `buildSchema()` to apply per-item rules with `applyEach()`. The path coming from a `Record<string, string | number | null | string[]>` model is too broad for `applyEach()` (and for `min()` / `max()`) to type-check directly, so cast `fieldPath` to the appropriate shape inside each `kind` branch:

```ts
import {
  applyEach,
  applyWhen,
  required,
  min,
  max,
  SchemaFn,
  SchemaPath,
} from '@angular/forms/signals';

function buildSchema(
  configs: FieldConfig[],
): SchemaFn<Record<string, string | number | null | string[]>> {
  return (rootPath) => {
    for (const config of configs) {
      const applyRules = (path: typeof rootPath) => {
        const fieldPath = path[config.name];

        if (config.kind === 'array') {
          const arrayPath = fieldPath as unknown as SchemaPath<string[]>;
          if (config.itemRequired) {
            applyEach(arrayPath, (item) => required(item));
          }
          return;
        }

        if (config.required) required(fieldPath);

        if (config.kind === 'number') {
          const numberPath = fieldPath as unknown as SchemaPath<number | null>;
          if (config.min !== undefined) min(numberPath, config.min);
          if (config.max !== undefined) max(numberPath, config.max);
        }
      };

      if (config.when) {
        const {field, equals} = config.when;
        applyWhen(rootPath, ({valueOf}) => valueOf(rootPath[field]) === equals, applyRules);
      } else {
        applyRules(rootPath);
      }
    }
  };
}
```

The casts inside each branch are deliberate escape hatches: you're trading the compiler's structural guarantee for a runtime invariant the surrounding `kind` check enforces. Each cast is scoped to a `kind` block, so the assumption stays local and straightforward to audit.

A config that uses the `array` kind looks like this:

```ts
const contactConfig: FieldConfig[] = [
  {kind: 'text', name: 'fullName', label: 'Full name', required: true},
  {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
];
```

To render an array field, iterate it with `@for` and let users add or remove items by updating the model signal. Add a typed accessor that returns a [`FieldTree`](api/forms/signals/FieldTree) so the iteration sees the array structure, and define methods to grow and shrink the model:

```ts
import {FieldTree} from '@angular/forms/signals';

// inside the component class
asArrayField(name: string): FieldTree<string[]> {
  return this.dynamicForm[name] as unknown as FieldTree<string[]>;
}

addItem(name: string) {
  this.model.update(current => ({
    ...current,
    [name]: [...(current[name] as string[]), ''],
  }));
}

removeItem(name: string, index: number) {
  this.model.update(current => ({
    ...current,
    [name]: (current[name] as string[]).filter((_, i) => i !== index),
  }));
}
```

`FieldTree<string[]>` is iterable, so `@for` can walk it; each item is a `FieldTree<string>` that satisfies `[formField]` directly. Leaf fields can use `Field<T>` accessors instead, since `Field<T>` is the callable signature without iteration.

In the template, render an array case like this:

```angular-html
@case ('array') {
  <fieldset>
    <legend>{{ config.label }}</legend>
    @for (item of asArrayField(config.name); track item; let i = $index) {
      <input type="text" [formField]="item" />
      <button type="button" (click)="removeItem(config.name, i)">Remove</button>
    }
    <button type="button" (click)="addItem(config.name)">Add</button>
  </fieldset>
}
```

The `addItem()` method extends the model; the form re-derives the array's fields automatically. New items start with fresh validation state. `removeItem()` filters the model; the dropped item's field state goes with it.

### Tracking item identity

Signal Forms tracks each item in an array of objects by its identity. When you store a reference to a field at a specific position, that reference follows the underlying data, not the position. Reading state through the held reference returns the data even if it has moved:

```ts
const contactModel = signal([
  {name: 'Alice', phone: '555-0001'},
  {name: 'Bob', phone: '555-0002'},
]);

const contactForm = form(contactModel);

// Hold a reference to the field that's currently at index 0 (Alice).
const aliceField = contactForm[0];

// Swap the array items so Bob is at index 0, Alice at index 1.
contactModel.update(([alice, bob]) => [bob, alice]);

// The held reference still points to Alice's field, even after the swap.
console.log(aliceField().value().phone); // '555-0001' (Alice's number)
console.log(contactForm[0]().value().phone); // '555-0002' (Bob, now at index 0)
```

This identity tracking prevents bugs when sorting, reordering, or filtering, as long as the referenced item remains in the array. Stored field references remain valid even when array order changes; removing the referenced item itself orphans the held reference.

For arrays of primitives (the `phoneNumbers` example above), Signal Forms tracks items positionally instead: index 0 always refers to whatever value is currently at position 0.

Identity here is by JavaScript object reference, not by a logical id like a database key. If you replace the array with freshly-deserialized objects (for example, after a server reload), field state doesn't follow the logical item even when each item's `id` is unchanged. The guarantee covers in-memory operations like sorting, reordering, and filtering, not data refresh.

## Validating the config

Configs from external sources need validation before the form is built. Several failure modes can hide in untrusted JSON:

- Duplicate `name` values overwrite earlier model entries and break the `track config.name` expression in the template.
- A `when` clause that names a non-existent field fails at runtime when the condition first evaluates.
- A `when` clause that compares against an `array` field has no defined equality semantics.
- A `when.equals` value whose type doesn't match the referenced field's kind silently never matches, hiding the conditional behavior as if the rule were never active.

Catch all four at the boundary:

```ts
function validateConfigs(configs: FieldConfig[]): FieldConfig[] {
  const knownNames = new Set<string>();

  for (const config of configs) {
    if (knownNames.has(config.name)) {
      throw new Error(`Duplicate field name in config: "${config.name}"`);
    }
    knownNames.add(config.name);
  }

  for (const config of configs) {
    if (!config.when) continue;
    if (!knownNames.has(config.when.field)) {
      throw new Error(
        `Field "${config.name}" references unknown field "${config.when.field}" in its 'when' condition.`,
      );
    }
    const referenced = configs.find((c) => c.name === config.when!.field)!;
    if (referenced.kind === 'array') {
      throw new Error(
        `Field "${config.name}" cannot use 'when' to compare against array field "${config.when.field}".`,
      );
    }
    const expected = referenced.kind === 'text' ? 'string' : 'number';
    if (typeof config.when.equals !== expected) {
      throw new Error(
        `Field "${config.name}" compares ${referenced.kind} field "${config.when.field}" against a ${typeof config.when.equals} value; expected a ${expected}.`,
      );
    }
  }

  return configs;
}
```

The first pass enforces uniqueness; the second pass walks each `when` clause to confirm the referenced field exists, isn't an array, and is being compared against a value of the right type. The function returns the configs unchanged on success, so it composes cleanly with the field initializer that holds the configs in the component. Failures surface at the boundary between your application and the upstream source rather than as opaque form misbehavior later.

## Rendering the form dynamically

In the component, use `@for` to iterate the configs and `@switch` on `kind` to pick the right input control:

```angular-ts
import {Component, signal} from '@angular/core';
import {Field, FieldTree, form, FormField, FormRoot} from '@angular/forms/signals';

@Component({
  selector: 'app-dynamic-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="dynamicForm">
      @for (config of configs; track config.name) {
        @switch (config.kind) {
          @case ('text') {
            <label>
              {{ config.label }}
              <input type="text" [formField]="asTextField(config.name)" />
            </label>
          }
          @case ('number') {
            <label>
              {{ config.label }}
              <input type="number" [formField]="asNumberField(config.name)" />
            </label>
          }
          @case ('array') {
            <fieldset>
              <legend>{{ config.label }}</legend>
              @for (item of asArrayField(config.name); track item; let i = $index) {
                <input type="text" [formField]="item" />
                <button type="button" (click)="removeItem(config.name, i)">Remove</button>
              }
              <button type="button" (click)="addItem(config.name)">Add</button>
            </fieldset>
          }
        }
      }
    </form>
  `,
})
export class DynamicForm {
  configs: FieldConfig[] = validateConfigs([
    {kind: 'text', name: 'fullName', label: 'Full Name', required: true},
    {kind: 'number', name: 'age', label: 'Age', required: true, min: 18, max: 120},
    {kind: 'array', name: 'phoneNumbers', label: 'Phone numbers', itemRequired: true},
  ]);

  model = signal(buildModel(this.configs));

  dynamicForm = form(this.model, buildSchema(this.configs));

  asTextField(name: string): Field<string> {
    // <input type="text"> requires Field<string>.
    return this.dynamicForm[name] as unknown as Field<string>;
  }

  asNumberField(name: string): Field<number | null> {
    // <input type="number"> requires Field<number | null>.
    return this.dynamicForm[name] as unknown as Field<number | null>;
  }

  asArrayField(name: string): FieldTree<string[]> {
    // FieldTree (not Field) so @for can iterate the array.
    return this.dynamicForm[name] as unknown as FieldTree<string[]>;
  }

  addItem(name: string) {
    this.model.update((current) => ({
      ...current,
      [name]: [...(current[name] as string[]), ''],
    }));
  }

  removeItem(name: string, index: number) {
    this.model.update((current) => ({
      ...current,
      [name]: (current[name] as string[]).filter((_, i) => i !== index),
    }));
  }
}
```

Template type-checking treats `dynamicForm[name]` as an independent expression, so the `@switch` narrowing on `config.kind` doesn't reach the indexed access. The accessors restate that narrowing as a cast at the binding site, and the matching `kind` branch guarantees the narrowed type is correct at runtime.

Because the model and schema are both derived from the same `FieldConfig[]` at component construction, they can't drift apart for a given config. The example above assumes the config is available synchronously when the component is created.

## Next steps

JSON-driven forms keep their model and schema aligned by deriving both from the same `FieldConfig[]`. Each extension in this guide (conditional rules, repeating fields) widens the type and adds a translation step inside `buildSchema()` while preserving that alignment. The model and schema stay locked together, regardless of where the config comes from or how it grows.

For related guides cover other aspects of Signal Forms, check out:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/schemas" title="Schemas and schema composability" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
</docs-pill-row>

For detailed API documentation, see:

- [`form()`](api/forms/signals/form) - Create a form from a model signal
- [`applyWhen()`](api/forms/signals/applyWhen) - Apply a schema conditionally based on reactive state
- [`applyEach()`](api/forms/signals/applyEach) - Apply a schema to each item in an array field
- [`FieldTree`](api/forms/signals/FieldTree) - Navigable tree of fields exposed by `form()`
- [`SchemaFn`](api/forms/signals/SchemaFn) - Type signature for schema functions

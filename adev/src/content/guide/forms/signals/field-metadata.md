# Field metadata

Field metadata is reactive data you can attach to an individual field. Angular's built-in constraint validators like `required()` and `min()` use this system internally. In other words, every time you call a validator, you're contributing to a metadata key for that particular field.

This guide covers the metadata system in depth: how reducers combine contributions from multiple schema rules, how to write custom reducers, how reading composes with `hasMetadata()`, and how managed metadata ties lifecycle-aware objects to individual fields.

## You have already been using metadata

When you call `required()` in a schema and read `.required()` on the resulting field in a template, you are using the metadata system. `state.required` is not a special-case property. It is a convenience getter that returns the current value of a built-in `REQUIRED` metadata key.

```angular-ts
import {Component, signal} from '@angular/core';
import {form, required, FormField} from '@angular/forms/signals';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        @if (registrationForm.username().required()) {
          <span class="required-marker" aria-hidden="true">*</span>
        }
        <input [formField]="registrationForm.username" />
      </label>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    required(path.username);
  });
}
```

Calling `required(path.username)` contributes a value to the `REQUIRED` metadata key on that field. Reading `registrationForm.username().required()` returns the accumulated value. The metadata key is the bridge connecting the two.

Several built-in constraint validators follow this pattern:

| Validator     | Metadata key | Type                  | `FieldState` getter |
| ------------- | ------------ | --------------------- | ------------------- |
| `required()`  | `REQUIRED`   | `boolean`             | `required`          |
| `min()`       | `MIN`        | `number \| undefined` | `min`               |
| `max()`       | `MAX`        | `number \| undefined` | `max`               |
| `minLength()` | `MIN_LENGTH` | `number \| undefined` | `minLength`         |
| `maxLength()` | `MAX_LENGTH` | `number \| undefined` | `maxLength`         |
| `pattern()`   | `PATTERN`    | `RegExp[]`            | `pattern`           |

Non-constraint validators like `email()` and `validate()` do not contribute to metadata. They run their check and surface a validation error, but they do not publish a reactive value for templates to read.

## When to use custom metadata

When you need reactive data attached to a specific field that built-in state signals like `valid()`, `disabled()`, and `touched()` do not cover, use **custom metadata**.

Some examples might include:

- **Configuration attached to reusable field schemas.** A currency symbol on a price field, so any template or custom control rendering the field can display it. Or `MIN_DATE` and `MAX_DATE` on a date field, read by a reusable range picker.
- **Parsed values shared between rules on one field.** A phone number parsed once into E.164 format, so a format validator and a uniqueness check both read the same canonical form without reparsing.
- **Display hints assembled from the field's state.** A severity level (`'info' | 'warning' | 'error'`) that the UI maps to badges and icons, or a context-aware help message that changes based on what the user has typed and which other fields are filled in.

If you find yourself keeping a parallel `Map<fieldKey, value>` alongside your form to track something per field, that is a sign metadata is the right tool. Metadata stays colocated with the schema, stays reactive, and participates in the field's lifecycle.

## Creating a metadata key

When you want to create a custom key, call `createMetadataKey<TWrite>()`. The type parameter describes the value your schema rules will contribute.

```ts
import {createMetadataKey} from '@angular/forms/signals';

export const USERNAME_HELP = createMetadataKey<string>();
```

Every `createMetadataKey()` call creates a new unique key. Two calls with matching type parameters are still two distinct keys, so define each key once at module scope and import it wherever it's needed.

NOTE: A key created without a reducer uses "override" semantics by default: the last contribution wins if multiple rules set the key.

## Setting values from a schema

When you need to register a value for the key on a specific field, use `metadata(path, key, logic)` inside a schema function.

```angular-ts
import {Component, computed, signal} from '@angular/core';
import {form, metadata, FormField} from '@angular/forms/signals';
import {USERNAME_HELP} from './metadata-keys';

@Component({
  selector: 'app-registration',
  imports: [FormField],
  template: `
    <form>
      <label>
        Username
        <input [formField]="registrationForm.username" />
      </label>
      <p class="help">{{ usernameHelp() }}</p>
    </form>
  `,
})
export class Registration {
  registrationModel = signal({username: ''});

  registrationForm = form(this.registrationModel, (path) => {
    metadata(path.username, USERNAME_HELP, ({value}) => {
      const username = value();
      if (username.length === 0) {
        return 'Choose a unique username between 3 and 20 characters.';
      }
      if (username.length < 3) {
        return 'Keep typing, usernames are at least 3 characters.';
      }
      if (username.length > 20) {
        return 'Usernames are at most 20 characters.';
      }
      return 'Looks good.';
    });
  });

  usernameHelp = computed(() => this.registrationForm.username().metadata(USERNAME_HELP)?.() ?? '');
}
```

The logic function receives the field's context, which exposes `value` as a signal of the field's current value, `state` as the field's `FieldState`, and methods like `valueOf(path)` and `stateOf(path)` for reading other fields in the same form. Any signal the function reads becomes a reactive dependency: when `value()` changes, the metadata recomputes, and any template reading the key updates.

## Reading metadata from a field

`hasMetadata(key)` returns `true` if any schema rule registered the key on this field. `state.metadata(key)` returns `undefined` when no rule has registered the key, and a signal of the current reduced value otherwise.

```ts
registrationForm.username().hasMetadata(USERNAME_HELP); // true if any metadata() rule registered this key
```

The shape of that inner value (whether it can itself be `undefined`, what type it holds) depends on the key's reducer. Reducers are covered in the next section.

When the key may not be registered, gate the read with `hasMetadata()`:

```angular-html
@if (registrationForm.username().hasMetadata(USERNAME_HELP)) {
  <p class="help">{{ registrationForm.username().metadata(USERNAME_HELP)!() }}</p>
}
```

When you know a rule always registers the key (because the schema in the same file does so), you can skip the `hasMetadata()` check and use optional chaining as a compact alternative:

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)?.();
// message: string | undefined
```

Or, when the rule is guaranteed to have registered, drop the optional chain and assert:

```ts
const message = registrationForm.username().metadata(USERNAME_HELP)!();
// message: string | undefined (still, because the inner value may be undefined)
```

The component example above uses optional chaining inside a `computed()` so the template binds to a plain `string`, with an empty fallback for the initial frame.

This is the whole API for a single contributor. The next section covers what happens when more than one schema rule contributes to the same key, and how to combine those contributions with reducers.

## Combining contributions with reducers

Override semantics work when only one rule contributes to a key on a given field. As soon as two rules contribute, the first value is silently discarded:

```ts
const HELP = createMetadataKey<string>();

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});
```

After both rules run, `state.metadata(HELP)!()` returns only the second message. This is almost never what you want. Contributions often come from different sources: two schemas composed with `apply()` that each attach help text, or multiple validation rules that each contribute a hint.

To combine contributions, pass a reducer to `createMetadataKey()`. A reducer describes how to fold individual values into an accumulated result:

```ts
import {createMetadataKey, MetadataReducer} from '@angular/forms/signals';

const HELP = createMetadataKey<string, string[]>(MetadataReducer.list());

form(model, (path) => {
  metadata(path.username, HELP, () => 'Choose something unique across the system.');
  metadata(path.username, HELP, () => 'Usernames are 3 to 20 characters.');
});

// state.metadata(HELP)!() === [
//   'Choose something unique across the system.',
//   'Usernames are 3 to 20 characters.',
// ]
```

Notice the two type parameters on `createMetadataKey<TWrite, TAcc>`: the first is the type each rule contributes, the second is the type the reducer produces. With `list()`, rules contribute a `string` and the field reads back a `string[]`.

### Built-in reducers

Angular provides six built-in reducers on the [`MetadataReducer`](api/forms/signals/MetadataReducer) namespace. `override()` has two forms with slightly different semantics, listed separately in the table:

| Reducer        | Accumulator type      | What it does                                                           | Initial value |
| -------------- | --------------------- | ---------------------------------------------------------------------- | ------------- |
| `list<T>()`    | `T[]`                 | Accepts `T \| undefined` contributions; appends non-`undefined` values | `[]`          |
| `or()`         | `boolean`             | `true` if any contribution is `true`                                   | `false`       |
| `and()`        | `boolean`             | `true` only if every contribution is `true`                            | `true`        |
| `min()`        | `number \| undefined` | Keeps the smallest contributed number                                  | `undefined`   |
| `max()`        | `number \| undefined` | Keeps the largest contributed number                                   | `undefined`   |
| `override()`   | `T \| undefined`      | Last contribution replaces previous (the default)                      | `undefined`   |
| `override(fn)` | `T`                   | Same, but with a provided initial value                                | `fn()`        |

`list()` is the only built-in reducer whose item type is wider than its accumulator's element type. A rule may contribute `undefined` and the reducer will silently drop it. This is how the built-in `PATTERN` key handles dynamic `pattern()` rules whose logic function returns `undefined`: the `undefined` contribution is skipped rather than included in the final regex list.

### How built-in validator keys use reducers

While `MetadataReducer.min()` and `MetadataReducer.max()` are reducers, you may be surprised to learn that they are not validators. `MetadataReducer.min()` picks the smallest contribution to a key, while the `min()` validator enforces a lower bound on a field's value. They share a name but solve different problems.

The built-in constraint keys pick their reducers based on what "strictest" means for the constraint, which is often the opposite of what the key's name suggests:

| Key          | Reducer          | Reasoning                                                                                                                             |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `REQUIRED`   | `or()`           | If any `required()` rule evaluates to `true`, the field is required.                                                                  |
| `MIN`        | `max()`          | A minimum-value constraint is strictest when largest. If one rule requires `>= 5` and another `>= 10`, the effective minimum is `10`. |
| `MAX`        | `min()`          | A maximum-value constraint is strictest when smallest. If one rule caps at `100` and another at `50`, the effective maximum is `50`.  |
| `MIN_LENGTH` | `max()`          | Same logic as `MIN`: the longest required length wins.                                                                                |
| `MAX_LENGTH` | `min()`          | Same logic as `MAX`: the shortest allowed length wins.                                                                                |
| `PATTERN`    | `list<RegExp>()` | Each `pattern()` call contributes a regex; the value must match all of them.                                                          |

This pairing of "strictest wins" is why calling `min(path.age, 18)` and `min(path.age, 21)` in two composed schemas works correctly. Each call registers its own validator that enforces its specific bound (so a value below either bound fails validation). Separately, each call contributes to the public `MIN` key, and `state.metadata(MIN)!()` reports the aggregate (`21`) so UI and custom controls can read the effective minimum.

### Writing a custom reducer

When you want to write your own reducer, implement an object matching the `MetadataReducer<TAcc, TItem>` interface:

```ts
interface MetadataReducer<TAcc, TItem> {
  reduce: (acc: TAcc, item: TItem) => TAcc;
  getInitial: () => TAcc;
}
```

You can define a custom reducer when none of the built-ins match the semantics you need. For example, a `SEVERITY` key that keeps the most severe level contributed by any rule:

```ts
import {createMetadataKey, type MetadataReducer} from '@angular/forms/signals';

type Severity = 'info' | 'warning' | 'error';

const SEVERITY_RANK: Record<Severity, number> = {info: 0, warning: 1, error: 2};

const maxSeverity: MetadataReducer<Severity | undefined, Severity> = {
  reduce(acc, item) {
    if (acc === undefined) return item;
    return SEVERITY_RANK[item] > SEVERITY_RANK[acc] ? item : acc;
  },
  getInitial: () => undefined,
};

export const SEVERITY = createMetadataKey<Severity, Severity | undefined>(maxSeverity);
```

Any number of rules can now contribute a severity, and the field reports the highest:

```ts
form(model, (path) => {
  metadata(path.password, SEVERITY, () => 'info');
  metadata(path.password, SEVERITY, ({value}) => (value().length < 12 ? 'warning' : 'info'));
  metadata(path.password, SEVERITY, ({value}) =>
    /password|1234/i.test(value()) ? 'error' : 'info',
  );
});
```

The reducer runs whenever any contribution's signals change, so `state.metadata(SEVERITY)!()` stays in sync with the current worst case across all rules.

TIP: Keep your reducers pure: `reduce()` should depend only on its two arguments, and `getInitial()` should return the same value every time it is called. Reducers run inside a reactive computation that re-executes when any contribution's signals change, so impure reducers produce inconsistent metadata.

## Attaching lifecycle-aware objects with managed metadata

Managed metadata stores a lifecycle-aware object on a field instead of a reactive value. Use it for per-field objects like a `resource()` that fetches external data, an `effect()` that syncs to an outside system, or a service handle scoped to a single field.

### Creating a managed key

When you want to define a managed key, call `createManagedMetadataKey<TRead, TWrite>(create)`. The `create` function you pass produces the value the key holds.

```ts
import {Signal} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {createManagedMetadataKey} from '@angular/forms/signals';

export interface UrlPreview {
  title: string;
  description?: string;
  image?: string;
}

export const URL_PREVIEW = createManagedMetadataKey((_state, url: Signal<string | undefined>) => {
  return httpResource<UrlPreview>(() => {
    const currentUrl = url();
    return currentUrl ? {url: '/api/url-preview', params: {url: currentUrl}} : undefined;
  });
});
```

The `create` function receives the field's `FieldState` and a `Signal<TAcc>` of data contributed by `metadata()` rules for this key, and returns whatever object should live on the field. The return value is stored as-is: unlike non-managed keys, the framework does not wrap it in a `computed()`.

`create` runs once when a field is constructed, inside the field's injection context. That lets you call `inject()`, `resource()`, and `effect()` inside `create`, and ties cleanup to the field's lifecycle: when the field is destroyed, Angular destroys the injection context, and any `resource()`, `effect()`, or `DestroyRef` callback you registered there cleans up automatically.

Because `create` itself is not reactive, any behavior that needs to respond to signal changes has to live inside an `effect()`, `resource()`, or `httpResource()` set up during that initial call. `URL_PREVIEW` demonstrates the pattern: the `httpResource()` reads the URL signal inside its request function, so the request re-runs whenever the signal changes. The schema rule (`metadata(path.url, URL_PREVIEW, ({value}) => value())`) decides what data to feed in; the managed key decides what to do with it.

### Using a managed key in a form

When you need to use a managed key in a form, register a `metadata()` rule for the key, and then read the returned object from the field state.

```angular-ts
import {Component, computed, signal} from '@angular/core';
import {applyEach, form, metadata, FormField} from '@angular/forms/signals';
import {URL_PREVIEW} from './url-preview';

@Component({
  selector: 'app-link-editor',
  imports: [FormField],
  template: `
    <form>
      @for (link of linksForm.links; track link) {
        <fieldset>
          <label>
            URL
            <input [formField]="link.url" />
          </label>
          <!-- Read the URL_PREVIEW key for this link's url field; the result is the resource its create function produced -->
          @let preview = link.url().metadata(URL_PREVIEW);
          @if (preview?.isLoading()) {
            <p>Loading preview...</p>
          } @else if (preview?.hasValue() && preview.value(); as data) {
            <article class="preview">
              <h3>{{ data.title }}</h3>
              @if (data.description) {
                <p>{{ data.description }}</p>
              }
            </article>
          } @else if (preview?.error()) {
            <p class="error">Could not load preview.</p>
          }
        </fieldset>
      }
      <button type="button" (click)="addLink()">Add link</button>
    </form>
  `,
})
export class LinkEditor {
  linksModel = signal({links: [{url: ''}]});

  linksForm = form(this.linksModel, (path) => {
    // Register the URL_PREVIEW key on each link's url field.
    // applyEach runs the schema per item, so create() runs once per link
    // and each link gets its own resource.
    applyEach(path.links, (itemPath) => {
      metadata(itemPath.url, URL_PREVIEW, ({value}) => value());
    });
  });

  addLink() {
    this.linksForm.links().value.update((links) => [...links, {url: ''}]);
  }
}
```

Each array item gets its own `URL_PREVIEW` resource because `applyEach` registers the schema rules against each item independently. When the user adds a link, `create` runs for the new item's field. When a link is removed (not shown here, but a common pattern), the framework tears down that field's injector along with the resource.

## Next steps

Remember that metadata exists so reactive data can travel with the field through schema composition, accumulate across rules, and tear down with the field's lifecycle. It leverages the same system Angular's built-in validators use, and can be tailored to your own use cases.

For detailed API documentation, see:

- [`createMetadataKey()`](api/forms/signals/createMetadataKey) - Define a metadata key with optional reducer
- [`createManagedMetadataKey()`](api/forms/signals/createManagedMetadataKey) - Define a lifecycle-aware metadata key
- [`metadata()`](api/forms/signals/metadata) - Contribute a value to a metadata key in a schema
- [`MetadataReducer`](api/forms/signals/MetadataReducer) - Built-in reducers for combining contributions

For additional related guides on Signal Forms, check out:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/form-logic" title="Adding form logic" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/async-operations" title="Async operations" />
</docs-pill-row>

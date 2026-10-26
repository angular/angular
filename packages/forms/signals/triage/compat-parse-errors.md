# Triage: `compatForm()` fields drop parse errors

This file holds the evidence for the triage pull request. The branch contains repro specs and these
notes, and no fix. Everything was measured at
[`ce30bb0889`](https://github.com/angular/angular/tree/ce30bb0889018ad9da521d6ad729294e1aa3b5ff).
The affected source files are unchanged on `main` at `3e173fc844`.

## Run the specs

The specs are in [`test/web/compat_parse_errors.spec.ts`](../test/web/compat_parse_errors.spec.ts),
in `describe('compatForm() parse errors')`. Each spec asserts the expected behavior, so it fails
while the bug exists. The spec whose name starts with `control:` checks the test setup and passes.

The web test runner ignores `--filter`, so this runs the whole Chromium suite and lists the failing
specs by name:

```bash
pnpm bazel test //packages/forms/signals/test/web:test_chromium --test_output=all
```

Each spec types `5e` into `<input type="number">` through `TestInputValidityMonitor`, the same way
`number_input.spec.ts` does, and then calls `submit()`.

| Spec                                                     | Shows                                          | Result |
| -------------------------------------------------------- | ---------------------------------------------- | ------ |
| Reports a native parse error on a compat field           | The parse error is lost, and `submit()` runs   | Fails  |
| `control:` Reports a native parse error on a plain field | The same input on a plain `form()` field works | Passes |

Observed output:

```text
compatForm() parse errors > reports a native parse error on a compat field
    Expected $.bindingErrors.length = 0 to equal 1.
    Expected $.fieldParseErrors.length = 0 to equal 1.
    Expected $.fieldErrors.length = 0 to equal 1.
    Expected $.fieldInvalid = false to equal true.
    Expected $.rootInvalid = false to equal true.
    Expected $.actionSaw.length = 1 to equal 0.
    Unexpected $.actionSaw[0] = 5 in array.
```

The `FormField` binding produces the parse error in both forms (`bindingParseErrors` matches). On the
compat field, `FormField.errors()`, the field's `parseErrors()` and `errors()`, and `invalid()` on the
field and the root all miss it. `submit()` runs the action, which reads `5` while the input shows
`5e`.

## Root cause

`CompatValidationState` hardcodes `parseErrors` to an empty array and takes `errors`, `syncValid`,
`valid`, and `invalid` straight from the `FormControl`
([`compat/src/compat_validation_state.ts:36-53`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/compat/src/compat_validation_state.ts#L36-L53)):

```ts
readonly parseErrors: Signal<ValidationError.WithFormField[]> = computed(() => []);

constructor(private readonly node: CompatFieldNode, options: CompatFieldNodeOptions) {
  this.syncValid = getControlStatusSignal(options, (c: AbstractControl) => c.status === 'VALID');
  this.errors = getControlStatusSignal(options, extractNestedReactiveErrors);
  // ...
  this.valid = getControlStatusSignal(options, (c) => c.valid);
  this.invalid = getControlStatusSignal(options, (c) => c.invalid);
}
```

The default validation state collects parse errors from every binding and puts them first in
`errors`
([`src/field/validation.ts:258-273`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/validation.ts#L258-L273)):

```ts
readonly parseErrors = computed(
  () => this.node.formFieldBindings().flatMap((field) => field.parseErrors()),
  {equal: shallowArrayEquals},
);

readonly errors = computed(
  () => [...this.parseErrors(), ...this.syncErrors(), ...this.asyncErrors().filter(/* ... */)],
  {equal: shallowArrayEquals},
);
```

The rest follows from that:

- `FormField.errors` filters the field's `errors()`, so the binding can't show its own parse error
  either
  ([`src/directive/form_field.ts:196-202`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/form_field.ts#L196-L202)).
- `submit()` gates on the submitted node's `invalid()`, or on `valid()` with
  `ignoreValidators: 'none'`
  ([`src/api/structure.ts:528-540`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/api/structure.ts#L528-L540)).
  A plain root reads each compat child's `status()`, which reads `errors()`. A compat field reads
  its own `invalid` and `valid`. Both paths miss the parse error.
- The `FormControl` never sees the bad input, because its value stays `5`, so a reactive validator
  can't catch it either.

**History.** The empty `parseErrors` dates from
[`ebae211add`](https://github.com/angular/angular/commit/ebae211add37700858adeb8fc5d87bf503a59721),
which introduced parse errors when only custom controls produced them. Since then, two more sources
produce parse errors that compat fields drop:

- Native inputs with bad input, such as number, date, and time, from
  [`22afbb2f36`](https://github.com/angular/angular/commit/22afbb2f36be89c2ae575df343571a918dec5985).
- Legacy `NG_VALIDATORS` on a CVA, from
  [`f9f24fc669`](https://github.com/angular/angular/commit/f9f24fc6699b762d17127d0412343041ecdea70e).

## Compared with the two APIs compat bridges

- **Reactive forms:** `NumberValueAccessor` writes `null` when the input is empty or bad
  ([`packages/forms/src/directives/number_value_accessor.ts:74`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/src/directives/number_value_accessor.ts#L74)),
  so `Validators.required` catches it.
- **Plain signal forms:** the parse error makes the field invalid, and `submit()` doesn't run the
  action. The `control:` spec confirms this.
- **Compat:** the model keeps the last good value, nothing is invalid, and `submit()` runs.

## Related bug

A compat field's `errorSummary` is always empty, so the root's `errorSummary()` omits every
`FormControl` error. That bug has its own issue and triage PR, because the fix is independent of
this one.

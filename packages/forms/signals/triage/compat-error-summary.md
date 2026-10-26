# Triage: `FormControl` errors are missing from `errorSummary()`

This file holds the evidence for the triage pull request. The branch contains repro specs and these
notes, and no fix. Everything was measured at
[`ce30bb0889`](https://github.com/angular/angular/tree/ce30bb0889018ad9da521d6ad729294e1aa3b5ff).
The affected source files are unchanged on `main` at `3e173fc844`.

## Run the specs

The specs are in
[`test/node/compat/compat_error_summary.spec.ts`](../test/node/compat/compat_error_summary.spec.ts),
in `describe('compatForm() errorSummary')`. Each spec asserts the expected behavior, so it fails
while the bug exists. The spec whose name starts with `control:` checks the test setup and passes.

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_output=all
```

| Spec                                                     | Shows                                          | Result |
| -------------------------------------------------------- | ---------------------------------------------- | ------ |
| Includes FormControl errors in the root `errorSummary()` | The root summary omits a `required` error      | Fails  |
| Sets `fieldTree` on FormControl errors                   | Compat errors don't point at their field       | Fails  |
| `control:` Sets `fieldTree` on a plain field error       | Plain errors point at their field, by identity | Passes |

Observed output, 2 failures from this file:

```text
compatForm() errorSummary includes FormControl errors in the root errorSummary()
    root errorSummary():
        Expected $.length = 0 to equal 1.
        Expected $[0] = undefined to equal 'required'.
compatForm() errorSummary sets fieldTree on FormControl errors
    fieldTree of the compat field error: Expected undefined to be Function.
```

In the first spec, the compat field's `errors()` has the `required` error and the root's
`invalid()` is `true`. Only the summary is empty.

## Root cause

A compat field's `errorSummary` is a shared empty signal
([`compat/src/compat_validation_state.ts:55-56`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/compat/src/compat_validation_state.ts#L55-L56)):

```ts
asyncErrors: Signal<(ValidationError.WithFieldTree | 'pending')[]> = EMPTY_ARRAY_SIGNAL;
errorSummary: Signal<ValidationError.WithFieldTree[]> = EMPTY_ARRAY_SIGNAL;
```

A parent's summary is its own errors plus each child's summary
([`src/field/validation.ts:275-288`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/validation.ts#L275-L288)),
so a compat child contributes nothing:

```ts
const errors = this.node.structure.reduceChildren(this.errors(), (child, result) => [
  ...result,
  ...child.errorSummary(),
]);
```

`CompatValidationError` declares `fieldTree` but never assigns it
([`src/compat/validation_errors.ts:19-31`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/compat/validation_errors.ts#L19-L31)).
Plain validation rules set it through `addDefaultField()`
([`validation.ts:394-414`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/validation.ts#L394-L414)),
and compat errors never pass through that helper.

## Why the summary fix needs `fieldTree`

By reading the code: on the client, `errorSummary()` sorts errors by DOM position with
`compareErrorPosition()`. For an error without `formField`, that calls `error.fieldTree()`
([`validation.ts:416-444`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/validation.ts#L416-L444)).
If the summary returned compat errors as they are, sorting any summary with two or more errors would
throw `TypeError: error.fieldTree is not a function`. The fix has to set `fieldTree` on compat errors
first.

## Who is affected

- Forms that show a list of errors from the root's `errorSummary()` and contain `compatForm()`
  fields. The list misses every `FormControl` error, while `invalid()` is `true` and `submit()` is
  blocked, so the user can't see why.
- Code that reads `error.fieldTree` on a compat error, for example to call `focusBoundControl()`,
  gets `undefined`.

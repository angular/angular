# Triage: CVA and native controls receive other controls' parse errors

This file holds the evidence for the triage pull request. The branch contains repro specs and these
notes, and no fix. Everything was measured at
[`ce30bb0889`](https://github.com/angular/angular/tree/ce30bb0889018ad9da521d6ad729294e1aa3b5ff).
The affected source files are unchanged on `main` at `3e173fc844`.

## Run the specs

The specs are in
[`test/web/form_field_errors_per_binding.spec.ts`](../test/web/form_field_errors_per_binding.spec.ts),
in `describe('[formField] errors per control')`. Each spec asserts the expected behavior, so it
fails while the bug exists.

The web test runner ignores `--filter`, so this runs the whole Chromium suite and lists the failing
specs by name:

```bash
pnpm bazel test //packages/forms/signals/test/web:test_chromium --test_output=all
```

| Spec                                                             | Shows                                            | Result |
| ---------------------------------------------------------------- | ------------------------------------------------ | ------ |
| Passes each host only the parse errors of its own binding        | Native and CVA hosts get another control's error | Fails  |
| Reports only its own parse errors through the injected NgControl | `NgControl.errors` has the same leak             | Fails  |

The first spec binds one number field to four hosts: two native inputs, a CVA component, and a custom
control. Each host also carries a probe directive with `errors` and `invalid` inputs. The spec types
`5e` into the first input.

| Host                       | `FormField.errors()` | `errors` input received       | `invalid` input received |
| -------------------------- | -------------------- | ----------------------------- | ------------------------ |
| Native, with the bad input | Its own parse error  | Its own parse error           | `true`                   |
| Native                     | None                 | The first input's parse error | `true`                   |
| CVA                        | None                 | The first input's parse error | `true`                   |
| Custom control             | None                 | None                          | `true`                   |

The second spec binds two native inputs, each with a directive that injects `NgControl`.

Observed output:

```text
[formField] errors per control > passes each host only the parse errors of its own binding
    Expected $[1].errorsInput.length = 1 to equal 0.
    Unexpected $[1].errorsInput[0] = 'parse from native (bad input)' in array.
    Expected $[2].errorsInput.length = 1 to equal 0.
    Unexpected $[2].errorsInput[0] = 'parse from native (bad input)' in array.

[formField] errors per control > reports only its own parse errors through the injected NgControl
    Expected $[1].errors.length = 1 to equal 0.
    Unexpected $[1].errors[0] = 'parse' in array.
```

## History: a regression from a refactor

- [`ebae211add`](https://github.com/angular/angular/commit/ebae211add37700858adeb8fc5d87bf503a59721)
  ("feat(forms): introduce parse errors in signal forms") sent the `errors` binding through the
  directive for custom, CVA, and native hosts alike. Its doc comment on `getValue()` in
  `packages/core/src/render3/instructions/control.ts` states the intent: "we only want to report
  parse errors that are relevant for this particular UI control."
- [`a67e00741c`](https://github.com/angular/angular/commit/a67e00741c23d7ae4c93970c026bd7f9d41521ee)
  ("refactor(forms): move control logic into `FormField` directive") landed after it and moved the
  binding logic into `@angular/forms/signals`. It kept the filter only for custom controls
  ([`src/directive/control_custom.ts:41-45`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/control_custom.ts#L41-L45)).
  CVA and native hosts read `fieldState.errors()` through `readFieldStateBindingValue()`
  ([`control_cva.ts:99-101`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/control_cva.ts#L99-L101),
  [`control_native.ts:113-114`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/control_native.ts#L113-L114),
  [`bindings.ts:58-64`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/bindings.ts#L58-L64)).
  Later commits to these files neither restore nor reject the filter.
- [`22afbb2f36`](https://github.com/angular/angular/commit/22afbb2f36be89c2ae575df343571a918dec5985),
  which added native parse errors, says the error "is added for the control that received the
  un-parsable value."
- `invalid` was never filtered, even in `ebae211add`, which special-cased only `errors`. Validity is
  field-level, which is why every host above receives `invalid: true`.

## The `NgControl` path

`FormField` provides `NgControl` as a lazily created `InteropNgControl`, one per binding, built from
the field state only
([`form_field.ts:110`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/form_field.ts#L110),
[`form_field.ts:178-182`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/directive/form_field.ts#L178-L182)).
Its `errors` getter converts the field's unfiltered `errors()`
([`src/controls/interop_ng_control.ts:93-95`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/controls/interop_ng_control.ts#L93-L95)).
CVA components written for reactive forms often inject `NgControl` to show their own error state,
so this path matters as much as the `errors` input.

## Who is affected

Three things must happen together:

- One field is bound to two or more controls, for example a range slider and a number input.
- One control has a parse error, from a native input, a legacy CVA validator, or a custom control.
- Another host consumes errors: a directive with an `errors` input on a native element, a CVA with
  an `errors` input, or a component that reads `NgControl.errors`.

Then the other controls show the first control's parse error as their own. No existing spec relies
on the unfiltered behavior: the only other multi-control parse spec (`number_input.spec.ts:61`)
checks `FormField.errors()`, and the rest of the Chromium suite passes.

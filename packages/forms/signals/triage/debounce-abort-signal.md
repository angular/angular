# Triage: the `debounce()` abort signal fires late, inside a computation

This file holds the evidence for the triage pull request. The branch contains repro specs and these
notes, and no fix. Everything was measured at
[`ce30bb0889`](https://github.com/angular/angular/tree/ce30bb0889018ad9da521d6ad729294e1aa3b5ff).
The affected source files are unchanged on `main` at `3e173fc844`.

## Run the specs

The specs are in [`test/node/debounce_abort.spec.ts`](../test/node/debounce_abort.spec.ts), in
`describe('debounce() abort signal')`. Each spec asserts the expected behavior, so it fails while the
bug exists. The spec whose name starts with `control:` checks the test setup and passes.

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_output=all
```

| Spec                                                                                     | Shows                                                | Result |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| Aborts a custom debouncer as soon as the value is set directly                           | The abort doesn't fire on a direct model write       | Fails  |
| Lets an abort listener write a signal                                                    | NG0600 when touch aborts after a direct write        | Fails  |
| Lets an abort listener write a signal when the user types again after a direct write     | NG0600 when the next keystroke aborts                | Fails  |
| Does not abort a debounce that already completed                                         | A finished debounce is aborted on the next touch     | Fails  |
| Lets an abort listener write a signal on blur after a debounce completed                 | NG0600 in the normal type, wait, blur flow           | Fails  |
| Keeps a pending value when a signal read by an earlier abort listener changes            | The typed value never reaches the model              | Fails  |
| `control:` A duration debounce that ends after a direct write leaves the model unchanged | The late `sync()` writes back the current value only | Passes |

Observed output, 6 failures from this file:

```text
aborts a custom debouncer as soon as the value is set directly
    abort listener calls right after value.set(): Expected 0 to be 1.
does not abort a debounce that already completed
    abort calls on the completed debounce after markAsTouched(): Expected 1 to be 0.
    completed debounce AbortSignal.aborted after markAsTouched(): Expected true to be false.
lets an abort listener write a signal when the user types again after a direct write
    errors thrown by the signal write when the next keystroke aborts:
        Unexpected $[0] = 'Error: NG0600: Writing to signals is not allowed in a `computed`. Signal: 'debouncing'. '
keeps a pending value when a signal read by an earlier abort listener changes
    model value after touch: Expected 'direct' to be 'b'.
lets an abort listener write a signal on blur after a debounce completed
    errors thrown by the abort listener on blur after a normal debounce:
        Unexpected $[0] = 'Error: NG0600: Writing to signals is not allowed in a `computed`. Signal: 'debouncing'. '
lets an abort listener write a signal
    errors thrown by the signal write in the abort listener:
        Unexpected $[0] = 'Error: NG0600: Writing to signals is not allowed in a `computed`. Signal: 'debouncing'. '
    debouncing flag after the abort: Expected true to be false.
```

## Root cause

`FieldNode.pendingSync` is a `linkedSignal` whose computation aborts the previous controller
([`src/field/node.ts:146-152`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/node.ts#L146-L152)):

```ts
private readonly pendingSync: WritableSignal<AbortController | undefined> = linkedSignal({
  source: () => this.value(),
  computation: (_source, previous) => {
    previous?.value?.abort();
    return undefined;
  },
});
```

Three things follow from that:

1. **The abort is lazy.** A computation runs only when something reads it. A direct `value.set()`
   only marks `pendingSync` dirty. The abort runs at the next read: `debounceSync()` on the next
   keystroke, `flushSync()` on touch or when the last binding is removed, and `_reset()`
   ([`node.ts:330-331`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/node.ts#L330-L331),
   [`node.ts:413-447`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/node.ts#L413-L447)).
   If the debounce resolves first, nothing aborts it in time.
2. **The abort runs with dependency tracking on.** `linkedSignal` makes its own node the active
   consumer while `computation` runs
   ([`linked_signal.ts:156-178`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/core/primitives/signals/src/linked_signal.ts#L156-L178)).
   `AbortController.abort()` runs listeners synchronously, so user listeners run in that context.
   The `untracked()` around the read in `debounceSync()` doesn't help, because the computation sets
   its own consumer.
   - A signal write in a listener throws NG0600. `dispatchEvent` catches the error and reports it as
     an uncaught error, and the write is lost.
   - A signal read in a listener becomes a dependency of `pendingSync`. When that signal changes,
     the next read reruns the computation and aborts the _live_ debounce. `flushSync()` then finds
     nothing to flush, and the typed value never reaches the model.
3. **A finished debounce stays in `pendingSync`.** `debounceSync()` never clears it after the
   promise resolves. The `sync()` that completes the debounce changes `value`, so the next read
   aborts the finished controller, and point 2 applies to the normal type, wait, blur flow.

The doc comment on `pendingSync`
([`node.ts:140-145`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/field/node.ts#L140-L145))
and the guide
([`async-operations.md:472`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/adev/src/content/guide/forms/signals/async-operations.md?plain=1#L472))
both describe an abort that fires when the value changes before the debounce resolves.

## Who is affected

- **Not affected:** both built-in debouncers. Their abort listeners only clear a timer and resolve
  ([`src/api/rules/debounce.ts:64-94`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/api/rules/debounce.ts#L64-L94)).
  The guide's custom example
  ([`async-operations.md:447-466`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/adev/src/content/guide/forms/signals/async-operations.md?plain=1#L447-L466))
  receives the late abort, but its listener only calls `clearTimeout()` and `resolve()`.
- **Affected:** custom debouncers whose abort listener writes or reads a signal, such as a
  "searching" indicator or a listener that reads another field.
- **Tests:** an NG0600 swallowed by `dispatchEvent` surfaces as an uncaught error and can fail an
  unrelated spec that runs later.

The visible value is never wrong unless a listener reads a signal (point 2). `controlValue` is linked
to `value`, so a late `sync()` after a direct write writes the current value back, and
`deepSignal.set()` returns early on an equal value
([`src/util/deep_signal.ts:30-32`](https://github.com/angular/angular/blob/ce30bb0889018ad9da521d6ad729294e1aa3b5ff/packages/forms/signals/src/util/deep_signal.ts#L30-L32)).
The `control:` spec confirms this.

## Measured fix options

Each option was applied as a temporary patch, and the full node target and the full Chromium suite
were run. The patches aren't part of this branch. The PR description shows their shape.

| Option                                                        | Node target                                                                 | Chromium suite                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `untracked()` around the abort only                           | 2 of these specs still fail: the lazy abort and the abort after completion. | Not run                                                               |
| Keep the `linkedSignal`, abort untracked, clear on completion | Only the lazy-abort spec fails.                                             | No new failures                                                       |
| Same, but read `pendingSync` before the orphan check          | Only the lazy-abort spec fails.                                             | Unhandled rejection `NG01904: Orphan field` in `orphan_repro.spec.ts` |
| Replace the `linkedSignal` with a plain field                 | Only the lazy-abort spec fails.                                             | No new failures                                                       |

The lazy-abort spec fails under every option because none of them makes the abort eager. An eager
abort needs a reactive consumer of `value` per debounced field, such as an `effect`. Effects run
asynchronously, so even that isn't synchronous.

The orphan pitfall applies to any version that reads `value` or `pendingSync` after the `await`:
check `this.structure.isOrphaned()` first. Reading `value` on a removed array item throws NG01904.

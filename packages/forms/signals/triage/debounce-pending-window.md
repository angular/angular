# Triage: a debounced async validator keeps its old result instead of reporting `pending`

This note has the spec output, the root cause with links to the code, and the full code for each fix
option. Code links point to `main` at
[`6d32550fbb`](https://github.com/angular/angular/commit/6d32550fbbae49851a680b3dc1281d8b899352e7).
Nothing in the library is changed.

## Reproduce

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_arg=--filter="validateAsync debounce window" --test_output=all
pnpm bazel test //packages/core/test/resource:resource --test_arg=--filter="debounced status before effects run" --test_output=all
```

The forms specs are in
[`test/node/validate_async_debounce_window.spec.ts`](../test/node/validate_async_debounce_window.spec.ts),
and the core specs are in
[`packages/core/test/resource/debounce_status_spec.ts`](../../../core/test/resource/debounce_status_spec.ts).
Each one asserts the expected behavior, so a failing spec shows the bug. The `control:` spec runs the
same flow without `debounce`.

| Spec                                                                                 | Result on `main` | With option A applied |
| ------------------------------------------------------------------------------------ | ---------------- | --------------------- |
| forms: with debounce, a value change is pending at once and `submit()` isn't blocked | Fails            | Passes                |
| forms, `control:` the same flow without debounce                                     | Passes           | Passes                |
| core: `debounced()` reports `loading` as soon as the source changes                  | Fails            | Passes                |
| core: a chained resource reports `loading` as soon as the source changes             | Fails            | Passes                |

I applied option A temporarily to fill in the last column, then reverted it. With it applied, these
suites also pass: `//packages/core/test/resource:resource` (Node), `resource_web` (Chromium and
Firefox), which includes the 13 existing `debounced()` specs, and the full signal forms node and
Chromium suites.

Output on `main`:

```text
validateAsync debounce window with debounce: a value change is pending at once and submit() isn't blocked
    state read synchronously after value.set():
        Expected $.pending = false to equal true.
        Expected $.invalid = true to equal false.
    submit() ran the action for the new VALID value: Expected false to be true.
debounced status before effects run reports loading as soon as the source changes
    state right after source.set(): Expected $.status = 'resolved' to equal 'loading'.
debounced status before effects run makes a chained resource report loading as soon as the source changes
    chained resource status right after source.set(): Expected 'resolved' to be 'loading'.
```

## Root cause

1. With `debounce`, `validateAsync()` builds the resource's params as
   `computed(() => ɵchain(debounced(() => params(), opts.debounce)))`
   ([`validate_async.ts` L137-L141](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/api/rules/validation/validate_async.ts#L137-L141)).
   `validateHttp()` passes its `debounce` option through to the same code.
2. When its source changes, `debounced()` keeps its previous state in its `linkedSignal`
   ([`debounce.ts` L80-L85](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/core/src/resource/debounce.ts#L80-L85)).
   It moves to `loading` only inside its effect
   ([`debounce.ts` L146-L148](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/core/src/resource/debounce.ts#L146-L148)).
3. Until effects flush, `chain()` returns the old params. The resource's request doesn't change, and
   its status stays `resolved` with the previous result. So `pending()` is `false`, and `invalid()`
   reflects the old value.

Without `debounce`, the resource's request is a `linkedSignal` over the params, so it switches to
`loading` synchronously
([`resource.ts` L263](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/core/src/resource/resource.ts#L263)).

**Who sees the window.** Templates rarely do, because effects run before views refresh. Code that
writes a value and reads state or submits in the same task does:

- WebMCP's `execute` sets the value and submits in the same task
  ([`registration.ts` L72-L77](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/webmcp/registration.ts#L72-L77)).
  By reading the code, an agent that fixes an invalid value gets "Form submission failed" with the old error.
- An app that sets a value and calls `submit()` in one handler, for example from a keyboard shortcut.
- Any app that reads a `chain(debounced(...))` resource right after a write. The cause is in core,
  not in forms.

This contradicts the async operations guide: "validation always reflects the current value"
([`async-operations.md` L668](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/adev/src/content/guide/forms/signals/async-operations.md?plain=1#L668)).
It also contradicts the `debounced()` guide, which says that `status()` "tells you whether a new value
is still pending"
([`debounced.md` L34](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/adev/src/content/guide/signals/debounced.md?plain=1#L34)).

## Related work

- **#70884** is about the same `ɵchain(debounced(...))` wrapper. A factory that reads the params
  outside a `resource()` params function, for example in `resourceFromSnapshots()` or an `effect()`,
  gets the `LOADING` marker that `chain()` throws.
- **#71414** fixes #70884 without `ɵchain()`, but it's stuck. On Oct 25, JeanMeche requested
  changes
  ([review](https://github.com/angular/angular/pull/71414#pullrequestreview-5640773489)). The review
  says that the gap isn't specific to signal forms, because `@angular/core` has no snapshot-based
  chaining primitive. It also says that keeping the previous settled value while debouncing causes
  stale results. The PR's author replied that it "seems to be unfixable without breaking changes or
  creating a new API". When I applied #71414's only commit, `f4227ac1a6`, to `ce30bb0889`, this window
  stayed, because its debounced snapshot is still `resolved` with the old value until the effect runs.

Option A below follows that review. It fixes the stale `resolved` state in core `debounced()`, for
every chained resource, instead of working around it in forms.

## Fix options

### Option A: `debounced()` reports `loading` as soon as its source changes (recommended)

```diff
 // packages/core/src/resource/debounce.ts, debounced()
+  const equal = options?.equal ?? Object.is;
+
   const state = linkedSignal<
     {value: T; thrown: false} | {error: unknown; thrown: true},
     ResourceSnapshot<T>
   >({
     source: () => {
       /* unchanged */
     },
     computation: (res, previous) => {
-      // If we already have a state from the effect or a previous read, keep it!
-      // The effect is responsible for timing and state transitions.
       if (previous !== undefined) {
-        return previous.value;
+        // The effect owns timing, but a changed source is pending from the moment it changes.
+        const prev = previous.value;
+        if (!res.thrown && prev.status === 'resolved' && !equal(res.value, prev.value)) {
+          return {status: 'loading', value: prev.value};
+        }
+        return prev;
       }
       /* first evaluation unchanged */
     },
   });

   effect(
     () => {
       /* ...read the source, unchanged... */
       const currentState = untracked(state);

-      // Check if the value is the same as the previous one.
-      const equal = options?.equal ?? Object.is;
-      if (currentState.status === 'reloading' || currentState.status === 'loading') {
+      // Compare with the value being waited on, or else with the settled value.
+      if (active !== undefined) {
         if (equal(value, pendingValue!)) return;
       } else if (currentState.status === 'resolved') {
         if (equal(value, currentState.value!)) return;
       }
```

Tradeoffs:

- **The effect guard must change too.** The state can now be `loading` before any wait has started.
  Forms passes `undefined` params when validation is skipped. With the old guard,
  `equal(undefined, pendingValue)` is `true` while nothing is pending, so the effect would return
  early, and the state would stay `loading` forever. Checking `active` avoids that.
- **Measured.** All four specs pass, and so do the core resource suites and the signal forms suites.
- **Synchronous waits.** A `wait` function that returns `undefined` now reports `loading` until
  effects flush. Templates don't see it.
- **Skipped validation.** When params change to `undefined`, for example because sync validation
  fails, the field reports `pending` for the debounce duration. That happens today too, once the
  effect runs. Option A only makes it start sooner.
- **#70884 throws sooner.** I measured a snapshot-based factory over `chain(debounced(...))`, the
  pattern from #70884:

  | Read                                 | `main`              | With option A    |
  | ------------------------------------ | ------------------- | ---------------- |
  | Before the change                    | `'initial'`         | `'initial'`      |
  | Same task as `source.set('updated')` | `'initial'` (stale) | throws `LOADING` |
  | After `TestBed.tick()`               | throws `LOADING`    | throws `LOADING` |
  | After the debounce                   | `'updated'`         | `'updated'`      |

  The pattern already throws during every debounce. Option A moves the throw to the moment the value
  changes. Factories built with `resource()` aren't affected, because `ResourceImpl` catches the
  marker. A snapshot-based chaining primitive in core, as the #71414 review suggests, would fix
  #70884 and is complementary to this change.

- **Optional extra.** If the source returns to the settled value before the effect runs, the effect
  waits once more before it settles. The effect could resolve at once in that case.

### Option B: `validateAsync()` treats a params mismatch as pending (forms only)

```diff
 // packages/forms/signals/src/api/rules/validation/validate_async.ts, validateAsync()
       if (opts.debounce !== undefined) {
         const debouncedResource = debounced(() => params(), opts.debounce);
-        const wrappedParams = computed(() => ɵchain(debouncedResource));
+        const wrappedParams = computed(() => {
+          const settled = ɵchain(debouncedResource);
+          // Until the debounced value catches up with the params, the request is pending.
+          if (!Object.is(settled, params())) {
+            throw ɵResourceParamsStatus.LOADING;
+          }
+          return settled;
+        });
         return opts.factory(wrappedParams);
       }
```

Tradeoffs:

- Needs a new private export from core. Today only `ɵchain` is exported
  ([`core_private_export.ts` L163](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/core/src/core_private_export.ts#L163)),
  not `ResourceParamsStatus`.
- Fixes forms only. Other `chain(debounced(...))` users keep the window.
- It has the same effect on #70884 as option A. I haven't measured this option.

### Option C: WebMCP waits before submitting (mitigation)

```diff
 // packages/forms/signals/src/webmcp/registration.ts, execute
         node.value.set(args);
+        await injector.get(ApplicationRef).whenStable();

         const success = await submit(formTree);
```

This settles validation before the agent's submit, so the agent gets accurate errors. It also waits
for unrelated pending work, and it doesn't fix `pending()` for other code that reads it right after a
write.

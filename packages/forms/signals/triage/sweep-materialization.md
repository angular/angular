# Triage: the field cleanup sweep materializes every signal form field

This note has the spec output, the root cause with links to the code, and the full code for each fix
option. Code links point to `main` at
[`6d32550fbb`](https://github.com/angular/angular/commit/6d32550fbbae49851a680b3dc1281d8b899352e7).
Nothing in the library is changed.

## Reproduce

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_arg=--filter="field cleanup sweep laziness" --test_output=all
```

The specs are in
[`test/node/field_tree_cleanup_laziness.spec.ts`](../test/node/field_tree_cleanup_laziness.spec.ts).
Each one asserts the expected behavior, so a failing spec shows the bug. The `control:` spec checks
that cleanup still destroys a removed field that was read, which a fix must keep.

| Spec                                                                        | Result on `main` | With option A applied |
| --------------------------------------------------------------------------- | ---------------- | --------------------- |
| keeps rule-less children unmaterialized after effects run                   | Fails            | Passes                |
| creates no child structures for 100 rule-less rows when effects run         | Fails            | Passes                |
| does not write `childrenMap` when `children()` is called on a leaf          | Fails            | Passes                |
| `control:` destroys a field that was read once it is removed from the model | Passes           | Passes                |

I applied option A temporarily to fill in the last column, then reverted it. With it applied, the
full node suite and the full Chromium suite also pass.

Output on `main`:

```text
keeps rule-less children unmaterialized after effects run
    root children materialized after TestBed.tick() (child structures before: 0, after: 3): Expected true to be false.
creates no child structures for 100 rule-less rows when effects run
    child structures after TestBed.tick() (before: 0): Expected 301 to be 0.
does not write childrenMap when children() is called on a leaf
    childrenMap.update() calls from two children() calls on a leaf: Expected 2 to be 0.
```

A form over `{rows: [100 × {id, label}]}` with no rules has 0 child structures after `form()`. After
the first `TestBed.tick()`, it has 301: `rows`, the 100 rows, and their 200 leaves. Each one is a full
`FieldNode`, with its structure, validation, node, metadata, and submit state.

## Root cause

1. `98c5afdb02` ("perf(forms): lazily instantiate signal form fields") made fields lazy: a field
   without logic isn't created until something reads it.
2. The field-management effect walks the tree to find fields that are no longer reachable.
   `markStructuresLive()` recurses through `structure.children()`
   ([`manager.ts` L79-L87](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/field/manager.ts#L79-L87)).
3. `children()` calls `ensureChildrenMap()` first
   ([`structure.ts` L111-L112](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/field/structure.ts#L111-L112)),
   which forces materialization with `computeChildrenMap(..., forceMaterialize = true)`
   ([`structure.ts` L147-L160](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/field/structure.ts#L147-L160)).

So the sweep's first run creates every reachable field, and that undoes the lazy creation as soon as
effects flush. The existing lazy materialization specs
([`structure.spec.ts` L88-L132](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/test/node/api/structure.spec.ts#L88-L132))
never flush effects, so they can't catch this.

**The leaf write.** For a non-object value, `computeChildrenMap()` returns `undefined`
([`structure.ts` L306-L310](https://github.com/angular/angular/blob/6d32550fbbae49851a680b3dc1281d8b899352e7/packages/forms/signals/src/field/structure.ts#L306-L310)).
So `_areChildrenMaterialized()` stays `false` for a leaf, and every `children()` or `getChild()` call
writes `childrenMap` again. The write is `undefined` to `undefined`, so it doesn't notify consumers.
It's a small cost on every sweep.

**Other effects.** By reading the code, each field the sweep creates also runs its metadata
lifecycle. Combined with #71623, that means every field with a rule such as `required()` gets its own
injector after the first sweep, even if nothing reads it. #70627 reports the user-facing symptom: a
form over a large imported array blocks the main thread, and very large data can crash the tab.

**Earlier fix.** #70633 made the same one-line change as option A. Its author closed it a week after
opening it, with no review and no tests, and it's now locked. This PR adds the specs that it lacked.

## Fix options

### Option A: the sweep walks only materialized children (recommended)

```diff
 // packages/forms/signals/src/field/manager.ts
   private markStructuresLive(
     structure: FieldNodeStructure,
     liveStructures: Set<FieldNodeStructure>,
   ): void {
     liveStructures.add(structure);
-    for (const child of structure.children()) {
+    for (const child of structure.materializedChildren()) {
       this.markStructuresLive(child.structure, liveStructures);
     }
   }
```

The leaf guard, which makes the third spec pass:

```diff
 // packages/forms/signals/src/field/structure.ts, class FieldNodeStructure
   private ensureChildrenMap() {
     // If we're already materialized, there's nothing to do.
-    if (this._areChildrenMaterialized()) {
+    if (this._areChildrenMaterialized() || !isObject(untracked(this.value))) {
       return;
     }
```

Tradeoffs:

- A field that was never materialized has no structure in `structures`, so the sweep has nothing to
  mark or destroy for it.
- `materializedChildren()` still reads `childrenMap()` inside the effect, so the sweep reruns when a
  field materializes children or the model changes shape. The control spec covers removing a field
  that was read.
- Only the sweep becomes lazy. Other walkers still call `children()` and materialize what they
  visit: `markAsTouched()`, `reloadValidation()`, focus, and WebMCP schema inference. #71150 changes
  `markAsTouched()` to visit only `materializedChildren()` under disabled, hidden, and readonly
  fields.
- The leaf guard reads `value` untracked. `ensureChildrenMap()` already runs its update inside
  `untracked()`.

### Option B: destroy children where they're removed

`computeChildrenMap()` already finds dropped keys (`maybeRemoveStaleArrayFields()` and
`maybeRemoveStaleObjectFields()`). It could queue the dropped fields, and the effect would drain the
queue:

```ts
// In computeChildrenMap(), for each dropped child:
this.fieldManager.queueRemoval(droppedChild.structure);

// In the field-management effect:
for (const structure of this.fieldManager.drainRemovals()) {
  destroySubtree(structure); // Recurses through materializedChildren().
}
```

Tradeoffs:

- The destroy can't run in the computation itself: `ResourceImpl.destroy()` writes signals, and a
  computed rejects writes.
- It avoids walking every materialized field on each structural change. But the queue needs its own
  reactive trigger, and tracked array items can move instead of being removed.
- It's worth it only if profiling of large dynamic forms points at the sweep.

### Option C: make `children()` stop materializing

This changes behavior for every caller: `markAsTouched()`, `reloadValidation()`, focus, and WebMCP
schema inference. For example, a field read for the first time after `submit()` would start
untouched. Not recommended.

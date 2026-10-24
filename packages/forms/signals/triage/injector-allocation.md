# Triage: fields create injectors that nothing uses

This note has the spec output, the root cause with links to the code, and the full code for each fix
option. Code links point to `main` at
[`3e173fc844`](https://github.com/angular/angular/commit/3e173fc844c440775d3f110da8505442e227dee5).
Nothing in the library is changed.

## Reproduce

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_arg=--filter="field injector allocation" --test_output=all
```

The specs are in
[`test/node/field_injector_allocation.spec.ts`](../test/node/field_injector_allocation.spec.ts). Each
one counts calls to `Injector.create` and asserts the count a fix should reach.

| Spec                                                                             | Result on `main` |
| -------------------------------------------------------------------------------- | ---------------- |
| creates injectors only for fields with managed metadata keys (50 items per rule) | Fails            |
| creates no injectors to destroy 50 removed fields that never had one             | Fails            |

Injectors created for a form over 50 array items, reading each item once:

| Rule on each item | Injectors | Needs an injection context?         |
| ----------------- | --------- | ----------------------------------- |
| None              | 0         | No                                  |
| `validate()`      | 0         | No                                  |
| `required()`      | 50        | No                                  |
| `min()`           | 50        | No                                  |
| `debounce()`      | 50        | No                                  |
| `validateAsync()` | 50        | Yes: it uses a managed metadata key |

Output:

```text
creates injectors only for fields with managed metadata keys (50 items per rule)
    Expected $.required = 50 to equal 0.
    Expected $.min = 50 to equal 0.
    Expected $.debounce = 50 to equal 0.
creates no injectors to destroy 50 removed fields that never had one
    Injector.create calls while the cleanup sweep destroys the removed items: Expected 50 to be 0.
```

**Cost per injector.** One `Injector.create({providers: [], parent})` took about 1.1 to 1.5 µs in
Node on an Apple silicon Mac: 10.8 ms and 14.7 ms for 10,000 calls in two runs. I measured this at
`ce30bb0889` with a timing spec that isn't part of this PR. I didn't measure memory.

## Root cause

1. A field runs `runMetadataCreateLifecycle()` when it's constructed
   ([`node.ts` L104](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/node.ts#L104)).
2. The method returns early only when the field has no metadata keys at all
   ([`metadata.ts` L34-L58](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/metadata.ts#L34-L58)).
   Many built-in rules add plain metadata keys: `required()`, `min()`, `max()`, `minLength()`,
   `maxLength()`, `minDate()`, `maxDate()`, `pattern()`, `validateStandardSchema()`, and `debounce()`.
3. It then calls `runInInjectionContext(this.node.structure.injector, ...)` before the loop checks
   `key.create`. Reading `structure.injector` creates the field's `R3Injector`
   ([`structure.ts` L96-L102](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/structure.ts#L96-L102)).
   Only managed keys, from `createManagedMetadataKey()`, have `create`. `validateAsync()` and
   `validateHttp()` use one.
4. `FieldNodeStructure.destroy()` calls `this.injector.destroy()`
   ([`structure.ts` L216-L218](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/structure.ts#L216-L218)).
   For a field that never had an injector, the getter creates one just so it can be destroyed.

The guide promises an injection context only to a managed key's `create`
([`field-metadata.md` L314](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/adev/src/content/guide/forms/signals/field-metadata.md?plain=1#L314)).
Plain metadata keys only build a `computed()`, which doesn't need one.

**Interaction with #70627.** That issue reports that the cleanup sweep materializes every reachable
field. Each field that's materialized runs `runMetadataCreateLifecycle()`. So, by reading the code,
the combination gives every field with one of the rules above an injector after the first sweep, even
if nothing reads the field.

## Fix options

### Option A: enter an injection context only for managed keys (recommended)

```diff
 // packages/forms/signals/src/field/metadata.ts, class FieldMetadataState
   runMetadataCreateLifecycle(): void {
-    if (!this.node.logicNode.logic.hasMetadataKeys()) {
+    const logic = this.node.logicNode.logic;
+    if (!logic.hasMetadataKeys()) {
       return;
     }

     const wasInParams = ɵisInParamsFunction();
     if (wasInParams) ɵsetInParamsFunction(false);
     try {
-      untracked(() =>
-        runInInjectionContext(this.node.structure.injector, () => {
-          for (const key of this.node.logicNode.logic.getMetadataKeys()) {
-            if (key.create) {
-              const logic = this.node.logicNode.logic.getMetadata(key);
-              const result = key.create!(
-                this.node,
-                computed(() => logic.compute(this.node.context)),
-              );
-              this.metadata.set(key, result);
-            }
-          }
-        }),
-      );
+      untracked(() => {
+        for (const key of logic.getMetadataKeys()) {
+          if (!key.create) {
+            continue;
+          }
+          // Only managed keys need the field's injector, so it's created here and nowhere else.
+          runInInjectionContext(this.node.structure.injector, () => {
+            const keyLogic = logic.getMetadata(key);
+            const result = key.create!(this.node, computed(() => keyLogic.compute(this.node.context)));
+            this.metadata.set(key, result);
+          });
+        }
+      });
     } finally {
       if (wasInParams) ɵsetInParamsFunction(true);
     }
   }
```

```diff
 // packages/forms/signals/src/field/structure.ts, class FieldNodeStructure
   destroy(): void {
-    this.injector.destroy();
+    this._injector?.destroy();
   }
```

Tradeoffs:

- Managed keys keep their injection context, which is everything the guide promises.
- Nothing else reads a field's injector. `compatForm()` child fields read the root's injector through
  `getInjectorFromOptions()`
  ([`util.ts` L28-L34](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/util.ts#L28-L34)),
  and that read stays lazy.
- A field with several managed keys enters the injection context once per key instead of once. That's
  a small cost, and only for those fields.
- The `destroy()` change is the same line the
  [host teardown triage](https://github.com/Flarette/angular/blob/triage/forms-host-teardown/packages/forms/signals/triage/host-teardown.md)
  changes.

### Option B: cache "has managed keys" on the logic node

```ts
// packages/forms/signals/src/schema/logic.ts, class LogicContainer
private hasManagedKeys?: boolean;

hasManagedMetadataKeys(): boolean {
  return (this.hasManagedKeys ??= [...this.metadata.keys()].some((key) => !!key.create));
}
```

`runMetadataCreateLifecycle()` would then return early when `hasManagedMetadataKeys()` is `false`.

Tradeoffs:

- Skips the key loop for each field, not just the injector.
- Brittle: `getMetadata()` adds keys lazily
  ([`logic.ts` L328-L334](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/schema/logic.ts#L328-L334)),
  so a cached `false` could go stale. Today's callers check `hasMetadata()` first, but nothing enforces
  that.

### Option C: a lightweight field scope instead of an `R3Injector`

This is option C in the
[host teardown triage](https://github.com/Flarette/angular/blob/triage/forms-host-teardown/packages/forms/signals/triage/host-teardown.md).
It makes even managed keys cheaper, but it's a much larger change.

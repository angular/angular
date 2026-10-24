# Triage: destroying a form's host doesn't destroy its fields

This note has the spec output, the root cause with links to the
code, and the full code for each fix option. Code links point to `main` at
[`3e173fc844`](https://github.com/angular/angular/commit/3e173fc844c440775d3f110da8505442e227dee5).
Nothing in the library is changed.

## Reproduce

```bash
pnpm bazel test //packages/forms/signals/test/node:test --test_arg=--filter="form host teardown" --test_output=all
```

The specs are in [`test/node/form_host_teardown.spec.ts`](../test/node/form_host_teardown.spec.ts).
Each one asserts the expected behavior, so a failing spec shows the bug. The `control:` spec checks the
harness.

| Spec                                                                             | Result on `main` |
| -------------------------------------------------------------------------------- | ---------------- |
| runs root-field `DestroyRef` callbacks when the form injector is destroyed       | Fails            |
| runs live child-field `DestroyRef` callbacks when the form injector is destroyed | Fails            |
| `control:` removing an array item runs its `DestroyRef` callbacks                | Passes           |
| aborts an in-flight `validateAsync` load when the form injector is destroyed     | Fails            |
| aborts an in-flight `validateAsync` load when the host component is destroyed    | Fails            |
| starts no validation loads after the form injector is destroyed                  | Fails            |

Output:

```text
runs root-field DestroyRef callbacks when the form injector is destroyed
    root-field DestroyRef callbacks after env.destroy(): Expected spy destroyed to have been called once. It was called 0 times.
runs live child-field DestroyRef callbacks when the form injector is destroyed
    live child-field DestroyRef callbacks after env.destroy(): Expected spy destroyed to have been called once. It was called 0 times.
aborts an in-flight validateAsync load when the form injector is destroyed
    loader AbortSignal.aborted after env.destroy(): Expected false to be true.
aborts an in-flight validateAsync load when the host component is destroyed
    loader AbortSignal.aborted after fixture.destroy(): Expected false to be true.
starts no validation loads after the form injector is destroyed
    loads started, including any after env.destroy(): Expected 2 to be 1.
```

The control spec passes, so the probe works: removing an item from the model destroys that item's
field and runs its `DestroyRef` callbacks.

## Root cause

1. Each field creates its own `R3Injector` the first time something reads `injector`. Its parent is
   the form's injector
   ([`structure.ts` L96-L102](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/structure.ts#L96-L102)).
2. An `R3Injector` doesn't register with its parent's destroy hooks
   ([`r3_injector.ts` L219-L247](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/di/r3_injector.ts#L219-L247)),
   so destroying the form's injector leaves every field injector alive.
3. The only caller of `FieldNodeStructure.destroy()` is the cleanup sweep
   ([`manager.ts` L56-L71](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/manager.ts#L56-L71)).
   It destroys fields that are no longer reachable from the root.
4. Only child structures register for the sweep
   ([`structure.ts` L525](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/structure.ts#L525)),
   and the sweep always marks the root live
   ([`manager.ts` L79-L87](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/manager.ts#L79-L87)).
   `FormFieldManager` registers no `DestroyRef` hook of its own.

So when the host goes away, no field is destroyed. A `validateAsync()` resource registers its
`destroy()` on the field injector's `DestroyRef`
([`resource.ts` L346](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/resource/resource.ts#L346)),
and only `destroy()` aborts the in-flight load
([`resource.ts` L411-L424](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/resource/resource.ts#L411-L424)).

What keeps running depends on the host:

| Host                 | In-flight load     | New loads after teardown                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment injector | Not aborted (spec) | Start (spec). The resource's load effect uses `manualCleanup: true` ([`resource.ts` L339](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/resource/resource.ts#L339)), and on this host it's a root effect                                                       |
| Component            | Not aborted (spec) | None, by reading the code: the load effect finds `ViewContext` through the field injector's parent and dies with the view ([`effect.ts` L163-L176](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/render3/reactivity/effect.ts#L163-L176)). No spec checks this |

The field metadata guide says that a managed key's cleanup is tied to the field's lifecycle
([`field-metadata.md` L314](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/adev/src/content/guide/forms/signals/field-metadata.md?plain=1#L314)).
It doesn't say when a whole form's fields end. The `injector` option's docs only mention dependency
injection
([`structure.ts` L50-L56](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/api/structure.ts#L50-L56)).

## Fix options

### Option A: the field manager destroys every field with the host (recommended)

```diff
 // packages/forms/signals/src/field/manager.ts
-import {APP_ID, effect, Injector, untracked} from '@angular/core';
+import {APP_ID, DestroyRef, effect, Injector, untracked} from '@angular/core';

   createFieldManagementEffect(root: FieldNodeStructure): void {
     effect(
       () => {
         /* ...unchanged sweep... */
       },
       {injector: this.injector},
     );
+
+    this.injector.get(DestroyRef).onDestroy(() => {
+      for (const structure of this.structures) {
+        structure.destroy();
+      }
+      this.structures.clear();
+    });
   }
```

```diff
 // packages/forms/signals/src/field/structure.ts
 export class RootFieldNodeStructure extends FieldNodeStructure {
   constructor(/* ... */) {
     super(logic, node, createChildNode);
     this.childrenMap = this.createChildrenMap();
+    // The sweep always marks the root live, so only the host's teardown destroys it.
+    this.fieldManager.structures.add(this);
   }
 }

 // class FieldNodeStructure
   destroy(): void {
-    this.injector.destroy();
+    this._injector?.destroy();
   }
```

```diff
 // packages/forms/signals/compat/src/compat_structure.ts, end of the constructor
+    this.fieldManager.structures.add(this);
```

Tradeoffs:

- One hook per form. Nothing else iterates `structures`, so adding the root changes no other code
  path.
- The sweep deletes a structure from `structures` before it destroys it, so the hook never destroys a
  field twice. `R3Injector.destroy()` throws if it runs twice.
- `_injector?.destroy()` keeps teardown from creating an injector for a field that never had one.
  The [field injector allocation triage](https://github.com/Flarette/angular/blob/triage/forms-injector-allocation/packages/forms/signals/triage/injector-allocation.md) makes the same change.
- Teardown order: the sweep effect is destroyed in the same synchronous teardown as the hook, so it
  can't run after the hook.
- Not defined: a field that's first read after teardown. Its injector's parent is destroyed, nothing
  sweeps it, and a managed key's `create()` may throw `NG0205`. No spec covers this.

### Option B: each field injector registers with the host

```diff
 // packages/forms/signals/src/field/structure.ts, class FieldNodeStructure
   get injector(): DestroyableInjector {
-    this._injector ??= Injector.create({
-      providers: [],
-      parent: this.fieldManager.injector,
-    }) as DestroyableInjector;
+    if (this._injector === undefined) {
+      const parent = this.fieldManager.injector;
+      const injector = Injector.create({providers: [], parent}) as DestroyableInjector;
+      // Destroy with the host, and stop listening if the sweep destroys the field first.
+      const unregister = parent.get(DestroyRef).onDestroy(() => injector.destroy());
+      injector.get(DestroyRef).onDestroy(unregister);
+      this._injector = injector;
+    }
     return this._injector;
   }
```

Tradeoffs:

- Covers the root, child, and compat structures without a registry.
- Adds one hook on the host for every field that has an injector, and two `DestroyRef` lookups per
  field.
- `unregister()` runs while the host is being destroyed. Both `R3Injector` and the component
  `DestroyRef` would need to allow removing a hook during teardown.

### Option C: replace per-field `R3Injector`s with a lightweight field scope

```ts
/** A field's injection context: its own DestroyRef, everything else from the form's injector. */
class FieldScope extends Injector {
  private readonly hooks = new Set<() => void>();
  private readonly destroyRef = {
    onDestroy: (hook: () => void) => {
      this.hooks.add(hook);
      return () => this.hooks.delete(hook);
    },
  } as unknown as DestroyRef;

  constructor(private readonly parent: Injector) {
    super();
  }

  override get(token: any, notFoundValue?: any, options?: any): any {
    if (token === DestroyRef) return this.destroyRef;
    if (token === Injector) return this;
    return this.parent.get(token, notFoundValue, options);
  }

  destroy(): void {
    for (const hook of this.hooks) hook();
    this.hooks.clear();
  }
}
```

Tradeoffs:

- A child scope registers on its parent scope's `DestroyRef`, so destroying the root scope destroys
  every field.
- `runInInjectionContext()` accepts an injector that isn't an `R3Injector`
  ([`contextual.ts` L37-L44](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/core/src/di/contextual.ts#L37-L44)).
- A scope is much cheaper than an `R3Injector`, so this also addresses the [field injector allocation triage](https://github.com/Flarette/angular/blob/triage/forms-injector-allocation/packages/forms/signals/triage/injector-allocation.md).
- It's the largest change. `INJECTOR`, `destroyed`, and `EnvironmentInjector` lookups need explicit
  handling and tests.

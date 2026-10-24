# Triage: `instanceof AbstractControl` keeps reactive forms in every signal forms bundle

This note has the bundle measurements, how to reproduce them, the root cause with links to the code,
and the full code for each fix option. Code links point to `main` at
[`3e173fc844`](https://github.com/angular/angular/commit/3e173fc844c440775d3f110da8505442e227dee5).
Nothing in the library is changed.

## Measurement apps

This branch adds two production build targets. They aren't tests, and they build without errors.

- [`packages/core/test/bundling/forms_signals_model/`](../../../core/test/bundling/forms_signals_model/main.ts):
  a component with `form(signal({name: ''}), (p) => required(p.name))` and an interpolation. It uses
  no directives.
- [`packages/core/test/bundling/forms_signals_field/`](../../../core/test/bundling/forms_signals_field/main.ts):
  the same form bound to `<input [formField]="f.name" />`.

Both use `optimize_angular_app`, the production Angular CLI build that the core bundling tests use,
with the default settings, including mangling.

## Reproduce

```bash
pnpm bazel build //packages/core/test/bundling/forms_signals_model:bundles //packages/core/test/bundling/forms_signals_field:bundles
for app in model field; do
  f=dist/bin/packages/core/test/bundling/forms_signals_$app/bundles/main.js
  echo "$app raw=$(wc -c < $f) gzip=$(gzip -9 -c $f | wc -c) brotli=$(brotli -c $f | wc -c)"
done
```

To measure the recommended fix, change the check in
[`context.ts` L171](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/context.ts#L171)
to `if (ngDevMode && result instanceof AbstractControl)`, and build again.

## Results

Sizes in bytes at `3e173fc844`:

| App           | Today (raw / gzip / brotli) | With the dev-mode-only check (raw / gzip / brotli) | Saved (gzip)    |
| ------------- | --------------------------- | -------------------------------------------------- | --------------- |
| Model only    | 141,563 / 44,490 / 39,869   | 124,217 / 39,742 / 35,722                          | 4,748 B (10.7%) |
| `[formField]` | 182,983 / 56,835 / 50,450   | 173,946 / 54,939 / 48,812                          | 1,896 B (3.3%)  |

The status strings that `AbstractControl` defines, `"DISABLED"` and `"PENDING"`, disappear from the
model-only bundle with the fix (1 occurrence each before, 0 after). The `[formField]` bundle keeps
one of each through the `ControlValueAccessor` interop.

**What ships only because of the check.** Mangled names can't be read, so this list comes from an
earlier build with `NG_BUILD_MANGLE=0` at `ce30bb0889`:

- **Model only:** `AbstractControl`; the control event classes `ControlEvent`, `ValueChangeEvent`,
  `PristineChangeEvent`, `TouchedChangeEvent`, and `StatusChangeEvent`; `Validators` and its helpers,
  such as `requiredValidator`, `minValidator`, `emailValidator`, `patternValidator`, `compose`, and
  `mergeErrors`; RxJS `forkJoin`, `from`, `innerFrom`, and the `schedule*` helpers; and the tslib
  async iterator helpers.
- **`[formField]`:** `AbstractControl`, four of the event classes, and the validator array helpers
  such as `addValidators` and `coerceToValidator`. This app keeps `Validators`, `NgControl`,
  `AbstractControlDirective`, and `BaseControlValueAccessor` without the check, through the
  `ControlValueAccessor` interop. That cost is out of scope here.

`FormGroup`, `FormArray`, and `FormControl` don't ship in either app.

## Root cause

- `FieldNodeContext.valueOf` rejects `AbstractControl` values with `instanceof`
  ([`context.ts` L168-L179](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/field/context.ts#L168-L179)).
  That's a value reference to the class.
- `valueOf` is an instance field of `FieldNodeContext`, so every app that calls `form()` keeps it,
  whether or not any rule calls `valueOf`.
- `@angular/forms` is side-effect free, so this one reference decides whether `AbstractControl` ships.
  `AbstractControl` then pulls in `Validators` through `hasValidator(Validators.required)`, and the
  async validator helpers pull in RxJS.
- The check came in with `compatForm()` (`60447945bc`) as a plain `throw new Error`. Its message is
  already dev-only (`ngDevMode && ...`), and no spec covers the error, `NG1907`.

## Fix options

### Option A: run the check in dev mode only (recommended)

```diff
 // packages/forms/signals/src/field/context.ts, class FieldNodeContext
   readonly valueOf = <TValue>(p: SchemaPath<TValue, SchemaPathRules>) => {
     const result = this.resolve(p)().value();

-    if (result instanceof AbstractControl) {
+    if (ngDevMode && result instanceof AbstractControl) {
       throw new RuntimeError(
         RuntimeErrorCode.ABSTRACT_CONTROL_IN_FORM,
         ngDevMode &&
           `Tried to read an 'AbstractControl' value from a 'form()'. Did you mean to use 'compatForm()' instead?`,
       );
     }
     return result;
   };
```

Tradeoffs:

- Production builds define `ngDevMode` as `false`, so the branch and the class reference are removed.
  The "With the dev-mode-only check" column above is this exact change.
- In production, a rule that calls `valueOf()` on a `FormControl` inside a `form()` model gets the
  control back instead of an error. Development builds still throw.
- `@angular/forms` already has dev-only errors, for example in `toObservable()`
  ([`validators.ts` L611](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/src/validators.ts#L611)),
  and so does signal forms
  ([`structure.ts` L253](https://github.com/angular/angular/blob/3e173fc844c440775d3f110da8505442e227dee5/packages/forms/signals/src/api/structure.ts#L253)).

### Option B: a brand check exported privately from `@angular/forms`

```ts
// packages/forms/src/model/abstract_model.ts
const ABSTRACT_CONTROL = Symbol.for('ng.AbstractControl');

export abstract class AbstractControl</* ... */> {
  /** @internal */
  get [ABSTRACT_CONTROL](): true {
    return true;
  }
  // ...
}

/** Checks for a control without a value reference to the class, so the class can be tree-shaken. */
export function ɵisAbstractControl(value: unknown): value is AbstractControl {
  return typeof value === 'object' && value !== null && (value as any)[ABSTRACT_CONTROL] === true;
}
```

```diff
 // packages/forms/signals/src/field/context.ts, valueOf
-    if (result instanceof AbstractControl) {
+    if (ɵisAbstractControl(result)) {
```

Tradeoffs:

- Keeps the production error.
- Adds a private export to `@angular/forms` and an API golden update, and it crosses the package
  boundary.
- The getter must stay a class member, not a module-level assignment, so that the class stays
  tree-shakable. I haven't measured this option.

### Option C: drop the check

Smallest change, but it drops the diagnostic for a real mistake in development too. Not recommended.

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Known NGP (`packages/ngp`) compiler gaps when running the shared `ngtsc`, `typecheck`,
 * `extended/test/checks`, and `compliance` test suites.
 *
 * By default in `NG_COMPILER_BACKEND=ngp` mode, specs listed here are marked pending (`xit`)
 * so that CI targets (`ngtsc_ngp`, `test_ngp`, `full_ngp`, `local_ngp`) remain green and prevent
 * regressions on already-supported behavior.
 *
 * Set `NGP_RUN_KNOWN_FAILURES=1` in the environment to execute all known-failing specs without
 * skipping.
 *
 * Tracked compiler gap categories & GitHub issues (https://github.com/alxhub/ng-hybrid-preprocessor):
 * - Extended Template Diagnostics (NG8102, NG8107, NG8109, NG8111, NG8115, NG8117): #673, #677
 * - Template Type-Checking (TCB) & Host Binding Type-Checking: #678-#683, #694-#696
 * - Angular Diagnostic Error Codes (NG1xxx-NG11xxx): #684-#692
 * - Decorator Metadata Type-Checking: #693
 * - Compiler Pipeline Features (HMR, local compilation, declaration-only emission,
 *   incremental compilation, Xi18n, ComponentIndex, TemplateTypeChecker API)
 */

export function isNgpSkipEnabled(): boolean {
  return (
    process.env['NG_COMPILER_BACKEND'] === 'ngp' && process.env['NGP_RUN_KNOWN_FAILURES'] !== '1'
  );
}

export function shouldSkipInNgp(fullSpecName: string): boolean {
  if (!isNgpSkipEnabled()) {
    return false;
  }
  const normalized = fullSpecName.replace(/\s+/g, ' ').trim();
  return (
    NGP_KNOWN_TYPECHECK_FAILURES.has(normalized) ||
    NGP_REQUIRES_TYPE_CHECKER.has(normalized) ||
    NGP_KNOWN_NGTSC_FAILURES.has(normalized) ||
    NGP_POTENTIAL_BREAKING_CHANGES.has(normalized)
  );
}

/**
 * Known failures in `//packages/compiler-cli/src/ngtsc/typecheck/test:test_ngp`
 * (#678-#682, #690, plus `TemplateTypeChecker` IDE metadata queries).
 */
const NGP_KNOWN_TYPECHECK_FAILURES: ReadonlySet<string> = new Set([
  'template parse failures should handle TypeScript parse failures gracefully',
  'template parse failures should handle non-Error failures gracefully',

  // The tests below check a pattern that is not allowed (private inputs/outputs). The reason they
  // pass with ngtsc is that the tests are set up in a way that bypasses some validations.
  // TODO(crisbeto): clean up these tests since they aren't testing a valid pattern.
  'input signal type-check diagnostics allow access to private input if modifiers are explicitly ignored',
  'input signal type-check diagnostics allow access to private input if modifiers are explicitly ignored, but error if not assignable',
  'input signal type-check diagnostics disallows access to private input',
  'input signal type-check diagnostics with `--strict` allow access to private input if modifiers are explicitly ignored',
  'input signal type-check diagnostics with `--strict` allow access to private input if modifiers are explicitly ignored, but error if not assignable',
  'input signal type-check diagnostics with `--strict` disallows access to private input',
  'model inputs type-check diagnostics allow access to private input if modifiers are explicitly ignored',
  'model inputs type-check diagnostics allow access to private model if modifiers are explicitly ignored, but error if not assignable',
  'model inputs type-check diagnostics allows access to private output',
  'model inputs type-check diagnostics allows access to protected output',
  'model inputs type-check diagnostics disallows access to private model',
  'model inputs type-check diagnostics with `--strict` allow access to private input if modifiers are explicitly ignored',
  'model inputs type-check diagnostics with `--strict` allow access to private model if modifiers are explicitly ignored, but error if not assignable',
  'model inputs type-check diagnostics with `--strict` allows access to private output',
  'model inputs type-check diagnostics with `--strict` allows access to protected output',
  'model inputs type-check diagnostics with `--strict` disallows access to private model',
]);

/**
 * Tests that rely on a TypeScript `TypeChecker` during analysis or template semantics checking,
 * which `ngp` does not have at preprocessing time.
 */
const NGP_REQUIRES_TYPE_CHECKER: ReadonlySet<string> = new Set([
  // Detecting writes to read-only `@let` or `@for` variables in two-way bindings (NG8005)
  // requires a TypeChecker (`isSignalReference`) to distinguish non-signal variables from
  // `WritableSignal` variables (since `[(dir)]="signalVar"` is valid).
  'ngtsc type checking @let declarations should not be able to write to let declaration in a two-way binding',
  'ngtsc type checking for loop blocks should not be able to write to loop template variables in a two-way binding',

  // TypeChecker-backed extended template diagnostics (#673, #677) in
  // `//packages/compiler-cli/src/ngtsc/typecheck/extended/test/checks/*:test_ngp` and `ngtsc_spec`.
  'ngtsc extended template checks should produce nullish coalescing not nullable warning',
  '@let declarations should produce a warning when a signal aliased via @let is not invoked in interpolation',
  '@let declarations should produce a warning when a signal aliased via @let is used in @if',
  '@let declarations should produce a warning when a signal aliased via @let is used in a bound attribute',
  '@let declarations should produce a warning when an instance property of a signal aliased via @let is accessed in interpolation',
  'NullishCoalescingNotNullableCheck does not warn for pipe arguments when parens are used',
  'NullishCoalescingNotNullableCheck should produce nullish coalescing warning',
  'NullishCoalescingNotNullableCheck should produce nullish coalescing warning for classes with inline TCBs',
  'NullishCoalescingNotNullableCheck should respect configured diagnostic category',
  'NullishCoalescingNotNullableCheck warns for pipe arguments which are likely configured incorrectly (?? operates on "format" here)',
  'OptionalChainNotNullableCheck should produce optional chain warning for classes with inline TCBs',
  'OptionalChainNotNullableCheck should produce optional chain warning for indexed access',
  'OptionalChainNotNullableCheck should produce optional chain warning for method call',
  'OptionalChainNotNullableCheck should produce optional chain warning for property access',
  'OptionalChainNotNullableCheck should respect configured diagnostic category',
  'Uninvoked function in text interpolation compiler check should produce a warning when a function is not invoked in text interpolation',
  'Uninvoked function in text interpolation compiler check should produce a warning when a property method is not invoked in text interpolation (with and without safe navigation)',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in a chain is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in a function is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function is not',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function that returns a function is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function in a conditional is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function that uses key read in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when no function in a conditional is not invoked',
  'UninvokedTrackFunctionCheck should produce a diagnostic when a track function in a @for block is not invoked',
  'UninvokedTrackFunctionCheck should produce a warning when track is a method on an item',
  'UninvokedTrackFunctionCheck should produce a warning when track is a regular function on an object',
  'UninvokedTrackFunctionCheck should produce a warning when track is an arrow function property on component',
  'should produce a warning if the template contains a directive with the same input name, but on a different node',
  'should produce a warning when a computed signal is not invoked',
  'should produce a warning when a model signal is not invoked',
  "should produce a warning when a property named 'asReadonly' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'asReadonly' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'asReadonly' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'asReadonly' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'asReadonly' of a not invoked signal is used in interpolation",
  "should produce a warning when a property named 'length' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'length' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'length' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'length' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'length' of a not invoked signal is used in interpolation",
  "should produce a warning when a property named 'name' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'name' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'name' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'name' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'name' of a not invoked signal is used in interpolation",
  "should produce a warning when a property named 'prototype' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'prototype' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'prototype' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'prototype' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'prototype' of a not invoked signal is used in interpolation",
  "should produce a warning when a property named 'set' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'set' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'set' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'set' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'set' of a not invoked signal is used in interpolation",
  "should produce a warning when a property named 'update' of a not invoked signal is used in an @if control flow expression (negate=false)",
  "should produce a warning when a property named 'update' of a not invoked signal is used in an @if control flow expression (negate=true)",
  "should produce a warning when a property named 'update' of a not invoked signal is used in an @switch control flow (negate=false)",
  "should produce a warning when a property named 'update' of a not invoked signal is used in an @switch control flow (negate=true)",
  "should produce a warning when a property named 'update' of a not invoked signal is used in interpolation",
  'should produce a warning when a readonly signal is not invoked',
  'should produce a warning when a required input signal is not invoked',
  'should produce a warning when a required model signal is not invoked',
  'should produce a warning when a signal in a nested property read is not invoked',
  'should produce a warning when a signal is not invoked',
  'should produce a warning when a signal is not invoked in a conditional style binding branch',
  'should produce a warning when a signal is not invoked in a non-null asserted style binding expression',
  'should produce a warning when a signal is not invoked in a parenthesized style binding expression',
  'should produce a warning when a signal is not invoked in a prefixed-not property binding expression',
  'should produce a warning when a signal is not invoked in an svg:ng-template',
  'should produce a warning when an input signal is not invoked',
  'should produce a warning when nested signal is not invoked on interpolated binding',
  'should produce a warning when signal is invoked in attribute binding interpolation',
  'should produce a warning when signal is not invoked on interpolated binding',
  "should produce a warning when signal isn't invoked on animation binding",
  "should produce a warning when signal isn't invoked on attribute binding",
  "should produce a warning when signal isn't invoked on class binding",
  "should produce a warning when signal isn't invoked on dom property binding",
  "should produce a warning when signal isn't invoked on style binding",
  'should produce optional chain warning for chained property access',
]);

/**
 * Addressing these failures will likely cause breaking changes. Proceed with caution.
 */
const NGP_POTENTIAL_BREAKING_CHANGES: ReadonlySet<string> = new Set([
  // Aligning the debug info shape can cause a different overload to
  // match for signal inputs which in turn causes breakages.
  'Debug Info Typescript tranformation afterRenderEffect should insert debug info into afterRenderEffect function if imported from angular core',
  'Debug Info Typescript tranformation afterRenderEffect should insert debug info into afterRenderEffect function in a property assignment',
  'Debug Info Typescript tranformation afterRenderEffect should insert debug info into afterRenderEffect function with a phase spec',
  'Debug Info Typescript tranformation afterRenderEffect should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation afterRenderEffect should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation computed Property Assignment Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation computed Property Assignment Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation computed Property Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation computed Property Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation computed Variable Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation computed Variable Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation computed should insert debug info into computed function if imported from angular core',
  'Debug Info Typescript tranformation contentChild .required should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation contentChild should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation contentChild should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation contentChildren should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation contentChildren should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation effect should insert debug info into effect function if imported from angular core',
  'Debug Info Typescript tranformation effect should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation effect should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation httpResource Property Assignment Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation httpResource Property Assignment Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation httpResource Property Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation httpResource Property Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation httpResource Variable Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation httpResource Variable Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation input .required should insert debug info into .required',
  'Debug Info Typescript tranformation input .required should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation input should insert debug info into input function if imported from angular core',
  'Debug Info Typescript tranformation linkedSignal Property Assignment Case should insert debug info into linkedSignal with a computation object',
  'Debug Info Typescript tranformation linkedSignal Property Assignment Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation linkedSignal Property Assignment Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation linkedSignal Property Declaration Case should insert debug info into linkedSignal with a computation object',
  'Debug Info Typescript tranformation linkedSignal Property Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation linkedSignal Property Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation linkedSignal Variable Declaration Case should insert debug info into linkedSignal with a computation object',
  'Debug Info Typescript tranformation linkedSignal Variable Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation linkedSignal Variable Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation linkedSignal should insert debug info into linkedSignal function if imported from angular core',
  'Debug Info Typescript tranformation model .required should insert debug info into .required',
  'Debug Info Typescript tranformation model .required should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation model should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation signal Property Assignment Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation signal Property Assignment Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation signal Property Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation signal Property Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation signal Variable Declaration Case should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation signal Variable Declaration Case should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation viewChild .required should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation viewChild should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation viewChild should tree-shake away debug info if in prod mode',
  'Debug Info Typescript tranformation viewChildren should not tree-shake away debug info if in dev mode',
  'Debug Info Typescript tranformation viewChildren should tree-shake away debug info if in prod mode',

  // Design difference, not a bug: when an imported transform function's parameter type references
  // another symbol imported in the external declaration file (rather than a self-contained type),
  // ngp emits `Parameters<typeof i1.transformFn>[0]` instead of re-importing the external symbol.
  'ngtsc behavioral tests input transforms should compile an input with an external transform function',
  'ngtsc behavioral tests input transforms should compile an input with using an ambient type in the transform function',

  // Design difference, not a bug: on an `@Inject` parameter whose type is imported from another
  // file, ngp emits `type: undefined` in `ɵsetClassMetadata` in both compilation modes. Single-file
  // analysis cannot tell an imported class from an imported interface (ngtsc can, via the type
  // checker), and withholding the type is safe because DI uses the `@Inject` token. The
  // cross-file pass deliberately does not upgrade these so that both modes keep the same runtime
  // imports; see the `@Inject` rule in `ng-analyze/src/analyzer/mod.rs`. These specs assert the
  // ngtsc shape (`type: ImportedClass` and a surviving import) for such a parameter.
  'ngtsc behavioral tests should use imported types in setClassMetadata if they can be represented as values',
  'ngtsc behavioral tests should use imported types in setClassMetadata if they can be represented as values and imported as `* as foo`',
  'ngtsc behavioral tests should preserve the types of non-const enums in setClassMetadata',

  // Flat module index generation (`flatModuleOutFile` and `flatModuleId`) is a legacy View Engine
  // feature that won't be ported to ngp for the time being.
  'ngtsc behavioral tests flat module indices should determine the flat module entry-point within multiple root files',
  'ngtsc behavioral tests flat module indices should generate a basic flat module index',
  'ngtsc behavioral tests flat module indices should generate a flat module with an id',
  'ngtsc behavioral tests flat module indices should generate a proper flat module index file when nested',
  'ngtsc behavioral tests flat module indices should report an error when a deeply visible directive is not exported',
  'ngtsc behavioral tests flat module indices should report an error when a deeply visible module is not exported',
  'ngtsc behavioral tests flat module indices should report an error when a flat module index is requested but no entrypoint can be determined',
  'ngtsc behavioral tests flat module indices should report an error when a visible directive is not exported',
  'ngtsc behavioral tests flat module indices should report an error when a visible host directive is not exported',

  // These tests depend on compiler flags that aren't relevant for ngp
  // (`_useHostForImportAndAliasGeneration` and `generateDeepReexports`).
  'ngtsc behavioral tests NgModule export aliasing should escape unusual characters in aliased filenames',
  'ngtsc behavioral tests NgModule export aliasing should use an alias to import a directive from a deep dependency when _useHostForImportAndAliasGeneration is set',
  'ngtsc behavioral tests NgModule export aliasing should write alias ES2015 exports for NgModule exported directives when _useHostForImportAndAliasGeneration is set',
  'ngtsc behavioral tests aliasing re-exports should error when two directives with the same declared name are exported from the same NgModule',
  'ngtsc behavioral tests aliasing re-exports should not error when two directives with the same declared name are exported from the same NgModule, but one is exported from the file directly',
  'ngtsc behavioral tests aliasing re-exports should re-export a directive from a different file under a private symbol name',
  'ngtsc behavioral tests aliasing re-exports should re-export a directive from an exported NgModule under a private symbol name',

  // For the time being we aren't implementing selectorless in ngp. Also some of the analysis depends on
  // the parsed template which hasn't been ported to Rust at the time of writing.
  'selectorless should be able to alias imports of selectorless dependencies',
  'selectorless should be able to use default imports as selectorless dependencies',
  'selectorless should check input bindings coming from host directives on component nodes',
  'selectorless should check input bindings coming from host directives on directive nodes',
  'selectorless should check output bindings coming from host directives on component nodes',
  'selectorless should check output bindings coming from host directives on directive nodes',
  'selectorless should check required inputs of selectorless components',
  'selectorless should check required inputs of selectorless directives',
  'selectorless should check that selectorless component reference is a component class',
  'selectorless should check that selectorless component references are standalone',
  'selectorless should check that selectorless directive reference is a directive class',
  'selectorless should check that selectorless directive references are standalone',
  'selectorless should check that the component using selectorless syntax is standalone',
  'selectorless should check the input bindings of selectorless components',
  'selectorless should check the input bindings of selectorless directives',
  'selectorless should check the input bindings of selectorless directives imported from an external library',
  'selectorless should check the output bindings of selectorless components',
  'selectorless should check the output bindings of selectorless directives',
  'selectorless should defer selectorless symbols',
  'selectorless should emit references to selectorless dependencies defined in the same function',
  'selectorless should emit references to selectorless symbols',
  'selectorless should generate metadata for a pipe without a name',
  'selectorless should import capitalized pipes from external modules implicitly',
  'selectorless should import capitalized pipes implicitly',
  'selectorless should not allow a `deferredImports` object in a selectorless component',
  'selectorless should not allow an `imports` array in a selectorless component',
  'selectorless should pick the dependency closest to the class',
  'selectorless should report unclaimed inputs on directive nodes as errors',
  'selectorless should report unclaimed outputs on directive nodes as errors',
  'selectorless should resolve local reference to selectorless component',
  'selectorless should resolve local reference to selectorless directive',
  'selectorless should treat unclaimed inputs as DOM property bindings on component nodes',
  'selectorless should treat unclaimed outputs as DOM events on component nodes',
]);

/**
 * Known failures in `//packages/compiler-cli/test/ngtsc:ngtsc_ngp`
 * (HMR, local compilation, declaration-only emission, incremental compilation,
 * Xi18n, ComponentIndex, and diagnostic/TCB gaps #677-#696).
 */
const NGP_KNOWN_NGTSC_FAILURES: ReadonlySet<string> = new Set([
  'import generation should report an error when a library entry-point does not export the symbol',
  'import generation should report an error when using a directive outside of rootDirs',
  'local compilation @defer should produce a diagnostic in case imports with symbols used in `deferredImports` can not be removed',
  'local compilation @defer should support importing multiple deferrable deps from a single file and use them within `@Component.deferrableImports` field',
  'local compilation custom decorator should produce diagnostic for each custom decorator',
  'local compilation host directives should generate component hostDirectives definition without input and output',
  'local compilation host directives should produce fatal diagnostics for host directives with forward references of externally imported directive',
  'local compilation input transform should not check inline function param type',
  'ngtsc @defer block @Component.deferredImports block-specific deferredImports mapping should report error when defer block has no name parameter but deferredImports is an object',
  'ngtsc @defer block @Component.deferredImports block-specific deferredImports mapping should report error when name parameter references missing block in deferredImports',
  'ngtsc @defer block block-specific deferredImports type checking should report an error when a pipe declared in a keyed block is used in an unnamed defer block',
  'ngtsc behavioral tests cycle detection should detect a simple cycle and fatally error if doing partial-compilation',
  'ngtsc compilation of standalone types component-side should compile a standalone component in a cycle with its module',
  'ngtsc incremental compilation template type-checking should retain default imports that have been converted into a value expression',
  'ngtsc type checking @let declarations should produce a single diagnostic if a @let declaration invokes itself',
  'ngtsc type checking @let declarations should produce a single diagnostic if a @let declaration refers to properties on itself',
  'ngtsc type checking @let declarations should report @let declaration used in the expression of a @if block before it is defined',
  'ngtsc type checking for loop blocks should not allow usages of aliased `if` block variables inside the tracking expression',
  'ngtsc type checking for loop blocks should not allow usages of local references outside of the template in the tracking expression',
  'ngtsc type checking for loop blocks should not allow usages of local references within the same template inside the tracking expression',
  'ngtsc type checking for loop blocks should not allow usages of parent loop variables inside the tracking expression',
  'ngtsc type checking for loop blocks should not allow usages of parent template variables inside the tracking expression',
]);

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
    NGP_REQUIRES_TYPE_CHECKER.has(normalized) ||
    NGP_KNOWN_NGTSC_FAILURES.has(normalized) ||
    NGP_INTENTIONAL_BEHAVIOR_DIFFERENCES.has(normalized)
  );
}

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
]);

/**
 * Includes behaviors that are intentionally different with ngp, or functionality we have decided not to support.
 */
const NGP_INTENTIONAL_BEHAVIOR_DIFFERENCES: ReadonlySet<string> = new Set([
  // Design difference, not a bug: when an imported transform function's parameter type references
  // another symbol imported in the external declaration file (rather than a self-contained type),
  // ngp emits `Parameters<typeof i1.transformFn>[0]` instead of re-importing the external symbol.
  'ngtsc behavioral tests input transforms should compile an input with an external transform function',
  'ngtsc behavioral tests input transforms should compile an input with using an ambient type in the transform function',

  // Partial compilation isn't implemented in ngp.
  'ngtsc behavioral tests cycle detection should detect a simple cycle and fatally error if doing partial-compilation',

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

  // The two tests check behavior specific to the TS6 source
  // file construction so we don't need to support them.
  'template parse failures should handle TypeScript parse failures gracefully',
  'template parse failures should handle non-Error failures gracefully',

  // Tests TypeScript `structureIsReused` across in-memory ngtsc incremental compilations.
  'ngtsc type checking stability should allow for complete program reuse during incremental compilations',

  // Extended diagnostics that won't be ported to the new compilation model
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in a chain is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in a function is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function is not',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a function that returns a function is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function in a conditional is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when a nested function that uses key read in an event binding is not invoked',
  'UninvokedFunctionInEventBindingFactoryCheck should produce a diagnostic when no function in a conditional is not invoked',
]);

/**
 * Known failures in `//packages/compiler-cli/test/ngtsc:ngtsc_ngp`
 * (HMR, local compilation, declaration-only emission, incremental compilation,
 * Xi18n, ComponentIndex, API docs extraction, `TemplateTypeChecker` helpers,
 * and diagnostic/TCB gaps #677-#696).
 */
const NGP_KNOWN_NGTSC_FAILURES: ReadonlySet<string> = new Set([
  'import generation should report an error when a library entry-point does not export the symbol',
  'import generation should report an error when using a directive outside of rootDirs',

  // API documentation extraction (`getApiDocumentation`) is not implemented in NGP.
  'ngtsc NgModule docs extraction should extract NgModule info',
  'ngtsc class docs extraction should extract a method with a rest parameter',
  'ngtsc class docs extraction should extract abstract classes',
  'ngtsc class docs extraction should extract class constructor',
  'ngtsc class docs extraction should extract class constructor with overloads',
  'ngtsc class docs extraction should extract class generic parameters',
  'ngtsc class docs extraction should extract class members',
  'ngtsc class docs extraction should extract class method params',
  'ngtsc class docs extraction should extract classes',
  'ngtsc class docs extraction should extract getters and setters',
  'ngtsc class docs extraction should extract inherited getters/setters',
  'ngtsc class docs extraction should extract inherited members',
  'ngtsc class docs extraction should extract inheritence/interface conformance',
  'ngtsc class docs extraction should extract member tags',
  'ngtsc class docs extraction should extract members of a class from .d.ts',
  'ngtsc class docs extraction should extract method generic parameters',
  'ngtsc class docs extraction should extract methods with overloads',
  'ngtsc class docs extraction should extract only once, when discovering abstract methods with overloads',
  'ngtsc class docs extraction should extract public constructor parameters',
  'ngtsc class docs extraction should not extract Angular-internal members',
  'ngtsc class docs extraction should not extract a constructor without parameters',
  'ngtsc class docs extraction should not extract internal member tags',
  'ngtsc class docs extraction should not extract private class members',
  'ngtsc class docs extraction should only mark constructor parameter properties from a parent as inherited',
  'ngtsc common docs extraction should not extract unexported statements',
  'ngtsc constant docs extraction should extract an object literal cast to a const and marked as an enum',
  'ngtsc constant docs extraction should extract an object literal marked as an enum',
  'ngtsc constant docs extraction should extract constants',
  'ngtsc constant docs extraction should extract multiple constant declarations in a single statement',
  'ngtsc constant docs extraction should extract non-primitive constants',
  'ngtsc decorator docs extraction should extract class decorators that define members in an interface',
  'ngtsc decorator docs extraction should extract param decorators',
  'ngtsc decorator docs extraction should extract property decorators',
  'ngtsc decorator docs extraction should extract property decorators with a type alias',
  'ngtsc decorator docs extraction should extract the decorator with some deprecated signatures',
  'ngtsc directive docs extraction selector alias extraction should extract alias from element with attribute selector',
  'ngtsc directive docs extraction selector alias extraction should extract alias from ng-template with attribute selector',
  'ngtsc directive docs extraction selector alias extraction should extract alias from simple attribute selector',
  'ngtsc directive docs extraction selector alias extraction should extract aliases from complex selector with element and multiple attributes',
  'ngtsc directive docs extraction selector alias extraction should extract multiple aliases from multiple attribute selectors',
  'ngtsc directive docs extraction selector alias extraction should handle empty selector',
  'ngtsc directive docs extraction selector alias extraction should not extract aliases from class selector',
  'ngtsc directive docs extraction selector alias extraction should not extract aliases from element-only selector',
  'ngtsc directive docs extraction should extract NgModule component info',
  'ngtsc directive docs extraction should extract NgModule directive info',
  'ngtsc directive docs extraction should extract getters and setters as inputs',
  'ngtsc directive docs extraction should extract input and output info for a component',
  'ngtsc directive docs extraction should extract input and output info for a directive',
  'ngtsc directive docs extraction should extract standalone component info',
  'ngtsc directive docs extraction should extract standalone directive info',
  'ngtsc docs extraction filtering should extract the type declaration if the value declaration is private',
  'ngtsc docs extraction filtering should not extract Angular-private symbols',
  'ngtsc docs: @docsPrivate tag should error if marked as private without reasoning',
  'ngtsc docs: @docsPrivate tag should omit class annotated with `@docsPrivate`',
  'ngtsc docs: @docsPrivate tag should omit constant annotated with `@docsPrivate`',
  'ngtsc docs: @docsPrivate tag should omit function annotated with `@docsPrivate`',
  'ngtsc docs: @docsPrivate tag should omit interface annotated with `@docsPrivate`',
  'ngtsc enum docs extraction should extract enum info with explicit values',
  'ngtsc enum docs extraction should extract enum info without explicit values',
  'ngtsc function docs extraction should extract a function with a rest parameter',
  'ngtsc function docs extraction should extract function generics',
  'ngtsc function docs extraction should extract function with parameters',
  'ngtsc function docs extraction should extract functions',
  'ngtsc function docs extraction should extract imported symbols from other angular packages',
  'ngtsc function docs extraction should extract overloaded functions',
  'ngtsc function docs extraction should extract type predicates as return type of type guards',
  'ngtsc function docs extraction should not extract imported symbols from non angular packages',
  'ngtsc function docs extraction should not extract private symbols',
  'ngtsc function docs extraction should not extract symbols from private packages',
  'ngtsc function docs extraction should prefer implementation docs over overload docs',
  'ngtsc function docs extraction should use overload docs when implementation has no docs',
  'ngtsc initializer API docs extraction function-based should extract container description',
  'ngtsc initializer API docs extraction function-based should extract container tags',
  'ngtsc initializer API docs extraction function-based should extract name',
  'ngtsc initializer API docs extraction function-based should extract top-level call signatures',
  'ngtsc initializer API docs extraction function-based should have an empty list of sub-properties',
  'ngtsc initializer API docs extraction interface-based should extract container description',
  'ngtsc initializer API docs extraction interface-based should extract container tags',
  'ngtsc initializer API docs extraction interface-based should extract individual return types',
  'ngtsc initializer API docs extraction interface-based should extract name',
  'ngtsc initializer API docs extraction interface-based should extract sub-property call signatures',
  'ngtsc initializer API docs extraction interface-based should extract top-level call signatures',
  'ngtsc interface docs extraction should extract a method with a rest parameter',
  'ngtsc interface docs extraction should extract call signatures',
  'ngtsc interface docs extraction should extract getters and setters',
  'ngtsc interface docs extraction should extract inherited getters/setters',
  'ngtsc interface docs extraction should extract inherited members',
  'ngtsc interface docs extraction should extract interface members',
  'ngtsc interface docs extraction should extract interface method params',
  'ngtsc interface docs extraction should extract interfaces',
  'ngtsc interface docs extraction should extract member tags',
  'ngtsc interface docs extraction should extract return type for call signature',
  'ngtsc interface docs extraction should not extract private interface members',
  'ngtsc jsdoc extraction should escape Angular control flow syntax',
  'ngtsc jsdoc extraction should escape decorator names',
  'ngtsc jsdoc extraction should extract a @see jsdoc tag',
  'ngtsc jsdoc extraction should extract a description from a multi-line jsdoc',
  'ngtsc jsdoc extraction should extract a description from a single-line jsdoc',
  'ngtsc jsdoc extraction should extract class member descriptions',
  'ngtsc jsdoc extraction should extract function parameter descriptions',
  'ngtsc jsdoc extraction should extract jsdoc from all types of top-level statement',
  'ngtsc jsdoc extraction should extract jsdoc with a multi-line tags',
  'ngtsc jsdoc extraction should extract jsdoc with a single-line tag',
  'ngtsc jsdoc extraction should extract jsdoc with an empty tag',
  'ngtsc jsdoc extraction should extract jsdoc with custom tags',
  'ngtsc jsdoc extraction should extract raw comment blocks',
  'ngtsc jsdoc extraction should handle a jsdoc with a trailing ()',
  'ngtsc jsdoc extraction should handle a jsdoc with a url',
  'ngtsc pipe docs extraction should extract NgModule pipe info',
  'ngtsc pipe docs extraction should extract standalone pipe info',
  'ngtsc re-export docs extraction should extract info from a named re-export',
  'ngtsc re-export docs extraction should extract info from a transitive re-export',
  'ngtsc re-export docs extraction should extract info from an aggregate re-export',
  'ngtsc re-export docs extraction should extract info from an aliased re-export',
  'ngtsc type alias docs extraction should extract type aliases based on primitives',
  'ngtsc type alias docs extraction should extract type aliases based with generics',
  'ngtsc type alias docs extraction should extract type aliases for objects',

  // `TemplateTypeChecker` Language Service helper queries (`getPrimaryAngularDecorator`,
  // `getOwningNgModule`, `getPotentialPipes`) are not implemented in NGP.
  'full type checking can retrieve candidate pipes` which are out of scope',
  'full type checking supports `getOwningNgModule()` for components',
  'full type checking supports `getOwningNgModule()` for pipes',
  'full type checking supports `getOwningNgModule()` for standalone components (which should be null)',
  'full type checking supports `getPrimaryAngularDecorator()` for NgModules',
  'full type checking supports `getPrimaryAngularDecorator()` for components',
  'full type checking supports `getPrimaryAngularDecorator()` for pipes',

  // Legacy `xi18n` message extraction (`mainXi18n`) is not implemented in NGP.
  'ngtsc xi18n should extract xlf',
  'ngtsc xi18n should extract xlf2',
  'ngtsc xi18n should extract xmb',
  'ngtsc xi18n should not emit js',
]);

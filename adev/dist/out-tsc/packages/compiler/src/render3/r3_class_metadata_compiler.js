/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';
export function compileClassMetadata(metadata) {
  const fnCall = internalCompileClassMetadata(metadata);
  return o.arrowFn([], [devOnlyGuardedExpression(fnCall).toStmt()]).callFn([]);
}
/** Compiles only the `setClassMetadata` call without any additional wrappers. */
function internalCompileClassMetadata(metadata) {
  return o
    .importExpr(R3.setClassMetadata)
    .callFn([
      metadata.type,
      metadata.decorators,
      metadata.ctorParameters ?? o.literal(null),
      metadata.propDecorators ?? o.literal(null),
    ]);
}
/**
 * Wraps the `setClassMetadata` function with extra logic that dynamically
 * loads dependencies from `@defer` blocks.
 *
 * Generates a call like this:
 * ```ts
 * setClassMetadataAsync(type, () => [
 *   import('./cmp-a').then(m => m.CmpA);
 *   import('./cmp-b').then(m => m.CmpB);
 * ], (CmpA, CmpB) => {
 *   setClassMetadata(type, decorators, ctorParameters, propParameters);
 * });
 * ```
 *
 * Similar to the `setClassMetadata` call, it's wrapped into the `ngDevMode`
 * check to tree-shake away this code in production mode.
 */
export function compileComponentClassMetadata(metadata, dependencies) {
  if (dependencies === null || dependencies.length === 0) {
    // If there are no deferrable symbols - just generate a regular `setClassMetadata` call.
    return compileClassMetadata(metadata);
  }
  return internalCompileSetClassMetadataAsync(
    metadata,
    dependencies.map((dep) => new o.FnParam(dep.symbolName, o.DYNAMIC_TYPE)),
    compileComponentMetadataAsyncResolver(dependencies),
  );
}
/**
 * Identical to `compileComponentClassMetadata`. Used for the cases where we're unable to
 * analyze the deferred block dependencies, but we have a reference to the compiled
 * dependency resolver function that we can use as is.
 * @param metadata Class metadata for the internal `setClassMetadata` call.
 * @param deferResolver Expression representing the deferred dependency loading function.
 * @param deferredDependencyNames Names of the dependencies that are being loaded asynchronously.
 */
export function compileOpaqueAsyncClassMetadata(metadata, deferResolver, deferredDependencyNames) {
  return internalCompileSetClassMetadataAsync(
    metadata,
    deferredDependencyNames.map((name) => new o.FnParam(name, o.DYNAMIC_TYPE)),
    deferResolver,
  );
}
/**
 * Internal logic used to compile a `setClassMetadataAsync` call.
 * @param metadata Class metadata for the internal `setClassMetadata` call.
 * @param wrapperParams Parameters to be set on the callback that wraps `setClassMetata`.
 * @param dependencyResolverFn Function to resolve the deferred dependencies.
 */
function internalCompileSetClassMetadataAsync(metadata, wrapperParams, dependencyResolverFn) {
  // Omit the wrapper since it'll be added around `setClassMetadataAsync` instead.
  const setClassMetadataCall = internalCompileClassMetadata(metadata);
  const setClassMetaWrapper = o.arrowFn(wrapperParams, [setClassMetadataCall.toStmt()]);
  const setClassMetaAsync = o
    .importExpr(R3.setClassMetadataAsync)
    .callFn([metadata.type, dependencyResolverFn, setClassMetaWrapper]);
  return o.arrowFn([], [devOnlyGuardedExpression(setClassMetaAsync).toStmt()]).callFn([]);
}
/**
 * Compiles the function that loads the dependencies for the
 * entire component in `setClassMetadataAsync`.
 */
export function compileComponentMetadataAsyncResolver(dependencies) {
  const dynamicImports = dependencies.map(({symbolName, importPath, isDefaultImport}) => {
    // e.g. `(m) => m.CmpA`
    const innerFn =
      // Default imports are always accessed through the `default` property.
      o.arrowFn(
        [new o.FnParam('m', o.DYNAMIC_TYPE)],
        o.variable('m').prop(isDefaultImport ? 'default' : symbolName),
      );
    // e.g. `import('./cmp-a').then(...)`
    return new o.DynamicImportExpr(importPath).prop('then').callFn([innerFn]);
  });
  // e.g. `() => [ ... ];`
  return o.arrowFn([], o.literalArr(dynamicImports));
}
//# sourceMappingURL=r3_class_metadata_compiler.js.map

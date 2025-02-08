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
import {R3DeferPerComponentDependency} from './view/api';

export type CompileClassMetadataFn = (metadata: R3ClassMetadata) => o.Expression;

/**
 * Metadata of a class which captures the original Angular decorators of a class. The original
 * decorators are preserved in the generated code to allow TestBed APIs to recompile the class
 * using the original decorator with a set of overrides applied.
 */
export interface R3ClassMetadata {
  /**
   * The class type for which the metadata is captured.
   */
  type: o.Expression;

  /**
   * An expression representing the Angular decorators that were applied on the class.
   */
  decorators: o.Expression;

  /**
   * An expression representing the Angular decorators applied to constructor parameters, or `null`
   * if there is no constructor.
   */
  ctorParameters: o.Expression | null;

  /**
   * An expression representing the Angular decorators that were applied on the properties of the
   * class, or `null` if no properties have decorators.
   */
  propDecorators: o.Expression | null;
}

export function compileClassMetadata(metadata: R3ClassMetadata): o.InvokeFunctionExpr {
  const fnCall = internalCompileClassMetadata(metadata);
  return o.arrowFn([], [devOnlyGuardedExpression(fnCall).toStmt()]).callFn([]);
}

/** Compiles only the `setClassMetadata` call without any additional wrappers. */
function internalCompileClassMetadata(metadata: R3ClassMetadata): o.InvokeFunctionExpr {
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
export function compileComponentClassMetadata(
  metadata: R3ClassMetadata,
  dependencies: R3DeferPerComponentDependency[] | null,
): o.Expression {
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
export function compileOpaqueAsyncClassMetadata(
  metadata: R3ClassMetadata,
  deferResolver: o.Expression,
  deferredDependencyNames: string[],
): o.Expression {
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
function internalCompileSetClassMetadataAsync(
  metadata: R3ClassMetadata,
  wrapperParams: o.FnParam[],
  dependencyResolverFn: o.Expression,
): o.Expression {
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
export function compileComponentMetadataAsyncResolver(
  dependencies: R3DeferPerComponentDependency[],
): o.ArrowFunctionExpr {
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

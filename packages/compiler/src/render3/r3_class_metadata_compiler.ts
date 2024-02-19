/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../output/output_ast';

import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';

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
  ctorParameters: o.Expression|null;

  /**
   * An expression representing the Angular decorators that were applied on the properties of the
   * class, or `null` if no properties have decorators.
   */
  propDecorators: o.Expression|null;
}

export function compileClassMetadata(metadata: R3ClassMetadata): o.Expression {
  // Generate an ngDevMode guarded call to setClassMetadata with the class identifier and its
  // metadata.
  const fnCall = o.importExpr(R3.setClassMetadata).callFn([
    metadata.type,
    metadata.decorators,
    metadata.ctorParameters ?? o.literal(null),
    metadata.propDecorators ?? o.literal(null),
  ]);
  const iife = o.arrowFn([], [devOnlyGuardedExpression(fnCall).toStmt()]);
  return iife.callFn([]);
}

/**
 * Wraps the `setClassMetadata` function with extra logic that dynamically
 * loads dependencies from `@defer` blocks.
 *
 * Generates a call like this:
 * ```
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
    deferrableTypes: Map<string, {importPath: string, isDefaultImport: boolean}>|
    null): o.Expression {
  if (deferrableTypes === null || deferrableTypes.size === 0) {
    // If there are no deferrable symbols - just generate a regular `setClassMetadata` call.
    return compileClassMetadata(metadata);
  }

  const dynamicImports: o.Expression[] = [];
  const importedSymbols: o.FnParam[] = [];
  for (const [symbolName, {importPath, isDefaultImport}] of deferrableTypes) {
    // e.g. `(m) => m.CmpA`
    const innerFn =
        // Default imports are always accessed through the `default` property.
        o.arrowFn(
            [new o.FnParam('m', o.DYNAMIC_TYPE)],
            o.variable('m').prop(isDefaultImport ? 'default' : symbolName));

    // e.g. `import('./cmp-a').then(...)`
    const importExpr = (new o.DynamicImportExpr(importPath)).prop('then').callFn([innerFn]);

    dynamicImports.push(importExpr);
    importedSymbols.push(new o.FnParam(symbolName, o.DYNAMIC_TYPE));
  }

  // e.g. `() => [ ... ];`
  const dependencyLoadingFn = o.arrowFn([], o.literalArr(dynamicImports));

  // e.g. `setClassMetadata(...)`
  const setClassMetadataCall = o.importExpr(R3.setClassMetadata).callFn([
    metadata.type,
    metadata.decorators,
    metadata.ctorParameters ?? o.literal(null),
    metadata.propDecorators ?? o.literal(null),
  ]);

  // e.g. `(CmpA) => setClassMetadata(...)`
  const setClassMetaWrapper = o.arrowFn(importedSymbols, [setClassMetadataCall.toStmt()]);

  // Final `setClassMetadataAsync()` call with all arguments
  const setClassMetaAsync = o.importExpr(R3.setClassMetadataAsync).callFn([
    metadata.type, dependencyLoadingFn, setClassMetaWrapper
  ]);

  // Generate an ngDevMode guarded call to `setClassMetadataAsync` with
  // the class identifier and its metadata, so that this call can be tree-shaken.
  const iife = o.arrowFn([], [devOnlyGuardedExpression(setClassMetaAsync).toStmt()]);
  return iife.callFn([]);
}

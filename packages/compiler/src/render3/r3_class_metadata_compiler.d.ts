/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import { R3DeferPerComponentDependency } from './view/api';
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
export declare function compileClassMetadata(metadata: R3ClassMetadata): o.InvokeFunctionExpr;
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
export declare function compileComponentClassMetadata(metadata: R3ClassMetadata, dependencies: R3DeferPerComponentDependency[] | null): o.Expression;
/**
 * Identical to `compileComponentClassMetadata`. Used for the cases where we're unable to
 * analyze the deferred block dependencies, but we have a reference to the compiled
 * dependency resolver function that we can use as is.
 * @param metadata Class metadata for the internal `setClassMetadata` call.
 * @param deferResolver Expression representing the deferred dependency loading function.
 * @param deferredDependencyNames Names of the dependencies that are being loaded asynchronously.
 */
export declare function compileOpaqueAsyncClassMetadata(metadata: R3ClassMetadata, deferResolver: o.Expression, deferredDependencyNames: string[]): o.Expression;
/**
 * Compiles the function that loads the dependencies for the
 * entire component in `setClassMetadataAsync`.
 */
export declare function compileComponentMetadataAsyncResolver(dependencies: R3DeferPerComponentDependency[]): o.ArrowFunctionExpr;

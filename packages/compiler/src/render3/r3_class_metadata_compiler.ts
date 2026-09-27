/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';

import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression, tsIgnoreComment} from './util';
import {R3DeferPerComponentDependency} from './view/api';

export type CompileClassMetadataFn = (metadata: R3ClassMetadata) => o.Expression;

/**
 * A single constructor parameter captured in the `ctorParameters` callback of `setClassMetadata`.
 */
export interface R3ClassMetadataCtorParameter {
  /**
   * An expression referring to the parameter's type in a value position, or `null` if the type
   * cannot be referenced at runtime. A `null` type is emitted as `undefined`.
   */
  type: o.Expression | null;

  /**
   * An expression representing the Angular decorators that were applied on the parameter, or
   * `null` if it has no decorators. A `null` value omits the `decorators` key entirely.
   */
  decorators: o.Expression | null;

  /**
   * Whether to guard `type` with a `@ts-ignore` comment.
   *
   * `setClassMetadata` is emitted into regular TypeScript, so a type that turns out not to exist
   * in a value position makes the generated code fail to compile with errors such as TS2693. Only
   * pass `false` when the reference is known to resolve to a value, which generally requires the
   * same whole-program information that a `ts.TypeChecker` has; a producer that cannot prove it
   * should pass `true` and let the reference fail at runtime instead of breaking the build.
   *
   * This is deliberately required rather than defaulted, so that every producer has to make the
   * choice explicitly.
   */
  suppressTypeErrors: boolean;
}

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
   * The Angular decorators applied to constructor parameters, or `null` if there is no
   * constructor.
   *
   * Prefer the structured form, which lets the compiler decide how the parameters are emitted.
   * An expression is still accepted for callers that only have the already-built callback, such
   * as the linker reading a partial declaration.
   */
  ctorParameters: o.Expression | R3ClassMetadataCtorParameter[] | null;

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
      compileCtorParameters(metadata.ctorParameters, /* allowSuppressions */ true),
      metadata.propDecorators ?? o.literal(null),
    ]);
}

/**
 * Builds the `ctorParameters` callback passed to `setClassMetadata`.
 *
 * @param ctorParameters The parameters to emit, or an already-built expression to pass through.
 * @param allowSuppressions Whether `@ts-ignore` may be attached to the emitted parameters. This is
 *     only useful when the result is emitted into TypeScript; partial declarations are published
 *     as JavaScript, so there is nothing to suppress there.
 */
export function compileCtorParameters(
  ctorParameters: o.Expression | R3ClassMetadataCtorParameter[] | null,
  allowSuppressions: boolean,
): o.Expression {
  if (ctorParameters === null) {
    return o.literal(null);
  }

  // Producers that built the callback themselves get it back untouched. There is no reliable way
  // to tell which part of an opaque expression holds a parameter type.
  if (!Array.isArray(ctorParameters)) {
    return ctorParameters;
  }

  const params = ctorParameters.map((param) => {
    const typeProp = new o.LiteralMapPropertyAssignment(
      'type',
      param.type ?? o.literal(undefined),
      /* quoted */ false,
    );

    // `undefined` is always valid in a value position, so it never needs to be suppressed.
    if (allowSuppressions && param.type !== null && param.suppressTypeErrors) {
      // The comment goes directly on the `type` property assignment rather than on the enclosing
      // parameter literal or callback. This ensures that even if an emitter or code formatter
      // (like Prettier or clang-format) splits the parameter object literal across multiple lines,
      // the `@ts-ignore` is attached to `type: ...` rather than suppressing `{`.
      //
      // Because `LiteralMapPropertyAssignment` is built fresh on each call, this also avoids
      // mutating caller-owned expressions (which can be shared with other emits like `ɵfac` or
      // cached across incremental rebuilds).
      typeProp.leadingComments = [tsIgnoreComment()];
    }

    const entries: o.LiteralMapEntry[] = [typeProp];

    if (param.decorators !== null) {
      entries.push(new o.LiteralMapPropertyAssignment('decorators', param.decorators, false));
    }

    return new o.LiteralMapExpr(entries);
  });

  return o.arrowFn([], o.literalArr(params));
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

  const uniqueDeps = new Map<string, R3DeferPerComponentDependency>();
  for (const dep of dependencies) {
    uniqueDeps.set(dep.symbolName, dep);
  }
  const dedupedDependencies = Array.from(uniqueDeps.values());

  return internalCompileSetClassMetadataAsync(
    metadata,
    dedupedDependencies.map((dep) => new o.FnParam(dep.symbolName, o.DYNAMIC_TYPE)),
    compileComponentMetadataAsyncResolver(dedupedDependencies),
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
    return new o.DynamicImportExpr(importPath)
      .prop('then')
      .callFn([innerFn], undefined, undefined, [
        // Necessary, because we might not generate extensions for the path
        // and TS may try to enforce it based on the compiler options.
        tsIgnoreComment(),
      ]);
  });

  // e.g. `() => [ ... ];`
  return o.arrowFn([], o.literalArr(dynamicImports));
}

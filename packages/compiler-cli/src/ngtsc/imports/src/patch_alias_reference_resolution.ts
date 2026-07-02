/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** Possible alias import declarations */
export type AliasImportDeclaration = ts.ImportSpecifier | ts.NamespaceImport | ts.ImportClause;

/**
 * Describes a TypeScript transformation context with the internal emit
 * resolver exposed. There are requests upstream in TypeScript to expose
 * that as public API: https://github.com/microsoft/TypeScript/issues/17516.
 */
interface TransformationContextWithResolver extends ts.TransformationContext {
  getEmitResolver: () => EmitResolver | undefined;
}

const patchedReferencedAliasesSymbol = Symbol('patchedReferencedAliases');

/** Describes a subset of the TypeScript internal emit resolver. */
interface EmitResolver {
  isReferencedAliasDeclaration?(node: ts.Node, ...args: unknown[]): void;
  [patchedReferencedAliasesSymbol]?: Set<AliasImportDeclaration>;
}

/**
 * Patches the alias declaration reference resolution for a given transformation context
 * so that TypeScript knows about the specified alias declarations being referenced.
 *
 * This exists because TypeScript performs analysis of import usage before transformers
 * run and doesn't refresh its state after transformations. This means that imports
 * for symbols used as constructor types are elided due to their original type-only usage.
 *
 * In reality though, since we downlevel decorators and constructor parameters, we want
 * these symbols to be retained in the JavaScript output as they will be used as values
 * at runtime. We can instruct TypeScript to preserve imports for such identifiers by
 * creating a mutable clone of a given import specifier/clause or namespace, but that
 * has the downside of preserving the full import in the JS output. See:
 * https://github.com/microsoft/TypeScript/blob/3eaa7c65f6f076a08a5f7f1946fd0df7c7430259/src/compiler/transformers/ts.ts#L242-L250.
 *
 * This is a trick the CLI used in the past  for constructor parameter downleveling in JIT:
 * https://github.com/angular/angular-cli/blob/b3f84cc5184337666ce61c07b7b9df418030106f/packages/ngtools/webpack/src/transformers/ctor-parameters.ts#L323-L325
 * The trick is not ideal though as it preserves the full import (as outlined before), and it
 * results in a slow-down due to the type checker being involved multiple times. The CLI worked
 * around this import preserving issue by having another complex post-process step that detects and
 * elides unused imports. Note that these unused imports could cause unused chunks being generated
 * by webpack if the application or library is not marked as side-effect free.
 *
 * This is not ideal though, as we basically re-implement the complex import usage resolution
 * from TypeScript. We can do better by letting TypeScript do the import eliding, but providing
 * information about the alias declarations (e.g. import specifiers) that should not be elided
 * because they are actually referenced (as they will now appear in static properties).
 *
 * More information about these limitations with transformers can be found in:
 *   1. https://github.com/Microsoft/TypeScript/issues/17552.
 *   2. https://github.com/microsoft/TypeScript/issues/17516.
 *   3. https://github.com/angular/tsickle/issues/635.
 *
 * The patch we apply to tell TypeScript about actual referenced aliases (i.e. imported symbols),
 * matches conceptually with the logic that runs internally in TypeScript when the
 * `emitDecoratorMetadata` flag is enabled. TypeScript basically surfaces the same problem and
 * solves it conceptually the same way, but obviously doesn't need to access an internal API.
 *
 * The set that is returned by this function is meant to be filled with import declaration nodes
 * that have been referenced in a value-position by the transform, such the installed patch can
 * ensure that those import declarations are not elided.
 *
 * If `null` is returned then the transform operates in an isolated context, i.e. using the
 * `ts.transform` API. In such scenario there is no information whether an alias declaration
 * is referenced, so all alias declarations are naturally preserved and explicitly registering
 * an alias declaration as used isn't necessary.
 *
 * See below. Note that this uses sourcegraph as the TypeScript checker file doesn't display on
 * Github.
 * https://sourcegraph.com/github.com/microsoft/TypeScript@3eaa7c65f6f076a08a5f7f1946fd0df7c7430259/-/blob/src/compiler/checker.ts#L31219-31257
 */
export function loadIsReferencedAliasDeclarationPatch(
  context: ts.TransformationContext,
): Set<ts.Declaration> | null {
  // If the `getEmitResolver` method is not available, TS most likely changed the
  // internal structure of the transformation context. We will abort gracefully.
  if (!isTransformationContextWithEmitResolver(context)) {
    throwIncompatibleTransformationContextError();
  }
  const emitResolver = context.getEmitResolver();
  if (emitResolver === undefined) {
    // In isolated `ts.transform` operations no emit resolver is present, return null as `isReferencedAliasDeclaration`
    // will never be invoked.
    return null;
  }

  // The emit resolver may have been patched already, in which case we return the set of referenced
  // aliases that was created when the patch was first applied.
  // See https://github.com/angular/angular/issues/40276.
  const existingReferencedAliases = emitResolver[patchedReferencedAliasesSymbol];
  if (existingReferencedAliases !== undefined) {
    return existingReferencedAliases;
  }

  const originalIsReferencedAliasDeclaration = emitResolver.isReferencedAliasDeclaration;
  // If the emit resolver does not have a function called `isReferencedAliasDeclaration`, then
  // we abort gracefully as most likely TS changed the internal structure of the emit resolver.
  if (originalIsReferencedAliasDeclaration === undefined) {
    throwIncompatibleTransformationContextError();
  }

  const referencedAliases = new Set<AliasImportDeclaration>();
  emitResolver.isReferencedAliasDeclaration = function (node, ...args) {
    if (isAliasImportDeclaration(node) && (referencedAliases as Set<ts.Node>).has(node)) {
      return true;
    }
    return originalIsReferencedAliasDeclaration.call(emitResolver, node, ...args);
  };
  return (emitResolver[patchedReferencedAliasesSymbol] = referencedAliases);
}

/**
 * Gets whether a given node corresponds to an import alias declaration. Alias
 * declarations can be import specifiers, namespace imports or import clauses
 * as these do not declare an actual symbol but just point to a target declaration.
 */
export function isAliasImportDeclaration(node: ts.Node): node is AliasImportDeclaration {
  return ts.isImportSpecifier(node) || ts.isNamespaceImport(node) || ts.isImportClause(node);
}

/** Whether the transformation context exposes its emit resolver. */
function isTransformationContextWithEmitResolver(
  context: ts.TransformationContext,
): context is TransformationContextWithResolver {
  return (context as Partial<TransformationContextWithResolver>).getEmitResolver !== undefined;
}

/**
 * Throws an error about an incompatible TypeScript version for which the alias
 * declaration reference resolution could not be monkey-patched. The error will
 * also propose potential solutions that can be applied by developers.
 */
function throwIncompatibleTransformationContextError(): never {
  throw Error(
    'Angular compiler is incompatible with this version of the TypeScript compiler.\n\n' +
      'If you recently updated TypeScript and this issue surfaces now, consider downgrading.\n\n' +
      'Please report an issue on the Angular repositories when this issue ' +
      'surfaces and you are using a supposedly compatible TypeScript version.',
  );
}

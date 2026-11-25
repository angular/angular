/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {getSourceFile} from '../../util/src/typescript';

import {
  AliasImportDeclaration,
  isAliasImportDeclaration,
  loadIsReferencedAliasDeclarationPatch,
  loadIsUnreferencedAliasDeclarationPatch,
} from './patch_alias_reference_resolution';

const DefaultImportDeclaration = Symbol('DefaultImportDeclaration');

interface WithDefaultImportDeclaration {
  [DefaultImportDeclaration]?: ts.ImportDeclaration;
}

/**
 * Attaches a default import declaration to `expr` to indicate the dependency of `expr` on the
 * default import.
 */
export function attachDefaultImportDeclaration(
  expr: WrappedNodeExpr<unknown>,
  importDecl: ts.ImportDeclaration,
): void {
  (expr as WithDefaultImportDeclaration)[DefaultImportDeclaration] = importDecl;
}

/**
 * Obtains the default import declaration that `expr` depends on, or `null` if there is no such
 * dependency.
 */
export function getDefaultImportDeclaration(
  expr: WrappedNodeExpr<unknown>,
): ts.ImportDeclaration | null {
  return (expr as WithDefaultImportDeclaration)[DefaultImportDeclaration] ?? null;
}

/**
 * TypeScript has trouble with generating default imports inside of transformers for some module
 * formats. The issue is that for the statement:
 *
 * import X from 'some/module';
 * console.log(X);
 *
 * TypeScript will not use the "X" name in generated code. For normal user code, this is fine
 * because references to X will also be renamed. However, if both the import and any references are
 * added in a transformer, TypeScript does not associate the two, and will leave the "X" references
 * dangling while renaming the import variable. The generated code looks something like:
 *
 * const module_1 = require('some/module');
 * console.log(X); // now X is a dangling reference.
 *
 * Therefore, we cannot synthetically add default imports, and must reuse the imports that users
 * include. Doing this poses a challenge for imports that are only consumed in the type position in
 * the user's code. If Angular reuses the imported symbol in a value position (for example, we
 * see a constructor parameter of type Foo and try to write "inject(Foo)") we will also end up with
 * a dangling reference, as TS will elide the import because it was only used in the type position
 * originally.
 *
 * To avoid this, the compiler must patch the emit resolver, and should only do this for imports
 * which are actually consumed. The `DefaultImportTracker` keeps track of these imports as they're
 * encountered and emitted, and implements a transform which can correctly flag the imports as
 * required.
 *
 * This problem does not exist for non-default imports as the compiler can easily insert
 * "import * as X" style imports for those, and the "X" identifier survives transformation.
 *
 * The opposite problem exists for imports that are only referenced from Angular decorators, or
 * (with `emitDecoratorMetadata`) from the types of the declarations that those decorate.
 * TypeScript considers such an import used, but once the compiler has removed the decorators the
 * import can be left without any reference. The tracker is told which decorators were removed, and
 * flags the imports that are no longer referred to so that they are elided.
 */
export class DefaultImportTracker {
  /**
   * A `Map` which tracks the `Set` of `ts.ImportClause`s for default imports that were used in
   * a given file name.
   */
  private sourceFileToUsedImports = new Map<string, Set<ts.ImportClause>>();

  /** A `Map` which tracks the `Set` of Angular decorators that were removed in a given file name. */
  private sourceFileToRemovedDecorators = new Map<string, Set<ts.Decorator>>();

  recordUsedImport(importDecl: ts.ImportDeclaration): void {
    if (importDecl.importClause) {
      addToSetInMap(
        this.sourceFileToUsedImports,
        getSourceFile(importDecl).fileName,
        importDecl.importClause,
      );
    }
  }

  recordRemovedDecorator(decorator: ts.Decorator): void {
    const original = ts.getOriginalNode(decorator, ts.isDecorator);
    addToSetInMap(this.sourceFileToRemovedDecorators, getSourceFile(original).fileName, original);
  }

  /**
   * Get a `ts.TransformerFactory` which will preserve default imports that were previously marked
   * as used, and elide the imports that were only referenced from removed decorators.
   *
   * This transformer must run after any other transformers which call `recordUsedImport` or
   * `recordRemovedDecorator`, as well as any custom `before` transformers that may synthesize
   * references to imported symbols.
   *
   * @param checker Resolves identifiers to the imports that they refer to. Unreferenced imports
   *     are only elided when it is provided.
   */
  importPreservingTransformer(checker?: ts.TypeChecker): ts.TransformerFactory<ts.SourceFile> {
    return (context) => {
      return (sourceFile) => {
        const clausesForFile = this.sourceFileToUsedImports.get(sourceFile.fileName);
        const removedDecorators = this.sourceFileToRemovedDecorators.get(sourceFile.fileName);

        if (clausesForFile !== undefined) {
          const clausesToPreserve = loadIsReferencedAliasDeclarationPatch(context);
          clausesForFile.forEach((clause) => clausesToPreserve?.add(clause));
        }

        // JSX refers to its factory without naming it, so the imports of such files are left as
        // they are.
        const isJsx = sourceFile.languageVariant === ts.LanguageVariant.JSX;
        if (checker !== undefined && removedDecorators !== undefined && !isJsx) {
          const aliasesToElide = loadIsUnreferencedAliasDeclarationPatch(context);
          const emitDecoratorMetadata = context.getCompilerOptions().emitDecoratorMetadata === true;
          findUnreferencedImports(
            sourceFile,
            removedDecorators,
            checker,
            emitDecoratorMetadata,
          ).forEach((alias) => aliasesToElide?.add(alias));
        }

        return sourceFile;
      };
    };
  }
}

/**
 * Finds the imports that were referenced from `removedDecorators`, and that the transformed
 * `sourceFile` no longer refers to.
 */
function findUnreferencedImports(
  sourceFile: ts.SourceFile,
  removedDecorators: ReadonlySet<ts.Decorator>,
  checker: ts.TypeChecker,
  emitDecoratorMetadata: boolean,
): Set<AliasImportDeclaration> {
  const candidates = new Set<AliasImportDeclaration>();
  const candidatesNamed = (name: string) =>
    Array.from(candidates).filter((alias) => alias.name?.text === name);

  // Resolves an identifier to the import that it refers to. An identifier that was synthesized
  // during the transform cannot be resolved, so it is assumed to refer to the import of that name.
  const importsOf = (node: ts.Identifier): AliasImportDeclaration[] => {
    const id = ts.getOriginalNode(node);
    if (!ts.isIdentifier(id) || id.parent === undefined) {
      return candidatesNamed(node.text);
    }
    // The symbol at the name of a shorthand property or at an export specifier is that of the
    // property or the export, rather than that of the value which it refers to.
    const {parent} = id;
    const symbol =
      ts.isShorthandPropertyAssignment(parent) && parent.name === id
        ? checker.getShorthandAssignmentValueSymbol(parent)
        : ts.isExportSpecifier(parent)
          ? checker.getExportSpecifierLocalTargetSymbol(parent)
          : checker.getSymbolAtLocation(id);
    const alias = symbol?.declarations?.find(isAliasImportDeclaration);
    return alias === undefined ? [] : [alias];
  };
  const forEachImportIn = (
    node: ts.Node | undefined,
    cb: (alias: AliasImportDeclaration) => void,
  ): void => {
    if (node !== undefined && ts.isIdentifier(node)) {
      importsOf(node).forEach(cb);
    } else if (node !== undefined) {
      ts.forEachChild(node, (child) => forEachImportIn(child, cb));
    }
  };

  // The candidates are the imports that the removed decorators referred to, along with the imports
  // that TypeScript marked as referenced in order to emit the metadata of the decorated nodes.
  const addCandidate = (alias: AliasImportDeclaration) => void candidates.add(alias);
  for (const decorator of removedDecorators) {
    forEachImportIn(decorator, addCandidate);
    if (emitDecoratorMetadata) {
      getDecoratorMetadataTypes(decorator, checker).forEach((type) =>
        forEachImportIn(type, addCandidate),
      );
    }
  }

  // A candidate is still referenced if the transformed file refers to it as a value.
  const markReferenced = (alias: AliasImportDeclaration) => void candidates.delete(alias);
  const visit = (node: ts.Node): void => {
    if (candidates.size === 0) {
      return;
    } else if (
      ts.isImportDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      (ts.isHeritageClause(node) && node.token === ts.SyntaxKind.ImplementsKeyword)
    ) {
      return;
    } else if (ts.isExpressionWithTypeArguments(node)) {
      // The base of a class or an instantiation expression, which unlike other type nodes is a
      // value.
      return visit(node.expression);
    } else if (ts.isTypeNode(node)) {
      return;
    } else if (ts.isIdentifier(node)) {
      return importsOf(node).forEach(markReferenced);
    } else if (emitDecoratorMetadata && ts.isDecorator(node)) {
      const decorator = ts.getOriginalNode(node);
      if (decorator.parent === undefined) {
        // It is not known what a decorator that was created by a transform ends up decorating.
        return candidates.clear();
      }
      // The metadata of a decorator that remains refers to the types that it serializes.
      getDecoratorMetadataTypes(decorator, checker).forEach((type) =>
        forEachImportIn(type, markReferenced),
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return candidates;
}

/**
 * Gets the types that `emitDecoratorMetadata` may serialize on behalf of `decorator`: the type of
 * a property, the parameter and return types of a method or of an accessor pair (as an accessor
 * shares its metadata with its counterpart), and the parameter types of the constructors for a
 * class. The decorator of a parameter contributes to the metadata of its function.
 */
function getDecoratorMetadataTypes(
  decorator: ts.Node,
  checker: ts.TypeChecker,
): (ts.TypeNode | undefined)[] {
  const decorated = ts.isParameter(decorator.parent) ? decorator.parent.parent : decorator.parent;
  if (ts.isPropertyDeclaration(decorated)) {
    return [decorated.type];
  }
  const functions: readonly ts.Node[] = ts.isClassLike(decorated)
    ? decorated.members.filter(ts.isConstructorDeclaration)
    : ts.isAccessor(decorated)
      ? (checker.getSymbolAtLocation(decorated.name)?.declarations ?? [decorated])
      : [decorated];
  return functions
    .filter(ts.isFunctionLike)
    .flatMap((fn) => [...fn.parameters.map((param) => param.type), fn.type]);
}

function addToSetInMap<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
  if (!map.has(key)) {
    map.set(key, new Set<V>());
  }
  map.get(key)!.add(value);
}

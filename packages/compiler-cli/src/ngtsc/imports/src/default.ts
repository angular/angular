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
  loadIsReferencedAliasDeclarationPatch,
} from './patch_alias_reference_resolution';

const DefaultImportDeclaration = Symbol('DefaultImportDeclaration');
const ReusedAliasImportDeclaration = Symbol('ReusedAliasImportDeclaration');

interface WithDefaultImportDeclaration {
  [DefaultImportDeclaration]?: ts.ImportDeclaration;
  [ReusedAliasImportDeclaration]?: AliasImportDeclaration;
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
 * Attaches the author's import binding to `expr` to indicate that `expr` refers to the imported
 * symbol through that binding, so that the binding has to survive emit.
 */
export function attachAliasImportDeclaration(
  expr: WrappedNodeExpr<unknown>,
  aliasDecl: AliasImportDeclaration,
): void {
  (expr as WithDefaultImportDeclaration)[ReusedAliasImportDeclaration] = aliasDecl;
}

/**
 * Obtains the import binding that `expr` refers to an imported symbol through, or `null` if it
 * does not reuse an import.
 */
export function getAliasImportDeclaration(
  expr: WrappedNodeExpr<unknown>,
): AliasImportDeclaration | null {
  return (expr as WithDefaultImportDeclaration)[ReusedAliasImportDeclaration] ?? null;
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
 * Non-default imports could be replaced by an inserted "import * as X" style import instead, but
 * the compiler reuses the author's named and namespace imports as well where it can, which needs
 * the same treatment.
 */
export class DefaultImportTracker {
  /**
   * A `Map` which tracks the `Set` of import bindings that generated code refers to in a given
   * file name.
   */
  private sourceFileToUsedImports = new Map<string, Set<AliasImportDeclaration>>();

  recordUsedImport(importDecl: ts.ImportDeclaration): void {
    if (importDecl.importClause) {
      this.recordUsedAlias(importDecl.importClause);
    }
  }

  recordUsedAlias(aliasDecl: AliasImportDeclaration): void {
    const sf = getSourceFile(aliasDecl);
    if (!this.sourceFileToUsedImports.has(sf.fileName)) {
      this.sourceFileToUsedImports.set(sf.fileName, new Set<AliasImportDeclaration>());
    }
    this.sourceFileToUsedImports.get(sf.fileName)!.add(aliasDecl);
  }

  /**
   * Narrows `importDecl` down to the bindings that generated code refers to, or returns `null` if
   * none of its bindings were reused.
   */
  filterUsedImport(importDecl: ts.ImportDeclaration): ts.ImportDeclaration | null {
    const original = ts.getOriginalNode(importDecl, ts.isImportDeclaration);
    const used = this.sourceFileToUsedImports.get(getSourceFile(original).fileName);
    const clause = importDecl.importClause;
    if (used === undefined || clause === undefined) {
      return null;
    }
    const name = used.has(ts.getOriginalNode(clause, ts.isImportClause)) ? clause.name : undefined;
    let namedBindings = clause.namedBindings;
    if (namedBindings !== undefined && ts.isNamespaceImport(namedBindings)) {
      if (!used.has(ts.getOriginalNode(namedBindings, ts.isNamespaceImport))) {
        namedBindings = undefined;
      }
    } else if (namedBindings !== undefined) {
      const elements = namedBindings.elements.filter((el) =>
        used.has(ts.getOriginalNode(el, ts.isImportSpecifier)),
      );
      namedBindings =
        elements.length > 0 ? ts.factory.updateNamedImports(namedBindings, elements) : undefined;
    }
    if (name === undefined && namedBindings === undefined) {
      return null;
    }
    return ts.factory.updateImportDeclaration(
      importDecl,
      importDecl.modifiers,
      ts.factory.updateImportClause(clause, clause.phaseModifier, name, namedBindings),
      importDecl.moduleSpecifier,
      importDecl.attributes,
    );
  }

  /**
   * Get a `ts.TransformerFactory` which will preserve the imports that were previously marked as
   * used.
   *
   * This transformer must run after any other transformers which call `recordUsedImport` or
   * `recordUsedAlias`.
   */
  importPreservingTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context) => {
      let aliasesToPreserve: Set<ts.Declaration> | null = null;

      return (sourceFile) => {
        const used = this.sourceFileToUsedImports.get(sourceFile.fileName);
        if (used !== undefined) {
          for (const alias of used) {
            if (aliasesToPreserve === null) {
              aliasesToPreserve = loadIsReferencedAliasDeclarationPatch(context);
            }
            aliasesToPreserve?.add(alias);
          }
        }
        return sourceFile;
      };
    };
  }
}

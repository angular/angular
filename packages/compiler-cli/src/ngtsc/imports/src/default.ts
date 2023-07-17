/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {getSourceFile} from '../../util/src/typescript';

import {loadIsReferencedAliasDeclarationPatch} from './patch_alias_reference_resolution';

const DefaultImportDeclaration = Symbol('DefaultImportDeclaration');

interface WithDefaultImportDeclaration {
  [DefaultImportDeclaration]?: ts.ImportDeclaration;
}

/**
 * Attaches a default import declaration to `expr` to indicate the dependency of `expr` on the
 * default import.
 */
export function attachDefaultImportDeclaration(
    expr: WrappedNodeExpr<unknown>, importDecl: ts.ImportDeclaration): void {
  (expr as WithDefaultImportDeclaration)[DefaultImportDeclaration] = importDecl;
}

/**
 * Obtains the default import declaration that `expr` depends on, or `null` if there is no such
 * dependency.
 */
export function getDefaultImportDeclaration(expr: WrappedNodeExpr<unknown>): ts.ImportDeclaration|
    null {
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
 */
export class DefaultImportTracker {
  /**
   * A `Map` which tracks the `Set` of `ts.ImportClause`s for default imports that were used in
   * a given file name.
   */
  private sourceFileToUsedImports = new Map<string, Set<ts.ImportClause>>();

  recordUsedImport(importDecl: ts.ImportDeclaration): void {
    if (importDecl.importClause) {
      const sf = getSourceFile(importDecl);

      // Add the default import declaration to the set of used import declarations for the file.
      if (!this.sourceFileToUsedImports.has(sf.fileName)) {
        this.sourceFileToUsedImports.set(sf.fileName, new Set<ts.ImportClause>());
      }
      this.sourceFileToUsedImports.get(sf.fileName)!.add(importDecl.importClause);
    }
  }

  /**
   * Get a `ts.TransformerFactory` which will preserve default imports that were previously marked
   * as used.
   *
   * This transformer must run after any other transformers which call `recordUsedImport`.
   */
  importPreservingTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return context => {
      let clausesToPreserve: Set<ts.Declaration>|null = null;

      return sourceFile => {
        const clausesForFile = this.sourceFileToUsedImports.get(sourceFile.fileName);

        if (clausesForFile !== undefined) {
          for (const clause of clausesForFile) {
            // Initialize the patch lazily so that apps that
            // don't use default imports aren't patched.
            if (clausesToPreserve === null) {
              clausesToPreserve = loadIsReferencedAliasDeclarationPatch(context);
            }
            clausesToPreserve.add(clause);
          }
        }

        return sourceFile;
      };
    };
  }
}

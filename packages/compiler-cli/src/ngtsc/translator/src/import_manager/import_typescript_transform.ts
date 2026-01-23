/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {loadIsReferencedAliasDeclarationPatch} from '../../../imports';

import type {ImportManager} from './import_manager';

/**
 * Creates a TypeScript transform for the given import manager.
 *
 *  - The transform updates existing imports with new symbols to be added.
 *  - The transform adds new necessary imports.
 *  - The transform inserts additional optional statements after imports.
 *  - The transform deletes any nodes that are marked for deletion by the manager.
 */
export function createTsTransformForImportManager(
  manager: ImportManager,
  extraStatementsForFiles?: Map<string, ts.Statement[]>,
): ts.TransformerFactory<ts.SourceFile> {
  return (ctx) => {
    const {
      affectedFiles,
      newImports,
      updatedImports,
      reusedOriginalAliasDeclarations,
      deletedImports,
    } = manager.finalize();

    // If we re-used existing source file alias declarations, mark those as referenced so TypeScript
    // doesn't drop these thinking they are unused.
    if (reusedOriginalAliasDeclarations.size > 0) {
      const referencedAliasDeclarations = loadIsReferencedAliasDeclarationPatch(ctx);
      if (referencedAliasDeclarations !== null) {
        reusedOriginalAliasDeclarations.forEach((aliasDecl) =>
          referencedAliasDeclarations.add(aliasDecl),
        );
      }
    }

    // Update the set of affected files to include files that need extra statements to be inserted.
    if (extraStatementsForFiles !== undefined) {
      for (const [fileName, statements] of extraStatementsForFiles.entries()) {
        if (statements.length > 0) {
          affectedFiles.add(fileName);
        }
      }
    }

    const visitStatement: ts.Visitor<ts.Node, ts.Node | undefined> = (node) => {
      if (!ts.isImportDeclaration(node)) {
        return node;
      }

      if (deletedImports.has(node)) {
        return undefined;
      }

      if (node.importClause === undefined || !ts.isImportClause(node.importClause)) {
        return node;
      }

      const clause = node.importClause;
      if (
        clause.namedBindings === undefined ||
        !ts.isNamedImports(clause.namedBindings) ||
        !updatedImports.has(clause.namedBindings)
      ) {
        return node;
      }

      const newClause = ctx.factory.updateImportClause(
        clause,
        clause.isTypeOnly,
        clause.name,
        updatedImports.get(clause.namedBindings),
      );
      const newImport = ctx.factory.updateImportDeclaration(
        node,
        node.modifiers,
        newClause,
        node.moduleSpecifier,
        node.attributes,
      );

      // This tricks TypeScript into thinking that the `importClause` is still optimizable.
      // By default, TS assumes, no specifiers are elide-able if the clause of the "original
      // node" has changed. google3:
      // typescript/unstable/src/compiler/transformers/ts.ts;l=456;rcl=611254538.
      ts.setOriginalNode(newImport, {
        importClause: newClause,
        kind: newImport.kind,
      } as Partial<ts.ImportDeclaration> as any);

      return newImport;
    };

    return (sourceFile) => {
      if (!affectedFiles.has(sourceFile.fileName)) {
        return sourceFile;
      }

      sourceFile = ts.visitEachChild(sourceFile, visitStatement, ctx);

      // Filter out the existing imports and the source file body.
      // All new statements will be inserted between them.
      const extraStatements = extraStatementsForFiles?.get(sourceFile.fileName) ?? [];
      const existingImports: ts.Statement[] = [];
      const body: ts.Statement[] = [];

      for (const statement of sourceFile.statements) {
        if (isImportStatement(statement)) {
          existingImports.push(statement);
        } else {
          body.push(statement);
        }
      }

      return ctx.factory.updateSourceFile(
        sourceFile,
        [
          ...existingImports,
          ...(newImports.get(sourceFile.fileName) ?? []),
          ...extraStatements,
          ...body,
        ],
        sourceFile.isDeclarationFile,
        sourceFile.referencedFiles,
        sourceFile.typeReferenceDirectives,
        sourceFile.hasNoDefaultLib,
        sourceFile.libReferenceDirectives,
      );
    };
  };
}

/** Whether the given statement is an import statement. */
function isImportStatement(stmt: ts.Statement): boolean {
  return (
    ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt) || ts.isNamespaceImport(stmt)
  );
}

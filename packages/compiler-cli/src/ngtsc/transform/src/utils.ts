/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ImportManager} from '../../translator';

/**
 * Adds extra imports in the import manage for this source file, after the existing imports
 * and before the module body.
 * Can optionally add extra statements (e.g. new constants) before the body as well.
 */
export function addImports(
    importManager: ImportManager, sf: ts.SourceFile,
    extraStatements: ts.Statement[] = []): ts.SourceFile {
  // Generate the import statements to prepend.
  const addedImports = importManager.getAllImports(sf.fileName).map(i => {
    return ts.createImportDeclaration(
        undefined, undefined,
        ts.createImportClause(undefined, ts.createNamespaceImport(ts.createIdentifier(i.as))),
        ts.createLiteral(i.name));
  });

  // Filter out the existing imports and the source file body. All new statements
  // will be inserted between them.
  const existingImports = sf.statements.filter(stmt => isImportStatement(stmt));
  const body = sf.statements.filter(stmt => !isImportStatement(stmt));
  // Prepend imports if needed.
  if (addedImports.length > 0) {
    sf.statements =
        ts.createNodeArray([...existingImports, ...addedImports, ...extraStatements, ...body]);
  }

  return sf;
}

function isImportStatement(stmt: ts.Statement): boolean {
  return ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt) ||
      ts.isNamespaceImport(stmt);
}

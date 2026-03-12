/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {DocEntry} from './entities';
import {extractConstant} from './constant_extractor';

/**
 * Extracts documentation entries from a variable statement. A variable statement can have
 * multiple declarations, so this function extracts a doc entry for each declaration.
 * @param statement The TypeScript AST node for the variable statement.
 * @param typeChecker The TypeScript type checker.
 */
export function extractFromVariableStatement(
  statement: ts.VariableStatement,
  typeChecker: ts.TypeChecker,
): DocEntry[] {
  return statement.declarationList.declarations.map((declaration) =>
    extractConstant(declaration, typeChecker),
  );
}

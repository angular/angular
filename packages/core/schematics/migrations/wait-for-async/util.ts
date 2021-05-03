/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isReferenceToImport} from '../../utils/typescript/symbol';

/** Finds calls to the `async` function. */
export function findAsyncReferences(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    asyncImportSpecifier: ts.ImportSpecifier) {
  const results = new Set<ts.Identifier>();

  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
        node.expression.text === 'async' &&
        isReferenceToImport(typeChecker, node.expression, asyncImportSpecifier)) {
      results.add(node.expression);
    }

    ts.forEachChild(node, visitNode);
  });

  return results;
}

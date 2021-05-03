/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getImportOfIdentifier} from '../../utils/typescript/imports';

/** Finds all the Identifier nodes in a file that refer to `Native` view encapsulation. */
export function findNativeEncapsulationNodes(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): Set<ts.Identifier> {
  const results = new Set<ts.Identifier>();

  sourceFile.forEachChild(function walkNode(node: ts.Node) {
    // Note that we look directly for nodes in the form of `<something>.Native`, rather than going
    // for `Component` class decorators, because it's much simpler and it allows us to handle cases
    // where `ViewEncapsulation.Native` might be used in a different context (e.g. a variable).
    // Using the encapsulation outside of a decorator is an edge case, but we do have public APIs
    // where it can be passed in (see the `defaultViewEncapsulation` property on the
    // `COMPILER_OPTIONS` provider).
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name) &&
        node.name.text === 'Native' && ts.isIdentifier(node.expression)) {
      const expressionImport = getImportOfIdentifier(typeChecker, node.expression);
      if (expressionImport && expressionImport.name === 'ViewEncapsulation' &&
          expressionImport.importModule === '@angular/core') {
        results.add(node.name);
      }
    } else {
      node.forEachChild(walkNode);
    }
  });

  return results;
}

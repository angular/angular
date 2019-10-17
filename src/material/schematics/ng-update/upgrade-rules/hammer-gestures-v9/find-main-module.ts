/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Finds the main Angular module within the specified source file. The first module
 * that is part of the "bootstrapModule" expression is returned.
 */
export function findMainModuleExpression(mainSourceFile: ts.SourceFile): ts.Expression|null {
  let foundModule: ts.Expression|null = null;
  const visitNode = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.arguments.length &&
        ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
        node.expression.name.text === 'bootstrapModule') {
      foundModule = node.arguments[0]!;
    } else {
      ts.forEachChild(node, visitNode);
    }
  };

  ts.forEachChild(mainSourceFile, visitNode);

  return foundModule;
}

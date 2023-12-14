/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export function lookupIdentifiersInSourceFile(
    sourceFile: ts.SourceFile, name: string): Set<ts.Identifier> {
  const results = new Set<ts.Identifier>();
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === name) {
      results.add(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return results;
}

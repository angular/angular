/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export function lookupIdentifiersInSourceFile(
  sourceFile: ts.SourceFile,
  names: string[],
): Set<ts.Identifier> {
  const results = new Set<ts.Identifier>();
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && names.includes(node.text)) {
      results.add(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return results;
}

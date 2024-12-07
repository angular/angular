/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** Gets all types that are inherited (implemented or extended). */
export function getInheritedTypes(
  node: ts.ClassLikeDeclaration | ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
): ts.Type[] {
  if (node.heritageClauses === undefined) {
    return [];
  }

  const heritageTypes: ts.Type[] = [];
  for (const heritageClause of node.heritageClauses) {
    for (const typeNode of heritageClause.types) {
      heritageTypes.push(checker.getTypeFromTypeNode(typeNode));
    }
  }
  return heritageTypes;
}

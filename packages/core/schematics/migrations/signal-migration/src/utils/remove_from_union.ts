/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export function removeFromUnionIfPossible(
  union: ts.UnionTypeNode,
  filter: (v: ts.TypeNode) => boolean,
): ts.TypeNode {
  const filtered = union.types.filter(filter);
  if (filtered.length === union.types.length) {
    return union;
  }
  // If there is only item at this point, avoid the union structure.
  if (filtered.length === 1) {
    return filtered[0];
  }
  return ts.factory.updateUnionTypeNode(union, ts.factory.createNodeArray(filtered));
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** Whether the given node is a descendant of the given ancestor. */
export function isNodeDescendantOf(node: ts.Node, ancestor: ts.Node | undefined): boolean {
  while (node) {
    if (node === ancestor) return true;
    node = node.parent;
  }
  return false;
}

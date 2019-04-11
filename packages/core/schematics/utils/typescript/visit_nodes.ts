/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export interface TypeScriptVisitor { visitNode(node: ts.Node): void; }

export function visitAllNodes(node: ts.Node, visitors: TypeScriptVisitor[]) {
  visitors.forEach(v => v.visitNode(node));
  ts.forEachChild(node, node => visitAllNodes(node, visitors));
}

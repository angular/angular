/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {readSpanComment} from './diagnostics';

/**
 * Given a `ts.Node` with source span comments, finds the first node whose source span comment
 * matches the given `sourceSpan`. Additionally, the `filter` function allows matching only
 * `ts.Nodes` of a given type, which provides the ability to select only matches of a given type
 * when there may be more than one.
 *
 * Returns `null` when no `ts.Node` matches the given conditions.
 */
export function findNodeWithSourceSpan<T extends ts.Node>(
    tcb: ts.Node, sourceSpan: ParseSourceSpan, filter: (node: ts.Node) => node is T): T|null {
  function visitor(node: ts.Node): T|undefined {
    const comment = readSpanComment(tcb.getSourceFile(), node);
    if (sourceSpan.start.offset === comment?.start && sourceSpan.end.offset === comment?.end &&
        filter(node)) {
      return node;
    }
    return node.forEachChild(visitor);
  }
  return tcb.forEachChild(visitor) ?? null;
}

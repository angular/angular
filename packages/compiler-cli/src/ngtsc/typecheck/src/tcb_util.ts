import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {readSpanComment} from './diagnostics';

export function findNodeWithAbsoluteSourceSpan<T extends ts.Node>(
    sourceSpan: AbsoluteSourceSpan, tcb: ts.Node, filter: (node: ts.Node) => node is T): T|null {
  function visitor(node: ts.Node): T|undefined {
    const comment = readSpanComment(tcb.getSourceFile(), node);
    if (sourceSpan.start === comment?.start && sourceSpan.end === comment?.end && filter(node)) {
      return node;
    }
    return node.forEachChild(visitor);
  }
  return tcb.forEachChild(visitor) ?? null;
}
export function findNodeWithSourceSpan<T extends ts.Node>(
    sourceSpan: ParseSourceSpan, tcb: ts.Node, filter: (node: ts.Node) => node is T): T|null {
  const absoluteSourceSpan = new AbsoluteSourceSpan(sourceSpan.start.offset, sourceSpan.end.offset);
  return findNodeWithAbsoluteSourceSpan(absoluteSourceSpan, tcb, filter);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteSourceSpan} from '@angular/compiler';
import ts from 'typescript';
const parseSpanComment = /^(\d+),(\d+)$/;
/**
 * Reads the trailing comments and finds the first match which is a span comment (i.e. 4,10) on a
 * node and returns it as an `AbsoluteSourceSpan`.
 *
 * Will return `null` if no trailing comments on the node match the expected form of a source span.
 */
export function readSpanComment(node, sourceFile = node.getSourceFile()) {
  return (
    ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        return null;
      }
      const commentText = sourceFile.text.substring(pos + 2, end - 2);
      const match = commentText.match(parseSpanComment);
      if (match === null) {
        return null;
      }
      return new AbsoluteSourceSpan(+match[1], +match[2]);
    }) || null
  );
}
/** Used to identify what type the comment is. */
export var CommentTriviaType;
(function (CommentTriviaType) {
  CommentTriviaType['DIAGNOSTIC'] = 'D';
  CommentTriviaType['EXPRESSION_TYPE_IDENTIFIER'] = 'T';
})(CommentTriviaType || (CommentTriviaType = {}));
/** Identifies what the TCB expression is for (for example, a directive declaration). */
export var ExpressionIdentifier;
(function (ExpressionIdentifier) {
  ExpressionIdentifier['DIRECTIVE'] = 'DIR';
  ExpressionIdentifier['COMPONENT_COMPLETION'] = 'COMPCOMP';
  ExpressionIdentifier['EVENT_PARAMETER'] = 'EP';
  ExpressionIdentifier['VARIABLE_AS_EXPRESSION'] = 'VAE';
})(ExpressionIdentifier || (ExpressionIdentifier = {}));
/** Tags the node with the given expression identifier. */
export function addExpressionIdentifier(node, identifier) {
  ts.addSyntheticTrailingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}`,
    /* hasTrailingNewLine */ false,
  );
}
const IGNORE_FOR_DIAGNOSTICS_MARKER = `${CommentTriviaType.DIAGNOSTIC}:ignore`;
/**
 * Tag the `ts.Node` with an indication that any errors arising from the evaluation of the node
 * should be ignored.
 */
export function markIgnoreDiagnostics(node) {
  ts.addSyntheticTrailingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    IGNORE_FOR_DIAGNOSTICS_MARKER,
    /* hasTrailingNewLine */ false,
  );
}
/** Returns true if the node has a marker that indicates diagnostics errors should be ignored.  */
export function hasIgnoreForDiagnosticsMarker(node, sourceFile) {
  return (
    ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        return null;
      }
      const commentText = sourceFile.text.substring(pos + 2, end - 2);
      return commentText === IGNORE_FOR_DIAGNOSTICS_MARKER;
    }) === true
  );
}
function makeRecursiveVisitor(visitor) {
  function recursiveVisitor(node) {
    const res = visitor(node);
    return res !== null ? res : node.forEachChild(recursiveVisitor);
  }
  return recursiveVisitor;
}
function getSpanFromOptions(opts) {
  let withSpan = null;
  if (opts.withSpan !== undefined) {
    if (opts.withSpan instanceof AbsoluteSourceSpan) {
      withSpan = opts.withSpan;
    } else {
      withSpan = {start: opts.withSpan.start.offset, end: opts.withSpan.end.offset};
    }
  }
  return withSpan;
}
/**
 * Given a `ts.Node` with finds the first node whose matching the criteria specified
 * by the `FindOptions`.
 *
 * Returns `null` when no `ts.Node` matches the given conditions.
 */
export function findFirstMatchingNode(tcb, opts) {
  const withSpan = getSpanFromOptions(opts);
  const withExpressionIdentifier = opts.withExpressionIdentifier;
  const sf = tcb.getSourceFile();
  const visitor = makeRecursiveVisitor((node) => {
    if (!opts.filter(node)) {
      return null;
    }
    if (withSpan !== null) {
      const comment = readSpanComment(node, sf);
      if (comment === null || withSpan.start !== comment.start || withSpan.end !== comment.end) {
        return null;
      }
    }
    if (
      withExpressionIdentifier !== undefined &&
      !hasExpressionIdentifier(sf, node, withExpressionIdentifier)
    ) {
      return null;
    }
    return node;
  });
  return tcb.forEachChild(visitor) ?? null;
}
/**
 * Given a `ts.Node` with source span comments, finds the first node whose source span comment
 * matches the given `sourceSpan`. Additionally, the `filter` function allows matching only
 * `ts.Nodes` of a given type, which provides the ability to select only matches of a given type
 * when there may be more than one.
 *
 * Returns `null` when no `ts.Node` matches the given conditions.
 */
export function findAllMatchingNodes(tcb, opts) {
  const withSpan = getSpanFromOptions(opts);
  const withExpressionIdentifier = opts.withExpressionIdentifier;
  const results = [];
  const stack = [tcb];
  const sf = tcb.getSourceFile();
  while (stack.length > 0) {
    const node = stack.pop();
    if (!opts.filter(node)) {
      stack.push(...node.getChildren());
      continue;
    }
    if (withSpan !== null) {
      const comment = readSpanComment(node, sf);
      if (comment === null || withSpan.start !== comment.start || withSpan.end !== comment.end) {
        stack.push(...node.getChildren());
        continue;
      }
    }
    if (
      withExpressionIdentifier !== undefined &&
      !hasExpressionIdentifier(sf, node, withExpressionIdentifier)
    ) {
      continue;
    }
    results.push(node);
  }
  return results;
}
export function hasExpressionIdentifier(sourceFile, node, identifier) {
  return (
    ts.forEachTrailingCommentRange(sourceFile.text, node.getEnd(), (pos, end, kind) => {
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        return false;
      }
      const commentText = sourceFile.text.substring(pos + 2, end - 2);
      return commentText === `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}`;
    }) || false
  );
}
//# sourceMappingURL=comments.js.map

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {ParseError} from '../parse_util';

import * as t from './r3_ast';
import {IDENTIFIER_PATTERN} from './util';

/** Creates a content block from an HTML AST node. */
export function createContentBlock(
  ast: html.Block,
  visitor: html.Visitor,
): {node: t.ContentBlock | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  if (ast.parameters.length !== 1) {
    errors.push(
      new ParseError(ast.startSourceSpan, '@content block must have exactly one parameter'),
    );
    return {node: null, errors};
  }

  const param = ast.parameters[0];
  let expr = param.expression.trim();
  if (expr.startsWith('(') && expr.endsWith(')')) {
    expr = expr.slice(1, -1).trim();
  }

  const parts = expr.split(',').map((p) => p.trim());
  if (parts.length !== 1 || parts[0] === '') {
    errors.push(
      new ParseError(ast.startSourceSpan, '@content block must have exactly one parameter'),
    );
    return {node: null, errors};
  }

  const name = parts[0];
  if (!IDENTIFIER_PATTERN.test(name)) {
    errors.push(
      new ParseError(param.sourceSpan, '@content name must be a valid JavaScript identifier'),
    );
    return {node: null, errors};
  }

  const node = new t.ContentBlock(
    name,
    html.visitAll(visitor, ast.children, ast.children),
    ast.nameSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    ast.endSourceSpan,
    ast.i18n,
  );
  return {node, errors};
}

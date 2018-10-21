/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as e from '../../../src/expression_parser/ast';
import * as a from '../../../src/render3/r3_ast';

export function findExpression(tmpl: a.Node[], expr: string): e.AST|null {
  const res = tmpl.reduce((found, node) => {
    if (found !== null) {
      return found;
    } else {
      return findExpressionInNode(node, expr);
    }
  }, null as e.AST | null);
  if (res instanceof e.ASTWithSource) {
    return res.ast;
  }
  return res;
}

function findExpressionInNode(node: a.Node, expr: string): e.AST|null {
  if (node instanceof a.Element || node instanceof a.Template) {
    return findExpression(
        [
          ...node.inputs,
          ...node.outputs,
          ...node.children,
        ],
        expr);
  } else if (node instanceof a.BoundAttribute || node instanceof a.BoundText) {
    const ts = toStringExpression(node.value);
    return toStringExpression(node.value) === expr ? node.value : null;
  } else if (node instanceof a.BoundEvent) {
    return toStringExpression(node.handler) === expr ? node.handler : null;
  } else {
    return null;
  }
}

export function toStringExpression(expr: e.AST): string {
  while (expr instanceof e.ASTWithSource) {
    expr = expr.ast;
  }
  if (expr instanceof e.PropertyRead) {
    if (expr.receiver instanceof e.ImplicitReceiver) {
      return expr.name;
    } else {
      return `${toStringExpression(expr.receiver)}.${expr.name}`;
    }
  } else if (expr instanceof e.ImplicitReceiver) {
    return '';
  } else if (expr instanceof e.Interpolation) {
    let str = '{{';
    for (let i = 0; i < expr.expressions.length; i++) {
      str += expr.strings[i] + toStringExpression(expr.expressions[i]);
    }
    str += expr.strings[expr.strings.length - 1] + '}}';
    return str;
  } else {
    throw new Error(`Unsupported type: ${(expr as any).constructor.name}`);
  }
}

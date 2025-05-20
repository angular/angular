/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as expr from './ast';

/** Serializes the given AST into a normalized string format. */
export function serialize(expression: expr.ASTWithSource): string {
  return expression.visit(new SerializeExpressionVisitor());
}

class SerializeExpressionVisitor implements expr.AstVisitor {
  visitUnary(ast: expr.Unary, context: any): string {
    return `${ast.operator}${ast.expr.visit(this, context)}`;
  }

  visitBinary(ast: expr.Binary, context: any): string {
    return `${ast.left.visit(this, context)} ${ast.operation} ${ast.right.visit(this, context)}`;
  }

  visitChain(ast: expr.Chain, context: any): string {
    return ast.expressions.map((e) => e.visit(this, context)).join('; ');
  }

  visitConditional(ast: expr.Conditional, context: any): string {
    return `${ast.condition.visit(this, context)} ? ${ast.trueExp.visit(
      this,
      context,
    )} : ${ast.falseExp.visit(this, context)}`;
  }

  visitThisReceiver(): string {
    return 'this';
  }

  visitImplicitReceiver(): string {
    return '';
  }

  visitInterpolation(ast: expr.Interpolation, context: any): string {
    return interleave(
      ast.strings,
      ast.expressions.map((e) => e.visit(this, context)),
    ).join('');
  }

  visitKeyedRead(ast: expr.KeyedRead, context: any): string {
    return `${ast.receiver.visit(this, context)}[${ast.key.visit(this, context)}]`;
  }

  visitKeyedWrite(ast: expr.KeyedWrite, context: any): string {
    return `${ast.receiver.visit(this, context)}[${ast.key.visit(
      this,
      context,
    )}] = ${ast.value.visit(this, context)}`;
  }

  visitLiteralArray(ast: expr.LiteralArray, context: any): string {
    return `[${ast.expressions.map((e) => e.visit(this, context)).join(', ')}]`;
  }

  visitLiteralMap(ast: expr.LiteralMap, context: any): string {
    return `{${zip(
      ast.keys.map((literal) => (literal.quoted ? `'${literal.key}'` : literal.key)),
      ast.values.map((value) => value.visit(this, context)),
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}}`;
  }

  visitLiteralPrimitive(ast: expr.LiteralPrimitive): string {
    if (ast.value === null) return 'null';

    switch (typeof ast.value) {
      case 'number':
      case 'boolean':
        return ast.value.toString();
      case 'undefined':
        return 'undefined';
      case 'string':
        return `'${ast.value.replace(/'/g, `\\'`)}'`;
      default:
        throw new Error(`Unsupported primitive type: ${ast.value}`);
    }
  }

  visitPipe(ast: expr.BindingPipe, context: any): string {
    return `${ast.exp.visit(this, context)} | ${ast.name}`;
  }

  visitPrefixNot(ast: expr.PrefixNot, context: any): string {
    return `!${ast.expression.visit(this, context)}`;
  }

  visitNonNullAssert(ast: expr.NonNullAssert, context: any): string {
    return `${ast.expression.visit(this, context)}!`;
  }

  visitPropertyRead(ast: expr.PropertyRead, context: any): string {
    if (ast.receiver instanceof expr.ImplicitReceiver) {
      return ast.name;
    } else {
      return `${ast.receiver.visit(this, context)}.${ast.name}`;
    }
  }

  visitPropertyWrite(ast: expr.PropertyWrite, context: any): string {
    if (ast.receiver instanceof expr.ImplicitReceiver) {
      return `${ast.name} = ${ast.value.visit(this, context)}`;
    } else {
      return `${ast.receiver.visit(this, context)}.${ast.name} = ${ast.value.visit(this, context)}`;
    }
  }

  visitSafePropertyRead(ast: expr.SafePropertyRead, context: any): string {
    return `${ast.receiver.visit(this, context)}?.${ast.name}`;
  }

  visitSafeKeyedRead(ast: expr.SafeKeyedRead, context: any): string {
    return `${ast.receiver.visit(this, context)}?.[${ast.key.visit(this, context)}]`;
  }

  visitCall(ast: expr.Call, context: any): string {
    return `${ast.receiver.visit(this, context)}(${ast.args
      .map((e) => e.visit(this, context))
      .join(', ')})`;
  }

  visitSafeCall(ast: expr.SafeCall, context: any): string {
    return `${ast.receiver.visit(this, context)}?.(${ast.args
      .map((e) => e.visit(this, context))
      .join(', ')})`;
  }

  visitTypeofExpression(ast: expr.TypeofExpression, context: any) {
    return `typeof ${ast.expression.visit(this, context)}`;
  }

  visitVoidExpression(ast: expr.VoidExpression, context: any) {
    return `void ${ast.expression.visit(this, context)}`;
  }

  visitASTWithSource(ast: expr.ASTWithSource, context: any): string {
    return ast.ast.visit(this, context);
  }

  visitTemplateLiteral(ast: expr.TemplateLiteral, context: any) {
    let result = '';
    for (let i = 0; i < ast.elements.length; i++) {
      result += ast.elements[i].visit(this, context);
      const expression = i < ast.expressions.length ? ast.expressions[i] : null;
      if (expression !== null) {
        result += '${' + expression.visit(this, context) + '}';
      }
    }
    return '`' + result + '`';
  }

  visitTemplateLiteralElement(ast: expr.TemplateLiteralElement, context: any) {
    return ast.text;
  }

  visitTaggedTemplateLiteral(ast: expr.TaggedTemplateLiteral, context: any) {
    return ast.tag.visit(this, context) + ast.template.visit(this, context);
  }

  visitParenthesizedExpression(ast: expr.ParenthesizedExpression, context: any) {
    return '(' + ast.expression.visit(this, context) + ')';
  }
}

/** Zips the two input arrays into a single array of pairs of elements at the same index. */
function zip<Left, Right>(left: Left[], right: Right[]): Array<[Left, Right]> {
  if (left.length !== right.length) throw new Error('Array lengths must match');

  return left.map((l, i) => [l, right[i]]);
}

/**
 * Interleaves the two arrays, starting with the first item on the left, then the first item
 * on the right, second item from the left, and so on. When the first array's items are exhausted,
 * the remaining items from the other array are included with no interleaving.
 */
function interleave<Left, Right>(left: Left[], right: Right[]): Array<Left | Right> {
  const result: Array<Left | Right> = [];

  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    if (index < left.length) result.push(left[index]);
    if (index < right.length) result.push(right[index]);
  }

  return result;
}

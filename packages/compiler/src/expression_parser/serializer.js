/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as expr from './ast';
/** Serializes the given AST into a normalized string format. */
export function serialize(expression) {
  return expression.visit(new SerializeExpressionVisitor());
}
class SerializeExpressionVisitor {
  visitUnary(ast, context) {
    return `${ast.operator}${ast.expr.visit(this, context)}`;
  }
  visitBinary(ast, context) {
    return `${ast.left.visit(this, context)} ${ast.operation} ${ast.right.visit(this, context)}`;
  }
  visitChain(ast, context) {
    return ast.expressions.map((e) => e.visit(this, context)).join('; ');
  }
  visitConditional(ast, context) {
    return `${ast.condition.visit(this, context)} ? ${ast.trueExp.visit(this, context)} : ${ast.falseExp.visit(this, context)}`;
  }
  visitThisReceiver() {
    return 'this';
  }
  visitImplicitReceiver() {
    return '';
  }
  visitInterpolation(ast, context) {
    return interleave(
      ast.strings,
      ast.expressions.map((e) => e.visit(this, context)),
    ).join('');
  }
  visitKeyedRead(ast, context) {
    return `${ast.receiver.visit(this, context)}[${ast.key.visit(this, context)}]`;
  }
  visitLiteralArray(ast, context) {
    return `[${ast.expressions.map((e) => e.visit(this, context)).join(', ')}]`;
  }
  visitLiteralMap(ast, context) {
    return `{${zip(
      ast.keys.map((literal) => (literal.quoted ? `'${literal.key}'` : literal.key)),
      ast.values.map((value) => value.visit(this, context)),
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}}`;
  }
  visitLiteralPrimitive(ast) {
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
  visitPipe(ast, context) {
    return `${ast.exp.visit(this, context)} | ${ast.name}`;
  }
  visitPrefixNot(ast, context) {
    return `!${ast.expression.visit(this, context)}`;
  }
  visitNonNullAssert(ast, context) {
    return `${ast.expression.visit(this, context)}!`;
  }
  visitPropertyRead(ast, context) {
    if (ast.receiver instanceof expr.ImplicitReceiver) {
      return ast.name;
    } else {
      return `${ast.receiver.visit(this, context)}.${ast.name}`;
    }
  }
  visitSafePropertyRead(ast, context) {
    return `${ast.receiver.visit(this, context)}?.${ast.name}`;
  }
  visitSafeKeyedRead(ast, context) {
    return `${ast.receiver.visit(this, context)}?.[${ast.key.visit(this, context)}]`;
  }
  visitCall(ast, context) {
    return `${ast.receiver.visit(this, context)}(${ast.args
      .map((e) => e.visit(this, context))
      .join(', ')})`;
  }
  visitSafeCall(ast, context) {
    return `${ast.receiver.visit(this, context)}?.(${ast.args
      .map((e) => e.visit(this, context))
      .join(', ')})`;
  }
  visitTypeofExpression(ast, context) {
    return `typeof ${ast.expression.visit(this, context)}`;
  }
  visitVoidExpression(ast, context) {
    return `void ${ast.expression.visit(this, context)}`;
  }
  visitRegularExpressionLiteral(ast, context) {
    return `/${ast.body}/${ast.flags || ''}`;
  }
  visitASTWithSource(ast, context) {
    return ast.ast.visit(this, context);
  }
  visitTemplateLiteral(ast, context) {
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
  visitTemplateLiteralElement(ast, context) {
    return ast.text;
  }
  visitTaggedTemplateLiteral(ast, context) {
    return ast.tag.visit(this, context) + ast.template.visit(this, context);
  }
  visitParenthesizedExpression(ast, context) {
    return '(' + ast.expression.visit(this, context) + ')';
  }
}
/** Zips the two input arrays into a single array of pairs of elements at the same index. */
function zip(left, right) {
  if (left.length !== right.length) throw new Error('Array lengths must match');
  return left.map((l, i) => [l, right[i]]);
}
/**
 * Interleaves the two arrays, starting with the first item on the left, then the first item
 * on the right, second item from the left, and so on. When the first array's items are exhausted,
 * the remaining items from the other array are included with no interleaving.
 */
function interleave(left, right) {
  const result = [];
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    if (index < left.length) result.push(left[index]);
    if (index < right.length) result.push(right[index]);
  }
  return result;
}
//# sourceMappingURL=serializer.js.map

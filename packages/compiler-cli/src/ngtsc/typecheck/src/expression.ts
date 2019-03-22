/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ASTWithSource, Binary, Conditional, Interpolation, KeyedRead, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, PropertyRead} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeCheckingConfig} from './api';
const BINARY_OPS = new Map<string, ts.SyntaxKind>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
  ['<', ts.SyntaxKind.LessThanToken],
  ['>', ts.SyntaxKind.GreaterThanToken],
  ['<=', ts.SyntaxKind.LessThanEqualsToken],
  ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
  ['==', ts.SyntaxKind.EqualsEqualsToken],
  ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
  ['*', ts.SyntaxKind.AsteriskToken],
  ['/', ts.SyntaxKind.SlashToken],
  ['%', ts.SyntaxKind.PercentToken],
  ['!=', ts.SyntaxKind.ExclamationEqualsToken],
  ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
  ['||', ts.SyntaxKind.BarBarToken],
  ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
  ['&', ts.SyntaxKind.AmpersandToken],
  ['|', ts.SyntaxKind.BarToken],
]);

/**
 * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
 * AST.
 */
export function astToTypescript(
    ast: AST, maybeResolve: (ast: AST) => ts.Expression | null,
    config: TypeCheckingConfig): ts.Expression {
  const resolved = maybeResolve(ast);
  if (resolved !== null) {
    return resolved;
  }
  // Branch based on the type of expression being processed.
  if (ast instanceof ASTWithSource) {
    // Fall through to the underlying AST.
    return astToTypescript(ast.ast, maybeResolve, config);
  } else if (ast instanceof PropertyRead) {
    // This is a normal property read - convert the receiver to an expression and emit the correct
    // TypeScript expression to read the property.
    const receiver = astToTypescript(ast.receiver, maybeResolve, config);
    return ts.createPropertyAccess(receiver, ast.name);
  } else if (ast instanceof Interpolation) {
    return astArrayToExpression(ast.expressions, maybeResolve, config);
  } else if (ast instanceof Binary) {
    const lhs = astToTypescript(ast.left, maybeResolve, config);
    const rhs = astToTypescript(ast.right, maybeResolve, config);
    const op = BINARY_OPS.get(ast.operation);
    if (op === undefined) {
      throw new Error(`Unsupported Binary.operation: ${ast.operation}`);
    }
    return ts.createBinary(lhs, op as any, rhs);
  } else if (ast instanceof LiteralPrimitive) {
    if (ast.value === undefined) {
      return ts.createIdentifier('undefined');
    } else if (ast.value === null) {
      return ts.createNull();
    } else {
      return ts.createLiteral(ast.value);
    }
  } else if (ast instanceof MethodCall) {
    const receiver = astToTypescript(ast.receiver, maybeResolve, config);
    const method = ts.createPropertyAccess(receiver, ast.name);
    const args = ast.args.map(expr => astToTypescript(expr, maybeResolve, config));
    return ts.createCall(method, undefined, args);
  } else if (ast instanceof Conditional) {
    const condExpr = astToTypescript(ast.condition, maybeResolve, config);
    const trueExpr = astToTypescript(ast.trueExp, maybeResolve, config);
    const falseExpr = astToTypescript(ast.falseExp, maybeResolve, config);
    return ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
  } else if (ast instanceof LiteralArray) {
    const elements = ast.expressions.map(expr => astToTypescript(expr, maybeResolve, config));
    return ts.createArrayLiteral(elements);
  } else if (ast instanceof LiteralMap) {
    const properties = ast.keys.map(({key}, idx) => {
      const value = astToTypescript(ast.values[idx], maybeResolve, config);
      return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
    });
    return ts.createObjectLiteral(properties, true);
  } else if (ast instanceof KeyedRead) {
    const receiver = astToTypescript(ast.obj, maybeResolve, config);
    const key = astToTypescript(ast.key, maybeResolve, config);
    return ts.createElementAccess(receiver, key);
  } else if (ast instanceof NonNullAssert) {
    const expr = astToTypescript(ast.expression, maybeResolve, config);
    return ts.createNonNullExpression(expr);
  } else {
    throw new Error(`Unknown node type: ${Object.getPrototypeOf(ast).constructor}`);
  }
}

/**
 * Convert an array of `AST` expressions into a single `ts.Expression`, by converting them all
 * and separating them with commas.
 */
function astArrayToExpression(
    astArray: AST[], maybeResolve: (ast: AST) => ts.Expression | null,
    config: TypeCheckingConfig): ts.Expression {
  // Reduce the `asts` array into a `ts.Expression`. Multiple expressions are combined into a
  // `ts.BinaryExpression` with a comma separator. First make a copy of the input array, as
  // it will be modified during the reduction.
  const asts = astArray.slice();
  return asts.reduce(
      (lhs, ast) => ts.createBinary(
          lhs, ts.SyntaxKind.CommaToken, astToTypescript(ast, maybeResolve, config)),
      astToTypescript(asts.pop() !, maybeResolve, config));
}

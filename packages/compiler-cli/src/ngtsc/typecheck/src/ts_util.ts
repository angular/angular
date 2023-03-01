/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';


/**
 * A `Set` of `ts.SyntaxKind`s of `ts.Expression` which are safe to wrap in a `ts.AsExpression`
 * without needing to be wrapped in parentheses.
 *
 * For example, `foo.bar()` is a `ts.CallExpression`, and can be safely cast to `any` with
 * `foo.bar() as any`. however, `foo !== bar` is a `ts.BinaryExpression`, and attempting to cast
 * without the parentheses yields the expression `foo !== bar as any`. This is semantically
 * equivalent to `foo !== (bar as any)`, which is not what was intended. Thus,
 * `ts.BinaryExpression`s need to be wrapped in parentheses before casting.
 */
//
const SAFE_TO_CAST_WITHOUT_PARENS: Set<ts.SyntaxKind> = new Set([
  // Expressions which are already parenthesized can be cast without further wrapping.
  ts.SyntaxKind.ParenthesizedExpression,

  // Expressions which form a single lexical unit leave no room for precedence issues with the cast.
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.CallExpression,
  ts.SyntaxKind.NonNullExpression,
  ts.SyntaxKind.ElementAccessExpression,
  ts.SyntaxKind.PropertyAccessExpression,
  ts.SyntaxKind.ArrayLiteralExpression,
  ts.SyntaxKind.ObjectLiteralExpression,

  // The same goes for various literals.
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.UndefinedKeyword,
]);

export function tsCastToAny(expr: ts.Expression): ts.Expression {
  // Wrap `expr` in parentheses if needed (see `SAFE_TO_CAST_WITHOUT_PARENS` above).
  if (!SAFE_TO_CAST_WITHOUT_PARENS.has(expr.kind)) {
    expr = ts.factory.createParenthesizedExpression(expr);
  }

  // The outer expression is always wrapped in parentheses.
  return ts.factory.createParenthesizedExpression(ts.factory.createAsExpression(
      expr, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
}


/**
 * Create an expression which instantiates an element by its HTML tagName.
 *
 * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
 * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
 */
export function tsCreateElement(tagName: string): ts.Expression {
  const createElement = ts.factory.createPropertyAccessExpression(
      /* expression */ ts.factory.createIdentifier('document'), 'createElement');
  return ts.factory.createCallExpression(
      /* expression */ createElement,
      /* typeArguments */ undefined,
      /* argumentsArray */[ts.factory.createStringLiteral(tagName)]);
}

/**
 * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
 *
 * The initializer `null!` is used to bypass strict variable initialization checks.
 *
 * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
 */
export function tsDeclareVariable(id: ts.Identifier, type: ts.TypeNode): ts.VariableStatement {
  const decl = ts.factory.createVariableDeclaration(
      /* name */ id,
      /* exclamationToken */ undefined,
      /* type */ type,
      /* initializer */ ts.factory.createNonNullExpression(ts.factory.createNull()));
  return ts.factory.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Creates a `ts.TypeQueryNode` for a coerced input.
 *
 * For example: `typeof MatInput.ngAcceptInputType_value`, where MatInput is `typeName` and `value`
 * is the `coercedInputName`.
 *
 * @param typeName The `EntityName` of the Directive where the static coerced input is defined.
 * @param coercedInputName The field name of the coerced input.
 */
export function tsCreateTypeQueryForCoercedInput(
    typeName: ts.EntityName, coercedInputName: string): ts.TypeQueryNode {
  return ts.factory.createTypeQueryNode(
      ts.factory.createQualifiedName(typeName, `ngAcceptInputType_${coercedInputName}`));
}

/**
 * Create a `ts.VariableStatement` that initializes a variable with a given expression.
 *
 * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
 * expression.
 */
export function tsCreateVariable(
    id: ts.Identifier, initializer: ts.Expression): ts.VariableStatement {
  const decl = ts.factory.createVariableDeclaration(
      /* name */ id,
      /* exclamationToken */ undefined,
      /* type */ undefined,
      /* initializer */ initializer);
  return ts.factory.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Construct a `ts.CallExpression` that calls a method on a receiver.
 */
export function tsCallMethod(
    receiver: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.CallExpression {
  const methodAccess = ts.factory.createPropertyAccessExpression(receiver, methodName);
  return ts.factory.createCallExpression(
      /* expression */ methodAccess,
      /* typeArguments */ undefined,
      /* argumentsArray */ args);
}

export function isAccessExpression(node: ts.Node): node is ts.ElementAccessExpression|
    ts.PropertyAccessExpression {
  return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
}

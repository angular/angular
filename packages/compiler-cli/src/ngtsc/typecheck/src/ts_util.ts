/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassDeclaration} from '../../reflection';

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
    expr = ts.createParen(expr);
  }

  // The outer expression is always wrapped in parentheses.
  return ts.createParen(
      ts.createAsExpression(expr, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
}


/**
 * Create an expression which instantiates an element by its HTML tagName.
 *
 * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
 * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
 */
export function tsCreateElement(tagName: string): ts.Expression {
  const createElement = ts.createPropertyAccess(
      /* expression */ ts.createIdentifier('document'), 'createElement');
  return ts.createCall(
      /* expression */ createElement,
      /* typeArguments */ undefined,
      /* argumentsArray */[ts.createLiteral(tagName)]);
}

/**
 * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
 *
 * The initializer `null!` is used to bypass strict variable initialization checks.
 *
 * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
 */
export function tsDeclareVariable(id: ts.Identifier, type: ts.TypeNode): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ type,
      /* initializer */ ts.createNonNullExpression(ts.createNull()));
  return ts.createVariableStatement(
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
  return ts.createTypeQueryNode(
      ts.createQualifiedName(typeName, `ngAcceptInputType_${coercedInputName}`));
}

/**
 * Create a `ts.VariableStatement` that initializes a variable with a given expression.
 *
 * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
 * expression.
 */
export function tsCreateVariable(
    id: ts.Identifier, initializer: ts.Expression): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ undefined,
      /* initializer */ initializer);
  return ts.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Construct a `ts.CallExpression` that calls a method on a receiver.
 */
export function tsCallMethod(
    receiver: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.CallExpression {
  const methodAccess = ts.createPropertyAccess(receiver, methodName);
  return ts.createCall(
      /* expression */ methodAccess,
      /* typeArguments */ undefined,
      /* argumentsArray */ args);
}

export function checkIfClassIsExported(node: ClassDeclaration): boolean {
  // A class is exported if one of two conditions is met:
  // 1) it has the 'export' modifier.
  // 2) it's declared at the top level, and there is an export statement for the class.
  if (node.modifiers !== undefined &&
      node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
    // Condition 1 is true, the class has an 'export' keyword attached.
    return true;
  } else if (
      node.parent !== undefined && ts.isSourceFile(node.parent) &&
      checkIfFileHasExport(node.parent, node.name.text)) {
    // Condition 2 is true, the class is exported via an 'export {}' statement.
    return true;
  }
  return false;
}

function checkIfFileHasExport(sf: ts.SourceFile, name: string): boolean {
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause !== undefined &&
        ts.isNamedExports(stmt.exportClause)) {
      for (const element of stmt.exportClause.elements) {
        if (element.propertyName === undefined && element.name.text === name) {
          // The named declaration is directly exported.
          return true;
        } else if (element.propertyName !== undefined && element.propertyName.text == name) {
          // The named declaration is exported via an alias.
          return true;
        }
      }
    }
  }
  return false;
}

export function checkIfGenericTypesAreUnbound(node: ClassDeclaration<ts.ClassDeclaration>):
    boolean {
  if (node.typeParameters === undefined) {
    return true;
  }
  return node.typeParameters.every(param => param.constraint === undefined);
}

export function isAccessExpression(node: ts.Node): node is ts.ElementAccessExpression|
    ts.PropertyAccessExpression {
  return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
}

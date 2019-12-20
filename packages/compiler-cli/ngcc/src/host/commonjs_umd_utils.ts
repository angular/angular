/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Declaration} from '../../../src/ngtsc/reflection';


export interface ExportDeclaration {
  name: string;
  declaration: Declaration;
}

export interface ExportStatement extends ts.ExpressionStatement {
  expression: ts.BinaryExpression&{left: ts.PropertyAccessExpression & {expression: ts.Identifier}};
}

export interface ReexportStatement extends ts.ExpressionStatement { expression: ts.CallExpression; }

export interface RequireCall extends ts.CallExpression {
  arguments: ts.CallExpression['arguments']&[ts.StringLiteral];
}


/**
 * Return the "namespace" of the specified `ts.Identifier` if the identifier is the RHS of a
 * property access expression, i.e. an expression of the form `<namespace>.<id>` (in which case a
 * `ts.Identifier` corresponding to `<namespace>` will be returned). Otherwise return `null`.
 */
export function findNamespaceOfIdentifier(id: ts.Identifier): ts.Identifier|null {
  return id.parent && ts.isPropertyAccessExpression(id.parent) &&
          ts.isIdentifier(id.parent.expression) ?
      id.parent.expression :
      null;
}

/**
 * Return the `RequireCall` that is used to initialize the specified `ts.Identifier`, if the
 * specified indentifier was indeed initialized with a require call in a declaration of the form:
 * `var <id> = require('...')`
 */
export function findRequireCallReference(id: ts.Identifier, checker: ts.TypeChecker): RequireCall|
    null {
  const symbol = checker.getSymbolAtLocation(id) || null;
  const declaration = symbol && symbol.valueDeclaration;
  const initializer =
      declaration && ts.isVariableDeclaration(declaration) && declaration.initializer || null;
  return initializer && isRequireCall(initializer) ? initializer : null;
}

/**
 * Check whether the specified `ts.Statement` is an export statement, i.e. an expression statement
 * of the form: `export.<foo> = <bar>`
 */
export function isExportStatement(stmt: ts.Statement): stmt is ExportStatement {
  return ts.isExpressionStatement(stmt) && ts.isBinaryExpression(stmt.expression) &&
      (stmt.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) &&
      ts.isPropertyAccessExpression(stmt.expression.left) &&
      ts.isIdentifier(stmt.expression.left.expression) &&
      stmt.expression.left.expression.text === 'exports';
}

/**
 * Check whether the specified `ts.Statement` is a re-export statement, i.e. an expression statement
 * of the form: `__export(<foo>)`
 */
export function isReexportStatement(stmt: ts.Statement): stmt is ReexportStatement {
  return ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression) &&
      ts.isIdentifier(stmt.expression.expression) &&
      stmt.expression.expression.text === '__export' && stmt.expression.arguments.length === 1;
}

/**
 * Check whether the specified `ts.Node` represents a `require()` call, i.e. an call expression of
 * the form: `require('<foo>')`
 */
export function isRequireCall(node: ts.Node): node is RequireCall {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' && node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]);
}

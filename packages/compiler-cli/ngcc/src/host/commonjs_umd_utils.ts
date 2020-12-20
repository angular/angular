/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Declaration} from '../../../src/ngtsc/reflection';
import {isAssignment} from '../../../src/ngtsc/util/src/typescript';

export interface ExportDeclaration {
  name: string;
  declaration: Declaration;
}

/**
 * A CommonJS or UMD wildcard re-export statement.
 *
 * The CommonJS or UMD version of `export * from 'blah';`.
 *
 * These statements can have several forms (depending, for example, on whether
 * the TypeScript helpers are imported or emitted inline). The expression can have one of the
 * following forms:
 * - `__export(firstArg)`
 * - `__exportStar(firstArg)`
 * - `tslib.__export(firstArg, exports)`
 * - `tslib.__exportStar(firstArg, exports)`
 *
 * In all cases, we only care about `firstArg`, which is the first argument of the re-export call
 * expression and can be either a `require('...')` call or an identifier (initialized via a
 * `require('...')` call).
 */
export interface WildcardReexportStatement extends ts.ExpressionStatement {
  expression: ts.CallExpression;
}

/**
 * A CommonJS or UMD re-export statement using an `Object.defineProperty()` call.
 * For example:
 *
 * ```
 * Object.defineProperty(exports, "<exported-id>",
 *     { enumerable: true, get: function () { return <imported-id>; } });
 * ```
 */
export interface DefinePropertyReexportStatement extends ts.ExpressionStatement {
  expression: ts.CallExpression&
      {arguments: [ts.Identifier, ts.StringLiteral, ts.ObjectLiteralExpression]};
}

/**
 * A call expression that has a string literal for its first argument.
 */
export interface RequireCall extends ts.CallExpression {
  arguments: ts.CallExpression['arguments']&[ts.StringLiteral];
}


/**
 * Return the "namespace" of the specified `ts.Identifier` if the identifier is the RHS of a
 * property access expression, i.e. an expression of the form `<namespace>.<id>` (in which case a
 * `ts.Identifier` corresponding to `<namespace>` will be returned). Otherwise return `null`.
 */
export function findNamespaceOfIdentifier(id: ts.Identifier): ts.Identifier|null {
  return id.parent && ts.isPropertyAccessExpression(id.parent) && id.parent.name === id &&
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
  const declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  const initializer =
      declaration && ts.isVariableDeclaration(declaration) && declaration.initializer || null;
  return initializer && isRequireCall(initializer) ? initializer : null;
}

/**
 * Check whether the specified `ts.Statement` is a wildcard re-export statement.
 * I.E. an expression statement of one of the following forms:
 * - `__export(<foo>)`
 * - `__exportStar(<foo>)`
 * - `tslib.__export(<foo>, exports)`
 * - `tslib.__exportStar(<foo>, exports)`
 */
export function isWildcardReexportStatement(stmt: ts.Statement): stmt is WildcardReexportStatement {
  // Ensure it is a call expression statement.
  if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) {
    return false;
  }

  // Get the called function identifier.
  // NOTE: Currently, it seems that `__export()` is used when emitting helpers inline and
  //       `__exportStar()` when importing them
  //       ([source](https://github.com/microsoft/TypeScript/blob/d7c83f023/src/compiler/transformers/module/module.ts#L1796-L1797)).
  //       So, theoretically, we only care about the formats `__export(<foo>)` and
  //       `tslib.__exportStar(<foo>, exports)`.
  //       The current implementation accepts the other two formats (`__exportStar(...)` and
  //       `tslib.__export(...)`) as well to be more future-proof (given that it is unlikely that
  //       they will introduce false positives).
  let fnName: string|null = null;
  if (ts.isIdentifier(stmt.expression.expression)) {
    // Statement of the form `someFn(...)`.
    fnName = stmt.expression.expression.text;
  } else if (
      ts.isPropertyAccessExpression(stmt.expression.expression) &&
      ts.isIdentifier(stmt.expression.expression.name)) {
    // Statement of the form `tslib.someFn(...)`.
    fnName = stmt.expression.expression.name.text;
  }

  // Ensure the called function is either `__export()` or `__exportStar()`.
  if ((fnName !== '__export') && (fnName !== '__exportStar')) {
    return false;
  }

  // Ensure there is at least one argument.
  // (The first argument is the exported thing and there will be a second `exports` argument in the
  // case of imported helpers).
  return stmt.expression.arguments.length > 0;
}


/**
 * Check whether the statement is a re-export of the form:
 *
 * ```
 * Object.defineProperty(exports, "<export-name>",
 *     { enumerable: true, get: function () { return <import-name>; } });
 * ```
 */
export function isDefinePropertyReexportStatement(stmt: ts.Statement):
    stmt is DefinePropertyReexportStatement {
  if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) {
    return false;
  }

  // Check for Object.defineProperty
  if (!ts.isPropertyAccessExpression(stmt.expression.expression) ||
      !ts.isIdentifier(stmt.expression.expression.expression) ||
      stmt.expression.expression.expression.text !== 'Object' ||
      !ts.isIdentifier(stmt.expression.expression.name) ||
      stmt.expression.expression.name.text !== 'defineProperty') {
    return false;
  }

  const args = stmt.expression.arguments;
  if (args.length !== 3) {
    return false;
  }
  const exportsObject = args[0];
  if (!ts.isIdentifier(exportsObject) || exportsObject.text !== 'exports') {
    return false;
  }

  const propertyKey = args[1];
  if (!ts.isStringLiteral(propertyKey)) {
    return false;
  }

  const propertyDescriptor = args[2];
  if (!ts.isObjectLiteralExpression(propertyDescriptor)) {
    return false;
  }

  return (propertyDescriptor.properties.some(
      prop => prop.name !== undefined && ts.isIdentifier(prop.name) && prop.name.text === 'get'));
}

/**
 * Extract the "value" of the getter in a `defineProperty` statement.
 *
 * This will return the `ts.Expression` value of a single `return` statement in the `get` method
 * of the property definition object, or `null` if that is not possible.
 */
export function extractGetterFnExpression(statement: DefinePropertyReexportStatement):
    ts.Expression|null {
  const args = statement.expression.arguments;
  const getterFn = args[2].properties.find(
      prop => prop.name !== undefined && ts.isIdentifier(prop.name) && prop.name.text === 'get');
  if (getterFn === undefined || !ts.isPropertyAssignment(getterFn) ||
      !ts.isFunctionExpression(getterFn.initializer)) {
    return null;
  }
  const returnStatement = getterFn.initializer.body.statements[0];
  if (!ts.isReturnStatement(returnStatement) || returnStatement.expression === undefined) {
    return null;
  }
  return returnStatement.expression;
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

/**
 * Check whether the specified `path` is an "external" import.
 * In other words, that it comes from a entry-point outside the current one.
 */
export function isExternalImport(path: string): boolean {
  return !/^\.\.?(\/|$)/.test(path);
}

/**
 * A UMD/CommonJS style export declaration of the form `exports.<name>`.
 */
export interface ExportsDeclaration extends ts.PropertyAccessExpression {
  name: ts.Identifier;
  expression: ts.Identifier;
  parent: ExportsAssignment;
}

/**
 * Check whether the specified `node` is a property access expression of the form
 * `exports.<foo>`.
 */
export function isExportsDeclaration(expr: ts.Node): expr is ExportsDeclaration {
  return expr.parent && isExportsAssignment(expr.parent);
}

/**
 * A UMD/CommonJS style export assignment of the form `exports.<foo> = <bar>`.
 */
export interface ExportsAssignment extends ts.BinaryExpression {
  left: ExportsDeclaration;
}

/**
 * Check whether the specified `node` is an assignment expression of the form
 * `exports.<foo> = <bar>`.
 */
export function isExportsAssignment(expr: ts.Node): expr is ExportsAssignment {
  return isAssignment(expr) && ts.isPropertyAccessExpression(expr.left) &&
      ts.isIdentifier(expr.left.expression) && expr.left.expression.text === 'exports' &&
      ts.isIdentifier(expr.left.name);
}

/**
 * An expression statement of the form `exports.<foo> = <bar>;`.
 */
export interface ExportsStatement extends ts.ExpressionStatement {
  expression: ExportsAssignment;
}

/**
 * Check whether the specified `stmt` is an expression statement of the form
 * `exports.<foo> = <bar>;`.
 */
export function isExportsStatement(stmt: ts.Node): stmt is ExportsStatement {
  return ts.isExpressionStatement(stmt) && isExportsAssignment(stmt.expression);
}

/**
 * Find the far right hand side of a sequence of aliased assignements of the form
 *
 * ```
 * exports.MyClass = alias1 = alias2 = <<declaration>>
 * ```
 *
 * @param node the expression to parse
 * @returns the original `node` or the far right expression of a series of assignments.
 */
export function skipAliases(node: ts.Expression): ts.Expression {
  while (isAssignment(node)) {
    node = node.right;
  }
  return node;
}

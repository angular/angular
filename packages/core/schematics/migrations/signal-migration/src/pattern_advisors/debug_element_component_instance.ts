/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Detects `query(By.directive(T)).componentInstance` patterns and enhances
 * them with information of `T`. This is important because `.componentInstance`
 * is currently typed as `any` and may cause runtime test failures after input
 * migrations then.
 *
 * The reference resolution pass leverages information from this pattern
 * recognizer.
 */
export class DebugElementComponentInstance {
  private cache = new WeakMap<ts.Node, ts.Type | null>();

  constructor(private checker: ts.TypeChecker) {}

  detect(node: ts.Node): ts.Type | null {
    if (this.cache.has(node)) {
      return this.cache.get(node)!;
    }
    if (!ts.isPropertyAccessExpression(node)) {
      return null;
    }
    // Check for `<>.componentInstance`.
    if (!ts.isIdentifier(node.name) || node.name.text !== 'componentInstance') {
      return null;
    }
    // Check for `<>.query(..).<>`.
    if (
      !ts.isCallExpression(node.expression) ||
      !ts.isPropertyAccessExpression(node.expression.expression) ||
      !ts.isIdentifier(node.expression.expression.name) ||
      node.expression.expression.name.text !== 'query'
    ) {
      return null;
    }

    const queryCall: ts.CallExpression = node.expression;
    if (queryCall.arguments.length !== 1) {
      return null;
    }

    const queryArg = queryCall.arguments[0];

    let typeExpr: ts.Node;

    if (
      ts.isCallExpression(queryArg) &&
      queryArg.arguments.length === 1 &&
      ts.isIdentifier(queryArg.arguments[0])
    ) {
      // Detect references, like: `query(By.directive(T))`.
      typeExpr = queryArg.arguments[0];
    } else if (ts.isIdentifier(queryArg)) {
      // Detect references, like: `harness.query(T)`.
      typeExpr = queryArg;
    } else {
      return null;
    }

    const symbol = this.checker.getSymbolAtLocation(typeExpr);
    if (
      symbol?.valueDeclaration === undefined ||
      !ts.isClassDeclaration(symbol?.valueDeclaration)
    ) {
      // Cache this as we use the expensive type checker.
      this.cache.set(node, null);
      return null;
    }

    const type = this.checker.getTypeAtLocation(symbol.valueDeclaration);

    this.cache.set(node, type);
    return type;
  }
}

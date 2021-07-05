/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {AsyncSuperScope, isSuperContainer, isSuperElementAccess, isSuperPropertyAccess} from './scopes/super_scope';
import {isAssignment} from './utils';

const NO_QUESTION_DOT_TOKEN = undefined;

/**
 * This class encapsulates a TS AST visitor for transforming accesses to `super` inside async
 * functions.
 */
export class TransformSuperElementAccessesVisitor {
  private readonly factory = this.context.factory;
  /**
   * Create an AST visitor that will traverse through the current `super` lexical scope,
   * transforming each of the `super` accesses as they are discovered.
   */
  constructor(
      private readonly context: ts.TransformationContext,
      private readonly superScope: AsyncSuperScope) {}

  /**
   * The visitor function that is used in a call to `ts.VisitEachChild()` from the
   * `AsyncFunctionVisitor`.
   *
   * Note that this needs to be an arrow function property, rather than a method to ensure it
   * retains hold of the correct `this`.
   */
  visitor: ts.Visitor = node => {
    if (isSuperContainer(node)) {
      // When we hit a new super container we are done
      return node;
    }
    // Transform accesses to `super` to use the `ɵsuper` and `ɵsuperIndex` proxies.
    node = this.transformSuperAccesses(node, this.superScope);
    return ts.visitEachChild(node, this.visitor, this.context);
  };


  /**
   * Transform all the instances where `super` is accessed for this node.
   *
   * There are a few scenarios including:
   *
   * - property read access: `bar = super.foo` -> `bar = ɵsuper.foo`
   * - property write access: `super.foo = bar` -> `ɵsuper.foo = bar`
   * - element read access: `bar = super['foo']` -> `ɵsuperIndex('foo')` or
   *   `ɵsuperIndex('foo').value`
   * - element write access: `super['foo'] = bar` -> `ɵsuperIndex('foo').value = bar`
   * - method calling: `super.foo()` -> `ɵsuper.foo.call(this)`
   * - element calling: `super[exp]()` -> `ɵsuperIndex(exp).call(this)`
   */
  private transformSuperAccesses(node: ts.Node, superScope: AsyncSuperScope): ts.Node {
    if (isAssignment(node) && isSuperElementAccess(node.left)) {
      // Transform any super element write
      // (e.g. `super['foo'] = x`).
      node = this.transformSuperElementAssignment(node, node.left, superScope);
    } else if (isSuperPropertyAccess(node)) {
      // Transform any super property access that is not a call
      // (e.g. `x = super.foo;` or `super.foo = x`).
      node = this.transformSuperPropertyAccess(node, superScope);
    } else if (isSuperElementAccess(node)) {
      // Transform any super element reads that are not calls
      // (e.g. `x = super[exp]`).
      node = this.transformSuperElementAccess(node, superScope);
    } else if (ts.isCallExpression(node)) {
      // Transform any super property/element calls
      // (e.g. `super.foo()` or `super[exp]()`).
      if (isSuperPropertyAccess(node.expression)) {
        const expression = this.transformSuperPropertyAccess(node.expression, superScope);
        node = this.transformSuperMethodCall(node, expression);
      } else if (isSuperElementAccess(node.expression)) {
        const expression = this.transformSuperElementAccess(node.expression, superScope);
        node = this.transformSuperMethodCall(node, expression);
      }
    }

    return node;
  }

  /**
   * Calls to super methods need to be converted to use `.call()` syntax.
   *
   * E.g. `super.foo(a,b)` will be transformed into `ɵsuper.foo.call(this,a,b)`.
   *
   * Note that optional chain calls needs special handling. The question-dot token needs to be moved
   * from the call expression to the property access expression.
   */
  private transformSuperMethodCall(node: ts.CallExpression, expression: ts.Expression):
      ts.CallExpression {
    const args = [this.factory.createThis(), ...node.arguments];
    if (ts.isCallChain(node)) {
      // Optional chain call: `super.foo?.(...)` -> `super.foo?.call(this, ...);
      const callCallExpression =
          this.factory.createPropertyAccessChain(expression, node.questionDotToken, 'call');
      return this.factory.updateCallChain(
          node, callCallExpression, NO_QUESTION_DOT_TOKEN, node.typeArguments, args);
    } else {
      // Normal call: `super.foo(...)` -> `super.foo.call(this, ...);
      const callCallExpression = this.factory.createPropertyAccessExpression(expression, 'call');
      return this.factory.updateCallExpression(node, callCallExpression, node.typeArguments, args);
    }
  }

  /**
   * Transform a `super.foo` property access into `ɵsuper.foo`, where `ɵsuper` will be a generated
   * super proxy object.
   */
  private transformSuperPropertyAccess(
      node: ts.PropertyAccessExpression, superScope: AsyncSuperScope): ts.PropertyAccessExpression {
    // Update the `super` keyword to the `ɵsuper` local variable
    return this.factory.updatePropertyAccessExpression(
        node, superScope.propertyAccessProxy, node.name);
  }

  /**
   * Generate a `super` element access assignment proxy expression.
   *
   * For example,
   *
   * ```
   * super['foo'] = foo
   * ```
   *
   * will be transformed into
   *
   * ```
   * ɵsuperIndex('foo').value = foo
   * ```
   */
  private transformSuperElementAssignment(
      assignment: ts.AssignmentExpression<ts.AssignmentOperatorToken>,
      expression: ts.SuperElementAccessExpression,
      superScope: AsyncSuperScope): ts.BinaryExpression {
    // ɵsuperIndex('foo')
    const superIndexCall = this.factory.createCallExpression(
        superScope.elementAccessProxy, undefined, [expression.argumentExpression]);
    // ɵsuperIndex('foo').value
    const valueAccess = this.factory.createPropertyAccessExpression(superIndexCall, 'value');
    // ɵsuperIndex('foo').value = foo
    return this.factory.updateBinaryExpression(
        assignment, valueAccess, assignment.operatorToken, assignment.right);
  }

  /**
   * Generate a `super` element access read expression.
   *
   * For example,
   *
   * ```
   * super['foo']
   * ```
   *
   * will be transformed into
   *
   * ```
   * ɵsuperIndex('foo')
   * ```
   *
   * or (if there have been super element writes)
   *
   * ```
   * ɵsuperIndex('foo').value
   * ```
   */
  private transformSuperElementAccess(
      node: ts.ElementAccessExpression, superScope: AsyncSuperScope): ts.CallExpression
      |ts.PropertyAccessExpression|ts.ElementAccessExpression {
    // ɵsuperIndex('foo')
    const superIndexCall = this.factory.createCallExpression(
        superScope.elementAccessProxy, undefined, [node.argumentExpression]);

    if (superScope.hasElementWrite) {
      // Return the "write" version of the element access helper
      // ɵsuperIndex('foo').value
      return this.factory.createPropertyAccessExpression(superIndexCall, 'value');
    } else {
      // Return the "readonly" version of the element access helper
      // ɵsuperIndex('foo')
      return superIndexCall;
    }
  }
}

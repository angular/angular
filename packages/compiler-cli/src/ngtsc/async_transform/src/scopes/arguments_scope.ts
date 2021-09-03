/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isAsync, isDeclarationName, isLabel, isPropertyName, isTagName} from '../utils';

import {Scopes} from './scopes';

/**
 * A stack of lexical scopes for the `arguments` keyword.
 *
 * Each time a visitor enters a node that creates a new lexical scope for the `arguments` keyword
 * then that node should be pushed into the stack.
 *
 * When the visitor leaves a node that has a lexical scope for `arguments` then the scope should be
 * popped off the stack.
 */
export class ArgumentsScopes extends Scopes<ArgumentsScope> {
  /**
   * Create a new instance of `AsyncArgumentsScope` based on the given `node`.
   */
  override createScope(node: ts.Node): ArgumentsScope {
    return new ArgumentsScope(this, node);
  }
}

/**
 * Represents the lexical scope of the `arguments` keyword within a function body.
 */
export class ArgumentsScope {
  private _argumentsAccesses = false;
  private _argumentsProxy: ts.Identifier|null = null;

  constructor(private scopes: ArgumentsScopes, readonly node: ts.Node) {}

  /**
   * Identifier for the `arguments` proxy variable
   *
   * This will be initialized as:
   *
   * ```
   * const ɵarguments = arguments;
   * ```
   *
   * Whenever the `arguments` keyword appears in an async arrow function within this lexical scope,
   * it will be replaced with this proxy. For example:
   *
   * ```
   * function foo() {
   *   const arrow = async () => console.log(arguments);
   * }
   * ```
   *
   * will be transformed into:
   *
   * ```
   * function foo() {
   *   const ɵarguments = arguments;
   *   function* arrow_generator() {
   *     yield ɵarguments[0];
   *   }
   *   const arrow = () => Zone.__awaiter(this, [], arrow_generator);
   * }
   * ```
   */
  get argumentsProxy(): ts.Identifier {
    if (this._argumentsProxy === null) {
      this._argumentsProxy = this.scopes.uniqueIdentifier('arguments');
    }
    return this._argumentsProxy;
  }

  /**
   * True if there have been any accesses to `arguments` in this scope.
   */
  get hasArgumentsAccess() {
    return this._argumentsAccesses;
  }

  /**
   * Record the `arguments` object being accessed.
   */
  recordArgumentsAccess(): void {
    this._argumentsAccesses = true;
  }
}

/**
 * A union of all the AST node types that can define a lexical scope of `arguments`.
 */
export type ArgumentsContainer = ts.FunctionExpression|ts.FunctionDeclaration|ts.MethodDeclaration;

/**
 * Test to see if the given `node` is a function that defines the `arguments` keyword.
 *
 * Note that arrow functions do not define `arguments` so is not such a container.
 */
export function isArgumentsContainer(node: ts.Node): node is ArgumentsContainer {
  return (
      ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node));
}

/**
 * Test to see if the given `node` is an `arguments` identifier within an "async arrow" function.
 *
 * Skip scenarios like `obj.arguments` and `obj = { arguments: {} }`.
 */
export function isArgumentsAccessInAsyncArrowFn(
    node: ts.Node, container: ts.Node): node is ts.Identifier {
  node = ts.getOriginalNode(node);
  const parent = node.parent;
  if (parent === undefined) {
    return false;
  }
  return isArgumentsIdentifier(node) && !isDeclarationName(node, parent) &&
      !isLabel(node, parent) && !isPropertyName(node, parent) && !ts.isQualifiedName(parent) &&
      !isTagName(node, parent) && isInAsyncArrowFn(node, container);
}

/**
 * Test to see if the given `node` is a shorthand property assignment named `arguments` within an
 * "async arrow" function. E.g. `{ arguments }`.
 */
export function isShorthandArgumentsInAsyncArrowFn(node: ts.Node, container: ts.Node):
    node is ts.ShorthandPropertyAssignment&{name: ts.Identifier} {
  node = ts.getOriginalNode(node);
  return ts.isShorthandPropertyAssignment(node) && isArgumentsIdentifier(node.name) &&
      isInAsyncArrowFn(node, container);
}

/**
 * Test to see if `node` is an `arguments` identifier.
 */
function isArgumentsIdentifier(node: ts.Node): node is ts.Identifier {
  return ts.isIdentifier(node) && node.text === 'arguments';
}

/**
 * Test to see if this node is directly within an async arrow function.
 *
 * We search up the tree from `node` looking for an async arrow function
 * stopping if we reach the arguments `container` node.
 */
function isInAsyncArrowFn(node: ts.Node, container: ts.Node): boolean {
  container = ts.getOriginalNode(container);
  while (node !== container) {
    if (ts.isArrowFunction(node)) {
      // We have an arrow function with no block: `(arg1, arg2) => expression`
      return isAsync(node);
    }
    node = node.parent;
  }
  return false;
}

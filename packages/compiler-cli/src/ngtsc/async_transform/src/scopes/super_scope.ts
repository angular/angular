/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Scopes} from './scopes';

/**
 * A stack of lexical scopes for the `super` keyword.
 *
 * Each time a visitor enters a node that creates a new lexical scope for the `super` keyword then
 * a new scope should be pushed into the stack.
 *
 * When the visitor leaves a node that has a lexical scope for `super` then the scope should be
 * popped off the stack.
 */
export class SuperScopes extends Scopes<AsyncSuperScope> {
  /**
   * Create a new instance of `AsyncSuperScope`.
   */
  override createScope(): AsyncSuperScope {
    return new AsyncSuperScope(this);
  }
}

/**
 * Represents the lexical scope of the `super` keyword within an async method.
 */
export class AsyncSuperScope {
  private _propertyAccessProxy: ts.Identifier|null = null;
  private _elementAccessProxy: ts.Identifier|null = null;

  /** Map of `super` property names that are accessed in this scope. */
  private _superAccesses = new Map<string, {read: boolean, write: boolean}>();
  /** Track if and how `super` "element accesses" happen in this scope. */
  private _elementAccessRead = false;
  private _elementAccessWrite = false;

  // Track how deeply we are within async functions.
  // Access to `super` is only relevant inside an async function.
  private asyncFunctionDepth = 0;

  constructor(private scopes: SuperScopes) {}

  /**
   * True if there have been any accesses (of any kind) to `super` in this scope.
   */
  get hasSuperAccess() {
    return this.hasPropertyAccess || this.hasElementAccess;
  }

  /**
   * True if there is a `super` "element access" (read or write) in this scope. E.g `super['foo']`.
   */
  get hasElementAccess() {
    return this._elementAccessRead || this._elementAccessWrite;
  }

  /**
   * True if there is a `super` "element read" in this scope. E.g `const foo = super['foo']`.
   */
  get hasElementRead() {
    return this._elementAccessRead;
  }

  /**
   * True if there is a `super` "element write" in this scope. E.g `super['foo'] = foo`.
   */
  get hasElementWrite() {
    return this._elementAccessWrite;
  }

  /**
   * Identifier for the `superIndex` proxy function.
   *
   * The form of this function depends on whether there have been any "element writes" or only
   * "element reads".
   *
   * The "element read" form is simple:
   *
   * ```
   * const ɵsuperIndex = name => super[name];`
   * ```
   *
   * The "element write" form is considerably more complex:
   *
   * ```
   * const ɵsuperIndex = (function (geti, seti) {
   *   const cache = Object.create(null);
   *   return name => cache[name] || (cache[name] = {
   *     get value() { return geti(name); },
   *     set value(v) { seti(name, v); }
   *   });
   * })(name => super[name], (name, value) => super[name] = value);
   * ```
   */
  get elementAccessProxy(): ts.Identifier {
    if (this._elementAccessProxy === null) {
      this._elementAccessProxy = this.scopes.uniqueIdentifier('superIndex');
    }
    return this._elementAccessProxy;
  }

  /**
   * Record entering an async function within this scope.
   */
  enterAsyncFunction() {
    this.asyncFunctionDepth++;
  }

  /**
   * Record leaving an async function within this scope.
   */
  leaveAsyncFunction() {
    this.asyncFunctionDepth--;
  }

  /**
   * Record the `super` object being read via an element access.
   * E.g. `const foo = super['foo'];`
   *
   * Note that we don't actually care about accesses unless we are within an async function.
   */
  recordSuperElementRead() {
    if (this.asyncFunctionDepth > 0) {
      this._elementAccessRead = true;
    }
  }

  /**
   * Record the `super` object being written via an element access.
   * E.g. `super['foo'] = foo;`
   *
   * Note that we don't actually care about accesses unless we are within an async function.
   */
  recordSuperElementWrite() {
    if (this.asyncFunctionDepth > 0) {
      this._elementAccessWrite = true;
    }
  }

  /**
   * True if there has been a "property" access to `super`. E.g `super.foo`.
   */
  get hasPropertyAccess() {
    return this._superAccesses.size > 0;
  }

  /**
   * Identifier for the `super` property access proxy variable.
   *
   * This variable will be initialized with an object for each property that is accessed:
   *
   * ```
   * const ɵsuper = Object.create(null, {
   *     foo: { get: () => super.foo },
   *     bar: { get: () => super.bar, set: (v) => super.bar = v }
   * });
   * ```
   */
  get propertyAccessProxy(): ts.Identifier {
    if (this._propertyAccessProxy === null) {
      this._propertyAccessProxy = this.scopes.uniqueIdentifier('super');
    }
    return this._propertyAccessProxy;
  }

  /**
   * An iterator over each of the `super` property accesses in this scope.
   *
   * Each iteration returns the property name and whether the property was read and/or written.
   */
  get superPropertyAccesses(): IterableIterator<[string, {read: boolean, write: boolean}]> {
    return this._superAccesses.entries();
  }

  /**
   * Record the name of a super property being read in this scope.
   *
   * Note that we don't actually care about accesses unless we are within an async function.
   */
  recordSuperPropertyRead(name: string): void {
    if (this.asyncFunctionDepth > 0) {
      if (!this._superAccesses.has(name)) {
        this._superAccesses.set(name, {read: true, write: false});
      } else {
        this._superAccesses.get(name)!.read = true;
      }
    }
  }

  /**
   * Record the name of a super property being written in this scope.
   *
   * Note that we don't actually care about accesses unless we are within an async function.
   */
  recordSuperPropertyWrite(name: string): void {
    if (this.asyncFunctionDepth > 0) {
      if (!this._superAccesses.has(name)) {
        this._superAccesses.set(name, {read: false, write: true});
      } else {
        this._superAccesses.get(name)!.write = true;
      }
    }
  }
}

/**
 * A union of all the AST node types that can define a lexical scope for `super`.
 */
export type SuperContainer = ts.MethodDeclaration|ts.GetAccessorDeclaration|
                             ts.SetAccessorDeclaration|ts.ConstructorDeclaration;

/**
 * Test to see if the given `node` is a function that can define a lexical scope for the `super`
 * keyword
 */
export function isSuperContainer(node: ts.Node): node is SuperContainer {
  return ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node) || ts.isConstructorDeclaration(node);
}


/**
 * Test to see if the given `node` is a property access on `super`. E.g. `super.foo`.
 */
export function isSuperPropertyAccess(node: ts.Node): node is ts.SuperPropertyAccessExpression {
  return ts.isPropertyAccessExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword;
}

/**
 * Test to see if the given `node` is an element access on `super`. E.g. `super['foo']`.
 */
export function isSuperElementAccess(node: ts.Node): node is ts.SuperElementAccessExpression {
  return ts.isElementAccessExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword;
}

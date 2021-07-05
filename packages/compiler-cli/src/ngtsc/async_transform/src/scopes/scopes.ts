/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * A stack of lexical scopes.
 *
 * Each time a visitor enters a node that creates a new lexical scope then a new scope for that node
 * should be pushed into the stack.
 *
 * When the visitor leaves a node that has a lexical scope then the scope should be popped off the
 * stack.
 */
export abstract class Scopes<Scope> {
  private uniqueIds: Record<string, number> = Object.create(null);
  private scopeStack: (Scope|null)[] = [];

  constructor(private factory: ts.NodeFactory) {}

  /**
   * Implement this method to create a new instance of Scope based on the given `node`.
   */
  abstract createScope(): Scope;

  /**
   * Push a scope onto the stack.
   */
  push(): void {
    this.scopeStack.push(this.createScope());
  }

  /**
   * Returns the scope at the top of the stack or `null` if the stack is empty.
   */
  peek(): Scope|null {
    if (this.scopeStack.length === 0) {
      return null;
    }
    return this.scopeStack[this.scopeStack.length - 1];
  }

  /**
   * Removes and returns the scope at the top of the stack.
   */
  pop(): void {
    this.scopeStack.pop();
  }

  /**
   * Create an unique identifier based on the `seed` string.
   *
   * Identifiers are guaranteed to be unique within the current stack of scopes for a given `seed`.
   */
  uniqueIdentifier(seed: string): ts.Identifier {
    if (this.uniqueIds[seed] === undefined) {
      this.uniqueIds[seed] = 0;
    } else {
      this.uniqueIds[seed]++;
    }
    const postfix = this.uniqueIds[seed] > 0 ? `_${this.uniqueIds[seed]}` : '';
    return this.factory.createIdentifier(`ɵ${seed}${postfix}`);
  }
}

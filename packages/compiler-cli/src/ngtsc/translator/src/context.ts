/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The current context of a translator visitor as it traverses the AST tree.
 *
 * It tracks whether we are in the process of outputting a statement or an expression.
 */
export class Context {
  constructor(readonly isStatement: boolean) {}

  get withExpressionMode(): Context {
    return this.isStatement ? new Context(false) : this;
  }

  get withStatementMode(): Context {
    return !this.isStatement ? new Context(true) : this;
  }
}

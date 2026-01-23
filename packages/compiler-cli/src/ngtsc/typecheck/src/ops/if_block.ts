/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstIfBlock, TmplAstIfBlockBranch} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Scope} from './scope';
import type {Context} from './context';
import {tcbExpression} from './expression';
import {markIgnoreDiagnostics} from '../comments';

/**
 * A `TcbOp` which renders an `if` template block as a TypeScript `if` statement.
 *
 * Executing this operation returns nothing.
 */
export class TcbIfOp extends TcbOp {
  private expressionScopes = new Map<TmplAstIfBlockBranch, Scope>();

  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstIfBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const root = this.generateBranch(0);
    root && this.scope.addStatement(root);
    return null;
  }

  private generateBranch(index: number): ts.Statement | undefined {
    const branch = this.block.branches[index];

    if (!branch) {
      return undefined;
    }

    // If the expression is null, it means that it's an `else` statement.
    if (branch.expression === null) {
      const branchScope = this.getBranchScope(this.scope, branch, index);
      return ts.factory.createBlock(branchScope.render());
    }

    // We process the expression first in the parent scope, but create a scope around the block
    // that the body will inherit from. We do this, because we need to declare a separate variable
    // for the case where the expression has an alias _and_ because we need the processed
    // expression when generating the guard for the body.
    const outerScope = this.scope.createChildScope(this.scope, branch, [], null);
    outerScope.render().forEach((stmt) => this.scope.addStatement(stmt));
    this.expressionScopes.set(branch, outerScope);

    let expression = tcbExpression(branch.expression, this.tcb, this.scope);
    if (branch.expressionAlias !== null) {
      expression = ts.factory.createBinaryExpression(
        ts.factory.createParenthesizedExpression(expression),
        ts.SyntaxKind.AmpersandAmpersandToken,
        outerScope.resolve(branch.expressionAlias),
      );
    }
    const bodyScope = this.getBranchScope(outerScope, branch, index);

    return ts.factory.createIfStatement(
      expression,
      ts.factory.createBlock(bodyScope.render()),
      this.generateBranch(index + 1),
    );
  }

  private getBranchScope(parentScope: Scope, branch: TmplAstIfBlockBranch, index: number): Scope {
    const checkBody = this.tcb.env.config.checkControlFlowBodies;
    return this.scope.createChildScope(
      parentScope,
      null,
      checkBody ? branch.children : [],
      checkBody ? this.generateBranchGuard(index) : null,
    );
  }

  private generateBranchGuard(index: number): ts.Expression | null {
    let guard: ts.Expression | null = null;

    // Since event listeners are inside callbacks, type narrowing doesn't apply to them anymore.
    // To recreate the behavior, we generate an expression that negates all the values of the
    // branches _before_ the current one, and then we add the current branch's expression on top.
    // For example `@if (expr === 1) {} @else if (expr === 2) {} @else if (expr === 3)`, the guard
    // for the last expression will be `!(expr === 1) && !(expr === 2) && expr === 3`.
    for (let i = 0; i <= index; i++) {
      const branch = this.block.branches[i];

      // Skip over branches without an expression.
      if (branch.expression === null) {
        continue;
      }

      // This shouldn't happen since all the state is handled
      // internally, but we have the check just in case.
      if (!this.expressionScopes.has(branch)) {
        throw new Error(`Could not determine expression scope of branch at index ${i}`);
      }

      const expressionScope = this.expressionScopes.get(branch)!;
      let expression: ts.Expression;

      // We need to recreate the expression and mark it to be ignored for diagnostics,
      // because it was already checked as a part of the block's condition and we don't
      // want it to produce a duplicate diagnostic.
      expression = tcbExpression(branch.expression, this.tcb, expressionScope);
      if (branch.expressionAlias !== null) {
        expression = ts.factory.createBinaryExpression(
          ts.factory.createParenthesizedExpression(expression),
          ts.SyntaxKind.AmpersandAmpersandToken,
          expressionScope.resolve(branch.expressionAlias),
        );
      }
      markIgnoreDiagnostics(expression);

      // The expressions of the preceding branches have to be negated
      // (e.g. `expr` becomes `!(expr)`) when comparing in the guard, except
      // for the branch's own expression which is preserved as is.
      const comparisonExpression =
        i === index
          ? expression
          : ts.factory.createPrefixUnaryExpression(
              ts.SyntaxKind.ExclamationToken,
              ts.factory.createParenthesizedExpression(expression),
            );

      // Finally add the expression to the guard with an && operator.
      guard =
        guard === null
          ? comparisonExpression
          : ts.factory.createBinaryExpression(
              guard,
              ts.SyntaxKind.AmpersandAmpersandToken,
              comparisonExpression,
            );
    }

    return guard;
  }
}

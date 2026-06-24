/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstSwitchBlock, TmplAstSwitchBlockCase} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Scope} from './scope';
import type {Context} from './context';
import {tcbExpression} from './expression';
import {markIgnoreDiagnostics} from '../comments';

/**
 * A `TcbOp` which renders a `switch` block as a TypeScript `switch` statement.
 *
 * Executing this operation returns nothing.
 */
export class TcbSwitchOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstSwitchBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const switchExpression = tcbExpression(this.block.expression, this.tcb, this.scope);
    const clauses = this.block.cases.map((current) => {
      const checkBody = this.tcb.env.config.checkControlFlowBodies;
      const clauseScope = this.scope.createChildScope(
        this.scope,
        null,
        checkBody ? current.children : [],
        checkBody ? this.generateGuard(current, switchExpression) : null,
      );
      const statements = [...clauseScope.render(), ts.factory.createBreakStatement()];

      return current.expression === null
        ? ts.factory.createDefaultClause(statements)
        : ts.factory.createCaseClause(
            tcbExpression(current.expression, this.tcb, clauseScope),
            statements,
          );
    });

    this.scope.addStatement(
      ts.factory.createSwitchStatement(switchExpression, ts.factory.createCaseBlock(clauses)),
    );

    return null;
  }

  private generateGuard(
    node: TmplAstSwitchBlockCase,
    switchValue: ts.Expression,
  ): ts.Expression | null {
    // For non-default cases, the guard needs to compare against the case value, e.g.
    // `switchExpression === caseExpression`.
    if (node.expression !== null) {
      // The expression needs to be ignored for diagnostics since it has been checked already.
      const expression = tcbExpression(node.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      return ts.factory.createBinaryExpression(
        switchValue,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        expression,
      );
    }

    // To fully narrow the type in the default case, we need to generate an expression that negates
    // the values of all of the other expressions. For example:
    // @switch (expr) {
    //   @case (1) {}
    //   @case (2) {}
    //   @default {}
    // }
    // Will produce the guard `expr !== 1 && expr !== 2`.
    let guard: ts.Expression | null = null;

    for (const current of this.block.cases) {
      if (current.expression === null) {
        continue;
      }

      // The expression needs to be ignored for diagnostics since it has been checked already.
      const expression = tcbExpression(current.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      const comparison = ts.factory.createBinaryExpression(
        switchValue,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        expression,
      );

      if (guard === null) {
        guard = comparison;
      } else {
        guard = ts.factory.createBinaryExpression(
          guard,
          ts.SyntaxKind.AmpersandAmpersandToken,
          comparison,
        );
      }
    }

    return guard;
  }
}

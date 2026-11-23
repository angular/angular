/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SwitchBlock, SwitchBlockCaseGroup} from '../../render3/r3_ast';
import {TcbOp} from './base';
import {getStatementsBlock, TcbExpr} from './codegen';
import type {Context} from './context';
import {tcbExpression} from './expression';
import type {Scope} from './scope';

/**
 * A `TcbOp` which renders a `switch` block as a TypeScript `switch` statement.
 *
 * Executing this operation returns nothing.
 */
export class TcbSwitchOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: SwitchBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const switchExpression = tcbExpression(this.block.expression, this.tcb, this.scope);
    const clauses = this.block.groups.flatMap<TcbExpr>((current) => {
      const checkBody = this.tcb.env.config.checkControlFlowBodies;
      const clauseScope = this.scope.createChildScope(
        this.scope,
        null,
        checkBody ? current.children : [],
        checkBody ? this.generateGuard(current, switchExpression) : null,
      );

      const statements = [...clauseScope.render(), new TcbExpr('break')];

      return current.cases.map((switchCase, index) => {
        const statementsStr = getStatementsBlock(
          index === current.cases.length - 1 ? statements : [],
          true /* singleLine */,
        );

        const source =
          switchCase.expression === null
            ? `default: ${statementsStr}`
            : `case ${tcbExpression(switchCase.expression, this.tcb, this.scope).print()}: ${statementsStr}`;

        return new TcbExpr(source);
      });
    });

    if (this.block.exhaustiveCheck) {
      let translateExpression = this.block.expression;
      if (this.block.exhaustiveCheck.expression) {
        translateExpression = this.block.exhaustiveCheck.expression;
      }

      const switchValue = tcbExpression(translateExpression, this.tcb, this.scope);
      const exhaustiveId = this.tcb.allocateId();

      clauses.push(
        new TcbExpr(`default: const tcbExhaustive${exhaustiveId}: never = ${switchValue.print()};`),
      );
    }

    this.scope.addStatement(
      new TcbExpr(
        `switch (${switchExpression.print()}) { ${clauses.map((c) => c.print()).join('\n')} }`,
      ),
    );

    return null;
  }

  private generateGuard(group: SwitchBlockCaseGroup, switchValue: TcbExpr): TcbExpr | null {
    // For non-default cases, the guard needs to compare against the case value, e.g.
    // `switchExpression === caseExpression`.
    const hasDefault = group.cases.some((c) => c.expression === null);

    if (!hasDefault) {
      let guard: TcbExpr | null = null;

      for (const switchCase of group.cases) {
        if (switchCase.expression !== null) {
          // The expression needs to be ignored for diagnostics since it has been checked already.
          const expression = tcbExpression(switchCase.expression, this.tcb, this.scope);
          expression.markIgnoreDiagnostics();
          const comparison = new TcbExpr(`${switchValue.print()} === ${expression.print()}`);

          if (guard === null) {
            guard = comparison;
          } else {
            guard = new TcbExpr(`(${guard.print()}) || (${comparison.print()})`);
          }
        }
      }

      return guard;
    }

    // To fully narrow the type in the default case, we need to generate an expression that negates
    // the values of all of the other expressions. For example:
    // @switch (expr) {
    //   @case (1) {}
    //   @case (2) {}
    //   @default {}
    // }
    // Will produce the guard `expr !== 1 && expr !== 2`.
    let guard: TcbExpr | null = null;

    for (const currentGroup of this.block.groups) {
      if (currentGroup === group) {
        continue;
      }

      for (const switchCase of currentGroup.cases) {
        if (switchCase.expression === null) {
          // Skip the default case.
          continue;
        }

        // The expression needs to be ignored for diagnostics since it has been checked already.
        const expression = tcbExpression(switchCase.expression, this.tcb, this.scope);
        expression.markIgnoreDiagnostics();
        const comparison = new TcbExpr(`${switchValue.print()} !== ${expression.print()}`);

        if (guard === null) {
          guard = comparison;
        } else {
          guard = new TcbExpr(`(${guard.print()}) && (${comparison.print()})`);
        }
      }
    }

    return guard;
  }
}

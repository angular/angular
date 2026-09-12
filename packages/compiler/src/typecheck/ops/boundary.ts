/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BoundaryBlock} from '../../render3/r3_ast';
import {TcbOp} from './base';
import {getStatementsBlock, TcbExpr} from './codegen';
import type {Context} from './context';
import {tcbExpression} from './expression';
import type {Scope} from './scope';

/**
 * A `TcbOp` which renders a `boundary` template block.
 */
export class TcbBoundaryOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: BoundaryBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const checkBody = this.tcb.env.config.checkControlFlowBodies;

    // 1. Render try body
    const tryBodyScope = this.scope.createChildScope(
      this.scope,
      null,
      checkBody ? this.block.children : [],
      null,
    );
    const tryBlockStr = `{\n${getStatementsBlock(tryBodyScope.render())}}`;

    // 2. Render catch clause if there are error blocks
    if (this.block.errorBlocks.length > 0) {
      // Create an inner block where we execute the chain of error branches
      const innerCatchStatements = this.generateCatchBranch(0);
      const catchBlockStr = `{\n${getStatementsBlock(innerCatchStatements)}}`;

      const tryStatement = new TcbExpr(`try ${tryBlockStr} catch (err) ${catchBlockStr}`);
      this.scope.addStatement(tryStatement);
    } else {
      this.scope.addStatement(new TcbExpr(tryBlockStr));
    }
    return null;
  }

  private generateCatchBranch(index: number): TcbExpr[] {
    const errorBlock = this.block.errorBlocks[index];
    if (!errorBlock) {
      return [];
    }

    const checkBody = this.tcb.env.config.checkControlFlowBodies;

    // Create a outerScope for the condition evaluation that declares the alias
    const outerScope = this.scope.createChildScope(this.scope, errorBlock, [], null);

    // Render alias declarations for the condition context
    const resultStatements: TcbExpr[] = [];
    outerScope.render().forEach((stmt) => resultStatements.push(stmt));

    // Evaluate the condition
    let expression: TcbExpr | null = null;
    if (errorBlock.expression) {
      expression = tcbExpression(errorBlock.expression, this.tcb, outerScope);
    }

    // Body block scope inherits from outerScope (so it has the alias) but passes null as node context
    // to prevent re-declaring the alias inside the block body.
    const bodyScope = this.scope.createChildScope(
      outerScope,
      null,
      checkBody ? errorBlock.children : [],
      null,
    );
    const bodyBlockStr = `{\n${getStatementsBlock(bodyScope.render())}}`;

    const nextBranchStatements = this.generateCatchBranch(index + 1);

    if (expression) {
      const ifStmt = new TcbExpr(
        `if (${expression.print()}) ${bodyBlockStr}${nextBranchStatements.length > 0 ? ` else {\n${getStatementsBlock(nextBranchStatements)}}` : ''}`,
      );
      resultStatements.push(ifStmt);
    } else {
      // If no expression, it's a general fallback block.
      resultStatements.push(new TcbExpr(bodyBlockStr));
    }
    return resultStatements;
  }
}

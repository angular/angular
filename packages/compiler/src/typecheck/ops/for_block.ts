/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, ImplicitReceiver, PropertyRead, ThisReceiver} from '../../expression_parser/ast';
import {ForLoopBlock, Variable} from '../../render3/r3_ast';
import {tcbExpression, TcbExpressionTranslator} from './expression';
import type {Context} from './context';
import type {Scope} from './scope';
import {TcbOp} from './base';
import {getStatementsBlock, TcbExpr} from './codegen';

/**
 * A `TcbOp` which renders a `for` block as a TypeScript `for...of` loop.
 *
 * Executing this operation returns nothing.
 */
export class TcbForOfOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: ForLoopBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const loopScope = this.scope.createChildScope(
      this.scope,
      this.block,
      this.tcb.env.config.checkControlFlowBodies ? this.block.children : [],
      null,
    );
    const initializerId = loopScope.resolve(this.block.item);
    const initializer = new TcbExpr(`const ${initializerId.print()}`);
    initializer.addParseSpanInfo(this.block.item.keySpan);

    // It's common to have a for loop over a nullable value (e.g. produced by the `async` pipe).
    // Add a non-null expression to allow such values to be assigned.
    const expression = new TcbExpr(
      `${tcbExpression(this.block.expression, this.tcb, this.scope).print()}!`,
    );
    const trackTranslator = new TcbForLoopTrackTranslator(this.tcb, loopScope, this.block);
    const trackExpression = trackTranslator.translate(this.block.trackBy);
    const block = getStatementsBlock([...loopScope.render(), trackExpression]);
    this.scope.addStatement(
      new TcbExpr(`for (${initializer.print()} of ${expression.print()}) {\n${block} }`),
    );
    return null;
  }
}

export class TcbForLoopTrackTranslator extends TcbExpressionTranslator {
  private allowedVariables: Set<Variable>;

  constructor(
    tcb: Context,
    scope: Scope,
    private block: ForLoopBlock,
  ) {
    super(tcb, scope);

    // Tracking expressions are only allowed to read the `$index`,
    // the item and properties off the component instance.
    this.allowedVariables = new Set([block.item]);
    for (const variable of block.contextVariables) {
      if (variable.value === '$index') {
        this.allowedVariables.add(variable);
      }
    }
  }

  protected override resolve(ast: AST): TcbExpr | null {
    if (
      ast instanceof PropertyRead &&
      (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver)
    ) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);

      if (
        target !== null &&
        (!(target instanceof Variable) || !this.allowedVariables.has(target))
      ) {
        this.tcb.oobRecorder.illegalForLoopTrackAccess(this.tcb.id, this.block, ast);
      }
    }

    return super.resolve(ast);
  }
}

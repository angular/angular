/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ImplicitReceiver,
  PropertyRead,
  ThisReceiver,
  TmplAstForLoopBlock,
  TmplAstVariable,
} from '@angular/compiler';
import ts from 'typescript';
import {tcbExpression, TcbExpressionTranslator} from './expression';
import type {Context} from './context';
import type {Scope} from './scope';
import {TcbOp} from './base';
import {addParseSpanInfo} from '../diagnostics';

/**
 * A `TcbOp` which renders a `for` block as a TypeScript `for...of` loop.
 *
 * Executing this operation returns nothing.
 */
export class TcbForOfOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstForLoopBlock,
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
    if (!ts.isIdentifier(initializerId)) {
      throw new Error(
        `Could not resolve for loop variable ${this.block.item.name} to an identifier`,
      );
    }
    const initializer = ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(initializerId)],
      ts.NodeFlags.Const,
    );
    addParseSpanInfo(initializer, this.block.item.keySpan);
    // It's common to have a for loop over a nullable value (e.g. produced by the `async` pipe).
    // Add a non-null expression to allow such values to be assigned.
    const expression = ts.factory.createNonNullExpression(
      tcbExpression(this.block.expression, this.tcb, this.scope),
    );
    const trackTranslator = new TcbForLoopTrackTranslator(this.tcb, loopScope, this.block);
    const trackExpression = trackTranslator.translate(this.block.trackBy);
    const statements = [
      ...loopScope.render(),
      ts.factory.createExpressionStatement(trackExpression),
    ];

    this.scope.addStatement(
      ts.factory.createForOfStatement(
        undefined,
        initializer,
        expression,
        ts.factory.createBlock(statements),
      ),
    );

    return null;
  }
}

export class TcbForLoopTrackTranslator extends TcbExpressionTranslator {
  private allowedVariables: Set<TmplAstVariable>;

  constructor(
    tcb: Context,
    scope: Scope,
    private block: TmplAstForLoopBlock,
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

  protected override resolve(ast: AST): ts.Expression | null {
    if (
      ast instanceof PropertyRead &&
      (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver)
    ) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);

      if (
        target !== null &&
        (!(target instanceof TmplAstVariable) || !this.allowedVariables.has(target))
      ) {
        this.tcb.oobRecorder.illegalForLoopTrackAccess(this.tcb.id, this.block, ast);
      }
    }

    return super.resolve(ast);
  }
}

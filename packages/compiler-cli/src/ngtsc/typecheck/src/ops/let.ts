/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstLetDeclaration} from '@angular/compiler';
import {Context} from './context';
import type {Scope} from './scope';
import {TcbOp} from './base';
import {TcbExpr} from './codegen';
import {tcbExpression} from './expression';

/**
 * A `TcbOp` which generates a constant for a `TmplAstLetDeclaration`.
 *
 * Executing this operation returns a reference to the `@let` declaration.
 */
export class TcbLetDeclarationOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstLetDeclaration,
  ) {
    super();
  }

  /**
   * `@let` declarations are mandatory, because their expressions
   * should be checked even if they aren't referenced anywhere.
   */
  override readonly optional = false;

  override execute(): TcbExpr {
    const id = new TcbExpr(this.tcb.allocateId()).addParseSpanInfo(this.node.nameSpan);
    const value = tcbExpression(this.node.value, this.tcb, this.scope).wrapForTypeChecker();
    // Value needs to be wrapped, because spans for the expressions inside of it can
    // be picked up incorrectly as belonging to the full variable declaration.
    const varStatement = new TcbExpr(`const ${id.print()} = ${value.print()}`);
    varStatement.addParseSpanInfo(this.node.sourceSpan);
    this.scope.addStatement(varStatement);
    return id;
  }
}

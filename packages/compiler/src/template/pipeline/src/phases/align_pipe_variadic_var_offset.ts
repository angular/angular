/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';

import type {ComponentCompilation} from '../compilation';
import {varsUsedByIrExpression} from './var_counting';

export function phaseAlignPipeVariadicVarOffset(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    for (const op of view.update) {
      ir.visitExpressionsInOp(op, expr => {
        if (!(expr instanceof ir.PipeBindingVariadicExpr)) {
          return expr;
        }

        if (!(expr.args instanceof ir.PureFunctionExpr)) {
          return expr;
        }

        if (expr.varOffset === null || expr.args.varOffset === null) {
          throw new Error(`Must run after variable counting`);
        }

        // The structure of this variadic pipe expression is:
        // PipeBindingVariadic(#, Y, PureFunction(X, ...ARGS))
        // Where X and Y are the slot offsets for the variables used by these operations, and Y > X.

        // In `TemplateDefinitionBuilder` the PipeBindingVariadic variable slots are allocated
        // before the PureFunction slots, which is unusually out-of-order.
        //
        // To maintain identical output for the tests in question, we adjust the variable offsets of
        // these two calls to emulate TDB's behavior. This is not perfect, because the ARGS of the
        // PureFunction call may also allocate slots which by TDB's ordering would come after X, and
        // we don't account for that. Still, this should be enough to pass the existing pipe tests.

        // Put the PipeBindingVariadic vars where the PureFunction vars were previously allocated.
        expr.varOffset = expr.args.varOffset;

        // Put the PureFunction vars following the PipeBindingVariadic vars.
        expr.args.varOffset = expr.varOffset + varsUsedByIrExpression(expr);
      });
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Finds all unresolved safe read expressions, and converts them into the appropriate output AST
 * reads, guarded by null checks.
 */
export function phaseFindAnyCasts(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.ops()) {
      ir.transformExpressionsInOp(op, removeAnys, ir.VisitorContextFlag.None);
    }
  }
}

function removeAnys(e: o.Expression): o.Expression {
  if (e instanceof o.InvokeFunctionExpr && e.fn instanceof ir.LexicalReadExpr &&
      e.fn.name === '$any') {
    if (e.args.length !== 1) {
      throw new Error('The $any builtin function expects exactly one argument.');
    }
    return e.args[0];
  }
  return e;
}

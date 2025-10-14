/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
/**
 * Find any function calls to `$any`, excluding `this.$any`, and delete them, since they have no
 * runtime effects.
 */
export function deleteAnyCasts(job) {
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.transformExpressionsInOp(op, removeAnys, ir.VisitorContextFlag.None);
    }
  }
}
function removeAnys(e) {
  if (
    e instanceof o.InvokeFunctionExpr &&
    e.fn instanceof ir.LexicalReadExpr &&
    e.fn.name === '$any'
  ) {
    if (e.args.length !== 1) {
      throw new Error('The $any builtin function expects exactly one argument.');
    }
    return e.args[0];
  }
  return e;
}
//# sourceMappingURL=any_cast.js.map

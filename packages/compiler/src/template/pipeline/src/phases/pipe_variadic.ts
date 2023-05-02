/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {ComponentCompilation} from '../compilation';

export function phasePipeVariadic(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    for (const op of view.update) {
      ir.transformExpressionsInOp(op, expr => {
        if (!(expr instanceof ir.PipeBindingExpr)) {
          return expr;
        }

        // Pipes are variadic if they have more than 4 arguments.
        if (expr.args.length <= 4) {
          return expr;
        }

        return new ir.PipeBindingVariadicExpr(
            expr.target, expr.name, o.literalArr(expr.args), expr.args.length);
      }, ir.VisitorContextFlag.None);
    }
  }
}

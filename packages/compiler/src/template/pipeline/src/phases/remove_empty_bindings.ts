/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Bidningd with no content can be safely deleted.
 */
export function removeEmptyBindings(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      switch (true) {
        case op instanceof ir.AttributeOp:
        case op instanceof ir.BindingOp:
        case op instanceof ir.ClassPropOp:
        case op instanceof ir.ClassMapOp:
        case op instanceof ir.PropertyOp:
        case op instanceof ir.StylePropOp:
        case op instanceof ir.StyleMapOp:
          if (op.expression instanceof ir.EmptyExpr) {
            ir.OpList.remove<ir.UpdateOp>(op);
          }
          break;
      }
    }
  }
}
